"""Private finite-piece partition review; no invented connection/centroid pass."""
from pathlib import Path
import argparse
import hashlib
import json
import math

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('input', type=Path)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
source = json.loads(args.input.read_text())
result = {'status': 'CONDITIONAL MATERIAL PARTITION, NOT A JOINED FABRICATION OR RESIDUAL-CENTROID PASS',
          'inputSHA256': hashlib.sha256(args.input.read_bytes()).hexdigest(),
          'candidateSourceSHA256': source['candidateSourceSHA256'],
          'partitionSourceSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
          'families': {}}

for name, family in source['families'].items():
    c = family['definition']
    cuts = [5437.5, 6562.5] if name == 'primary' else [5325., 6675.]
    arm_counts = [2, 2, 2] if name == 'primary' else [2, 3, 2]
    expected_backing = [8, 8, 8] if name == 'primary' else [9, 12, 9]
    items = family['inventory']['items']
    rib_item = next(row for row in items if row['item'].startswith('independent RHS'))
    apron_counts = rib_item['geometry']['cassetteCounts']
    totals = [0., 0., 0.]
    records = []
    for item in items:
        label, kg = item['item'], item['kgPerFace']
        g = item.get('geometry') or {}
        means = None
        if 'profileQZMM' in g:
            area, pm, qm = [0.]*3, [0.]*3, [0.]*3
            for a, b in zip(g['profileQZMM'], g['profileQZMM'][1:]):
                ds = math.dist(a, b)
                for t in ((1-1/math.sqrt(3))/2, (1+1/math.sqrt(3))/2):
                    q = a[0]+t*(b[0]-a[0])
                    for j, (lo, hi) in enumerate(((q, cuts[0]), tuple(cuts), (cuts[1], 12000-q))):
                        da = ds*.5*(hi-lo)
                        area[j] += da
                        pm[j] += da*(lo+hi)/2
                        qm[j] += da*q
            assert abs(sum(area)-g['areaPerFaceMM2']) < 1e-6
            weights = [v/sum(area) for v in area]
            means = [{'p': p/a, 'q': q/a} for p, q, a in zip(pm, qm, area)]
            basis = 'Exact mitred profile area split at unchanged independent-cassette joints'
        elif 'moving longitudinal rail' in label or 'continuous guide flats' in label:
            q = g['q'] if 'q' in g else c['apronQ']
            ends = [q, *cuts, 12000-q]
            lengths = [b-a for a, b in zip(ends, ends[1:])]
            weights = [v/sum(lengths) for v in lengths]
            means = [{'p': (a+b)/2, 'q': q} for a, b in zip(ends, ends[1:])]
            basis = 'Actual constant-q stock lengths split at independent-cassette joints'
        elif label.startswith('independent RHS') or 'radial standoffs' in label:
            weights = [v/g['count'] for v in apron_counts]
            basis = 'Separate supported apron segment ends, using explicit cassette rib counts'
        elif 'apron clips' in label:
            weights = [2*v/g['count'] for v in apron_counts]
            basis = 'Two clip/tab assemblies per actual apron rib'
        elif 'guide bolts perclip' in label:
            weights = [4*v/g['count'] for v in apron_counts]
            basis = 'Four M6 bolt/nut/two-washer assemblies per actual apron rib'
        elif 'moving-pan backing ribs' in label:
            assert len(set(g['lengthsMM'])) == 1
            weights = [v/g['count'] for v in expected_backing]
            basis = 'Each separate body has supported ends; corner rear span500 needs5 ribs at150 (or4 at200); full-width lengths are an explicit mass overbound'
        elif 'root plates' in label or 'root and elbow gussets' in label or 'root bolts perroot' in label:
            weights = [1/3]*3
            basis = 'One finite root hardware allocation per independent cassette'
        elif any(key in label for key in ('end-flange returns', 'seam strips', 'capture bolts', 'socket plates', 'pan locks', 'per module')):
            weights = [v/sum(arm_counts) for v in arm_counts]
            basis = 'Actual number of owned pan modules/arms'
        elif 'weld metal' in label:
            owned_lengths = [sum(c['tributaries'][j] for j, p in enumerate(c['stations'])
                                 if min(range(3), key=lambda k: abs(c['roots'][k]-p)) == i) for i in range(3)]
            lengths = [2*l/1000+2*n*(c['width']/1000+.300)+2*(.160+.120)
                       for l, n in zip(owned_lengths, arm_counts)]
            assert abs(sum(lengths)-g['lengthM']) < 1e-8
            weights = [v/g['lengthM'] for v in lengths]
            basis = 'Explicit declared carrier/root fillet-seam length only; other actual joining stock remains unproved'
        elif item['loadRoute'] == 'frame':
            weights = [row['frameDryKg']/kg for row in family['cassettes']]
            basis = 'Actual finite local frame member mass per root'
        else:
            raise ValueError(label)
        masses = [kg*v for v in weights]
        totals = [a+b for a, b in zip(totals, masses)]
        records.append({'item': label, 'kgByCassette': masses, 'basis': basis,
                        'sourceFaceKg': kg, 'includedFaceKg': sum(masses),
                        'loadRoute': item['loadRoute'], 'profileOrRailCentroidPQMM': means})
    bounds = [58.5, 67.5, 58.5] if name == 'primary' else [57.5, 81., 57.5]
    result['families'][name] = {
        'rootsP': c['roots'], 'kgByCassette': totals, 'native60CapKg': bounds,
        'reserveKg': [b-m for b, m in zip(bounds, totals)],
        'massScreen': all(m <= b for m, b in zip(totals, bounds)),
        'sourceFaceKg': family['inventory']['totalKgM']*c['faceLength']/1000,
        'partitionFaceKg': sum(totals), 'equivalentKgPerM': sum(totals)/(c['faceLength']/1000),
        'backingRibsByCassette': expected_backing, 'apronRibsByCassette': apron_counts,
        'items': records,
        'limitations': [
            'Physical profiles are conditionally split at listed independent joints; this is not proof of their joining, support or articulation.',
            'Corner body support uses conservative full-width rib masses; actual mitres, p supports and interfaces still need a finite detail.',
            'Finite item masses are not a proof that every permitted remaining-state centre of mass lies in the native p/q rectangles.',
            'Only declared seam weld stock is included. Unspecified apron, rib, splice, socket, guide and contact joining is not supplied by a percentage allowance.',
            'This partition does not add absent strength, local deflection, receiver, wind or maintenance qualifications.'
        ]}

args.output.write_text(json.dumps(result, indent=2)+'\n')
for name, row in result['families'].items():
    print(name, {key: row[key] for key in ('kgByCassette', 'native60CapKg', 'reserveKg', 'massScreen', 'equivalentKgPerM')})
