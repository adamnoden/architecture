import argparse
import hashlib
import itertools
import json
import math
from pathlib import Path


METHOD = 'project/str/studies/continuous_rc_cage.py'


def reference_cage_case():
    return {'schema':'str-continuous-rc-cage-case/1','normalCoreMm':290.,'upstandWidthMm':200.,
        'supportMode':'continuous-rc-through-former-DPC',
        'barDiameterMm':12.,'linkDiameterMm':8.,'linkMandrelMm':32.,'barMandrelMm':160.,
        'nominalLinkCoverMm':45.,'minimumCoverMm':40.,'cageSettingToleranceMm':5.,
        'relativeBarBoxToleranceMm':5.,'minimumIndependentBarClearanceMm':21.,
        'ordinaryLinkPitchMm':100.,'jointLinkPitchMm':50.,'lapLinkPitchMm':75.,
        'barrierLinkKeepoutHalfHeightMm':40.,
        'archTailInwardOffsetMm':10.,
        'archStraightTailMm':500.,'lapLengthMm':1000.,'lapIntervalsXMm':[[4550.,5550.],[6450.,7450.]],
        'goodBondMPa':3.,'poorBondFactor':.7,'concreteCompressionMPa':17.,
        'steelYieldMPa':500/1.15,'strengthSteelFraction':.92,
        'status':'authored-cage-comparison-not-structural-selection'}


def _admit(case):
    reference=reference_cage_case()
    if not isinstance(case,dict) or set(case)!=set(reference):
        raise ValueError('Exact authored cage case required; no source, result or approval injection')
    if case['schema']!=reference['schema'] or case['status']!=reference['status']:
        raise ValueError('Unsupported cage scope')
    for key,value in case.items():
        if key in ('schema','status','lapIntervalsXMm','supportMode'):continue
        if type(value) not in (int,float) or not math.isfinite(value) or value<=0:
            raise ValueError('Positive finite cage dimensions and material comparisons required')
    if not 200<=case['normalCoreMm']<=350 or not 160<=case['upstandWidthMm']<=250:
        raise ValueError('Cage comparison geometry outside bounded domain')
    if case['supportMode'] not in ('continuous-rc-through-former-DPC','historical-rocking-DPC-upper-loops'):
        raise ValueError('Unsupported physical support/capillary boundary')
    if not 8<=case['barDiameterMm']<=16 or case['barMandrelMm']<4*case['barDiameterMm']:
        raise ValueError('Unsupported main bar/mandrel comparison')
    if len(case['lapIntervalsXMm'])!=2 or any(len(row)!=2 or row[1]-row[0]!=case['lapLengthMm'] for row in case['lapIntervalsXMm']):
        raise ValueError('Two actual staggered lap intervals required')


def _smooth(t):
    t=max(0.,min(1.,t))
    return t*t*(3-2*t)


def _samples(fn,a,b,count=60):
    return [fn(a+(b-a)*i/count) for i in range(count+1)]


def _length(points):
    return math.fsum(math.dist(a,b) for a,b in zip(points,points[1:]))


def _segment_distance(p,q,a,b):
    u=[y-x for x,y in zip(p,q)];v=[y-x for x,y in zip(a,b)];w=[x-y for x,y in zip(p,a)]
    dot=lambda x,y:math.fsum(i*j for i,j in zip(x,y))
    aa,bb,cc,dd,ee=dot(u,u),dot(u,v),dot(v,v),dot(u,w),dot(v,w)
    clip=lambda value:max(0.,min(1.,value))
    if aa<=1e-12:s=0.;t=clip(ee/cc) if cc>1e-12 else 0.
    elif cc<=1e-12:t=0.;s=clip(-dd/aa)
    else:
        den=aa*cc-bb*bb;s=clip((bb*ee-cc*dd)/den) if den>1e-12 else 0.
        t=(bb*s+ee)/cc
        if t<0:t=0.;s=clip(-dd/aa)
        elif t>1:t=1.;s=clip((bb-dd)/aa)
    return math.sqrt(math.fsum((x+s*i-y-t*j)**2 for x,i,y,j in zip(p,u,a,v)))


def _path_distance(a,b):
    return min(_segment_distance(p,q,r,s) for p,q in zip(a,a[1:]) for r,s in zip(b,b[1:]))


def _rounded_quarter_distance(point,centre,radius,sx,sy):
    dx,dy=(point[0]-centre[0])*sx,(point[1]-centre[1])*sy
    if dx>=0 and dy>=0:return abs(math.hypot(dx,dy)-radius)
    return min(math.hypot(dx-radius,dy),math.hypot(dx,dy-radius))


def _rounded_hoop_points(width,depth,cover,diameter,mandrel,z=0.):
    radius=(mandrel+diameter)/2
    a,b=width/2-cover-diameter/2,depth/2-cover-diameter/2
    points=[]
    for cx,cy,start in ((a-radius,b-radius,0.),(-a+radius,b-radius,math.pi/2),
                         (-a+radius,-b+radius,math.pi),(a-radius,-b+radius,3*math.pi/2)):
        points.extend(_samples(lambda t:[cx+radius*math.cos(t),cy+radius*math.sin(t),z],start,start+math.pi/2,12))
    return points+[points[0]]


