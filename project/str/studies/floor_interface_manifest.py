"""Observe named vertical floor ports in the exact current builder before solve.

This is metadata reconstruction, not a new nonlinear solve or demand result.
The input supplies the exact native case and case ID; source bytes are verified
before and after building. The existing builder is stopped at its solve boundary.
"""
import hashlib
import json
from pathlib import Path
import re
import sys

from floor_section_model import load_source, run
import floor_section_model

METHOD = 'project/str/studies/floor_interface_manifest.py'


class MetadataObserved(Exception):
    pass


def observe(case, case_id, root):
    if not isinstance(case_id, str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9._:-]*', case_id):
        raise ValueError('Explicit stable native case ID required')
    root = Path(root)
    source = load_source(root)
    if not isinstance(case, dict) or case.get('sourceSHA256') != source['identities']:
        raise ValueError('Exact current native source/request required for metadata reconstruction')
    captured = {}

    def before_solve(frame, data):
        corners = {}
        for index, port in enumerate(data['ports']):
            match = re.fullmatch(r'CORNER/([A-Za-z0-9._:-]+)/([012])', port['id'])
            if match is None:
                continue
            identity, axis = match.group(1), int(match.group(2))
            group = corners.setdefault(identity, {'id':identity, 'ports':[]})
            terms = data['portTerms'][index]
            if len(terms) != 1 or terms[0][0] not in frame.nodes:
                raise ValueError('Corner requires one actual named collector node; new topology unsupported')
            node, row = terms[0]
            if group.get('collectorNodeId', node) != node:
                raise ValueError('Corner port axes do not share one actual collector node')
            group.update(collectorNodeId=node, collectorNodeXYZMm=list(frame.nodes[node]))
            group['ports'].append({'id':port['id'], 'coordinate':axis, 'index':index,
                'nodeDisplacementCoefficients':list(row), 'physicalPointXYMm':list(port['xyMm'])})
        if not corners:
            raise ValueError('No explicit named rigid L floor ports; topology unsupported')
        for group in corners.values():
            group['ports'].sort(key=lambda p:p['coordinate'])
            if [p['coordinate'] for p in group['ports']] != [0,1,2]:
                raise ValueError('Missing or duplicate named corner port coordinate')
            indices = {p['index'] for p in group['ports']}
            traces = []
            for point in data['operator']['assembled']['points']:
                rows = [data['operator']['assembled']['pointTerms'][point, axis] for axis in range(3)]
                if all(row and all(i in indices for i, _ in row) for row in rows):
                    traces.append({'xyMm':list(point), 'plateCoordinateCoefficients':rows})
            if not traces:
                raise ValueError('Named corner lacks actual physical plate point traces')
            group['physicalPlatePointTraces'] = traces
        captured.update(schema='str-named-floor-corner-port-manifest/1', sourceSHA256=source['identities'],
            request=case, caseId=case_id, verticalPortCount=len(data['ports']), corners=list(corners.values()),
            nonlinearSolvesExecuted=0, wholeJointDemandAvailable=False,
            methodSourceSHA256={METHOD:hashlib.sha256((root/METHOD).read_bytes()).hexdigest()},
            scope='Named rigid-corner port indices and exact node/physical-point work maps from the source-bound current builder. No native solve, joint demand, material or resistance is produced.')
        raise MetadataObserved()

    previous = floor_section_model.solve_vertical_frame
    floor_section_model.solve_vertical_frame = before_solve
    try:
        try:
            run(case, source, case_id)
        except MetadataObserved:
            pass
        else:
            raise ValueError('Metadata observer did not reach the actual native solve boundary')
    finally:
        floor_section_model.solve_vertical_frame = previous
    if source['identities'] != load_source(root)['identities']:
        raise ValueError('Native source changed during metadata reconstruction')
    return captured


if __name__ == '__main__':
    payload = json.load(sys.stdin)
    if not isinstance(payload, dict) or set(payload) != {'case','caseId'}:
        raise ValueError('Explicit {case,caseId} metadata request required')
    result = observe(payload['case'], payload['caseId'], Path(__file__).resolve().parents[3])
    json.dump(result, sys.stdout, allow_nan=False)
