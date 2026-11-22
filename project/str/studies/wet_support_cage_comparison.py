"""Exploratory ordinary wet-support cage paths, independent of native inputs.

Explicit geometry and actual frozen simultaneous actions are inputs. This is
not a selected cage, an anchorage/local-bearing proof or a current-house source.
"""
import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

from continuous_rc_cage import _segment_distance, _layer_capacity


DEFAULT_SETTINGS_PATH=Path(__file__).with_name('wet-support-cage-comparison-settings.json')
SETTINGS_SCHEMA='str-wet-support-cage-comparison/1'
SETTINGS_FIELDS=frozenset('''schema mainDiameterMm beamMainFaceMm beamNormalMainFaceMm
    postMainFaceMm beamReturnMandrelMm topLapLengthMm topLapVerticalSeparationMm
    topLapIntervalsYMm lapRampSlope linkDiameterMm linkMandrelMm linkNominalCoverMm
    linkPitchMm linkHookTailMm beamLinkReturnOffsetFromTangentMm linkHookPlaneOffsetMm
    linkPlaneJogRunMm linkClosureMandrelMm postCrossTiePlaneOffsetMm
    cageInstallationToleranceMm mainRelativePositionToleranceMm linkFabricationToleranceMm
    minimumConcreteCoverMm minimumIndependentMainClearMm postTopEndInsetMm postTopLevelRaiseMm
    postStraightGridEndZMm northShortGridBendStartZMm northShortGridTailMm
    northShortGridOutwardAngleDeg plainConcreteWeightKNPerM3 steelWeightKNPerM3
    comparisonSteelMassDensityKgPerM3 sourceSteelYieldMPa comparisonSteelFraction
    sourceGoodBondMPa sourcePoorBondMPa sourceConcreteCompressionMPa curveChordErrorMm'''.split())
# Admitted physical method, independent of editable authored defaults. Capacity
# uses the existing source17MPa/500MPa method; stronger claims need another proof.
FIXED_METHOD_VALUES={'mainDiameterMm':12.,'linkDiameterMm':8.,
    'sourceSteelYieldMPa':500/1.15,'sourceConcreteCompressionMPa':17.,
    'sourceGoodBondMPa':3.,'sourcePoorBondMPa':2.1,
    'steelWeightKNPerM3':78.5,'comparisonSteelMassDensityKgPerM3':7850.}


def comparison_settings():
    """Read the sole versioned default; never derive safety limits from it."""
    return validate_settings(json.loads(DEFAULT_SETTINGS_PATH.read_text()))


def validate_settings(s):
    """Cheap serializable-choice validation before any native solve."""
    if not isinstance(s,dict) or set(s)!=SETTINGS_FIELDS or s['schema']!=SETTINGS_SCHEMA:
        raise ValueError('Unsupported cage choices schema or fields')
    for key,value in s.items():
        if key in ('schema','topLapIntervalsYMm'):continue
        if type(value) not in (float,int) or not math.isfinite(value):raise ValueError('Finite cage choice required: '+key)
        if key not in ('postStraightGridEndZMm','northShortGridBendStartZMm','postTopLevelRaiseMm') and value<=0:raise ValueError('Positive cage choice required: '+key)
    if not 0<=s['postTopLevelRaiseMm']<=20:raise ValueError('Unsupported post top-level raise0..20mm')
    intervals=s['topLapIntervalsYMm']
    if not isinstance(intervals,list) or len(intervals)!=2 or any(not isinstance(v,list) or len(v)!=2 or any(type(x) not in (float,int) or not math.isfinite(x) for x in v) for v in intervals):
        raise ValueError('Two finite explicit lap intervals required')
    for key,value in FIXED_METHOD_VALUES.items():
        if s[key]!=value:raise ValueError('Unsupported source material/bar method edit: '+key)
    if not 0<s['comparisonSteelFraction']<=.92 or not 0<s['northShortGridOutwardAngleDeg']<90:
        raise ValueError('Unsupported material fraction or diagonal return angle')
    if not 24<=s['plainConcreteWeightKNPerM3']<=27:
        raise ValueError('Unsupported plain-concrete weight comparison domain')
    if s['cageInstallationToleranceMm']<5 or s['mainRelativePositionToleranceMm']<5 or s['linkFabricationToleranceMm']<1:
        raise ValueError('Unsupported reduction of independent placement/fabrication bounds')
    if not .005<=s['curveChordErrorMm']<=.05 or not 80<=s['linkHookTailMm']<=120 or not 50<=s['linkPitchMm']<=100:
        raise ValueError('Unsupported curve bound, hook tail or link duty')
    if s['minimumConcreteCoverMm']<40 or s['minimumIndependentMainClearMm']<21 or s['linkMandrelMm']<32 or s['linkClosureMandrelMm']<32:
        raise ValueError('Unsupported reduction of cover, clear spacing or link mandrel')
    if not 180<=s['beamReturnMandrelMm']<=240 or not 300<=s['topLapLengthMm']<=1500:
        raise ValueError('Unsupported main return/lap comparison domain')
    if any(b-a!=s['topLapLengthMm'] for a,b in intervals):raise ValueError('Every explicit interval must contain its authored full lap length')
    if abs(350-2*s['beamMainFaceMm']-s['beamReturnMandrelMm']-s['mainDiameterMm'])>1e-7:
        raise ValueError('Unsupported return diameter/row fit in actual350mm beam')
    if intervals[0][1]>=intervals[1][0]:raise ValueError('Overlapping beam lap intervals require a new congestion comparison')
    return s