def cage_geometry(case,portal):
    _admit(case)
    fixed={'rawSpan':2960,'rawSpring':2250,'rawRise':600,'ring':215,'coreAxial':215,'finishedAxial':775}
    if any(portal.get(key)!=value for key,value in fixed.items()) or portal['piers']['westEW']!=[4307.5,4520] or portal['piers']['eastEW']!=[7480,7692.5]:
        raise ValueError('Changed source opening/along-X geometry requires explicit cage reauthoring')
    bar=case['barDiameterMm'];link=case['linkDiameterMm'];cover=case['nominalLinkCoverMm']
    rlink=(case['linkMandrelMm']+link)/2
    face=cover+link/2+rlink
    along=portal['piers']['westEW'][1]-portal['piers']['westEW'][0]
    breadth=case['normalCoreMm'];outer=(breadth-2*face)/2;inner=outer/3
    halfx=along/2-face;tol=case['relativeBarBoxToleranceMm']
    points=[{'family':family,'xyMm':[sx*(halfx-(case['archTailInwardOffsetMm'] if family=='arch-tail' else 0)),sy*y]} for family,y in (('post',outer),('arch-tail',inner)) for sx,sy in itertools.product((-1,1),repeat=2)]
    pairs=[]
    for a,b in itertools.combinations(points,2):
        differences=[max(0.,abs(x-y)-2*tol) for x,y in zip(a['xyMm'],b['xyMm'])]
        pairs.append({'a':a,'b':b,'nominalClearMm':math.dist(a['xyMm'],b['xyMm'])-bar,
            'adverseBoxClearMm':math.hypot(*differences)-bar})
    worst=min(pairs,key=lambda row:row['adverseBoxClearMm'])
    min_rounded=math.inf
    corner=[-halfx,outer];centre=[-halfx,outer]
    for dx,dy in itertools.product((-tol,tol),repeat=2):
        point=[corner[0]+dx,corner[1]+dy]
        min_rounded=min(min_rounded,_rounded_quarter_distance(point,centre,rlink,-1,1)-bar/2-link/2)
    rbar=(case['barMandrelMm']+bar)/2
    foot_y=rbar
    foot_clear=math.inf
    for sx,sy in itertools.product((-1,1),repeat=2):
        c=[sx*halfx,sy*outer]
        for dx,dy in itertools.product((-tol,tol),repeat=2):
            p=[sx*halfx+dx,sy*foot_y+dy]
            foot_clear=min(foot_clear,_rounded_quarter_distance(p,c,rlink,sx,sy)-bar/2-link/2)
    source_glass=dict(portal['wrap']['composition'])['bareCellularGlass']
    glass=source_glass-(breadth-portal['coreAxial'])/2
    fbd=case['goodBondMPa'];fy=case['steelYieldMPa']
    good=bar*fy/(4*fbd);poor=good/case['poorBondFactor']
    return {'schema':'str-continuous-rc-cage-geometry/1','mainBarCentreFaceMm':face,'postAlongMm':along,
        'westPierAlongBoundsMm':portal['piers']['westEW'],
        'normalCoreMm':breadth,'upstandWidthMm':case['upstandWidthMm'],'outerPostBarNormalOffsetMm':outer,
        'nestedArchTailNormalOffsetMm':inner,'jointEightBarCoordinates':points,
        'worstIndependentBarPair':worst,'minimumRoundedHoopToMainBarSurfaceMm':min_rounded,
        'minimumFootLoopToRoundedHoopSurfaceMm':foot_clear,'minimumActualLinkCoverMm':cover-case['cageSettingToleranceMm'],
        'roundedLinkCentrelineRadiusMm':rlink,'mainBendCentrelineRadiusMm':rbar,
        'goodBondFullYieldDevelopmentMm':good,'poorBondFullYieldDevelopmentMm':poor,
        'archTailStraightLengthReserveMm':case['archStraightTailMm']-good,
        'lapRequiredConservativePoorBondMm':1.5*poor,'lapReserveMm':case['lapLengthMm']-1.5*poor,
        'sourceFaceCellularGlassMm':source_glass,'newFaceCellularGlassMm':glass,
        'faceGlassLossMm':source_glass-glass,'mineralLiningMm':dict(portal['wrap']['composition'])['mineralLining'],
        'finishedEnvelopeMm':breadth+2*(glass+dict(portal['wrap']['composition'])['mineralLining']),
        'upperJointFitsAdverseBox':worst['adverseBoxClearMm']>=case['minimumIndependentBarClearanceMm'] and min_rounded>=0,
        'upstandOppositeFaceAdverseClearMm':case['upstandWidthMm']-2*face-bar-2*tol,
        'upstandBarRowFitsAdverseBox':case['upstandWidthMm']-2*face-bar-2*tol>=case['minimumIndependentBarClearanceMm'],
        'footLoopFitsAdverseBox':foot_clear>=0,'materialOrStructureAccepted':False}


def arch_bar_paths(case,portal):
    g=cage_geometry(case,portal);left,right=portal['piers']['westEW'];centre=sum((left,right))/2
    global_x=6000.;cz=portal['centreZ'];ri=portal['rawRadius'];ro=ri+portal['ring']
    face=g['mainBarCentreFaceMm'];radius=g['mainBendCentrelineRadiusMm'];inner=g['nestedArchTailNormalOffsetMm'];outer=g['outerPostBarNormalOffsetMm']
    rows=[]
    for layer,large,tail_x in [('intrados',ri+face,right-face-case['archTailInwardOffsetMm']),('extrados',ro-face,left+face+case['archTailInwardOffsetMm'])]:
        fx=tail_x+radius;fz=cz+math.sqrt((large-radius)**2-(fx-global_x)**2)
        tx=global_x+large/(large-radius)*(fx-global_x);tz=cz+large/(large-radius)*(fz-cz)
        end_theta=math.atan2(tz-cz,tx-global_x)
        bend_theta=math.atan2(tz-fz,tx-fx)
        for sign in (-1,1):
            def normal(x):
                return sign*(inner+(outer-inner)*_smooth((x-right)/(5000-right)))
            left_tail=[[tail_x,sign*inner,fz-case['archStraightTailMm']],[tail_x,sign*inner,fz]]
            bend=_samples(lambda t:[fx+radius*math.cos(t),sign*inner,fz+radius*math.sin(t)],math.pi,bend_theta,30)
            arc=_samples(lambda t:[global_x+large*math.cos(t),normal(min(global_x+large*math.cos(t),12000-global_x-large*math.cos(t))),cz+large*math.sin(t)],end_theta,math.pi-end_theta,160)
            right_bend=[[12000-x,y,z] for x,y,z in reversed(bend)]
            right_tail=[[12000-x,y,z] for x,y,z in reversed(left_tail)]
            points=left_tail+bend[1:]+arc[1:]+right_bend[1:]+right_tail[1:]
            rows.append({'id':layer+'/'+str(sign),'diameterMm':case['barDiameterMm'],'pointsMm':points,
                'leftTangentPointMm':[tx,sign*inner,tz],'leftVerticalTailTopMm':[tail_x,sign*inner,fz],
                'centrelineLengthMm':_length(points),'straightTailMm':case['archStraightTailMm'],
                'normalJogsEndAtPhysicalColumnFaceXMm':right})
    return rows


def frame_bar_paths(case,portal,upstand_top):
    g=cage_geometry(case,portal);face=g['mainBarCentreFaceMm'];r=g['mainBendCentrelineRadiusMm']
    outer=g['outerPostBarNormalOffsetMm'];beam_y=case['upstandWidthMm']/2-face
    left,right=portal['piers']['westEW'];bottom_joint=-30.
    foot_bottom=bottom_joint+case['minimumCoverMm']+case['barDiameterMm']/2+case['cageSettingToleranceMm']+5
    foot_z=foot_bottom+r
    continuous=case['supportMode']=='continuous-rc-through-former-DPC'
    start_z=-680 if continuous else foot_z
    rows=[]
    for layer,x,beam_z in [('bottom',right-face,3170+face),('top',left+face,upstand_top-face)]:
        for side in ('west','east'):
            mirror=side=='east'
            branches=[]
            for sign,lap in ((1,case['lapIntervalsXMm'][0]),(-1,case['lapIntervalsXMm'][1])):
                def y_at(z):
                    low=outer if continuous else r+(outer-r)*_smooth((z-foot_z)/(700-foot_z))
                    return sign*(low-(outer-beam_y)*_smooth((z-2600)/500))
                vertical=_samples(lambda z:[x,y_at(z),z],start_z,beam_z-r,100)
                bend=_samples(lambda t:[x+r+r*math.cos(t),sign*beam_y,beam_z-r+r*math.sin(t)],math.pi,math.pi/2,30)
                target=lap[1] if not mirror else 12000-lap[0]
                local_lap=lap if not mirror else [12000-lap[1],12000-lap[0]]
                ramp_start=max(x+r,local_lap[0]-300)
                def horizontal_at(xx):
                    weight=_smooth((xx-ramp_start)/(local_lap[0]-ramp_start)) if xx<local_lap[0] else 1.
                    if xx>local_lap[1]:weight=1-_smooth((xx-local_lap[1])/300)
                    layer_jog=10 if layer=='bottom' else -10
                    pack_offset=-case['barDiameterMm']/2 if not mirror else case['barDiameterMm']/2
                    return [xx,sign*beam_y,beam_z+(layer_jog+pack_offset)*weight]
                horizontal=_samples(horizontal_at,x+r,target,60)
                points=vertical+bend[1:]+horizontal[1:]
                if mirror:points=[[12000-a,b,c] for a,b,c in points]
                if continuous:
                    rows.append({'id':layer+'/'+side+'/'+str(sign),'diameterMm':case['barDiameterMm'],'pointsMm':points,
                        'centrelineLengthMm':_length(points),'minimumSteelCentreZMm':start_z,
                        'lowestSteelSurfaceNominalMm':start_z,'formerDPCIntervalMm':[-50.,-30.],'crossesDPC':True,
                        'laps':'1000mm contact-lap packs, staggered between two normal faces; localverticaljogs preserveactualclosedlink fit.'})
                branches.append(points)
            if continuous:continue
            xx=12000-x if mirror else x
            foot=_samples(lambda t:[xx,r*math.cos(t),foot_z-r*math.sin(t)],0,math.pi,60)
            points=list(reversed(branches[0]))+foot[1:]+branches[1][1:]
            rows.append({'id':layer+'/'+side,'diameterMm':case['barDiameterMm'],'pointsMm':points,
                'centrelineLengthMm':_length(points),'minimumSteelCentreZMm':foot_bottom,
                'lowestSteelSurfaceNominalMm':foot_bottom-case['barDiameterMm']/2,
                'DPCUpperFaceMm':bottom_joint,'crossesDPC':False,
                'laps':'Staggered1000mm contact-lap packs; localZpair±6 about ten-mm-inward jogged baseplane. Pack tied as one unit, not independent overlapping bars.'})
    return rows


