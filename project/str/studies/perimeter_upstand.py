"""Physical perimeter upstand geometry from a freshly built house.

This module owns an optional comparison's dimensions, material union and frame
receiver geometry. It supplies no stiffness, support, load or acceptance by
itself. A consumer must actually replace the old slab strip and preserve its
normal-contact work traces before claiming a solved upstand house.
"""
import math

SCHEMA='str-perimeter-upstand-settings/1'
CORNERS=('SW','SE','NW','NE')


def settings_defaults():
    return {'schema':SCHEMA,'widthMm':300.,'depthMm':350.,
            'wind':'saved','execution':'deferred'}


def read_settings(value):
    if not isinstance(value,dict) or set(value)!=set(settings_defaults()):
        raise ValueError('Exact optional perimeter upstand settings required')
    if value['schema']!=SCHEMA or value['execution'] not in ('deferred','compute') or value['wind'] not in ('saved','zero'):
        raise ValueError('Explicit upstand execution and physical wind programme required')
    for name,lo,hi in (('widthMm',200,300),('depthMm',300,450)):
        x=value[name]
        if type(x) not in (int,float) or not math.isfinite(x) or not lo<=x<=hi:
            raise ValueError('Finite bounded ordinary perimeter section required')
    return dict(value)


def _box(box):
    if not isinstance(box,(list,tuple)) or len(box)!=6 or any(type(v) not in (int,float) or not math.isfinite(v) for v in box) or any(box[i+3]<=box[i] for i in range(3)):
        raise ValueError('Positive finite XYZ material box required')
    return list(box)


def subtract_boxes(boxes,exclusions):
    """Exact rectangular material partition; no raster area or nearest owner."""
    remaining=[_box(b) for b in boxes]
    for excluded in exclusions:
        cut=_box(excluded);out=[]
        for b in remaining:
            lo=[max(b[i],cut[i]) for i in range(3)]
            hi=[min(b[i+3],cut[i+3]) for i in range(3)]
            if any(hi[i]<=lo[i] for i in range(3)):
                out.append(b);continue
            # Successive orthogonal slices partition b without overlap.
            middle=list(b)
            for axis in range(3):
                if middle[axis]<lo[axis]:
                    q=list(middle);q[axis+3]=lo[axis];out.append(q);middle[axis]=lo[axis]
                if hi[axis]<middle[axis+3]:
                    q=list(middle);q[axis]=hi[axis];out.append(q);middle[axis+3]=hi[axis]
        remaining=out
    return sorted(remaining)


def union_boxes(boxes):
    result=[]
    for box in boxes:
        result.extend(subtract_boxes([box],result))
    return sorted(result)


def volume(boxes):
    return math.fsum(math.prod(b[i+3]-b[i] for i in range(3)) for b in boxes)/1e9


def wrench_of_weight(boxes,density):
    if type(density) not in (int,float) or not math.isfinite(density) or density<=0:
        raise ValueError('Explicit positive concrete density required')
    result=[0.]*6
    for b in boxes:
        weight=volume([b])*density;x=(b[0]+b[3])/2;y=(b[1]+b[4])/2
        result[2]-=weight;result[3]-=weight*y/1000;result[4]+=weight*x/1000
    return result


def section_properties(width,depth):
    """One solid ordinary rectangle, including its actual Saint-Venant J.

    The torsion value is the convergent rectangular-section series, not the sum
    of separate slab/rib J values. No cracked torsion or strength is inferred.
    """
    if any(type(x) not in (int,float) or not math.isfinite(x) or x<=0 for x in (width,depth)):
        raise ValueError('Positive finite physical section required')
    a,b=max(width,depth),min(width,depth)
    correction=math.fsum(math.tanh(n*math.pi*a/(2*b))/n**5 for n in range(1,202,2))
    return {'A':width*depth,'Iy':width*depth**3/12,
            'Iz':depth*width**3/12,
            'J':a*b**3/3*(1-192*b/(math.pi**5*a)*correction)}


def rigid_point_trace(origin,point,force,moment):
    """Six-action point-load transpose in frame kN / kN-mm coordinates."""
    if any(len(v)!=n or any(type(x) not in (int,float) or not math.isfinite(x) for x in v)
           for v,n in ((origin,3),(point,3),(force,3),(moment,3))):
        raise ValueError('Actual finite point, force and moment required')
    d=[point[i]-origin[i] for i in range(3)]
    cross=[d[1]*force[2]-d[2]*force[1],
           d[2]*force[0]-d[0]*force[2],
           d[0]*force[1]-d[1]*force[0]]
    return list(force)+[moment[i]+cross[i] for i in range(3)]