def validate_inputs(native,grid,s):
    """Reject unsupported edits; this comparison cannot inherit stale actions."""
    validate_settings(s)
    wet=native['seatedWetSupport'];g=wet['settings'];posts=wet['posts']
    if (g['beamWidthMm'],g['beamDepthMm'],g['beamTopZMm'])!=(250.,350.,3370.) or len(posts)!=2:
        raise ValueError('Unsupported actual beam geometry; regenerate a cage comparison for its real dimensions')
    for p in posts:
        a,b,c,d=p['rectangleXYMm']
        if (c-a,d-b,p['physicalBottomZMm'],p['physicalTopZMm'])!=(260.,450.,-180.,3010.):
            raise ValueError('Unsupported actual post geometry or grid datum')
        if p['sourceGridMemberId'].split('/')[1] not in grid['girders']:raise ValueError('Missing actual receiving grid source')


def _line(p,q):
    return {'kind':'line','points':[list(p),list(q)],'lengthLowerMm':math.dist(p,q),'lengthUpperMm':math.dist(p,q),'errorMm':0.}


def _arc(fn,a,b,radius,error):
    n=max(1,math.ceil(abs(b-a)/(2*math.acos(1-error/radius))))
    return {'kind':'arc','points':[fn(a+(b-a)*i/n) for i in range(n+1)],
        'lengthLowerMm':abs(b-a)*radius,'lengthUpperMm':abs(b-a)*radius,
        'errorMm':radius*(1-math.cos(abs(b-a)/(2*n)))}


def _jog(p,q,axial_axis,error):
    # Two orthogonal coordinate changes: constant in-plane speed, smooth
    # zero-end-slope out-of-plane offset. This is not a sharp kink.
    delta=q[axial_axis]-p[axial_axis];run=math.sqrt(sum((b-a)**2 for i,(a,b) in enumerate(zip(p,q)) if i!=axial_axis))
    n=max(4,math.ceil(math.sqrt(abs(delta)*.75/max(error,1e-12))))
    def at(t):
        v=[a+(b-a)*t for a,b in zip(p,q)];v[axial_axis]=p[axial_axis]+delta*(3*t*t-2*t*t*t);return v
    def speed(t):return math.hypot(run,delta*6*t*(1-t))
    count=256;lower=upper=0.
    for i in range(count):
        a,b=i/count,(i+1)/count;values=[speed(a),speed(b)]
        lower+=min(values)/count;upper+=max(values+[speed(.5)] if a<=.5<=b else values)/count
    return {'kind':'smooth-jog','points':[at(i/n) for i in range(n+1)],
        'lengthLowerMm':lower,'lengthUpperMm':upper,'errorMm':abs(delta)*.75/n**2,
        'minimumCurvatureRadiusLowerMm':run*run/(6*abs(delta)) if delta else None}


def _path(identifier,diameter,parts,kind):
    for a,b in zip(parts,parts[1:]):
        if math.dist(a['points'][-1],b['points'][0])>1e-7:raise ValueError('Disconnected physical steel path: '+identifier)
    return {'id':identifier,'kind':kind,'diameterMm':diameter,'parts':parts,
        'centrelineLengthLowerMm':sum(p['lengthLowerMm'] for p in parts),
        'centrelineLengthUpperMm':sum(p['lengthUpperMm'] for p in parts)}


def _reverse(part):return {**part,'points':list(reversed(part['points']))}


def beam_loop(g,s,index):
    bar=s['mainDiameterMm'];R=(s['beamReturnMandrelMm']+bar)/2;x=g['beamAxisXMm']+(-1 if index==0 else 1)*(g['beamWidthMm']/2-s['beamNormalMainFaceMm'])
    zc=g['beamTopZMm']-g['beamDepthMm']/2;bottom=zc-R;top=zc+R
    if abs(g['beamDepthMm']-2*s['beamMainFaceMm']-2*R)>1e-7:raise ValueError('Actual beam depth does not fit this explicit return diameter and bar rows')
    south=g['beamSouthEndYMm']+s['beamMainFaceMm']+R;north=g['beamNorthEndYMm']-s['beamMainFaceMm']-R
    a,b=s['topLapIntervalsYMm'][index];delta=s['topLapVerticalSeparationMm'];theta=math.atan(s['lapRampSlope'])
    straight=(delta-2*R*(1-math.cos(theta)))/math.sin(theta)
    if straight<=0 or b-a!=s['topLapLengthMm']:raise ValueError('Unsupported actual loop lap/ramp geometry')
    t1=[x,b+R*math.sin(theta),top-delta+R*(1-math.cos(theta))]
    t2=[x,t1[1]+straight*math.cos(theta),t1[2]+straight*math.sin(theta)]
    end=[x,t2[1]+R*math.sin(theta),top]
    if not south<a<b<end[1]<north:raise ValueError('Actual full lap and cold-bend ramp leave the straight beam field')
    first=_arc(lambda t:[x,b+R*math.sin(t),top-delta+R*(1-math.cos(t))],0,theta,R,s['curveChordErrorMm'])
    last=_arc(lambda t:[x,t2[1]+R*(math.sin(theta)-math.sin(theta-t)),t2[2]+R*(math.cos(theta-t)-math.cos(theta))],0,theta,R,s['curveChordErrorMm'])
    parts=[_line([x,a,top-delta],[x,b,top-delta]),first,_line(t1,t2),last,
        _line(end,[x,north,top]),
        _arc(lambda t:[x,north+R*math.cos(t),zc+R*math.sin(t)],math.pi/2,-math.pi/2,R,s['curveChordErrorMm']),
        _line([x,north,bottom],[x,south,bottom]),
        _arc(lambda t:[x,south-R*math.cos(t),zc+R*math.sin(t)],-math.pi/2,math.pi/2,R,s['curveChordErrorMm']),
        _line([x,south,top],[x,b,top])]
    result=_path('STR/WET-CAGE/beam/loop/'+str(index),bar,parts,'beam-main-loop')
    result.update(lapIntervalYMm=[a,b],lapParallelSeparationMm=delta,
        lapAdverseMainSurfaceClearMm=delta-bar-2*s['mainRelativePositionToleranceMm'],
        actualLapAfterEndToleranceMm=b-a-2*s['mainRelativePositionToleranceMm'],
        endReturnRegionsYMm=[[south-R,south],[north,north+R]],
        coldBendRampIntervalYMm=[b,end[1]],bendMandrelMm=s['beamReturnMandrelMm'])
    return result