def post_hoop_layout(case,portal):
    g=cage_geometry(case,portal);lo,hi=portal['piers']['westEW'];centre=(lo+hi)/2
    sides=[lo+case['nominalLinkCoverMm']+case['linkDiameterMm']/2,hi-case['nominalLinkCoverMm']-case['linkDiameterMm']/2]
    arches=[row['pointsMm'] for row in arch_bar_paths(case,portal)[::2]]
    arches=[[p for p in row if p[0]<=5000] for row in arches]
    def distance(point,a,b):
        u=[b[0]-a[0],b[2]-a[2]];v=[point[0]-a[0],point[1]-a[2]];den=_dot(u,u)
        t=max(0.,min(1.,_dot(u,v)/den)) if den>1e-12 else 0.
        return math.hypot(v[0]-t*u[0],v[1]-t*u[1])
    def nearest(z):
        return min(distance([x,z],p,q) for x in sides for row in arches for p,q in zip(row,row[1:]))
    threshold=(case['barDiameterMm']+case['linkDiameterMm'])/2+math.sqrt(3)*case['relativeBarBoxToleranceMm']+2.
    allowed=[];blocked=[];distances={}
    for z in range(-130,3111,10):
        if abs(z+40)<case['barrierLinkKeepoutHalfHeightMm']:
            blocked.append(z);continue
        d=nearest(z)
        distances[z]=d
        (allowed if d>=threshold else blocked).append(z)
    levels=[-130]
    while levels[-1]<3110:
        last=levels[-1];pitch=case['jointLinkPitchMm'] if 1700<=last<=2700 else case['ordinaryLinkPitchMm']
        target=min(3110,last+pitch);before=[z for z in allowed if last<z<=target]
        levels.append(max(before) if before else min(z for z in allowed if z>target))
    maximum=max(b-a for a,b in zip(levels,levels[1:]))
    joint_max=max(b-a for a,b in zip(levels,levels[1:]) if 1700<=a<=2700)
    if maximum>case['ordinaryLinkPitchMm']:raise ValueError('Actual post-hoop passage exceeds the100mm strength comparison')
    radius=g['roundedLinkCentrelineRadiusMm'];a=g['postAlongMm']-2*(case['nominalLinkCoverMm']+case['linkDiameterMm']/2)
    b=case['normalCoreMm']-2*(case['nominalLinkCoverMm']+case['linkDiameterMm']/2)
    length=2*(a+b-4*radius)+2*math.pi*radius
    return {'stationsZMm':levels,'westPostCentreXMm':centre,'closedLoopCentrelineAlongWidthMm':a,
        'closedLoopCentrelineNormalWidthMm':b,'roundedCornerRadiusMm':radius,
        'maximumActualPitchMm':maximum,'jointTargetPitchMm':case['jointLinkPitchMm'],'maximumJointActualPitchMm':joint_max,
        'minimumAdverseArchToHoopSurfaceClearMm':min(distances[z] for z in levels)-(case['barDiameterMm']+case['linkDiameterMm'])/2-math.sqrt(3)*case['relativeBarBoxToleranceMm'],
        'blockedStationsZMm':blocked,'barrierKeepoutZMm':[-40-case['barrierLinkKeepoutHalfHeightMm'],-40+case['barrierLinkKeepoutHalfHeightMm']],
        'bareHoopLengthMmEachExcludingClosures':length,
        'barePostHoopKgAllFourPostsExcludingClosures':4*len(levels)*length*math.pi*case['linkDiameterMm']**2/4*7.85e-6,
        'closureHookPathsQualified':False,'scope':'Rounded closed-loop envelopes avoid actual archbarpaths. Jointtarget50mmislocallyadjusted; allactualgapsremain<=100mmusedbystrengthscreen. Closurehooksarenotinvented.'}


def rectangular_capacity(breadth,depth,face_a,face_b,axial,reverse,bar=12.,steel_fraction=.92):
    if reverse:face_a,face_b=depth-face_b,depth-face_a
    steel=2*math.pi*bar**2/4;limit=steel_fraction*500/1.15
    def at(x):
        width=min(depth,.8*x);force=17*width*breadth;moment=force*(depth/2-width/2)
        for position in (face_a,face_b):
            stress=max(-limit,min(limit,.0035*(1-position/x)*200000))
            n=steel*(stress-(17 if position<width else 0));force+=n;moment+=n*(depth/2-position)
        return force/1000,moment/1e6
    lo,hi=.001,2500.
    for _ in range(40):
        mid=(lo+hi)/2
        if at(mid)[0]<axial:lo=mid
        else:hi=mid
    return at((lo+hi)/2)[1]


def _dot(a,b):return math.fsum(x*y for x,y in zip(a,b))


def _cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]


def recover_member_cuts(model,raw):
    rows=[]
    for name,member in model['members'].items():
        a,b=member['physicalStartMm'],member['physicalEndMm'];length=math.dist(a,b)
        axis=[(v-u)/length for u,v in zip(a,b)];yy=[0.,1.,0.];zz=_cross(axis,yy)
        for end,node in enumerate((member['a'],member['b'])):
            wrench=raw['memberEndWrenchesKN_KNmm'][name][end*6:(end+1)*6];force=wrench[:3]
            physical=(a,b)[end];offset=[u-v for u,v in zip(model['model'].nodes[node],physical)]
            moment=[v+w for v,w in zip(wrench[3:],_cross(offset,force))]
            rows.append({'memberId':name,'end':end,'kind':member['kind'],'physicalPointMm':list(physical),
                'breadthMm':member['breadthMm'],'depthMm':member['depthMm'],
                'axialCompressionKN':_dot(force,axis)*(1 if end==0 else -1),
                'shearYKN':_dot(force,yy),'shearZKN':_dot(force,zz),'torsionKNm':_dot(moment,axis)/1000,
                'bendingYKNm':_dot(moment,yy)/1000,'bendingZKNm':_dot(moment,zz)/1000,
                'globalPhysicalCutWrenchKN_KNm':[*force,*[v/1000 for v in moment]]})
    return rows


