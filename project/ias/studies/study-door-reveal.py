"""First-release trim and solid leaf at the current protected Study opening."""
import argparse
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
house = json.loads((HERE.parents[1]/'had/studies/water-replan.json').read_text())['model']
door = house['studyDoorOperation']
record = next(d for d in house['protectedRoute']['doors'] if d['id'] == 'STUDY')
host = next(w for w in house['groundWalls'] if w['id'] == record['host'])
hinge = door['hinge']
length, thick = door['leaf']
left, right = door['rough']
frames = door['checkedFramePieces']
frame_low, frame_high = frames[0][1], frames[0][1]+frames[0][3]
trim = 18
assert record['rough'] == host['holes'][0] == door['rough']
assert frames == [[left,frame_low,door['frameEach'],record['frameDepth']],
                  [right-door['frameEach'],frame_low,door['frameEach'],record['frameDepth']]]
assert host['finishedFaces'] == [frame_low+trim,frame_high-trim]
assert house['protectedRoute']['rectangularAssemblyHeightMaximum'] == 2250


def bounds(rect, pad=0):
    x,y,w,h = rect
    return (x-pad,y-pad,x+w+pad,y+h+pad)


def separation(p, r):
    return math.hypot(max(r[0]-p[0],0,p[0]-r[2]),max(r[1]-p[1],0,p[1]-r[3]))


def segment_distance(p, a, b):
    dx,dy = b[0]-a[0],b[1]-a[1]
    t = min(1,max(0,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)))
    return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)


def arm_distance(a,b,r):
    # Segment intersection by the two axis slabs, then nearest end or corner.
    lo,hi = 0,1
    for i in (0,1):
        d=b[i]-a[i]
        if d:
            t,u=sorted(((r[i]-a[i])/d,(r[i+2]-a[i])/d))
            lo,hi=max(lo,t),min(hi,u)
        elif not r[i] <= a[i] <= r[i+2]:
            lo,hi=1,0
    if lo<=hi:
        return 0
    return min(separation(a,r),separation(b,r),
               *(segment_distance((x,y),a,b) for x in (r[0],r[2]) for y in (r[1],r[3])))


def scene():
    # Fill all other wall openings and close the outer/court walls for a
    # conservative check. Their precise profiles are outside this task.
    items=[]
    for w in house['groundWalls']:
        a,b=w['a'],w['b']
        horizontal=a[1]==b[1]
        i=0 if horizontal else 1
        spans=[(a[i],b[i])] if w is not host else [(a[i],left),(right,b[i])]
        near,far=w['finishedFaces']
        for start,end in spans:
            rect=(start,near,end-start,far-near) if horizontal else (near,start,far-near,end-start)
            items.append((w['id'],bounds(rect,trim)))
    items += [(name,bounds(rect,trim)) for name,rect in house['fixedObstacles']['GROUND']]
    items += [(name,bounds(rect)) for name,rect in house['groundFurniture'].items()]
    x,y,w,h=house['court']
    e=house['envelope']
    width=2*x+w
    for name,r in [('west shell',(0,0,e,width)),('east shell',(width-e,0,e,width)),
                   ('south shell',(0,0,width,e)),('north shell',(0,width-e,width,e)),
                   ('court envelope',(x-e,y-e,w+2*e,h+2*e)),('stair',house['stair'])]:
        items.append((name,bounds(r,trim)))
    items += [(d['id'],bounds(d['open'])) for d in house['protectedRoute']['doors'] if 'open' in d]
    return items


obstacles = scene()
body_r,arm_r = door['bodyRadius'],door['forearmRadius']
knots = door['bodyKnots']
step = door['stepDegrees']
# Inactive objects have over one body radius of clearance. Bound the entire
# operator and both grip arcs before culling, including angular interpolation.
reach_radius = math.hypot(door['handleAlong'],door['handleFaceOffset']+thick/2)
zone = (min(hinge[0]-reach_radius,*[k[1] for k in knots])-2*body_r,
        min(hinge[1]-reach_radius,*[k[2] for k in knots])-2*body_r,
        max(hinge[0]+reach_radius,*[k[1] for k in knots])+2*body_r,
        max(hinge[1]+reach_radius,*[k[2] for k in knots])+2*body_r)