def post_bars(posts,s):
    bars=[];R=(s['beamReturnMandrelMm']+s['mainDiameterMm'])/2;angle=math.radians(s['northShortGridOutwardAngleDeg'])
    for post_index,post in enumerate(posts):
        a,b,c,d=post['rectangleXYMm'];cx,cy=(a+c)/2,(b+d)/2;hx=(c-a)/2-s['postMainFaceMm'];hy=(d-b)/2-s['postMainFaceMm'];top=post['physicalTopZMm']-s['postTopEndInsetMm']
        for side in (-1,1):
            for row,y in enumerate((-hy,-hy/3,hy/3,hy)):
                x=cx+side*hx;y+=cy
                identifier='STR/WET-CAGE/post/'+str(post_index)+'/main/'+str(side)+'/'+str(row)
                if post_index==1 and row==0:
                    z=s['northShortGridBendStartZMm'];direction=[side*math.sin(angle),math.cos(angle)]
                    fn=lambda t,x=x,y=y,z=z,direction=direction:[x+direction[0]*R*(1-math.cos(t)),y+direction[1]*R*(1-math.cos(t)),z-R*math.sin(t)]
                    arc=_arc(fn,0,math.pi/2,R,s['curveChordErrorMm']);end=arc['points'][-1]
                    tip=[end[0]+direction[0]*s['northShortGridTailMm'],end[1]+direction[1]*s['northShortGridTailMm'],end[2]]
                    parts=[_line([x,y,top],[x,y,z]),arc,_line(end,tip)]
                    credited=post['physicalBottomZMm']-z+s['northShortGridTailMm']
                else:
                    parts=[_line([x,y,top],[x,y,s['postStraightGridEndZMm']])]
                    credited=post['physicalBottomZMm']-s['postStraightGridEndZMm']
                result=_path(identifier,s['mainDiameterMm'],parts,'post-main')
                result.update(postIndex=post_index,gridDevelopmentStraightOnlyMm=credited,
                    gridStraightDevelopmentAfterEndpointToleranceMm=credited-2*s['mainRelativePositionToleranceMm'],
                    actualGoodBondConditionEstablished=False,
                    sourceGridMemberId=post['sourceGridMemberId'],topEndZMm=top,
                    postTopDRegionAccepted=False,gridJointCageAccepted=False)
                bars.append(result)
    return bars


def closed_link(identifier,width,depth,origin,axis,s,bottom_closure=False):
    """Actual open link perimeter plus two135° closures, on split hook planes."""
    r=(s['linkMandrelMm']+s['linkDiameterMm'])/2;rh=(s['linkClosureMandrelMm']+s['linkDiameterMm'])/2;a=width/2;b=depth/2;u=a-r;v=b-r;uh=a-rh;vh=b-rh;j=s['linkPlaneJogRunMm'];o=s['linkHookPlaneOffsetMm'];tail=s['linkHookTailMm'];err=s['curveChordErrorMm']
    if min(2*u,2*v)<j:raise ValueError('Actual link has no room for its closure-plane jog')
    def at(x,y,t=0):
        if bottom_closure:y=-y
        return [origin[0]+x,origin[1]+t,origin[2]+y] if axis=='y' else [origin[0]+x,origin[1]+y,origin[2]+t]
    h1=_arc(lambda t:at(uh+rh*math.cos(t),vh+rh*math.sin(t),-o),math.pi/2,-math.pi/4,rh,err)
    h2=_arc(lambda t:at(uh+rh*math.cos(t),vh+rh*math.sin(t),o),0,3*math.pi/4,rh,err)
    def extend(p,x,y,t):return at(x-tail/math.sqrt(2),y-tail/math.sqrt(2),t)
    tip1=extend(h1['points'][-1],uh+rh/math.sqrt(2),vh-rh/math.sqrt(2),-o)
    tip2=extend(h2['points'][-1],uh-rh/math.sqrt(2),vh+rh/math.sqrt(2),o)
    parts=[_line(tip1,h1['points'][-1]),_reverse(h1),
        _jog(at(uh,b,-o),at(uh-j,b,0),1 if axis=='y' else 2,err),_line(at(uh-j,b),at(-u,b)),
        _arc(lambda t:at(-u+r*math.cos(t),v+r*math.sin(t)),math.pi/2,math.pi,r,err),
        _line(at(-a,v),at(-a,-v)),
        _arc(lambda t:at(-u+r*math.cos(t),-v+r*math.sin(t)),math.pi,3*math.pi/2,r,err),
        _line(at(-u,-b),at(u,-b)),
        _arc(lambda t:at(u+r*math.cos(t),-v+r*math.sin(t)),3*math.pi/2,2*math.pi,r,err),
        _line(at(a,-v),at(a,vh-j)),_jog(at(a,vh-j),at(a,vh,o),1 if axis=='y' else 2,err),h2,_line(h2['points'][-1],tip2)]
    return _path(identifier,s['linkDiameterMm'],parts,'beam-link' if axis=='y' else 'post-link')