def screen_member_cuts(case,portal,rows):
    g=cage_geometry(case,portal);face=g['mainBarCentreFaceMm'];bar=case['barDiameterMm'];rlink=g['roundedLinkCentrelineRadiusMm']
    answer=[]
    for row in rows:
        if row['kind']=='post' and row['physicalPointMm'][2]<-30 and case['supportMode']=='historical-rocking-DPC-upper-loops':continue
        b,d=row['breadthMm'],row['depthMm'];x,y,z=row['physicalPointMm']
        if abs(b-case['normalCoreMm'])>.0001 and row['kind']!='upstand':
            raise ValueError('Actual native post/ring core differs from cage; do not screen stale215/240 forces as290')
        expected_depth=g['postAlongMm'] if row['kind']=='post' else portal['ring'] if row['kind']=='curved-ring' else (750 if row['memberId'].startswith('outer-north/') else 650)
        if abs(d-expected_depth)>.0001:raise ValueError('Actual source member depth changed; reauthor the bounded cage geometry')
        expected_depth=g['postAlongMm'] if row['kind']=='post' else portal['ring'] if row['kind']=='curved-ring' else 750 if row['memberId'].startswith('outer-north/') else 650
        if abs(d-expected_depth)>.0001:
            raise ValueError('Changed native along-X/radial/upstand depth requires explicit cage reauthoring')
        if row['kind']=='upstand' and abs(b-case['upstandWidthMm'])>.0001:
            raise ValueError('Actual native upstand differs from cage; no inherited140mm result')
        if row['kind']=='upstand' and abs(z-d/2-3170)>.0001:
            raise ValueError('Changed source upstand underside needs vertical cage reauthoring')
        if row['kind']=='curved-ring':
            outer=g['outerPostBarNormalOffsetMm'];inner=g['nestedArchTailNormalOffsetMm']
            normal=inner+(outer-inner)*_smooth((min(x,12000-x)-portal['piers']['westEW'][1])/(5000-portal['piers']['westEW'][1]))
            fz=b/2-normal;fy=face
            cell_b=2*(normal+rlink)
        elif row['kind']=='post':
            outer=g['outerPostBarNormalOffsetMm'];r=g['mainBendCentrelineRadiusMm'];beam_y=case['upstandWidthMm']/2-face
            low=outer if case['supportMode']=='continuous-rc-through-former-DPC' else r+(outer-r)*_smooth((z-92)/(700-92))
            normal=low-(outer-beam_y)*_smooth((z-2600)/500)
            fz=b/2-normal;fy=face;cell_b=b-2*(case['nominalLinkCoverMm']+case['linkDiameterMm']/2)
        else:
            fy=face+16;fz=face;cell_b=b-2*(case['nominalLinkCoverMm']+case['linkDiameterMm']/2)
        n=row['axialCompressionKN'];my=row['bendingYKNm'];mz=row['bendingZKNm']
        cy=rectangular_capacity(b,d,fy,d-fy,n,my<0,bar,case['strengthSteelFraction'])
        cz=rectangular_capacity(d,b,fz,b-fz,n,mz<0,bar,case['strengthSteelFraction'])
        ratio=abs(my)/cy+abs(mz)/cz if cy>0 and cz>0 else math.inf
        cell_d=d-2*(case['nominalLinkCoverMm']+case['linkDiameterMm']/2)
        area=cell_b*cell_d-(4-math.pi)*rlink**2
        shear_flow=abs(row['shearYKN'])*1000/(2*.9*(b-fz))+abs(row['shearZKN'])*1000/(2*.9*(d-fy))
        torsion_flow=abs(row['torsionKNm'])*1e6/(2*area)
        supply=math.pi*case['linkDiameterMm']**2/4*case['steelYieldMPa']*case['strengthSteelFraction']/case['ordinaryLinkPitchMm']
        answer.append({**row,'actualBarCentreFaceYDepthMm':fy,'actualBarCentreFaceZBreadthMm':fz,
            'uniaxialCapacityYKNm':cy,'uniaxialCapacityZKNm':cz,'linearUniaxialRatio':ratio,
            'actualClosedLinkCellAreaMm2':area,'conservativeCombinedFlowNPerMm':shear_flow+torsion_flow,
            'singleLinkLegSupplyNPerMm':supply,'linkFlowRatio':(shear_flow+torsion_flow)/supply,
            'scope':'Necessary uniaxial and thin-cell link-flow comparisons; localjoint/Dregion, concrete diagonal-strut, biaxial, bond splitting, cracking and second-order resistance remain separate.'})
    return answer


def geometric_report(case,portal):
    geometry=cage_geometry(case,portal);arches=arch_bar_paths(case,portal)
    frames=frame_bar_paths(case,portal,3920.)
    west_post=[]
    for row in frames:
        if '/west' in row['id']:
            groups=[];group=[]
            for point in row['pointsMm']:
                if 1500<=point[2]<=2550 and point[0]<=4520:group.append(point)
                elif group:
                    if len(group)>1:groups.append(group)
                    group=[]
            if len(group)>1:groups.append(group)
            west_post.extend({**row,'id':row['id']+'/joint/'+str(i),'pointsMm':points} for i,points in enumerate(groups))
    joint_arch=[{**row,'pointsMm':[p for p in row['pointsMm'] if p[0]<=4520.]} for row in arches]
    pairs=[]
    for a,b in itertools.combinations(joint_arch+west_post,2):
        distance=_path_distance(a['pointsMm'],b['pointsMm'])
        amin,amax=min(p[1] for p in a['pointsMm']),max(p[1] for p in a['pointsMm'])
        bmin,bmax=min(p[1] for p in b['pointsMm']),max(p[1] for p in b['pointsMm'])
        normal=max(0.,bmin-amax,amin-bmax)-case['barDiameterMm']-2*case['relativeBarBoxToleranceMm']
        generic=distance-case['barDiameterMm']-2*math.sqrt(3)*case['relativeBarBoxToleranceMm']
        projected=_path_distance([[p[0],0.,p[2]] for p in a['pointsMm']],[[p[0],0.,p[2]] for p in b['pointsMm']])-case['barDiameterMm']-2*math.sqrt(2)*case['relativeBarBoxToleranceMm']
        pairs.append({'a':a['id'],'b':b['id'],'nominalClearMm':distance-case['barDiameterMm'],
            'conservativeBoxBoundClearMm':generic,'normalAxisSeparationClearanceCertificateMm':normal,
            'projectedXZBoxClearanceCertificateMm':projected,'adverse3DClearanceLowerBoundMm':max(generic,normal,projected)})
    return {'schema':'str-continuous-rc-cage-result/1','case':case,'geometry':geometry,'archBars':arches,'outerFrameHalfBars':frames,
        'postHoopLayout':post_hoop_layout(case,portal),
        'postHoopLayout':post_hoop_layout(case,portal),
        'jointPathPairs':pairs,'minimumNominal3DJointMainBarClearanceMm':min(row['nominalClearMm'] for row in pairs),
        'minimumAdverse3DJointMainBarClearanceLowerBoundMm':min(row['adverse3DClearanceLowerBoundMm'] for row in pairs),
        'DPCBarContinuity':('PostH12bars andconcrete bridge−50..−30EXPLICITLY. ThisisNOTacapillarycut. Separateunloadedfloor/perimeterbarrier required; noassembledmoistureboundary isearned.' if case['supportMode']=='continuous-rc-through-former-DPC' else 'Historicalupperloops doNOTcross−50..−30. LowerH12starters areseparate,terminate−95/start−680; nointerfaceanchorinferred.'),
        'historicalSeparateLowerStarter':({'lengthMm':585.,'goodBondReserveMm':585.-geometry['goodBondFullYieldDevelopmentMm']} if case['supportMode']=='historical-rocking-DPC-upper-loops' else None),
        'activeCapEmbedment':({'barEndZMm':-680.,'capTopZMm':-180.,'capBottomZMm':-750.,'actualRunBelowCapTopMm':500.,
            'conservativelyCreditedDepthMm':570-2*case['nominalLinkCoverMm'],
            'fullYieldDevelopmentReserveMm':570-2*case['nominalLinkCoverMm']-geometry['goodBondFullYieldDevelopmentMm'],
            'newCapCandidateDetailedElsewhere':True,'existingCapRebarCageClaimed':False,'capJointResistanceAccepted':False} if case['supportMode']=='continuous-rc-through-former-DPC' else None),
        'actualMemberActions':None,'memberStrengthAccepted':False,'jointPanelAccepted':False,'DPCMaterialShearLawAccepted':False,
        'structureSelected':False,'ownerAppearanceApproval':False}


