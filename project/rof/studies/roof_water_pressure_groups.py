"""Source-bound added horizontal inner pressure and explicit centroid bounds.

Each exported sign group is shared across both circuits on its physical face.
Unknown extra-rib centroids are bounded by independent zero-net-force couples;
their forces and physical first moments are preserved at the original roots.
This adds a comparison to the original house wind, taking no shielding credit.
The separately exported vertical floor projection is NOT added twice.
"""
from collections import defaultdict
from pathlib import Path
import hashlib
import json
import math


def cross(a, b):
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]


def world(face, point):
    p, q, z = point
    return [(p, q, z), (12000-q, p, z), (12000-p, 12000-q, z), (q, 12000-p, z)][face]


def vector(face, direction):
    dp, dq, dz = direction
    return [(dp, dq, dz), (-dq, dp, dz), (-dp, -dq, dz), (dq, -dp, dz)][face]


def add_groups(Load, panel_loads, panel_specs, folder):
    folder = Path(folder)
    manifest = json.loads((folder/'manifest.json').read_text())
    for name, expected in manifest['files'].items():
        actual = hashlib.sha256((folder/name).read_bytes()).hexdigest()
        assert actual == expected, f'Stale inner-pressure input: {name}'
    exported = json.loads((folder/'roof_water_inner_candidate_wind.json').read_text())
    assert exported['sourceSHA256'] == manifest['files']['roof_water_inner_candidate.py']
    assert exported['exportSourceSHA256'] == manifest['files']['roof_water_inner_candidate_wind.py']
    assert exported['pressureKPa'] == 2.25
    definitions = manifest['candidateDefinitions']
    assert definitions['primary']['waterDepth'] == 170 and definitions['primary']['rear'] == 6795
    assert definitions['lower']['waterDepth'] == 190
    assert [definitions[k]['width'] for k in ('primary', 'lower')] == [350, 425]
    groups = defaultdict(list)
    excluded = []
    maximum_balance = 0.
    records = []

    def place(load, row, point, sign):
        nonlocal maximum_balance
        force = [sign*f for f in row['positiveForceN']]
        load.place('court', row['physicalFace'], -point[1], point[0],
                   fx=force[0], fy=force[1], down=-force[2], z=point[2],
                   root_station=row['rootP'], tag=row['name'])
        native = load.placed[-1]
        expected_source = world(row['physicalFace'], point)
        assert max(abs(a-b) for a, b in zip(native['source'], expected_source)) < 1e-7
        root = [*native['root'], 6600.]
        offset = [a-b for a, b in zip(expected_source, root)]
        intended = cross(offset, force)
        represented = [-native['MyGradientNmm'], native['MxGradientNmm'], native['yawNmm']]
        error = max(abs(a-b) for a, b in zip(intended, represented))
        maximum_balance = max(maximum_balance, error)
        assert error < 1e-6

    for index, row in enumerate(exported['resultants']):
        assert row['signDomain'] == [-1, 1]
        face, point = row['physicalFace'], row['centroidPqZMM']
        assert 0 <= face < 4
        assert row['circuit'] in ('primary', 'lower')
        assert all(math.isfinite(v) for v in [*point, *row['positiveForceN'], row['projectedAreaMM2']])
        assert max(abs(a-b) for a, b in zip(world(face, point), row['worldCentroidXYZMM'])) < 1e-7
        expected_force = [v*.00225*row['projectedAreaMM2'] for v in row['positiveWorldDirection']]
        assert max(abs(a-b) for a, b in zip(expected_force, row['positiveForceN'])) < 1e-7
        if abs(row['positiveForceN'][2]) > 0:
            assert row['signGroup'].endswith(':vertical_down')
            assert row['positiveForceN'][:2] == [0., 0.]
            excluded.append(index)
            continue
        groups[row['signGroup']].append((index, row))

    for group, members in sorted(groups.items()):
        key = ('added inner horizontal pressure', group)
        choices = [Load(group+' negative comparison'), Load(group+' positive comparison')]
        member_records = []
        for index, row in members:
            point = list(row['centroidPqZMM'])
            bounds = {}
            if 'centroidQRange' in row:
                assert row['name'].startswith('EXTRA apron rib/standoff')
                partitions = ([4590., 5437.5, 6562.5, 7410.] if row['circuit'] == 'primary'
                              else [4346., 5325., 6675., 7654.])
                roots = ([5025., 6000., 6975.] if row['circuit'] == 'primary'
                         else [5041.666666666667, 6000., 6958.333333333334])
                j = min(range(3), key=lambda k: abs(roots[k]-row['rootP']))
                assert abs(roots[j]-row['rootP']) < 1e-6
                bounds = {0: row.get('centroidPRange', partitions[j:j+2]),
                          1: row['centroidQRange'], 2: row['centroidZRange']}
                for axis, limits in bounds.items():
                    assert len(limits) == 2 and limits[0] <= limits[1]
                    point[axis] = sum(limits)/2
            for sign, load in zip((-1., 1.), choices):
                place(load, row, point, sign)
            row_record = {'exportRowIndex': index, 'name': row['name'], 'rootP': row['rootP'],
                          'baselineCentroidPqZMM': point, 'positiveForceN': row['positiveForceN'],
                          'centroidBoundsPqZMM': {str(k): v for k, v in bounds.items()},
                          'coupleGroups': []}
            for axis, limits in bounds.items():
                if limits[0] == limits[1]:
                    continue
                endpoint = point[:]
                endpoint[axis] = limits[1]
                r = [a-b for a, b in zip(world(row['physicalFace'], endpoint), world(row['physicalFace'], point))]
                moment = cross(r, row['positiveForceN'])
                if max(abs(v) for v in moment) < 1e-12:
                    continue
                couple_key = ('added inner pressure centroid couple', index, axis)
                couple_choices = []
                for sign in (-1., 1.):
                    load = Load(f'{group} row{index} centroid axis{axis} signed pure couple')
                    place(load, row, endpoint, sign)
                    place(load, row, point, -sign)
                    net = [sum(item[k] for item in load.placed) for k in ('FxN', 'FyN', 'downN')]
                    assert max(abs(v) for v in net) < 1e-9
                    couple_choices.append(load)
                panel_loads[couple_key] = couple_choices
                for specs in panel_specs.values():
                    specs.append(couple_key)
                row_record['coupleGroups'].append({'key': list(couple_key), 'positivePhysicalMomentNmm': moment})
            member_records.append(row_record)
        panel_loads[key] = choices
        for specs in panel_specs.values():
            specs.append(key)
        records.append({'signGroup': group, 'members': member_records})

    assert len(groups) == 20
    assert len(excluded) == 52
    couple_count = sum(len(row['coupleGroups']) for group in records for row in group['members'])
    return {
        'status': 'ADDED EXPORTED HORIZONTAL PRESSURE COMPARISON; NOT A JOINED ACTUAL-ASSEMBLY WIND QUALIFICATION',
        'pressureKPa': exported['pressureKPa'], 'inputManifest': manifest,
        'exportedResultants': len(exported['resultants']),
        'includedHorizontalResultants': sum(len(rows) for rows in groups.values()),
        'horizontalSharedSignGroups': len(groups), 'centroidCoupleGroups': couple_count,
        'excludedVerticalResultantIndices': excluded,
        'excludedVerticalProjectedAreaM2': sum(exported['resultants'][i]['projectedAreaMM2'] for i in excluded)/1e6,
        'maximumPhysicalMomentBalanceErrorNmm': maximum_balance,
        'method': 'Every exported horizontal group acts at either signed bound in addition to every original house programme. Group sign is shared across both circuits on its physical face. Each uncertain extra-stock p/q/Z centroid is centred and bounded with independent signed zero-net-force couples; component extrema need not coincide.',
        'verticalRule': 'Retain the existing native roof/cap vertical wind. Exported floor vertical rows are not added here; actual exposed/shadowed projection must be reconciled before any complete wind qualification.',
        'qualifications': [
            'No shielding or subtraction from the original house-pressure model is credited.',
            'Extra apron rib/standoff p midpoint is provisional: this trial bounds its whole independent-cassette partition, plus the explicitly exported q/Z ranges.',
            'The exported main panels/frames are the local lowest-bed comparison, not a proof of actual graded-skin pressure centroids.',
            'Extra small-stock pressure is not yet returned through the local frame/contact model.',
            'Actual corner articulation, residual-stock centres, connectors, masonry and temporary works remain unqualified.'
        ],
        'groups': records,
    }