def geometry_from_model(model,choices):
    """Consume actual native corners and north member sections; never redraw.

    cornerWidthsMm remains the sole core-width authority. North beam breadth,
    centroid, span and depth come from the actual built member, including its
    real physical offsets. No 200/290mm north width is assumed.
    """
    choices=read_settings(choices);frame=model['model'];floor=model['joinedFloor']
    actual={c['id']:c for c in floor['corners']}
    if set(actual)!=set(CORNERS):raise ValueError('Actual four native corners required')
    widths=model['houseLoadCase']['joinedCase']['floor']['cornerWidthsMm']
    if set(widths)!=set(CORNERS) or any(widths[c]!=300 for c in CORNERS):
        raise ValueError('This complete comparison requires all four saved cornerWidthsMm=300; no second core input')
    slab_bottom,slab_top=3170.,3370.
    top=slab_bottom+choices['depthMm'];width=choices['widthMm']
    if top<=slab_top:raise ValueError('Actual positive upstand above the unchanged RC200 slab required')
    corners={c:[list(r) for r in actual[c]['rectangles']] for c in CORNERS}
    x0=min(r[0] for rows in corners.values() for r in rows);x1=max(r[2] for rows in corners.values() for r in rows)
    y0=min(r[1] for rows in corners.values() for r in rows);y1=max(r[3] for rows in corners.values() for r in rows)
    proposed=[{'id':'outer-south','axis':0,'rectangleXYMm':[x0,y0,x1,y0+width]},
              {'id':'outer-north','axis':0,'rectangleXYMm':[x0,y1-width,x1,y1]},
              {'id':'outer-west','axis':1,'rectangleXYMm':[x0,y0,x0+width,y1]},
              {'id':'outer-east','axis':1,'rectangleXYMm':[x1-width,y0,x1,y1]}]
    ring=union_boxes([[r['rectangleXYMm'][0],r['rectangleXYMm'][1],slab_bottom,
                       r['rectangleXYMm'][2],r['rectangleXYMm'][3],top] for r in proposed])
    # Existing upper L concrete already occupies the floor-top/core footprint.
    core_boxes=union_boxes([[r[0],r[1],slab_top,r[2],r[3],top]
                           for rows in corners.values() for r in rows])
    north=[];north_boxes=[]
    for wall,row in model['wallFrames'].items():
        for name,member in model['members'].items():
            if member.get('kind')!='upstand' or not name.startswith(wall+'/'):continue
            a,b=member['physicalStartMm'],member['physicalEndMm']
            if abs(a[1]-b[1])>1e-7 or abs(a[2]-b[2])>1e-7:
                raise ValueError('Actual horizontal north upstand member required')
            breadth,depth=member['breadthMm'],member['depthMm']
            q=[min(a[0],b[0]),a[1]-breadth/2,a[2]-depth/2,
               max(a[0],b[0]),a[1]+breadth/2,a[2]+depth/2]
            _box(q);north_boxes.append(q)
            north.append({'memberId':name,'boxXYZMm':q,'breadthMm':breadth,
                          'depthMm':depth,'centroidZMm':a[2]})
    if not north:raise ValueError('Actual retained source-depth north members required')
    slab_portion=subtract_boxes(ring,[[x0,y0,slab_top,x1,y1,top]])
    added=subtract_boxes(ring,[[x0,y0,slab_bottom,x1,y1,slab_top],*core_boxes,*north_boxes])
    # The replacement owns precisely its slab strip excluding retained north RC.
    replaced=subtract_boxes(slab_portion,north_boxes)
    return {'schema':'str-actual-perimeter-upstand-geometry/1','settings':choices,
            'cornerWidthsMm':dict(widths),'cornerRectanglesXYMm':corners,
            'slabZMm':[slab_bottom,slab_top],'bandZMm':[slab_bottom,top],
            'outerEnvelopeXYMm':[x0,y0,x1,y1],'bands':proposed,
            'section':section_properties(width,choices['depthMm']),
            'retainedNorthMembers':north,'retainedNorthUnionBoxesXYZMm':union_boxes(north_boxes),
            'existingUpperCoreBoxesXYZMm':core_boxes,
            'fullRingUnionBoxesXYZMm':ring,
            'replacedSlabStripBoxesXYZMm':replaced,
            'addedConcreteBoxesXYZMm':added,
            'addedConcreteVolumeM3':volume(added),
            'newSlabStripVolumeM3':volume(replaced),
            'ordinaryFullSectionTorsionIsNotSeparateLayerSum':True,
            'nativeSolveAvailable':False,'materialInstalledInNativeModel':False,
            'candidateAccepted':False,'resistanceAccepted':False}