def barrier_bar_crossings(case,portal):
    g=cage_geometry(case,portal);face=g['mainBarCentreFaceMm'];rows=[]
    for wall,normal_key in (('court-north','courtNS'),('outer-north','gardenNS')):
        cy=sum(portal['piers'][normal_key])/2
        for side,key in (('west','westEW'),('east','eastEW')):
            lo,hi=portal['piers'][key];warm=[lo,lo+140] if side=='west' else [hi-140,hi]
            for x,y in itertools.product((lo+face,hi-face),(cy-g['outerPostBarNormalOffsetMm'],cy+g['outerPostBarNormalOffsetMm'])):
                rows.append({'pierId':wall+'/'+side,'barAxisXYZMm':[x,y,-40.],
                    'nominalBareDiameterMm':case['barDiameterMm'],'sourceWarmCoreClipXMm':warm,
                    'nominalBarProjectionIntersectsWarmClip':x+case['barDiameterMm']/2>warm[0] and x-case['barDiameterMm']/2<warm[1],
                    'nominalBarProjectionCrossesClipEdge':any(x-case['barDiameterMm']/2<edge<x+case['barDiameterMm']/2 for edge in warm),
                    'crossingIsCapillaryBreak':False,'ribEnvelopeOrCollarGeometryProvided':False,
                    'barToWaterstopSealOrWeldStrengthAccepted':False,
                    'scope':'−40isdiagnosticmidplane, notanadoptedsheetthickness/finishedjoint. Fouractualbarcrossingsperpier; sourcewarm140clip isnotoutdoors.'})
    return rows


def _corner_force_witness(row,half_depth,half_breadth):
    n=row['axialCompressionKN'];my=row['bendingYKNm']*1000;mz=row['bendingZKNm']*1000
    points=[{'uvMm':[sx*half_depth,sy*half_breadth],
        'axialCompressionKN':n/4+sx*my/(4*half_depth)+sy*mz/(4*half_breadth)} for sx,sy in itertools.product((-1,1),repeat=2)]
    actual=[sum(p['axialCompressionKN'] for p in points),
        sum(p['axialCompressionKN']*p['uvMm'][0] for p in points)/1000,
        sum(p['axialCompressionKN']*p['uvMm'][1] for p in points)/1000]
    return {'cornerActions':points,'maximumNecessaryTieTensionKN':max(0.,-min(p['axialCompressionKN'] for p in points)),
        'normalAndTwoMomentResidualKN_KNm':[actual[0]-n,actual[1]-my/1000,actual[2]-mz/1000],
        'scope':'Explicit four-corner axial strut/tie equilibrium witness at declared coordinates; not compatible bar stresses, a joint-panel solution or a concrete-strut resistance proof.'}


def bounded_corner_contact(contact,pressure_limit):
    n=contact['normalCompressionKN'];a,b,c,d=contact['effectiveContactFootprintXYMm'];ex,ey=contact['resultantEccentricityXYMm']
    dx=(c-a)/2-abs(ex);dy=(d-b)/2-abs(ey)
    fits=dx>0 and dy>0 and 3*dx<=c-a and 3*dy<=d-b
    minimum=n*1000/(4.5*dx*dy) if fits else None
    return {'pierId':contact['pierId'],'normalCompressionKN':n,'nearestCornerCentroidDistancesMm':[dx,dy],
        'uniformOptimalTriangleInterceptsMm':[3*dx,3*dy] if fits else None,
        'triangleInsideActualFace':fits,'minimumPossiblePeakPressureMPaAtTheseResultants':minimum,
        'sourceUnenhancedConcretePressureLimitMPa':pressure_limit,
        'boundedPressureEquilibriumImpossibleForCurrentResultants':minimum is not None and minimum>pressure_limit,
        'dualProof':'Integrate w=max(1-x/(3dx)-y/(3dy),0). Any p in[0,pmax] implies N/3<=pmax*(3dx)*(3dy)/6, hence pmax>=N/(4.5dxdy). Constant pressure on that triangle attains the bound. UnitsN/mm2.',
        'scope':'Exact necessary pressure bound for the current native N/M resultants and actual rectangle, independent of affine Winkler shape. A different compatible material/contact law may redistribute these resultants and must be recomputed.'}