nearby = [(k,r) for k,r in obstacles if r[0]<=zone[2] and r[2]>=zone[0] and r[1]<=zone[3] and r[3]>=zone[1]]


def operation(shift, grip_along, grip_shift, jamb_extra=0, overlay=False):
    local_leaf=(0,-thick/2-shift,length,thick/2-shift)
    fixed=list(nearby)
    jambs=[]
    for i,(x,y,w,h) in enumerate(frames):
        jamb=bounds((x if i==0 else x-jamb_extra,y,w+jamb_extra,h))
        jambs.append(jamb)
        fixed.append((['hinge jamb','latch jamb'][i],jamb))
        if overlay:
            inner=jamb[2] if i==0 else jamb[0]
            fixed.append(('overlay',bounds((inner-70 if i==0 else inner,y-trim,70,trim))))
    half_step=step/2
    body_rate=max(math.dist(a[1:],b[1:])/(b[0]-a[0]) for a,b in zip(knots,knots[1:]))
    grip_rate=math.radians(1)*math.hypot(grip_along,door['handleFaceOffset']+grip_shift)
    leaf_rate=math.radians(1)*math.hypot(length,thick/2+shift)
    arm_rate=max(body_rate,grip_rate)
    body_fixed,arm_fixed,body_leaf,arm_leaf,max_reach=[math.inf]*4+[0]
    for i in range(round(90/step)+1):
        angle=i*step
        c,s=math.cos(math.radians(angle)),math.sin(math.radians(angle))
        a,b=next((a,b) for a,b in zip(knots,knots[1:]) if a[0]<=angle<=b[0])
        t=(angle-a[0])/(b[0]-a[0])
        body=tuple(a[j]+t*(b[j]-a[j]) for j in (1,2))
        dx,dy=body[0]-hinge[0],body[1]-hinge[1]
        local_body=(dx*c-dy*s,-dx*s-dy*c)
        body_leaf=min(body_leaf,separation(local_body,local_leaf)-body_r)
        body_fixed=min(body_fixed,*(separation(body,r)-body_r for _,r in fixed))
        for sign in ([1,-1] if angle==45 else [1] if angle<45 else [-1]):
            g=sign*door['handleFaceOffset']-grip_shift
            grip=(hinge[0]+grip_along*c-g*s,hinge[1]-grip_along*s-g*c)
            arm_fixed=min(arm_fixed,*(arm_distance(body,grip,r)-arm_r for _,r in fixed))
            arm_leaf=min(arm_leaf,arm_distance(local_body,(grip_along,g),local_leaf)-arm_r)
            max_reach=max(max_reach,math.dist(body,grip))
    # Hausdorff displacement of a line segment is bounded by the faster end;
    # adding the blade's own motion bounds relative distance to the leaf.
    return {
        'sampledMm': [body_fixed,arm_fixed,body_leaf,arm_leaf,max_reach],
        'continuousBodyGapMm':min(body_fixed-body_rate*half_step,body_leaf-(body_rate+leaf_rate)*half_step),
        'continuousArmGapMm':min(arm_fixed-arm_rate*half_step,arm_leaf-(arm_rate+leaf_rate)*half_step),
        'continuousReachUpperMm':max_reach+(body_rate+grip_rate)*half_step,
    }


