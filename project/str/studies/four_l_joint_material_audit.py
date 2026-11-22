"""Attribute existing uniform plate G to the actual rigid L footprints.

Postprocess retained actual geometry only; no builder, solve or load injection.
Rigid port kinematics do not remove these cells' material or gravity. This
audit deliberately does not depend on numerical passivity of a joint observer.
"""
import hashlib
import json
import math
from pathlib import Path
import sys

METHOD='project/str/studies/four_l_joint_material_audit.py'


def audit(result, observation):
    if (result['sourceSHA256']!=observation['sourceSHA256']
            or result['request']!=observation['request']
            or result['nativeVertical']['native']['caseId']!=observation['caseId']):
        raise ValueError('Exact actual native source/request/case geometry required')
    cells=result['nativeVertical']['plate']['cellsXYMm']
    law=result['nativeVertical']['request']['plateLaw'];thickness=law['thicknessMm'];density=law['unitWeightKNPerM3']
    if not all(type(v) in (int,float) and math.isfinite(v) and v>0 for v in (thickness,density)):
        raise ValueError('Finite positive uniform actual plate thickness and density required')
    upper={r['cornerId']:r for r in result['roofCoupling']['upperL']}
    records=[]
    for corner in observation['joints']:
        footprints=corner['jointFootprintRectanglesXYMm'];pieces=[]
        for rectangle in footprints:
            for index,cell in enumerate(cells):
                a,b,c,d=max(rectangle[0],cell[0]),max(rectangle[1],cell[1]),min(rectangle[2],cell[2]),min(rectangle[3],cell[3])
                if c<=a or d<=b:continue
                area=(c-a)*(d-b);volume=area*thickness/1e9
                pieces.append({'actualPlateCellIndex':index,'actualPlateCellXYMm':cell,
                    'overlapRectangleXYMm':[a,b,c,d],'areaMm2':area,'volumeM3':volume,
                    'physicalGKN':volume*density,'gravityCentroidXYZMm':[(a+c)/2,(b+d)/2,result['floorSection']['midplaneZMm']]})
        area=math.fsum((r[2]-r[0])*(r[3]-r[1]) for r in footprints)
        covered=math.fsum(r['areaMm2'] for r in pieces)
        member=upper[corner['id']];member_area=member['physicalRCUnionVolumeM3']/(member['physicalEndXYZMm'][2]-member['physicalStartXYZMm'][2])*1e9
        if abs(covered-area)>1e-6 or abs(area-member_area)>1e-6:
            raise ValueError('Actual plate cells do not cover the exact physical upper-L footprint once')
        for i,a in enumerate(footprints):
            for b in footprints[i+1:]:
                if min(a[2],b[2])>max(a[0],b[0]) and min(a[3],b[3])>max(a[1],b[1]):
                    raise ValueError('Overlapping authored L rectangles duplicate material')
        weight=math.fsum(r['physicalGKN'] for r in pieces)
        centroid=[math.fsum(r['physicalGKN']*r['gravityCentroidXYZMm'][i] for r in pieces)/weight for i in range(3)]
        expected=member['physicalStartXYZMm'][:2]
        if max(abs(a-b) for a,b in zip(centroid[:2],expected))>1e-7:
            raise ValueError('Attributed plate joint material centroid differs from actual L body')
        records.append({'id':corner['id'],'footprintRectanglesXYMm':footprints,'physicalAreaMm2':area,
            'coveredByActualPlateCellsMm2':covered,'volumeM3':area*thickness/1e9,'physicalGKN':weight,
            'appliedGKN':weight*result['nativeVertical']['native']['multipliers']['physical-G'],
            'gravityCentroidXYZMm':centroid,'attributedActualCellPieces':pieces,
            'newJointBodyGRequired':False})
    if {r['id'] for r in records}!={'SW','SE','NW','NE'} or len(records)!=4:
        raise ValueError('Exactly four actual L footprints required')
    return {'schema':'str-four-L-existing-plate-material-attribution/1',
        'sourceSHA256':result['sourceSHA256'],'caseId':observation['caseId'],
        'requestSHA256':hashlib.sha256(json.dumps(result['request'],sort_keys=True,separators=(',',':')).encode()).hexdigest(),
        'plateThicknessMm':thickness,'plateUnitWeightKNPerM3':density,'joints':records,
        'totalJointVolumeM3':math.fsum(r['volumeM3'] for r in records),
        'totalJointPhysicalGAlreadyInPlateKN':math.fsum(r['physicalGKN'] for r in records),
        'newJointBodyGRequired':False,'loadInsertedKN':0.,'finiteJointCapacityAvailable':False,
        'scope':'Exact per-cell material attribution within retained native uniform plate cells. Joint own-G already enters the recovered plate contribution. Separating it requires subtracting the identical plate part before adding it once; no new load is needed. No local joint resistance or observer numerical passivity is established.'}


if __name__=='__main__':
    if len(sys.argv)!=3:raise ValueError('Use actual-native-full.json actual-observed-sidecar.json')
    full=Path(sys.argv[1]);sidecar=Path(sys.argv[2]);result=json.loads(full.read_text());observed=json.loads(sidecar.read_text())
    report=audit(result,observed['observation'])
    report.update(actualFullNativeCaptureFileSHA256=hashlib.sha256(full.read_bytes()).hexdigest(),
        geometryObservationMethodSourceSHA256=observed['observation']['methodSourceSHA256'],
        methodSourceSHA256={METHOD:hashlib.sha256(Path(__file__).read_bytes()).hexdigest()})
    json.dump(report,sys.stdout,indent=2,allow_nan=False)
    print()