def proposed_cap_cages(case,portal,grid):
    g=cage_geometry(case,portal);bar=case['barDiameterMm'];tol=case['relativeBarBoxToleranceMm'];rows=[]
    centres={'P25':('outer','west'),'P26':('outer','east'),'P28':('court','west'),'P30':('court','east')}
    for head in grid['heads']:
        if head['id'] not in centres:continue
        if head['capXY']!=[600,600] or head['capZ']!=[-750,-180]:
            raise ValueError('Actual northern cap differs from600x600x570 reference; no inherited fit')
        wall,side=centres[head['id']];along=portal['piers']['westEW' if side=='west' else 'eastEW'];normal=portal['piers']['gardenNS' if wall=='outer' else 'courtNS']
        cx=(along[0]+along[1])/2-head['xy'][0];cy=sum(normal)/2-head['xy'][1]
        sx=g['postAlongMm']/2-g['mainBarCentreFaceMm'];sy=g['outerPostBarNormalOffsetMm']
        starters=[[cx+u*sx,cy+v*sy] for u,v in itertools.product((-1,1),repeat=2)]
        vertical=[[x,y] for x,y in itertools.product((-195.,195.),repeat=2)]
        ns=[-244.,0.,110.,244.] if side=='west' else [-244.,-110.,0.,244.]
        ew=[-244.,-125.,0.,125.,244.] if wall=='outer' else [-244.,-120.,20.,244.]
        mesh_z={'bottomEW':-694.,'bottomNS':-682.,'topNS':-248.,'topEW':-236.}
        distances=[]
        for x,y in starters+vertical:
            distances.extend(abs(x-axis)-bar-2*tol for axis in ns)
            distances.extend(abs(y-axis)-bar-2*tol for axis in ew)
        parallel=min(min(b-a for a,b in zip(ns,ns[1:])),min(b-a for a,b in zip(ew,ew[1:])))-bar-2*tol
        bend_radius=g['mainBendCentrelineRadiusMm'];hook_tail=100.
        ew_length=2*(244-bend_radius)+math.pi*bend_radius+2*hook_tail
        ns_length=2*(185-bend_radius)+math.pi*bend_radius+2*hook_tail
        mat_length=2*(len(ns)*ns_length+len(ew)*ew_length);vertical_length=468.;starter_embed=500.
        hoop_outer_centre=430.;hoop_radius=g['roundedLinkCentrelineRadiusMm']
        hoop_length=4*(hoop_outer_centre-2*hoop_radius)+2*math.pi*hoop_radius
        rows.append({'headId':head['id'],'status':'NEW authored cap reinforcement, never existing/as-built',
            'actualCapXYZMm':{'xy':head['xy'],'plan':[600,600],'z':[-750,-180]},
            'starterAxesLocalXYMm':starters,'starterEndZMm':-680.,'starterActualRunBelowCapTopMm':starter_embed,
            'starterConservativeCreditedEmbedmentMm':min(starter_embed,570-2*case['nominalLinkCoverMm']),
            'starterFullYieldBondReserveMm':min(starter_embed,570-2*case['nominalLinkCoverMm'])-g['goodBondFullYieldDevelopmentMm'],
            'verticalSideBarAxesLocalXYMm':vertical,'verticalSideBarZMm':[-699.,-231.],
            'matNSAxesLocalXMm':ns,'matEWAxesLocalYMm':ew,'matZMm':mesh_z,'matBarEndCoordinatesMm':{'EW':244.,'NS':185.},
            'matEndHooks':{'mandrelMm':case['barMandrelMm'],'centrelineRadiusMm':bend_radius,'straightVerticalTailMm':hook_tail,
                'topDirection':'down into cap','bottomDirection':'up into cap','EWMainBarLengthMm':ew_length,'NSMainBarLengthMm':ns_length,
                'orthogonalHookCornerSeparationMm':244-185,'ownHoopToNSHookMinimumAdverseSurfaceClearMm':30-bar/2-case['linkDiameterMm']/2-2*tol},
            'parallelMatMinimumAdverseClearMm':parallel,'meshToVerticalBarMinimumAdversePlanClearMm':min(distances),
            'minimumMeshSurfaceCoverAfterSettingAndBarBoxMm':300-244-bar/2-case['cageSettingToleranceMm']-tol,
            'matsAtEWNSCrossings':'Intentional tied contact; twofamilies12mmcentreheight apart. Thepairmoves together, not independent intersecting bars.',
            'closedHoopCentrelineWidthMm':hoop_outer_centre,'closedHoopZMm':[-630.,-530.,-430.,-330.,-300.],
            'closedHoopMainCornerCentreLocalXYMm':195.,'closedHoopLinkDiameterMm':case['linkDiameterMm'],
            'minimumHoopToMatVerticalSurfaceClearMm':52-bar/2-case['linkDiameterMm']/2-2*tol,
            'matSteelAreaEachDirectionMm2':{'NS':len(ns)*math.pi*bar**2/4,'EW':len(ew)*math.pi*bar**2/4},
            'capVerticalSteelAreaIncludingStartersMm2':8*math.pi*bar**2/4,
            'bareMainAndMeshSteelKg':(mat_length+4*vertical_length+4*starter_embed)*math.pi*bar**2/4*7.85e-6,
            'bareHoopSteelKgExcludingClosureTails':5*hoop_length*math.pi*case['linkDiameterMm']**2/4*7.85e-6,
            'capGridJointAccepted':False,'pileCageConnectionAccepted':False,'hoopClosureClashAccepted':False})
    if len(rows)!=4:raise ValueError('Allfour actual northern caps required')
    for row in rows:row['matBarPaths']=cap_mat_paths(case,row)
    return rows


def cap_mat_paths(case,cage):
    radius=(case['barMandrelMm']+case['barDiameterMm'])/2;tail=100.;paths=[]
    for family,constants,end in (('EW',cage['matEWAxesLocalYMm'],244.),('NS',cage['matNSAxesLocalXMm'],185.)):
        for level in ('top','bottom'):
            z=cage['matZMm'][level+family];direction=-1 if level=='top' else 1
            for number,constant in enumerate(constants):
                if direction<0:
                    left=_samples(lambda t:[-end+radius+radius*math.cos(t),z-radius+radius*math.sin(t)],math.pi,math.pi/2,18)
                    right=_samples(lambda t:[end-radius+radius*math.cos(t),z-radius+radius*math.sin(t)],math.pi/2,0.,18)
                else:
                    left=_samples(lambda t:[-end+radius+radius*math.cos(t),z+radius+radius*math.sin(t)],math.pi,3*math.pi/2,18)
                    right=_samples(lambda t:[end-radius+radius*math.cos(t),z+radius+radius*math.sin(t)],3*math.pi/2,2*math.pi,18)
                outline=[[-end,z+direction*(radius+tail)],*left,*right,[end,z+direction*(radius+tail)]]
                points=[[u,constant,v] if family=='EW' else [constant,u,v] for u,v in outline]
                paths.append({'id':level+'/'+family+'/'+str(number),'diameterMm':case['barDiameterMm'],'pointsLocalXYWorldZMm':points,
                    'centrelineLengthMm':_length(points),'hookMandrelMm':case['barMandrelMm'],'straightTailMm':tail})
    return paths


def _layer_capacity(breadth,depth,positions,axial,reverse,diameter,steel_fraction):
    area=math.pi*diameter**2/4;limit=steel_fraction*500/1.15
    bars=[depth-position if reverse else position for position in positions]
    def at(x):
        width=min(depth,.8*x);force=17*width*breadth;moment=force*(depth/2-width/2)
        for position in bars:
            stress=max(-limit,min(limit,.0035*(1-position/x)*200000))
            n=area*(stress-(17 if position<width else 0));force+=n;moment+=n*(depth/2-position)
        return force/1000,moment/1e6
    lo,hi=.001,2500.
    for _ in range(40):
        mid=(lo+hi)/2
        if at(mid)[0]<axial:lo=mid
        else:hi=mid
    return at((lo+hi)/2)[1]


