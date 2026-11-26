"""Lightweight read of the existing native SW L section, not another model."""
import math
from pathlib import Path
from distributed_floor_compatibility import load_distributed_floor_source
from joined_successor_kernel import l_section


def read_SW_geometry(root,widthMm):
    if type(widthMm) not in (int,float) or not math.isfinite(widthMm) or not 140<=widthMm<=240:
        raise ValueError('Actual admitted SW corner width140..240mm required')
    source=load_distributed_floor_source(Path(root));values=source['successor']['values'];g=values['floor-portal-monolithic-drag']['geometry'];head=next(h for h in values['current-house-grid']['heads'] if h['id']=='P01')
    # This is the native builder's existing l_section/world mapping. No new
    # footprint, room datum, stiffness, mass or kinematic assumption is authored.
    section=l_section(g['wallUAndLegVLimitsMm'][0][0],widthMm,g['wallUAndLegVLimitsMm'][1][1]);origin=head['xy']
    rectangles=[[r[0]+origin[0],r[1]+origin[1],r[2]+origin[0],r[3]+origin[1]] for r in section['rectangles']]
    paths=('project/str/studies/floor-portal-monolithic-drag.json','project/str/studies/current-house-grid.json','project/str/studies/joined_successor_kernel.py','project/str/studies/distributed_floor_compatibility.py')
    return {'schema':'str-native-sw-section-geometry/1','widthMm':widthMm,'originXYMm':origin,'rectanglesXYMm':rectangles,
            'centroidXYMm':[a+b for a,b in zip(origin,section['centreUV'])],'areaMm2':section['A'],
            'slabZMm':g['soffitAndOrdinarySlabTopZMm'],'groundCapZMm':head['capZ'],
            'sourceSHA256':{p:source['identities'][p] for p in paths},'physicalGeometryMethod':'joined_successor_kernel.l_section / distributed_floor_compatibility SW P01 world mapping',
            'caseAccepted':False,'finishOrRoomGeometryIncluded':False}


def read_corner_geometry(root,widthMm,cornerId):
    """The same existing native section/world map for any of its four corners."""
    mapping={'SW':('P01',1,1),'SE':('P04',-1,1),'NW':('P07',1,-1),'NE':('P10',-1,-1)}
    if cornerId not in mapping:raise ValueError('Existing native SW/SE/NW/NE corner required')
    base=read_SW_geometry(root,widthMm);source=load_distributed_floor_source(Path(root));head_id,sx,sy=mapping[cornerId]
    head=next(h for h in source['successor']['values']['current-house-grid']['heads'] if h['id']==head_id);origin=head['xy'];signs=[sx,sy]
    local=[[r[0]-base['originXYMm'][0],r[1]-base['originXYMm'][1],r[2]-base['originXYMm'][0],r[3]-base['originXYMm'][1]] for r in base['rectanglesXYMm']]
    rectangles=[]
    for r in local:
        a=[origin[k]+signs[k]*r[k] for k in (0,1)];b=[origin[k]+signs[k]*r[k+2] for k in (0,1)]
        rectangles.append([min(a[0],b[0]),min(a[1],b[1]),max(a[0],b[0]),max(a[1],b[1])])
    return {**base,'schema':'str-native-corner-section-geometry/1','cornerId':cornerId,'originXYMm':origin,
            'centroidXYMm':[origin[k]+signs[k]*(base['centroidXYMm'][k]-base['originXYMm'][k]) for k in (0,1)],
            'rectanglesXYMm':rectangles,'groundCapZMm':head['capZ'],'sourceWorldSigns':signs,
            'physicalGeometryMethod':'joined_successor_kernel.l_section / distributed_floor_compatibility four actual cap world mappings'}


if __name__=='__main__':
    import argparse,json
    p=argparse.ArgumentParser();p.add_argument('widthMm',type=float);p.add_argument('--root',default='.');p.add_argument('--corner',default='SW',choices=['SW','SE','NW','NE']);a=p.parse_args()
    print(json.dumps(read_SW_geometry(a.root,a.widthMm) if a.corner=='SW' else read_corner_geometry(a.root,a.widthMm,a.corner),allow_nan=False))