def cross_tie(identifier,hx,hy,origin,s,mirror=False):
    r=(s['linkMandrelMm']+s['linkDiameterMm'])/2;tail=s['linkHookTailMm'];sign=-1 if mirror else 1
    def at(x,y):return [origin[0]+x,origin[1]+sign*y,origin[2]]
    left=_arc(lambda t:at(-hx+r*math.cos(t),hy+r*math.sin(t)),math.pi/2,5*math.pi/4,r,s['curveChordErrorMm'])
    right=_arc(lambda t:at(hx+r*math.cos(t),hy+r*math.sin(t)),math.pi/2,-math.pi/4,r,s['curveChordErrorMm'])
    tl=at(-hx-r/math.sqrt(2)+tail/math.sqrt(2),hy-r/math.sqrt(2)-tail/math.sqrt(2))
    tr=at(hx+r/math.sqrt(2)-tail/math.sqrt(2),hy-r/math.sqrt(2)-tail/math.sqrt(2))
    return _path(identifier,s['linkDiameterMm'],[_line(tl,left['points'][-1]),_reverse(left),_line(at(-hx,hy+r),at(hx,hy+r)),right,_line(right['points'][-1],tr)],'post-cross-tie')


def build_paths(wet,s):
    g=wet['settings'];main=[beam_loop(g,s,i) for i in (0,1)]+post_bars(wet['posts'],s);links=[]
    R=(s['beamReturnMandrelMm']+s['mainDiameterMm'])/2;offset=s['beamLinkReturnOffsetFromTangentMm']
    if not 0<=offset<R or R-offset>s['linkPitchMm']:raise ValueError('End-return unsupported run exceeds declared100mm link duty')
    lo=g['beamSouthEndYMm']+s['beamMainFaceMm']+R-offset;hi=g['beamNorthEndYMm']-s['beamMainFaceMm']-R+offset;count=math.ceil((hi-lo)/s['linkPitchMm'])
    inset=s['linkNominalCoverMm']+s['linkDiameterMm']/2
    for i in range(count+1):
        y=lo+(hi-lo)*i/count
        links.append(closed_link('STR/WET-CAGE/beam/link/'+str(i),g['beamWidthMm']-2*inset,g['beamDepthMm']-2*inset,[g['beamAxisXMm'],y,g['beamTopZMm']-g['beamDepthMm']/2],'y',s,True))
    for p,post in enumerate(wet['posts']):
        a,b,c,d=post['rectangleXYMm'];cx,cy=(a+c)/2,(b+d)/2;hx=(c-a)/2-s['postMainFaceMm'];hy=((d-b)/2-s['postMainFaceMm'])/3
        lo=post['physicalBottomZMm']+inset+s['postCrossTiePlaneOffsetMm'];hi=post['physicalTopZMm']-s['postTopEndInsetMm']-s['postCrossTiePlaneOffsetMm']-10+s['postTopLevelRaiseMm']
        count=math.ceil((hi-lo)/s['linkPitchMm'])
        for i in range(count+1):
            z=lo+(hi-lo)*i/count;prefix='STR/WET-CAGE/post/'+str(p)+'/link/'+str(i)
            links.append(closed_link(prefix,c-a-2*inset,d-b-2*inset,[cx,cy,z],'z',s))
            for mirror in (False,True):
                dz=s['postCrossTiePlaneOffsetMm']*(1 if mirror else -1)
                links.append(cross_tie(prefix+'/cross/'+str(int(mirror)),hx,hy,[cx,cy,z+dz],s,mirror))
    return main,links


def _segments(path):
    return [(a,b,part['errorMm']) for part in path['parts'] for a,b in zip(part['points'],part['points'][1:])]


def _bounds(points):return [min(p[i] for p in points) for i in range(3)]+[max(p[i] for p in points) for i in range(3)]


def _box_distance(a,b):return math.sqrt(sum(max(0,a[i]-b[i+3],b[i]-a[i+3])**2 for i in range(3)))


def _box_tolerance_distance(a,b,tol):return math.sqrt(sum(max(0,a[i]-b[i+3]-tol,b[i]-a[i+3]-tol)**2 for i in range(3)))