def screen_cap_cuts(case,cap_cages,cuts):
    cages={row['headId']:row for row in cap_cages};rows=[]
    head_for={'outer-north/west':'P25','outer-north/east':'P26','court-north/west':'P28','court-north/east':'P30'}
    for cut in cuts:
        head=cut.get('headId')
        if head is None:
            stem='/'.join(cut['memberId'].split('/')[:2]);head=head_for.get(stem)
        if head not in cages:raise ValueError('Actual named northern cap cut required')
        cage=cages[head];positions=cage['starterAxesLocalXYMm']
        n=cut['axialCompressionKN']
        available=max(0.,cut['physicalPointMm'][2]-cage['starterEndZMm']-2*case['relativeBarBoxToleranceMm']-2)
        stress=min(case['strengthSteelFraction']*case['steelYieldMPa'],4*case['goodBondMPa']*available/case['barDiameterMm'])
        fraction=stress/case['steelYieldMPa']
        cy=min(_layer_capacity(600,600,[300+x for x,y in positions],n,reverse,case['barDiameterMm'],fraction) for reverse in (False,True))
        cz=min(_layer_capacity(600,600,[300-y for x,y in positions],n,reverse,case['barDiameterMm'],fraction) for reverse in (False,True))
        ratio=abs(cut['bendingYKNm'])/cy+abs(cut['bendingZKNm'])/cz if cy>0 and cz>0 else math.inf
        area=430**2-(4-math.pi)*((case['linkMandrelMm']+case['linkDiameterMm'])/2)**2
        flow=(abs(cut['shearYKN'])+abs(cut['shearZKN']))*1000/(2*.9*495)+abs(cut['torsionKNm'])*1e6/(2*area)
        supply=math.pi*case['linkDiameterMm']**2/4*case['steelYieldMPa']*case['strengthSteelFraction']/100
        mats={}
        for direction,depth,moment in (('NS',502,cut['bendingYKNm']),('EW',514,cut['bendingZKNm'])):
            force=abs(moment)*1000/(.9*depth)
            capacity=cage['matSteelAreaEachDirectionMm2'][direction]*case['steelYieldMPa']*case['strengthSteelFraction']/1000
            count=len(cage['matNSAxesLocalXMm'] if direction=='NS' else cage['matEWAxesLocalYMm'])
            per_bar=force/count;stress_bar=per_bar*1000/(math.pi*case['barDiameterMm']**2/4)
            development=case['barDiameterMm']*stress_bar/(4*case['goodBondMPa']*case['poorBondFactor'])
            ab=case['minimumCoverMm']+case['barDiameterMm']/2
            mandrel=per_bar*1000/case['concreteCompressionMPa']*(1/ab+1/(2*case['barDiameterMm']))
            mats[direction]={'tensionChordForceKN':force,'steelTensionCapacityKN':capacity,'ratio':force/capacity,
                'perBarChordForceKN':per_bar,'poorBondDevelopmentRequiredMm':development,
                'conservativelyCreditedStraightHookTailMm':100.,'hookTailBondScreenPasses':development<=100,
                'bendMandrelRequiredForChordMm':mandrel,'authoredMandrelMm':case['barMandrelMm'],
                'scope':'Necessary planar tension-chord comparison for the actual cap-cut moment, not a solved 3D cap/grid/pile strut-and-tie body.'}
        rows.append({**cut,'headId':head,'creditedContinuousStarterAxesLocalXYMm':positions,
            'uncreditedConstructionCornerBarAxesLocalXYMm':cage['verticalSideBarAxesLocalXYMm'],
            'starterAvailableBondLengthMmAtCut':available,'starterStressCapMPaAtCut':stress,
            'conservativeUniaxialCapacityYKNm':cy,'conservativeUniaxialCapacityZKNm':cz,
            'linearUniaxialRatio':ratio,'closedLinkFlowNPerMm':flow,'singleLinkLegSupplyNPerMm':supply,
            'closedLinkFlowRatio':flow/supply,'matChordComparisons':mats,
            'capDiagonalStrutAndNodeResistanceAccepted':False,'capGridBarJointAccepted':False,'pileConnectionAccepted':False})
    return rows