face=thick/2
along=door['handleAlong']
new=operation(face,along,face)
overlay=operation(face,along,face,overlay=True)
old_grips=operation(face,along,0)
# When the whole blade is on the hall side of the axis, its minimum X occurs
# on the hinge edge. Its maximum X is the radius of the closed far-back corner.
blade_right=hinge[0]+math.hypot(length,thick)
jamb_faces=[frames[0][0]+frames[0][2],frames[1][0]]
sweep=(hinge[0],hinge[1]-length,blade_right,hinge[1]+thick)
assert all(sweep[2] < r[0] or r[2] < sweep[0] or sweep[3] < r[1] or r[3] < sweep[1] for _,r in obstacles)
assert math.isclose(new['sampledMm'][0],door['sampledBodyReserve'])
assert new['continuousBodyGapMm']>0 and new['continuousArmGapMm']>0 and new['continuousReachUpperMm']<600
assert old_grips['sampledMm'][3]<0 and overlay['sampledMm'][1]<0
ends=[[left-125,left-5],[right+5,right+125]]
assert ends[0][1]<left and ends[1][0]>right
# The comparison wall-to-frame joint is an authored 3 mm; the report's 32 mm
# jamb and 2–4 mm door edge gaps are separate dimensions.
trial_gap,trial_joint,frame=3,3,32
trial_rough=length+2*(trial_gap+trial_joint+frame)
alternate=operation(face,768,face,jamb_extra=door['leafEdgeGapEach']-trial_gap)
result={
    'frameDepthAndWallMm':[record['frameDepth'],host['t']], 'frameYmm':[frame_low,frame_high],
    'finishedWallYmm':host['finishedFaces'],'edgeGapsClosedMm':door['leafEdgeGapEach'],
    'centredSlabAt90HingeOverlapMm':jamb_faces[0]-(hinge[0]-thick/2),
    'facePivotHingeAndWorstLatchReserveMm':[hinge[0]-jamb_faces[0],jamb_faces[1]-blade_right],
    'gripOffsetsFromAxisMm':[door['handleFaceOffset']-face,-door['handleFaceOffset']-face],
    'facePivot':new, 'oldGripsAtFacePivot':old_grips, 'casingOverlay':overlay,
    'trimEndPieceXmm':ends, 'closedBladeToTrimBackMm':hinge[1]-host['finishedFaces'][0],
    'releaseSouthMm':22, 'supplierComparisonRoughMm':trial_rough,
    'supplierComparisonJambFacesMm':[hinge[0]-trial_gap,hinge[0]+length+trial_gap],
    'supplierComparisonWorstLatchReserveMm':hinge[0]+length+trial_gap-blade_right,
    'supplierComparison768Grip':alternate,
    'status':'IAS trial for the Study room face. Functional frame, stops, ironmongery, seals, head, fixing and opening adoption require their owning evidence.'
}
def figure():
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="980" height="460" viewBox="0 0 980 460" role="img">',
         '<title>Protected Study door, plan at the hinge jamb</title>',
         '<rect width="980" height="460" fill="#faf9f5"/><g font-family="sans-serif" fill="#253a3c">']
    def label(x,y,words,size=15):
        out.append(f'<text x="{x}" y="{y}" font-size="{size}">{words}</text>')
    label(30,35,'Protected Study door at the hinge jamb',24)
    label(30,63,'Plan. The hall is above the wall. Both details use the same 230 mm frame and hinge position.')
    for x0,offset,title in [(30,0,'Centred blade'),(505,face,'Hinge on Study face')]:
        label(x0,109,title,21)
        def xp(x):return x0+190+(x-left)*1.12
        def yp(y):return 132+(frame_high-y)*.68
        def box(xa,xb,ya,yb,colour):
            out.append(f'<rect x="{xp(xa):.2f}" y="{yp(yb):.2f}" width="{(xb-xa)*1.12:.2f}" height="{(yb-ya)*.68:.2f}" fill="{colour}"/>')
        box(left-150,left,*host['finishedFaces'],'#e3dfd1')
        box(left,jamb_faces[0],frame_low,frame_high,'#9f9483')
        box(ends[0][0],ends[0][1],frame_low,host['finishedFaces'][0],'#426867')
        box(hinge[0]-face+offset,hinge[0]+face+offset,frame_low-57,hinge[1],'#85aaaf')
        if offset==0:
            box(hinge[0]-face,jamb_faces[0],frame_low,hinge[1],'#bb5440')
        out.append(f'<circle cx="{xp(hinge[0]):.2f}" cy="{yp(hinge[1]):.2f}" r="4.5" fill="#183a40"/>')
        label(x0,358,'12 mm overlap with the jamb' if offset==0 else '10 mm between blade and jamb',17)
        label(x0,387,'Red marks the conflict at 90°.' if offset==0 else 'Dark green is the independently removable trim end.')
    label(30,433,'Nominal jamb, with the leaf shown open. Stops, seals and hinge hardware need the matched doorset.',15)
    return '\n'.join([*out,'</g></svg>',''])

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
    for ext,body in [('json',json.dumps(result,indent=2)+'\n'),('svg',figure())]:
        dest=Path(__file__).with_suffix('.'+ext)
        if args.check:
            assert dest.read_text()==body, f'Stale {dest.name}'
        else:
            dest.write_text(body)