def _projected_box_distance(p,q,r,t,drop,tol):
    """A projected segment/box-swept segment certificate; projection is a lower bound."""
    axes=[i for i in range(3) if i!=drop]
    at=lambda v:(v[axes[0]],v[axes[1]])
    points=sorted(set((v[0]+dx,v[1]+dy) for v in (at(r),at(t)) for dx in (-tol,tol) for dy in (-tol,tol)))
    cross=lambda a,b,c:(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    lower=[];upper=[]
    for v in points:
        while len(lower)>1 and cross(lower[-2],lower[-1],v)<=0:lower.pop()
        lower.append(v)
    for v in reversed(points):
        while len(upper)>1 and cross(upper[-2],upper[-1],v)<=0:upper.pop()
        upper.append(v)
    polygon=lower[:-1]+upper[:-1];a,b=at(p),at(q)
    if any(all(cross(v,w,c)>=-1e-10 for v,w in zip(polygon,polygon[1:]+polygon[:1])) for c in (a,b)):return 0.
    return min(_segment_distance([*a,0],[*b,0],[*v,0],[*w,0]) for v,w in zip(polygon,polygon[1:]+polygon[:1]))


def pair_clearance(a,b,position_tolerance):
    sa,sb=_segments(a),_segments(b);radius=(a['diameterMm']+b['diameterMm'])/2
    ea=max(p['errorMm'] for p in a['parts']);eb=max(p['errorMm'] for p in b['parts'])
    ba=_bounds([p for s in sa for p in s[:2]]);bb=_bounds([p for s in sb for p in s[:2]])
    bound=_box_tolerance_distance(ba,bb,position_tolerance)-radius-ea-eb
    if bound>=22:return {'clearanceLowerMm':bound,'method':'whole-path-box-certificate'}
    best=math.inf;bounds_a=[_bounds([p,q]) for p,q,_ in sa];bounds_b=[_bounds([p,q]) for p,q,_ in sb]
    for i,(p,q,e) in enumerate(sa):
        for j,(r,t,f) in enumerate(sb):
            lower=_box_tolerance_distance(bounds_a[i],bounds_b[j],position_tolerance)-e-f
            if lower>=best:continue
            distance=_segment_distance(p,q,r,t)-math.sqrt(3)*position_tolerance-e-f
            if distance<radius+22:
                drop=max(range(3),key=lambda k:abs(q[k]-p[k]))
                distance=max(distance,_projected_box_distance(p,q,r,t,drop,position_tolerance)-e-f)
            best=min(best,distance)
    return {'clearanceLowerMm':best-radius,'method':'whole-segment-distance-with-box/projection-and-curve-bounds'}


def collision_report(main,links,s):
    rows=[]
    for i,a in enumerate(main):
        for b in main[i+1:]:
            result=pair_clearance(a,b,2*s['mainRelativePositionToleranceMm'])
            rows.append({'a':a['id'],'b':b['id'],'requiredClearMm':s['minimumIndependentMainClearMm'],**result})
    for a in main:
        for b in links:
            result=pair_clearance(a,b,s['mainRelativePositionToleranceMm']+s['linkFabricationToleranceMm'])
            rows.append({'a':a['id'],'b':b['id'],'requiredClearMm':0.,**result})
    for i,a in enumerate(links):
        for b in links[i+1:]:
            # Different groups are separated by their actual axial planes;
            # the same conservative box certificate covers the vast majority.
            result=pair_clearance(a,b,2*s['linkFabricationToleranceMm'])
            rows.append({'a':a['id'],'b':b['id'],'requiredClearMm':0.,**result})
    failures=[r for r in rows if r['clearanceLowerMm']<r['requiredClearMm']]
    return {'checkedIndependentPathPairs':len(rows),'failedPairCount':len(failures),'failures':failures,
        'governing':sorted(rows,key=lambda r:r['clearanceLowerMm']-r['requiredClearMm'])[:12],
        'physicalCageAccepted':False,'scope':'All explicit independent steel paths, complete135degree tails and closure-plane jogs. Conservative independent box-position norms; a failed lower bound is unresolved geometry, never a physical pass.'}


def internal_closure_report(main,links,s):
    rows=[]
    for p in main:
        if p['kind']=='beam-main-loop':
            rows.append({'id':p['id'],'check':'same-bar-parallel-lap',
                'clearanceLowerMm':p['lapAdverseMainSurfaceClearMm'],'requiredClearMm':s['minimumIndependentMainClearMm']})
    for p in links:
        n=len(p['parts']);a={**p,'parts':p['parts'][:2]};b={**p,'parts':p['parts'][n-2:]}
        rows.append({'id':p['id'],'check':'same-bar-opposed-hook-arcs-and-tails','requiredClearMm':0.,
            **pair_clearance(a,b,2*s['linkFabricationToleranceMm'])})
    return {'checks':rows,'failures':[r for r in rows if r['clearanceLowerMm']<r['requiredClearMm']],
        'scope':'Additional nonlocal closure checks within each single bar. Local connected tangent segments are not separate bars; each ordinary arc is less than a full circle. Fabrication/closure strength remains unsupported.'}


def quantity(main,links,wet,s):
    g=wet['settings'];volume=g['beamWidthMm']*g['beamDepthMm']*(g['beamNorthEndYMm']-g['beamSouthEndYMm'])/1e9
    for p in wet['posts']:
        a,b,c,d=p['rectangleXYMm'];volume+=(c-a)*(d-b)*(p['physicalTopZMm']-p['physicalBottomZMm'])/1e9
    steel_total=0.;steel_grid=0.;lengths={}
    for path in main+links:
        area=math.pi*path['diameterMm']**2/4;v=area*path['centrelineLengthUpperMm']/1e9;steel_total+=v
        lengths[path['kind']]=lengths.get(path['kind'],0.)+path['centrelineLengthUpperMm']/1000
        if path['kind']=='post-main':
            p=wet['posts'][path['postIndex']];inside=path['topEndZMm']-p['physicalBottomZMm'];steel_grid+=v-area*inside/1e9
    body_steel=steel_total-steel_grid
    weight=s['plainConcreteWeightKNPerM3']*(volume-body_steel)+s['steelWeightKNPerM3']*steel_total
    reference=25*volume
    native_weight=g['concreteUnitWeightKNPerM3']*volume
    return {'grossBeamAndPostVolumeM3':volume,'actualSteelVolumeUpperM3':steel_total,
        'actualSteelMassUpperKg':s['comparisonSteelMassDensityKgPerM3']*steel_total,
        'actualSteelWeightUpperKN':s['steelWeightKNPerM3']*steel_total,
        'steelInsideNewBodiesM3':body_steel,'starterSteelInExistingGridM3':steel_grid,
        'centrelineLengthUpperMByKind':lengths,'explicitCageWeightUpperKN':weight,
        'wetBodiesAt25KNPerM3WeightKN':reference,'conditionalMassBudgetReserveKN':reference-weight,
        'nativeWetConcreteWeightKNPerM3':g['concreteUnitWeightKNPerM3'],
        'nativeWetBodiesWeightKN':native_weight,'conditionalNativeMassReserveKN':native_weight-weight,
        'conditionalEquivalentWetDensityKNPerM3':weight/volume,
        'maximumPlainConcreteWeightCompatibleWithBulk25KNPerM3':(reference-s['steelWeightKNPerM3']*steel_total)/(volume-body_steel),
        'plainConcreteDensityBoundEstablished':False,'wireChairsAndExistingGridCageIncluded':False,
        'installedMass25Qualified':False,
        'scope':'Actual explicit bent/lapped/hooked paths. All starter steel below the posts is charged in full with no displaced-grid-concrete credit. Source plain24/steel78.5 are authored comparison densities; absent wire, chairs, existing grid cage and delivered-density bounds remain explicit.'}


def support_solids(wet,grid):
    g=wet['settings'];x=g['beamAxisXMm'];w=g['beamWidthMm'];rows=[{'id':'STR/wet-support/beam','boxXYZMm':[x-w/2,g['beamSouthEndYMm'],g['beamTopZMm']-g['beamDepthMm'],x+w/2,g['beamNorthEndYMm'],g['beamTopZMm']]}]
    for i,p in enumerate(wet['posts']):
        a,b,c,d=p['rectangleXYMm'];rows.append({'id':'STR/wet-support/post/'+str(i),'boxXYZMm':[a,b,p['physicalBottomZMm'],c,d,p['physicalTopZMm']]})
        owner=p['sourceGridMemberId'].split('/')[1];beam=grid['girders'][owner];axis=0 if beam['axis']=='x' else 1;lo,hi=beam['extent'];datum=beam['datum'];half=beam['width']/2
        footprint=[lo,datum-half,hi,datum+half] if axis==0 else [datum-half,lo,datum+half,hi]
        rows.append({'id':'GRID/'+owner,'boxXYZMm':[*footprint[:2],beam['z'][0],*footprint[2:],beam['z'][1]]})
        for head in grid['heads']:
            cx,cy=head['xy'];hw,hd=[v/2 for v in head['capXY']];box=[cx-hw,cy-hd,head['capZ'][0],cx+hw,cy+hd,head['capZ'][1]]
            if min(c,box[3])>max(a,box[0]) and min(d,box[4])>max(b,box[1]):rows.append({'id':'CAP/'+head['id'],'boxXYZMm':box})
    return list({r['id']:r for r in rows}.values())


def _outside_faces(solids):
    from foundation_solid_weight import subtract_box
    rows=[]
    for i,row in enumerate(solids):
        box=row['boxXYZMm']
        for axis in range(3):
            others=[k for k in range(3) if k!=axis]
            for sign in (-1,1):
                value=box[axis+(3 if sign==1 else 0)];pieces=[[box[others[0]],box[others[1]],0,box[others[0]+3],box[others[1]+3],1]]
                for j,other in enumerate(solids):
                    if i==j:continue
                    b=other['boxXYZMm']
                    covers=(b[axis]<=value and b[axis+3]>value) if sign==1 else (b[axis]<value and b[axis+3]>=value)
                    if covers:pieces=[p for piece in pieces for p in subtract_box(piece,[b[others[0]],b[others[1]],0,b[others[0]+3],b[others[1]+3],1])]
                for piece in pieces:
                    face=[0.]*6;face[axis]=face[axis+3]=value
                    face[others[0]],face[others[1]],face[others[0]+3],face[others[1]+3]=piece[0],piece[1],piece[3],piece[4]
                    rows.append({'solidId':row['id'],'rectangleBoxXYZMm':face})
    return rows


def _segment_box_distance(p,q,box):
    direction=[b-a for a,b in zip(p,q)];cuts={0.,1.}
    for i,v in enumerate(direction):
        if v:
            for end in (box[i],box[i+3]):
                t=(end-p[i])/v
                if 0<t<1:cuts.add(t)
    cuts=sorted(cuts);best=math.inf
    for a,b in zip(cuts,cuts[1:]):
        middle=(a+b)/2;active=[]
        for i,v in enumerate(direction):
            value=p[i]+middle*v
            if value<box[i]:active.append((p[i]-box[i],v))
            elif value>box[i+3]:active.append((p[i]-box[i+3],v))
        denominator=sum(v*v for _,v in active)
        t=max(a,min(b,-sum(c*v for c,v in active)/denominator)) if denominator else middle
        best=min(best,math.sqrt(sum((c+v*t)**2 for c,v in active)))
    return best


def _segment_inside_union(p,q,solids):
    intervals=[]
    for row in solids:
        box=row['boxXYZMm'];lo,hi=0.,1.
        for i in range(3):
            delta=q[i]-p[i]
            if delta:
                a,b=sorted(((box[i]-p[i])/delta,(box[i+3]-p[i])/delta));lo=max(lo,a);hi=min(hi,b)
            elif not box[i]-1e-9<=p[i]<=box[i+3]+1e-9:lo,hi=1.,0.;break
        if lo<=hi:intervals.append((lo,hi))
    end=0.
    for a,b in sorted(intervals):
        if a>end+1e-8:return False
        end=max(end,b)
    return end>=1-1e-8


def cover_report(paths,solids,s):
    faces=_outside_faces(solids);result=[]
    for path in paths:
        tolerance=s['cageInstallationToleranceMm']+(s['mainRelativePositionToleranceMm'] if path['kind'] in ('beam-main-loop','post-main') else s['linkFabricationToleranceMm'])
        expanded=[{**f,'box':[v-tolerance if i<3 else v+tolerance for i,v in enumerate(f['rectangleBoxXYZMm'])]} for f in faces]
        minimum=math.inf;governing=None;outside=False
        for p,q,error in _segments(path):
            if not _segment_inside_union(p,q,solids):outside=True;break
            bounds=_bounds([p,q])
            for face in expanded:
                if _box_distance(bounds,face['box'])-error>=minimum:continue
                distance=_segment_box_distance(p,q,face['box'])-error
                if distance<minimum:minimum=distance;governing=face['solidId']
        lower=minimum-path['diameterMm']/2 if not outside else -1.
        result.append({'id':path['id'],'outsideActualSolidUnion':outside,'minimumAdverseCoverLowerMm':lower,'governingBoundarySource':governing})
    return {'exactSourceSolids':solids,'outsideBoundaryFaceCount':len(faces),'paths':result,
        'failedPaths':[r for r in result if r['minimumAdverseCoverLowerMm']<s['minimumConcreteCoverMm']],
        'existingGridReinforcementClearanceKnown':False,'physicalCoverQualified':False,
        'scope':'Exact orthogonal source-solid union boundary; segment/expanded-face distances include independent coordinate-box installation/fabrication and interpolation allowances. No cap, beam depth or material is invented; existing grid reinforcement is unknown.'}


def longitudinal_intersections(paths,axis,station,kind):
    points=[]
    for path in paths:
        if path['kind']!=kind:continue
        for part in path['parts']:
            if part['kind']!='line':continue
            p,q=part['points'];delta=q[axis]-p[axis]
            if not delta or any(abs(q[i]-p[i])>1e-9 for i in range(3) if i!=axis):continue
            if not min(p[axis],q[axis])-1e-8<=station<=max(p[axis],q[axis])+1e-8:continue
            point=list(p);point[axis]=station
            if not any(r['id']==path['id'] and math.dist(r['pointXYZMm'],point)<1e-8 for r in points):points.append({'id':path['id'],'pointXYZMm':point,'diameterMm':path['diameterMm']})
    return points


def gross_compression_kern_screen(N,mx,my,width,depth):
    """Necessary gross-section diagnostic; tiny unloaded rows are not failures."""
    force_tolerance=1e-8;moment_tolerance=1e-4  # kN and kNmm, numerical comparison only.
    ratio=None;condition=None
    if abs(N)<=force_tolerance:
        status=('not-loaded-not-applicable' if max(abs(mx),abs(my))<=moment_tolerance
            else 'unsupported-moment-without-compression')
    elif N<0:status='unsupported-axial-tension'
    else:
        ratio=6*(abs(mx)/(depth*N)+abs(my)/(width*N));condition=ratio<=1
        status='gross-full-compression-necessary-condition-'+('satisfied' if condition else 'not-satisfied')
    return {'grossUncrackedFullCompressionKernRatio':ratio,
        'grossFullCompressionNecessaryCondition':condition,'grossCompressionKernStatus':status,
        'grossCompressionKernNumericalTolerance':{'axialCompressionKN':force_tolerance,'bendingMomentKNmm':moment_tolerance}}


def simultaneous_section_screens(native,main,s):
    wet=native['seatedWetSupport'];g=wet['settings'];records=[];head=[];rows=native['nativeVertical']['native'];bar=s['mainDiameterMm']
    for row in rows['memberCuts']+rows['interiorMemberCuts']:
        if not row['memberId'].startswith('WET-SUPPORT/beam/'):continue
        if row['breadthMm']!=g['beamWidthMm'] or row['depthMm']!=g['beamDepthMm']:raise ValueError('Detached or changed beam geometry cannot inherit native actions')
        steel=longitudinal_intersections(main,1,row['physicalPointMm'][1],'beam-main-loop')
        record={'memberId':row['memberId'],'end':row['end'],'physicalPointMm':row['physicalPointMm'],
            'simultaneousActions':{k:row[k] for k in ('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')},'actualStraightBarIntersections':steel,
            'positionToleranceResistanceEvaluated':False,'anchorageAndBiaxialResistanceAccepted':False}
        if len(steel)<4:
            record.update(status='unsupported-return-or-jog-D-region',sectionRatio=None)
        else:
            N=row['axialCompressionKN'];b,d=row['breadthMm'],row['depthMm'];x,z=row['physicalPointMm'][0],row['physicalPointMm'][2]
            y_positions=[r['pointXYZMm'][2]-(z-d/2) for r in steel];z_positions=[r['pointXYZMm'][0]-(x-b/2) for r in steel]
            cy=min(_layer_capacity(b,d,y_positions,N,rev,bar,s['comparisonSteelFraction']) for rev in (False,True))
            cz=min(_layer_capacity(d,b,z_positions,N,rev,bar,s['comparisonSteelFraction']) for rev in (False,True))
            record.update(status='necessary-nominal-straight-section',capacityYKNm=cy,capacityZKNm=cz,
                sectionRatio=abs(row['bendingYKNm'])/cy+abs(row['bendingZKNm'])/cz if min(cy,cz)>0 else None)
        inset=s['linkNominalCoverMm']+s['linkDiameterMm']/2;radius=(s['linkClosureMandrelMm']+s['linkDiameterMm'])/2
        w,h=g['beamWidthMm']-2*inset,g['beamDepthMm']-2*inset;Ak=w*h-(4-math.pi)*radius**2
        flow=abs(row['shearYKN'])*1000/(2*.9*(g['beamWidthMm']-s['beamNormalMainFaceMm']))+abs(row['shearZKN'])*1000/(2*.9*(g['beamDepthMm']-s['beamMainFaceMm']))+abs(row['torsionKNm'])*1e6/(2*Ak)
        supply=math.pi*s['linkDiameterMm']**2/4*s['sourceSteelYieldMPa']*s['comparisonSteelFraction']/s['linkPitchMm']
        record.update(necessaryThinCellLinkFlowRatio=flow/supply,actualHookClosureStrengthAccepted=False)
        records.append(record)
    for index,post in enumerate(wet['posts']):
        a,b,c,d=post['rectangleXYMm'];cx,cy=(a+c)/2,(b+d)/2
        for end,z in ((0,post['physicalBottomZMm']),(1,post['physicalTopZMm'])):
            wrench=post['recovery']['physicalEndWrenchesKN_KNmm'][6*end:6*end+6];N=wrench[2]*(1 if end==0 else -1)
            steel=[r for r in longitudinal_intersections(main,2,z,'post-main') if r['id'].startswith('STR/WET-CAGE/post/'+str(index)+'/')]
            row={'postId':post['id'],'end':end,'physicalPointMm':[cx,cy,z],'simultaneousGlobalWrenchKN_KNmm':wrench,'axialCompressionKN':N,'actualStraightBarIntersections':steel,
                'status':'unsupported-post-head-D-region' if len(steel)<8 else 'necessary-nominal-straight-section','postHeadDRegionAccepted':False,'gridAnchorageAccepted':False}
            if len(steel)==8:
                mx,my=wrench[3]/1000,wrench[4]/1000
                capx=min(_layer_capacity(c-a,d-b,[r['pointXYZMm'][1]-b for r in steel],N,rev,bar,s['comparisonSteelFraction']) for rev in (False,True))
                capy=min(_layer_capacity(d-b,c-a,[r['pointXYZMm'][0]-a for r in steel],N,rev,bar,s['comparisonSteelFraction']) for rev in (False,True))
                row.update(capacityXKNm=capx,capacityYKNm=capy,sectionRatio=abs(mx)/capx+abs(my)/capy if min(capx,capy)>0 else None)
            if end==1:
                row.update(gross_compression_kern_screen(N,wrench[3],wrench[4],c-a,d-b))
            head.append(row)
    return {'beamCuts':records,'postCuts':head,'completeSignedLoadEnvelope':False,'beamEndDRegionAccepted':False,
        'scope':'Every comparison retains one actual simultaneous six-action row and its real straight-bar path intersections. Curved returns, shallow jogs and post-head terminations are unsupported D-regions. Source17MPa rectangular strain compatibility and nominal bar positions are necessary controls; no full biaxial, tolerance-domain, shear/torsion strut, hook or anchorage acceptance.'}


def assess(native,grid,s=None,with_collisions=True):
    s=comparison_settings() if s is None else s;validate_inputs(native,grid,s);wet=native['seatedWetSupport'];main,links=build_paths(wet,s)
    full=s['sourceSteelYieldMPa'];bar=s['mainDiameterMm'];area=math.pi*bar*bar/4
    result={'schema':'str-wet-support-cage-path-result/1','settings':s,'nativeSourceSHA256':native['sourceSHA256'],
        'parsedGridSemanticSHA256':hashlib.sha256(json.dumps(grid,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest(),
        'rawGridIdentityVerified':False,
        'nativeCaseId':native['nativeVertical']['native']['caseId'],'authoredPadOffsetsYMm':wet['settings']['padCentreOffsetsYMm'],
        'caseRole':'centred-reference-comparison' if wet['settings']['padCentreOffsetsYMm']==[0.,0.] else 'adverse-authored-edit-probe',
        'mainBars':main,'links':links,'quantities':quantity(main,links,wet,s),
        'fullYieldGoodBondDevelopmentMm':bar*full/(4*s['sourceGoodBondMPa']),
        'fullYieldPoorBondDevelopmentMm':bar*full/(4*s['sourcePoorBondMPa']),
        'sourceFullYieldMandrelComparisonMm':area*full*(1/(s['minimumConcreteCoverMm']+bar/2)+1/(2*bar))/s['sourceConcreteCompressionMPa'],
        'actualPad220mmBearingMaterial':False,'beamEndDRegionAccepted':False,'postHeadDRegionAccepted':False,
        'postBaseGridJointAccepted':False,'completeSignedLoadEnvelope':False,'cageAccepted':False,
        'scope':'Exploratory source-independent geometry and quantities on the exact supplied native case. No accepted design, full anchorage, bond/splitting/bursting, torsion strut, concrete pressure, joint or physical fabrication evidence is supplied.'}
    from wet_post_head_duties import post_duty
    result['postHeadDuties']=[post_duty(p) for p in wet['posts']]
    result['simultaneousSectionScreens']=simultaneous_section_screens(native,main,s)
    if with_collisions:
        result['collisions']=collision_report(main,links,s)
        result['internalClosures']=internal_closure_report(main,links,s)
        result['cover']=cover_report(main+links,support_solids(wet,grid),s)
    return result


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--native',type=Path);parser.add_argument('--grid',type=Path);parser.add_argument('--output',type=Path)
    parser.add_argument('--settings',type=Path,help='Explicit authored choice file, validated against the same admitted domain')
    parser.add_argument('--skip-collisions',action='store_true')
    modes=parser.add_mutually_exclusive_group();modes.add_argument('--read-settings',action='store_true');modes.add_argument('--validate-settings',action='store_true');modes.add_argument('--stdin',action='store_true')
    args=parser.parse_args()
    if args.settings and (args.read_settings or args.validate_settings or args.stdin):parser.error('--settings is only supported by the explicit-file mode')
    if args.read_settings:
        print(json.dumps(comparison_settings(),allow_nan=False));sys.exit(0)
    if args.validate_settings:
        print(json.dumps(validate_settings(json.load(sys.stdin)),allow_nan=False));sys.exit(0)
    if args.stdin:
        data=json.load(sys.stdin)
        if not isinstance(data,dict) or set(data)!={'native','grid','settings'}:raise ValueError('Exact native/grid/settings payload required')
        print(json.dumps(assess(data['native'],data['grid'],data['settings'],not args.skip_collisions),allow_nan=False));sys.exit(0)
    if not all((args.native,args.grid,args.output)):parser.error('--native, --grid and --output are required outside stdin/settings modes')
    native=json.loads(args.native.read_text());grid_bytes=args.grid.read_bytes()
    if hashlib.sha256(grid_bytes).hexdigest()!=native['sourceSHA256'].get('project/str/studies/current-house-grid.json'):
        raise ValueError('Explicit grid file bytes do not match the supplied native source identity')
    settings=validate_settings(json.loads(args.settings.read_text())) if args.settings else comparison_settings()
    grid=json.loads(grid_bytes);result=assess(native,grid,settings,with_collisions=not args.skip_collisions);result['rawGridIdentityVerified']=True
    args.output.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    print('main',len(result['mainBars']),'links',len(result['links']),'quantity',result['quantities'])
    if 'collisions' in result:print('collisionFailures',result['collisions']['failedPairCount'],result['collisions']['governing'][:3])