def review_native_actions(native,case,portal):
    if not isinstance(native.get('sourceSHA256'),dict) or not native.get('memberCuts'):
        raise ValueError('Actual source-bound native simultaneous member cuts required')
    expected='str-monolithic-rc-portal-case/1' if case['supportMode']=='continuous-rc-through-former-DPC' else 'str-rc-floor-house-load-case/1'
    if native.get('request',{}).get('schema')!=expected:
        raise ValueError('Actual native support topology differs from authored cage; no rocking-to-continuous result substitution')
    screens=screen_member_cuts(case,portal,native['memberCuts']);g=cage_geometry(case,portal)
    bends=[]
    for row in screens:
        x,y,z=row['physicalPointMm'];kind=row['kind']
        foot=kind=='post' and abs(z+30)<1e-7 and case['supportMode']=='historical-rocking-DPC-upper-loops'
        arch=kind=='curved-ring' and (abs(x-4520)<1e-7 or abs(x-7480)<1e-7)
        if not foot and not arch:continue
        hx=g['postAlongMm']/2-g['mainBarCentreFaceMm'] if foot else portal['ring']/2-g['mainBarCentreFaceMm']
        hy=g['mainBendCentrelineRadiusMm'] if foot else g['nestedArchTailNormalOffsetMm']
        witness=_corner_force_witness(row,hx,hy)
        ab=min(case['minimumCoverMm']+case['barDiameterMm']/2,hx,hy)
        force=witness['maximumNecessaryTieTensionKN']
        required=force*1000/case['concreteCompressionMPa']*(1/ab+1/(2*case['barDiameterMm']))
        bends.append({'memberId':row['memberId'],'end':row['end'],'kind':'upper-foot-loop' if foot else 'arch-tail-transition',
            'physicalPointMm':row['physicalPointMm'],'simultaneousSourceCut':row,'equilibriumWitness':witness,
            'conservativeAbMm':ab,'mandrelRequiredForWitnessMm':required,'authoredMandrelMm':case['barMandrelMm'],
            'mandrelNecessaryScreenPasses':required<=case['barMandrelMm'],
            'formula':'phi_m >= F_bt/f_cd*(1/a_b+1/(2phi)); F_bt is the declared witness tie, not an assumed full-yield bar force',
            'compatibleJointOrBaseForceTransferAccepted':False})
    joint_actions=[]
    for bend in bends:
        if bend['kind']!='arch-tail-transition':continue
        cut=bend['simultaneousSourceCut'];xx,yy,zz=cut['physicalPointMm'];west=xx<6000
        centre_x=sum(portal['piers']['westEW' if west else 'eastEW'])/2
        wrench=cut.get('globalPhysicalCutWrenchKN_KNm',cut.get('globalPhysicalEndWrenchKN_KNm'))
        if wrench is None:raise ValueError('Actual signed global physical cut wrench required at RC joint')
        force=wrench[:3]
        transferred=[a+b/1000 for a,b in zip(wrench[3:],_cross([xx-centre_x,0.,0.],force))]
        rise=math.sqrt((portal['rawRadius']+portal['ring'])**2-(xx-6000)**2)-math.sqrt(portal['rawRadius']**2-(xx-6000)**2)
        joint_actions.append({'archMemberId':cut['memberId'],'end':cut['end'],'archPhysicalCutXYZMm':cut['physicalPointMm'],
            'columnAxisJointXYZMm':[centre_x,yy,zz],'columnFaceEccentricityMm':xx-centre_x,
            'actualArchPhysicalCutWrenchKN_KNm':wrench,'sameArchActionTransferredToColumnAxisKN_KNm':[*force,*transferred],
            'physicalVerticalRingFaceHeightMm':rise,'actualNormalCoreMm':case['normalCoreMm'],
            'nominalDirectNormalTractionMPa':abs(force[0])*1000/(rise*case['normalCoreMm']),
            'nominalTwoShearResultantMPa':math.hypot(force[1],force[2])*1000/(rise*case['normalCoreMm']),
            'proposedPostJointLinkPitchMm':case['jointLinkPitchMm'],
            'physicalHorizontalEndBearingCredited':False,'rigidOffsetJointPanelResistanceAccepted':False})
    contacts=native.get('portalNormalContactResults',[])
    receipt={'schema':'str-continuous-rc-cage-native-review/1','caseId':native.get('caseId',native.get('name')),
        'sourceSHA256':native['sourceSHA256'],'nativeRequest':native.get('request'),
        'actualSimultaneousCutCount':len(native['memberCuts']),
        'nativeCutDigest':hashlib.sha256(json.dumps(native['memberCuts'],sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest(),
        'screens':screens,'bendScreens':bends,'actualArchColumnJointActions':joint_actions,'portalNormalContactResults':contacts,
        'boundedCompressionContact':[bounded_corner_contact(row,case['concreteCompressionMPa']) for row in contacts],
        'worstUniaxialComparison':max(screens,key=lambda row:row['linearUniaxialRatio']),
        'worstClosedLinkFlowComparison':max(screens,key=lambda row:row['linkFlowRatio']),
        'worstBendMandrelComparison':max(bends,key=lambda row:row['mandrelRequiredForWitnessMm']) if bends else None,
        'separateDPCAnchorProvided':False,'continuousRebarCrossesFormerDPC':case['supportMode']=='continuous-rc-through-former-DPC',
        'waterstopJointMaterialOrShearStrengthAccepted':False,
        'actualConcreteStrutAndJointPanelResistanceProvided':False,
        'actualLinkHookClashProofProvided':False,'installedOrSelectedStructure':False}
    return receipt


def render_cage(report):
    case=report['case'];g=report['geometry'];width=g['normalCoreMm'];depth=g['postAlongMm'];scale=1.2
    x=lambda v:230+v*scale;y=lambda v:260-v*scale
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1450 1190">','<rect width="1450" height="1190" fill="#faf8f2"/>',
        '<style>text{font:14px sans-serif;fill:#23343a}.small{font-size:12px}.post{fill:#385e82}.arch{fill:#ab653e}</style>',
        '<text x="30" y="30">CONTINUOUS RC PORTAL — AUTHORED CAGE / NO STRUCTURAL OR WATER-BARRIER SELECTION</text>',
        f'<text x="30" y="57">H{case["barDiameterMm"]:g} / H{case["linkDiameterMm"]:g}; {width:g}mm normal core; {g["upstandWidthMm"]:g}mm upstand</text>',
        f'<rect x="{x(-depth/2)}" y="{y(width/2)}" width="{depth*scale}" height="{width*scale}" fill="#dce1df" stroke="#52636b"/>']
    hoop=_rounded_hoop_points(depth,width,case['nominalLinkCoverMm'],case['linkDiameterMm'],case['linkMandrelMm'])
    out.append('<polyline points="'+' '.join(f'{x(a)},{y(b)}' for a,b,z in hoop)+'" fill="none" stroke="#273e47" stroke-width="4"/>')
    for row in g['jointEightBarCoordinates']:
        a,b=row['xyMm'];out.append(f'<circle class="{row["family"].split("-")[0]}" cx="{x(a)}" cy="{y(b)}" r="{case["barDiameterMm"]/2*scale}"/>')
    out.extend(['<text x="35" y="475">Post corners / separate nested arch legs.</text>',
        f'<text x="35" y="498">Worst independent ±{case["relativeBarBoxToleranceMm"]:g}mm box clear: {g["worstIndependentBarPair"]["adverseBoxClearMm"]:.3f}mm.</text>',
        f'<text x="35" y="521">Rounded hoop-to-bar clearance: {g["minimumRoundedHoopToMainBarSurfaceMm"]:.3f}mm.</text>'])
    xx=lambda v:230+v*.7;zz=lambda v:750-v*.45
    out.append(f'<rect x="{xx(-300)}" y="{zz(-180)}" width="420" height="{570*.45}" fill="#dce1df" stroke="#52636b"/>')
    out.append(f'<rect x="{xx(-width/2)}" y="{zz(450)}" width="{width*.7}" height="{630*.45}" fill="#e6e8e3" stroke="#52636b"/>')
    if case['supportMode']=='continuous-rc-through-former-DPC':
        for sy in (-1,1):out.append(f'<path d="M{xx(sy*g["outerPostBarNormalOffsetMm"])} {zz(-680)} V{zz(450)}" stroke="#385e82" stroke-width="7"/>')
        for level in (-694,-682,-248,-236):out.append(f'<path d="M{xx(-244)} {zz(level)} H{xx(244)}" stroke="#53816f" stroke-width="3"/>')
        label='Continuous bars through former DPC; separate unloaded waterstop NOT proved.'
    else:
        bottom=-30+case['minimumCoverMm']+case['barDiameterMm']/2+case['cageSettingToleranceMm']+5;r=g['mainBendCentrelineRadiusMm'];zc=bottom+r
        foot=_samples(lambda t:[r*math.cos(t),zc-r*math.sin(t)],0,math.pi,80)
        points=[[r,450],[r,zc],*foot,[-r,zc],[-r,450]]
        out.append('<polyline points="'+' '.join(f'{xx(a)},{zz(b)}' for a,b in points)+'" fill="none" stroke="#385e82" stroke-width="7"/>')
        label='Historical rocking-foot control: upper U-loop does not cross DPC.'
    for level in (-30,-50):out.append(f'<path d="M{xx(-width/2)-15} {zz(level)} H{xx(width/2)+15}" stroke="#b14e37" stroke-width="2"/>')
    out.extend([f'<text class="small" x="35" y="1120">{label}</text>'])
    xp=lambda v:650+(v-4300)*.19;zp=lambda v:950-v*.18
    layout=report['postHoopLayout']
    for level in layout['stationsZMm']:
        for centre in (layout['westPostCentreXMm'],12000-layout['westPostCentreXMm']):
            half=layout['closedLoopCentrelineAlongWidthMm']/2
            out.append(f'<path d="M{xp(centre-half)} {zp(level)} H{xp(centre+half)}" stroke="#a9bab4" stroke-width="1"/>')
    for row in report['outerFrameHalfBars']:
        out.append('<polyline points="'+' '.join(f'{xp(a)},{zp(c)}' for a,b,c in row['pointsMm'])+'" fill="none" stroke="#385e82" stroke-width="2"/>')
    for row in report['archBars']:
        out.append('<polyline points="'+' '.join(f'{xp(a)},{zp(c)}' for a,b,c in row['pointsMm'])+'" fill="none" stroke="#ab653e" stroke-width="2"/>')
    max_z=max(point[2] for row in report['outerFrameHalfBars'] for point in row['pointsMm'])
    for level,label in ((max_z+g['mainBarCentreFaceMm'],'outer top'),(3170,'upstand soffit'),(-180,'cap top'),(-680,'bar end')):
        out.append(f'<text class="small" x="1300" y="{zp(level)+4}">{level:g} {label}</text>')
    out.extend(['<text x="650" y="100">Actual curved main-bar paths, projected elevation.</text>',
        '<text x="650" y="123">Intrados tails nest inside extrados tails; no crossing splice.</text>',
        f'<text x="650" y="146">Arch straight tails {case["archStraightTailMm"]:g}; staggered contact laps {case["lapLengthMm"]:g}.</text>',
        '<text x="650" y="1110">Blue: post/upstand halves and cap starters. Orange: separate arch bars.</text>',
        '<text x="650" y="1133">Cap mats are NEW proposed geometry. Grid/pile interface is unqualified.</text>',
        '<text x="650" y="1156">Link closure hooks / joint panels / bar-to-waterstop seals remain explicit duties.</text>','</svg>'])
    return '\n'.join(out)+'\n'


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--read',action='store_true');parser.add_argument('--geometry',action='store_true')
    options=parser.parse_args()
    if options.read:print(json.dumps(reference_cage_case()))
    elif options.geometry:
        root=Path(__file__).resolve().parents[3];path=root/'project/had/studies/water-replan.json'
        portal=json.loads(path.read_text())['model']['insulatedPortal'];report=geometric_report(reference_cage_case(),portal)
        report['sources']={'project/had/studies/water-replan.json':hashlib.sha256(path.read_bytes()).hexdigest(),METHOD:hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
        print(json.dumps({'schema':'str-continuous-rc-cage-replay/1','result':report,'sectionSvg':render_cage(report)},allow_nan=False))
    else:raise SystemExit('Use --read or --geometry; member proof must bind actual native joined actions separately')
