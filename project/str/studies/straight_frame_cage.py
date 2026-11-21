"""Conventional straight-frame reinforcement route, without structural adoption.

No curved arch reinforcement is revived. Real signed cuts are consumed, never
replaced by an old cage's force envelope. Ideal closed link centrelines are
separate from the unresolved physical135-degree hook closures.
"""
import copy
import hashlib
import itertools
import json
import math
from pathlib import Path

from continuous_rc_cage import (reference_cage_case, _layer_capacity, _path_distance,
                                _rounded_hoop_points, cap_mat_paths, _segment_distance)

METHOD='project/str/studies/straight_frame_cage.py'
CAGE='project/str/studies/continuous_rc_cage.py'
WATER='project/had/studies/water-replan.json'
GRID='project/str/studies/current-house-grid.json'
ROOT=Path(__file__).resolve().parents[3]


def reference_straight_frame_cage_settings():
    source=reference_cage_case()
    return {'schema':'str-straight-frame-cage-settings/1','postBarMm':12.,'beamBarMm':10.,
        'wingBarMm':10.,'beamMandrelMm':150.,'wingMandrelMm':150.,'beamStraightTailMm':550.,
        'beamLinkCageNormalWidthMm':200.,'linkPitchMm':100.,'postHoopPhaseZMm':-110.,
        'linkDiameterMm':source['linkDiameterMm'],'linkMandrelMm':source['linkMandrelMm'],
        'nominalLinkCoverMm':source['nominalLinkCoverMm'],'minimumCoverMm':source['minimumCoverMm'],
        'settingToleranceMm':source['cageSettingToleranceMm'],'relativeBarToleranceMm':source['relativeBarBoxToleranceMm'],
        'minimumIndependentClearMm':source['minimumIndependentBarClearanceMm'],
        'goodBondMPa':source['goodBondMPa'],'poorBondMPa':source['goodBondMPa']*source['poorBondFactor'],
        'steelYieldMPa':source['steelYieldMPa'],'strengthSteelFraction':source['strengthSteelFraction'],
        'concreteCompressionMPa':source['concreteCompressionMPa'],
        'use':'unqualified-complete-route-and-signed-action-comparison'}


def _admit(settings):
    if isinstance(settings,dict) and settings.get('schema')=='str-straight-frame-six-bar-settings/1':
        _admit_six_bar_settings(settings);return
    expected=reference_straight_frame_cage_settings()
    if not isinstance(settings,dict) or set(settings)!=set(expected):raise ValueError('Exact straight-frame cage settings required; no derived source or approval')
    for k in ('schema','use'):
        if settings[k]!=expected[k]:raise ValueError('Unsupported straight-frame cage scope')
    for k,v in settings.items():
        if k in ('schema','use'):continue
        if type(v) not in (int,float) or not math.isfinite(v) or (v<=0 and k!='postHoopPhaseZMm'):raise ValueError('Finite authored cage controls required')
    if any(settings[k]!=expected[k] for k in ('linkDiameterMm','linkMandrelMm','minimumCoverMm','goodBondMPa','poorBondMPa','steelYieldMPa','strengthSteelFraction','concreteCompressionMPa')):
        raise ValueError('Source material/link comparison cannot be silently enhanced')
    if not 8<=settings['beamBarMm']<=12 or not 10<=settings['postBarMm']<=16 or not 8<=settings['wingBarMm']<=12 or not 50<=settings['linkPitchMm']<=100:
        raise ValueError('Unsupported conventional bar or link pitch comparison')


def _hash(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()


def _sample(fn,a,b,n=24):return [fn(a+(b-a)*i/n) for i in range(n+1)]


def _length(points):return math.fsum(math.dist(p,q) for p,q in zip(points,points[1:]))


def _path(name,diameter,points,kind,mandrel=None):
    return {'id':name,'kind':kind,'diameterMm':diameter,'pointsXYZMm':points,
        'centrelineLengthMm':_length(points),'mandrelMm':mandrel,'arcChordErrorBoundMm':
        (mandrel+diameter)/2*(1-math.cos(math.pi/48)) if mandrel else 0.}


def _lower_section_right(g,z):
    inner,spring=g['innerSpringXZMm'];clip=g['seatTopXAt2600Mm']
    return inner if z<=spring else inner+(clip-inner)*(z-spring)/(2600-spring) if z<2600 else 4520.


def _headed_mat_comparison(cap,starters,cap_cuts,s,authored_axes=None):
    """One bounded ordinary manufactured alternative after crossed hooks fail."""
    axes=copy.deepcopy(authored_axes if authored_axes is not None else {'NS':[-210.,40.,210.],'EW':[-140.,20.,210.]})
    if cap['id'] in ('P26','P30'):axes['NS']=[-v for v in reversed(axes['NS'])]
    levels={'topEW':-260.,'topNS':-360.,'bottomNS':-570.,'bottomEW':-670.}
    heads=[];bars=[]
    for family,constants in axes.items():
        for level in ('top','bottom'):
            z=levels[level+family]
            for number,c in enumerate(constants):
                for sign in (-1,1):
                    box=([217.,c-20,z-20,244.,c+20,z+20] if family=='EW' else [c-20,217.,z-20,c+20,244.,z+20])
                    if sign<0:
                        axis=0 if family=='EW' else 1;box[axis],box[axis+3]=-box[axis+3],-box[axis]
                    heads.append({'id':level+'/'+family+'/'+str(number)+'/'+str(sign),'boxXYZMm':box})
                bars.append({'id':level+'/'+family+'/'+str(number),'pointsLocalXYWorldZMm':([[-217,c,z],[217,c,z]] if family=='EW' else [[c,-217,z],[c,217,z]])})
    def boxdistance(a,b):return math.sqrt(sum(max(0.,a[i]-b[i+3],b[i]-a[i+3])**2 for i in range(3)))
    head_pairs=[{'a':a['id'],'b':b['id'],'adverseEnvelopeClearMm':boxdistance(a['boxXYZMm'],b['boxXYZMm'])-2*s['relativeBarToleranceMm']} for a,b in itertools.combinations(heads,2)]
    cover=min(min(p[0]+300,p[1]+300,300-p[3],300-p[4],p[2]+750,-180-p[5]) for p in (h['boxXYZMm'] for h in heads))-s['settingToleranceMm']-s['relativeBarToleranceMm']
    starter_head=[];starter_mat=[]
    for point,diameter in starters:
        x,y=point[0]-cap['xyMm'][0],point[1]-cap['xyMm'][1]
        for head in heads:
            p=head['boxXYZMm'];distance=math.hypot(max(0,p[0]-x,x-p[3]),max(0,p[1]-y,y-p[4]))
            starter_head.append(distance-diameter/2-2*s['relativeBarToleranceMm'])
        for family,constants in axes.items():
            coordinate=x if family=='NS' else y
            starter_mat.append(min(abs(coordinate-c) for c in constants)-(diameter+12)/2-2*s['relativeBarToleranceMm'])
    net=math.pi*(40**2-12**2)/4;force=math.pi*12**2/4*s['steelYieldMPa']
    owning=[r for r in cap_cuts if ('outer-north' if cap['id'] in ('P25','P26') else 'court-north') in r['memberId'] and ('/west/' if cap['id'] in ('P25','P28') else '/east/') in r['memberId']]
    chord=[]
    for row in owning:
        for family,key,lever in (('EW','bendingYKNm',410.),('NS','bendingZKNm',210.)):
            per_bar=abs(row[key])*1000/lever/len(axes[family])
            chord.append({'memberId':row['memberId'],'end':row['end'],'direction':family,'simultaneousMomentKNm':row[key],
                'authoredMatCoupleLeverMm':lever,'necessaryPerBarChordKN':per_bar,'uniformNetHeadBearingMPa':per_bar*1000/net})
    return {'schema':'str-headed-straight-cap-mat-comparison/1','product':'Leviat Ancon TTH12',
        'primarySource':{'url':'https://www.ancon.co.uk/downloads/81/Reinforcing%20Bar%20Couplers%20UK%20IRE%20Edition.pdf','edition':'September2026 UK and Ireland','page':14,'observedDate':'2026-11-20'},
        'headDiameterMm':40.,'headLengthMm':27.,'headTorqueNm':60.,'manufacturerMinimumConcreteGrade':'C32/40',
        'headNetBearingAreaMm2':net,'fullYieldBarForceKN':force/1000,'fullYieldUniformNetHeadBearingMPa':force/net,
        'straightMatAxesLocalMm':axes,'matLevelsZMm':levels,'headEnvelopes':heads,'straightMatBars':bars,
        'minimumHeadHeadAdverseEnvelopeClearMm':min(r['adverseEnvelopeClearMm'] for r in head_pairs),
        'minimumHeadSurfaceAdverseCoverMm':cover,'minimumHeadStarterAdverseClearMm':min(starter_head),
        'minimumMatStarterAdverseClearMm':min(starter_mat),'necessaryActualChordComparisons':chord,
        'extraFourHistoricalCapSideBarsIncluded':False,
        'extraSideBarDisposition':'Not inherited; this explicit new six-starter cap concept needs its own complete joint/confinement design.',
        'productAndThreadResistanceAccepted':False,'concreteGradeEstablished':False,'localBearingBurstingAccepted':False,'candidateAccepted':False,
        'scope':'Actual manufactured dimensions and a bounded fullpath geometric comparison, not transplanted product certification. Source fcd17 does not establishC32/40; concrete cone/splitting/bursting, joint confinement, tool assembly and the complete installed constituents remain unqualified.'}


def _bar_paths(result,s):
    g=result['geometry'];native=result['nativeVertical']['native'];rows=native['memberCuts']
    cy={wall:next(r['physicalPointMm'][1] for r in rows if r['memberId'].startswith(wall+'/upstand/')) for wall in ('outer-north','court-north')}
    depths={wall:next(r['depthMm'] for r in rows if r['memberId'].startswith(wall+'/upstand/')) for wall in cy}
    breadths={r['breadthMm'] for r in rows if r['kind']=='upstand'}
    if len(breadths)!=1:raise ValueError('Uniform authored north beam width required; no hidden local joint patch')
    beam_width=next(iter(breadths));link=s['linkDiameterMm'];lr=(s['linkMandrelMm']+link)/2
    face=s['nominalLinkCoverMm']+link/2+lr;post_x=(4307.5+face,4520-face);post_y=290/2-face
    beam_y=s['beamLinkCageNormalWidthMm']/2-face
    if min(beam_y,post_y)<=0 or s['beamLinkCageNormalWidthMm']>beam_width:raise ValueError('Beam link cage leaves actual solved concrete')
    bars=[];links=[];development=[];caps=[]
    for wall,y in cy.items():
        top=3170+depths[wall];post_top=top-face
        for side in ('west','east'):
            mirror=side=='east';xs=[12000-x if mirror else x for x in post_x]
            for number,(x,sign) in enumerate(itertools.product(xs,(-1,1))):
                bars.append(_path(wall+'/'+side+'/post/'+str(number),s['postBarMm'],[[x,y+sign*post_y,-680],[x,y+sign*post_y,post_top]],'straight-post'))
            full=s['postBarMm']*s['steelYieldMPa']/(4*s['goodBondMPa'])
            development.append({'id':wall+'/'+side+'/straight-post','fullYieldDevelopmentMm':full,
                'actualCapRunMm':500.,'actualBeamRunAboveSoffitMm':post_top-3170,
                'capReserveMm':500-full,'beamReserveMm':post_top-3170-full,
                'bondComparison':'Source good-bond vertical bar comparison; no physical bond or joint-panel acceptance.'})
            wingx=g['innerSpringXZMm'][0]-face;wingx=12000-wingx if mirror else wingx
            wr=(s['wingMandrelMm']+s['wingBarMm'])/2;wz=2270.
            points=[[wingx,y-wr,-680],[wingx,y-wr,wz],*_sample(lambda t:[wingx,y+wr*math.cos(t),wz+wr*math.sin(t)],math.pi,0),[wingx,y+wr,-680]]
            bars.append(_path(wall+'/'+side+'/wing-hairpin',s['wingBarMm'],points,'independent-direct-bearing-abutment-hairpin',s['wingMandrelMm']))
            z=s['postHoopPhaseZMm'];number=0
            while z<post_top-40:
                if z>=-180:
                    width=_lower_section_right(g,z)-4307.5 if z<3170 else 212.5
                    centre=(4307.5+(4307.5+width))/2;centre=12000-centre if mirror else centre
                    local=_rounded_hoop_points(width,290,s['nominalLinkCoverMm'],link,s['linkMandrelMm'])
                    pts=[[centre+p[0],y+p[1],z] for p in local]
                    links.append(_path(wall+'/'+side+'/post-link/'+str(number),link,pts,'ideal-horizontal-post-link',s['linkMandrelMm']));number+=1
                z+=s['linkPitchMm']
        radius=(s['beamMandrelMm']+s['beamBarMm'])/2
        for layer,z,leg in (('top',top-face,4307.5+58.),('bottom',3170+face,4307.5+150.)):
            for sign in (-1,1):
                yy=y+sign*beam_y;start=leg+radius
                left=[[leg,yy,z-radius-s['beamStraightTailMm']],*_sample(lambda t:[start+radius*math.cos(t),yy,z-radius+radius*math.sin(t)],math.pi,math.pi/2)]
                right=[[12000-p[0],p[1],p[2]] for p in reversed(left)]
                bars.append(_path(wall+'/beam/'+layer+'/'+str(sign),s['beamBarMm'],left+right,'ordinary-downturned-beam-bar',s['beamMandrelMm']))
                full=s['beamBarMm']*s['steelYieldMPa']/(4*s['poorBondMPa'])
                development.append({'id':wall+'/beam/'+layer+'/'+str(sign),'fullYieldDevelopmentMm':full,
                    'actualCreditedStraightTailMm':s['beamStraightTailMm'],'tailReserveMm':s['beamStraightTailMm']-full,
                    'hookReductionCredited':False})
        span=7586.25-4413.75;n=math.ceil(span/s['linkPitchMm'])
        for i in range(n+1):
            x=4413.75+span*i/n;local=_rounded_hoop_points(s['beamLinkCageNormalWidthMm'],depths[wall],s['nominalLinkCoverMm'],link,s['linkMandrelMm'])
            links.append(_path(wall+'/beam-link/'+str(i),link,[[x,y+p[0],3170+depths[wall]/2+p[1]] for p in local],'ideal-vertical-beam-link',s['linkMandrelMm']))
        # Explicit receiving cap schedule. This is reauthored around every actual
        # main/wing starter, never copied as an existing installed cap cage.
        for side in ('west','east'):
            head={'outer-north':('P25','P26'),'court-north':('P28','P30')}[wall][side=='east']
            centre_x=4500 if side=='west' else 7500;centre_y=11667.5 if wall=='outer-north' else 8050
            cap={'id':head,'xyMm':[centre_x,centre_y],'sizeMm':[600,600,570],'zMm':[-750,-180],
                 'matNSAxesLocalXMm':[-244.,40.,244.],'matEWAxesLocalYMm':[-244.,-135.,0.,135.,244.] if wall=='outer-north' else [-244.,-120.,30.,244.],
                 'matLevelsZMm':{'bottomEW':-694.,'bottomNS':-682.,'topNS':-248.,'topEW':-236.},
                 'matBarMm':12.,'newFabricationSchedule':True,'capGridJointAccepted':False,'pileInterfaceAccepted':False}
            # Mirror X set with the source pier, not only its drawing.
            if side=='east':cap['matNSAxesLocalXMm']=[-x for x in reversed(cap['matNSAxesLocalXMm'])]
            starters=[(p,b['diameterMm']) for b in bars if b['id'].startswith(wall+'/'+side+'/') for p in [b['pointsXYZMm'][0],b['pointsXYZMm'][-1]] if p[2]==-680]
            comparisons=[]
            for point,diameter in starters:
                for direction,axes,coordinate in (('NS',cap['matNSAxesLocalXMm'],point[0]-centre_x),('EW',cap['matEWAxesLocalYMm'],point[1]-centre_y)):
                    clear=min(abs(coordinate-a) for a in axes)-(diameter+cap['matBarMm'])/2-2*s['relativeBarToleranceMm']
                    comparisons.append({'starterXYMm':point[:2],'matDirection':direction,'adversePlanClearanceMm':clear})
            cap['starterMatComparisons']=comparisons;cap['minimumStarterMatAdversePlanClearanceMm']=min(r['adversePlanClearanceMm'] for r in comparisons)
            # Fullforce H12 mandrel is200, not the failed inherited160 template.
            body={'matNSAxesLocalXMm':cap['matNSAxesLocalXMm'],'matEWAxesLocalYMm':cap['matEWAxesLocalYMm'],
                  'matZMm':cap['matLevelsZMm']}
            mat_paths=cap_mat_paths({'barMandrelMm':200.,'barDiameterMm':12.},body)
            cap['matBarPaths']=mat_paths
            cap['authoredMatMandrelMm']=200.
            layer_pairs=[]
            for a,b in itertools.combinations(mat_paths,2):
                if a['id'].split('/')[0]==b['id'].split('/')[0]:continue
                distance=_path_distance(a['pointsLocalXYWorldZMm'],b['pointsLocalXYWorldZMm'])
                layer_pairs.append({'a':a['id'],'b':b['id'],'nominalSurfaceClearanceMm':distance-12.,
                    'adverseSurfaceClearanceLowerBoundMm':distance-12.-2*math.sqrt(3)*s['relativeBarToleranceMm']-2*106*(1-math.cos(math.pi/72))})
            cap['minimumTopBottomMatAdverseClearanceMm']=min(r['adverseSurfaceClearanceLowerBoundMm'] for r in layer_pairs)
            cap['topBottomMatPairs']=layer_pairs
            layer_hook_pairs=[]
            for a,b in itertools.combinations(mat_paths,2):
                if a['id'].split('/')[0]!=b['id'].split('/')[0]:continue
                d=_path_distance(a['pointsLocalXYWorldZMm'],b['pointsLocalXYWorldZMm'])
                if a['id'].split('/')[1]!=b['id'].split('/')[1] and abs(d-12)<1e-7:continue
                layer_hook_pairs.append({'a':a['id'],'b':b['id'],'nominalSurfaceClearanceMm':d-12.,
                    'adverseSurfaceClearanceLowerBoundMm':d-12.-2*math.sqrt(3)*s['relativeBarToleranceMm']-2*106*(1-math.cos(math.pi/72))})
            cap['withinLayerHookPairs']=layer_hook_pairs
            cap['minimumWithinLayerHookAdverseClearanceMm']=min(r['adverseSurfaceClearanceLowerBoundMm'] for r in layer_hook_pairs)
            cap['fullForceMatHookAssemblyPasses']=min(cap['minimumTopBottomMatAdverseClearanceMm'],cap['minimumWithinLayerHookAdverseClearanceMm'])>=s['minimumIndependentClearMm']
            deep=copy.deepcopy(body)
            for key in ('bottomEW','bottomNS'):deep['matZMm'][key]-=80
            deep_paths=cap_mat_paths({'barMandrelMm':200.,'barDiameterMm':12.},deep)
            deep_min=min(_path_distance(a['pointsLocalXYWorldZMm'],b['pointsLocalXYWorldZMm'])-12.-2*math.sqrt(3)*s['relativeBarToleranceMm']-2*106*(1-math.cos(math.pi/72))
                for a,b in itertools.combinations(deep_paths,2) if a['id'].split('/')[0]!=b['id'].split('/')[0])
            cap['deeperConventionalCapComparison']={'depthMm':650.,'minimumTopBottomMatAdverseClearanceMm':deep_min,'matHookLayerClearanceComparatorPasses':deep_min>=s['minimumIndependentClearMm'],'additionalRCVolumeM3':.6*.6*.08,
                'additionalPhysicalGKN':.6*.6*.08*25,'actual650DepthModelReplayed':False,
                'scope':'Per-cap extra80mm below unchangedtop−180; source570capacity/reactions do not qualify it.'}
            cap['deeperConventionalCapComparison']['completeHookAssemblyPasses']=False
            cap['headedStraightMatComparison']=_headed_mat_comparison(cap,starters,native.get('capCuts',[]),s)
            caps.append(cap)
    return bars,links,development,caps,{'beamNormalWidthMm':beam_width,'beamDepthsMm':depths,
        'postXBarAxesMm':list(post_x),'postNormalBarOffsetMm':post_y,'beamNormalBarOffsetMm':beam_y,
        'source200BeamPostBarCoverMm':200/2-post_y-s['postBarMm']/2,
        'actualBeamPostBarAdverseCoverMm':beam_width/2-post_y-s['postBarMm']/2-s['settingToleranceMm']-s['relativeBarToleranceMm']}


def _pairs(paths,s,link=False):
    # Exact segment distances for the explicit polyline and a conservative true
    # circular-arc chord-error bound. Whole-cage pairs, not isolated endpoints.
    rows=[];tol=s['relativeBarToleranceMm']
    for a,b in itertools.combinations(paths,2):
        if a['id'].split('/')[0]!=b['id'].split('/')[0]:continue
        d=_path_distance(a['pointsXYZMm'],b['pointsXYZMm']);error=a['arcChordErrorBoundMm']+b['arcChordErrorBoundMm']
        euclidean=d-error-(a['diameterMm']+b['diameterMm'])/2-2*math.sqrt(3)*tol
        axis=max(max(0,min(p[k] for p in a['pointsXYZMm'])-max(p[k] for p in b['pointsXYZMm']),min(p[k] for p in b['pointsXYZMm'])-max(p[k] for p in a['pointsXYZMm'])) for k in range(3))
        certificate=axis-(a['diameterMm']+b['diameterMm'])/2-2*tol-error
        rows.append({'a':a['id'],'b':b['id'],'nominalSurfaceClearanceMm':d-(a['diameterMm']+b['diameterMm'])/2,
            'adverseSurfaceClearanceLowerBoundMm':max(euclidean,certificate),'requiredClearanceMm':0. if link else s['minimumIndependentClearMm']})
    return rows


def _main_bar_cover(result,bars,geometry,s):
    g=result['geometry'];rows=[]
    for bar in bars:
        wall=bar['id'].split('/')[0];cy=next(r['physicalPointMm'][1] for r in result['nativeVertical']['native']['memberCuts'] if r['memberId'].startswith(wall+'/upstand/'))
        top=3170+geometry['beamDepthsMm'][wall];half=geometry['beamNormalWidthMm']/2
        covers=[]
        for p,q in zip(bar['pointsXYZMm'],bar['pointsXYZMm'][1:]):
            # Split the real straight segment at every physical vertical interface.
            cuts=[0.,1.]
            if q[2]!=p[2]:cuts.extend((z-p[2])/(q[2]-p[2]) for z in (-180.,g['innerSpringXZMm'][1],2600.,3170.) if 0<(z-p[2])/(q[2]-p[2])<1)
            for a,b in zip(sorted(cuts),sorted(cuts)[1:]):
                ends=[[u+t*(v-u) for u,v in zip(p,q)] for t in (a,b)];mid=[(u+v)/2 for u,v in zip(*ends)]
                if mid[2]<-180:
                    capx=4500. if mid[0]<6000 else 7500.;capy=11667.5 if wall=='outer-north' else 8050.
                    clearance=min(min(300-abs(r[0]-capx),300-abs(r[1]-capy),r[2]+750) for r in ends)
                elif mid[2]<3170:
                    west=[[(12000-r[0] if r[0]>6000 else r[0]),r[2]] for r in ends]
                    # Source polygon bottom/top are internal cap/beam interfaces.
                    poly=g['westPolygonXZMm'];edges=[(u,v) for u,v in zip(poly,poly[1:]+poly[:1]) if not (u[1]==v[1] and u[1] in (-180,3170))]
                    def contains(point):
                        xx,zz=point;inside=False
                        for u,v in zip(poly,poly[1:]+poly[:1]):
                            if (u[1]>zz)!=(v[1]>zz) and xx<(v[0]-u[0])*(zz-u[1])/(v[1]-u[1])+u[0]:inside=not inside
                        return inside
                    clearance=min(_segment_distance([west[0][0],0,west[0][1]],[west[1][0],0,west[1][1]], [u[0],0,u[1]],[v[0],0,v[1]]) for u,v in edges)
                    if not contains([(west[0][0]+west[1][0])/2,(west[0][1]+west[1][1])/2]):clearance=-clearance
                    clearance=min(clearance,min(145-abs(r[1]-cy) for r in ends))
                else:
                    clearance=min(min(r[0]-4307.5,7692.5-r[0],half-abs(r[1]-cy),top-r[2]) for r in ends)
                    # Only the actual post footprint continues below the beam.
                    if 4520<mid[0]<7480:clearance=min(clearance,min(r[2]-3170 for r in ends))
                covers.append(clearance)
        nominal=min(covers)-bar['diameterMm']/2-bar['arcChordErrorBoundMm']
        rows.append({'barId':bar['id'],'nominalSurfaceCoverLowerBoundMm':nominal,
            'adverseSurfaceCoverLowerBoundMm':nominal-s['settingToleranceMm']-s['relativeBarToleranceMm'],
            'minimumRequiredMm':s['minimumCoverMm']})
    return rows


def _screens(result,s):
    rows=result['nativeVertical']['native']['memberCuts'];out=[];full=s['steelYieldMPa']*s['strengthSteelFraction']
    for row in rows:
        if row['kind'] not in ('post','upstand'):continue
        n,my,mz=(row[k] for k in ('axialCompressionKN','bendingYKNm','bendingZKNm'));b,d=row['breadthMm'],row['depthMm']
        if row['kind']=='upstand':
            bar=s['beamBarMm'];fz=b/2-31.;fy=69.;positions_y=[fy,fy,d-fy,d-fy];positions_z=[fz,fz,b-fz,b-fz]
        else:
            bar=s['postBarMm'];x=row['physicalPointMm'][0];left=x-d/2;axis=[4307.5+69.,4520-69.]
            if '/east/' in row['memberId']:axis=[12000-v for v in axis]
            positions_y=[v-left for v in axis for _ in range(2)];positions_z=[69.,69.,b-69.,b-69.]
        cy=min(_layer_capacity(b,d,positions_y,n,reverse,bar,s['strengthSteelFraction']) for reverse in (False,True))
        cz=min(_layer_capacity(d,b,positions_z,n,reverse,bar,s['strengthSteelFraction']) for reverse in (False,True))
        ratio=abs(my)/cy+abs(mz)/cz if min(cy,cz)>0 else None
        cell_b=(s['beamLinkCageNormalWidthMm'] if row['kind']=='upstand' else b)-2*(s['nominalLinkCoverMm']+s['linkDiameterMm']/2)
        cell_d=d-2*(s['nominalLinkCoverMm']+s['linkDiameterMm']/2)
        radius=(s['linkMandrelMm']+s['linkDiameterMm'])/2
        area=cell_b*cell_d-(4-math.pi)*radius**2
        if min(cell_b,cell_d,area)<=0:raise ValueError('No positive actual closed-link cell remains')
        flow=abs(row['shearYKN'])*1000/(2*.9*(b-69))+abs(row['shearZKN'])*1000/(2*.9*(d-69))+abs(row['torsionKNm'])*1e6/(2*area)
        supply=math.pi*s['linkDiameterMm']**2/4*full/s['linkPitchMm']
        out.append({'memberId':row['memberId'],'end':row['end'],'physicalPointMm':row['physicalPointMm'],
            'actualSectionMm':[d,b],'simultaneousActions':{k:row[k] for k in ('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')},
            'conservativeSignedCapacityYKNm':cy,'conservativeSignedCapacityZKNm':cz,'linearUniaxialRatio':ratio,'closedLinkCellAreaMm2':area,'combinedNecessaryLinkFlowNPerMm':flow,'singleLinkLegSupplyNPerMm':supply,'linkFlowRatio':flow/supply,
            'scope':'Source rectangular strain-compatibility comparisons, both moment signs and actual eccentric bar coordinates; not joint, fullbiaxial/shear/torsion or complete member resistance.'})
    return out


def _mixed_layer_capacity(breadth,depth,positions,axial,reverse,s):
    """Same source rectangular block, with each actual bar's own diameter."""
    bars=[(depth-x if reverse else x,diameter) for x,diameter in positions]
    limit=s['strengthSteelFraction']*s['steelYieldMPa'];fc=s['concreteCompressionMPa']
    def at(x):
        width=min(depth,.8*x);force=fc*width*breadth;moment=force*(depth/2-width/2)
        for position,diameter in bars:
            stress=max(-limit,min(limit,.0035*(1-position/x)*200000))
            value=math.pi*diameter**2/4*(stress-(fc if position<width else 0))
            force+=value;moment+=value*(depth/2-position)
        return force/1000,moment/1e6
    lo,hi=.001,2500.
    if not at(lo)[0]<=axial<=at(hi)[0]:return 0.
    for _ in range(45):
        mid=(lo+hi)/2
        if at(mid)[0]<axial:lo=mid
        else:hi=mid
    return at((lo+hi)/2)[1]


def _station_bars(row,bars):
    """Credit only the explicit vertical path through the physical post cut.

    A wing bend or a terminated lower bar never becomes an invented fullheight
    longitudinal bar. Horizontal/curved segments receive no axial-bar credit.
    """
    z=row['physicalPointMm'][2];prefix='/'.join(row['memberId'].split('/')[:2])+'/'
    out=[]
    for bar in bars:
        if not bar['id'].startswith(prefix):continue
        points=[]
        for p,q in zip(bar['pointsXYZMm'],bar['pointsXYZMm'][1:]):
            if p[:2]!=q[:2] or p[2]==q[2] or not min(p[2],q[2])-1e-8<=z<=max(p[2],q[2])+1e-8:continue
            point=p[:2]
            if point not in points:points.append(point)
        out.extend({'barId':bar['id'],'xyMm':point,'diameterMm':bar['diameterMm']} for point in points)
    return out


def _actual_path_screens(result,bars,s):
    out=[];source={(row['memberId'],row['end']):row for row in _screens(result,s)}
    for row in result['nativeVertical']['native']['memberCuts']:
        if row['kind']!='post':continue
        x,y,z=row['physicalPointMm'];b,d=row['breadthMm'],row['depthMm'];actual=_station_bars(row,bars)
        py=[(p['xyMm'][0]-(x-d/2),p['diameterMm']) for p in actual]
        pz=[(p['xyMm'][1]-(y-b/2),p['diameterMm']) for p in actual]
        if any(not 0<v<depth for positions,depth in ((py,d),(pz,b)) for v,_ in positions):raise ValueError('A credited bar lies outside the actual physical cut')
        cy=min(_mixed_layer_capacity(b,d,py,row['axialCompressionKN'],rev,s) for rev in (False,True))
        cz=min(_mixed_layer_capacity(d,b,pz,row['axialCompressionKN'],rev,s) for rev in (False,True))
        ratio=abs(row['bendingYKNm'])/cy+abs(row['bendingZKNm'])/cz if min(cy,cz)>0 else None
        out.append({**source[(row['memberId'],row['end'])],'memberId':row['memberId'],'end':row['end'],'physicalPointMm':row['physicalPointMm'],
            'actualVerticalBars':actual,'conservativeSignedCapacityYKNm':cy,'conservativeSignedCapacityZKNm':cz,
            'linearUniaxialRatio':ratio,'axialCompressionKN':row['axialCompressionKN'],
            'bendingYKNm':row['bendingYKNm'],'bendingZKNm':row['bendingZKNm'],
            'comparisonSteelStressMPa':s['strengthSteelFraction']*s['steelYieldMPa'],
            'anchorageAndBiaxialResistanceAccepted':False,
            'scope':'Actual vertical path intersections and mixed bar diameters, both moment signs; source rectangular strain compatibility only. No anchorage, fullbiaxial or joint acceptance.'})
    return out


def _position_endpoint_screens(result,actual,s):
    """Adverse independent±5mm bar-position endpoint controls, not fullbiaxial proof."""
    source={(row['memberId'],row['end']):row for row in result['nativeVertical']['native']['memberCuts']}
    out=[]
    for row in actual:
        cut=source[(row['memberId'],row['end'])];x,y,z=cut['physicalPointMm'];b,d=cut['breadthMm'],cut['depthMm']
        ps=row['actualVerticalBars'];py=[(p['xyMm'][0]-(x-d/2),p['diameterMm']) for p in ps];pz=[(p['xyMm'][1]-(y-b/2),p['diameterMm']) for p in ps]
        capacities=[]
        for breadth,depth,positions in ((b,d,py),(d,b,pz)):
            capacities.append(min(_mixed_layer_capacity(breadth,depth,[(v+dv,diam) for (v,diam),dv in zip(positions,deltas)],cut['axialCompressionKN'],reverse,s)
                for deltas in itertools.product((-s['relativeBarToleranceMm'],s['relativeBarToleranceMm']),repeat=len(positions)) for reverse in (False,True)))
        cy,cz=capacities
        out.append({'memberId':row['memberId'],'end':row['end'],'minimumEndpointCapacityYKNm':cy,'minimumEndpointCapacityZKNm':cz,
            'linearUniaxialRatio':abs(cut['bendingYKNm'])/cy+abs(cut['bendingZKNm'])/cz if min(cy,cz)>0 else None,
            'scope':'Enumerated independent position-box endpoints, both moment signs. No claim of full continuous tolerance-domain or biaxial resistance acceptance.'})
    return out


def _boxes_clear(a,b):
    return math.sqrt(sum(max(0.,a[k]-b[k+3],b[k]-a[k+3])**2 for k in range(3)))


def reference_six_bar_straight_frame_cage_settings():
    return {'schema':'str-straight-frame-six-bar-settings/1','postBarMm':16.,'beamBarMm':10.,
        'lowerWingBarMm':16.,'postTopEndInsetMm':59.,'lowerWingEndZMm':2250.,
        'wingNormalOffsetMm':70.,'wingInnerFaceInsetMm':85.,
        'capPostEndLevelsZMm':[-680.,-600.],'capWingEndZMm':-680.,
        'beamReturnLegWestXMm':{'top':4380.,'bottom':4440.},
        'capMatEWFrameOffsetsMm':[-170.,0.,170.],
        'headProduct':'Leviat Ancon TTH16','headDiameterMm':50.,'headLengthMm':33.,'headTorqueNm':110.}


def _admit_six_bar_settings(c):
    reference=reference_six_bar_straight_frame_cage_settings()
    if not isinstance(c,dict) or set(c)!=set(reference):raise ValueError('Exact authored six-bar controls required')
    for key in ('schema','postBarMm','beamBarMm','lowerWingBarMm','headProduct','headDiameterMm','headLengthMm','headTorqueNm'):
        if c[key]!=reference[key]:raise ValueError('Unsupported manufactured product or six-bar family')
    for key in ('postTopEndInsetMm','lowerWingEndZMm','wingNormalOffsetMm','wingInnerFaceInsetMm','capWingEndZMm'):
        if type(c[key]) not in (int,float) or not math.isfinite(c[key]):raise ValueError('Finite six-bar authored dimensions required')
    for key,length in (('capPostEndLevelsZMm',2),('capMatEWFrameOffsetsMm',3)):
        if not isinstance(c[key],list) or len(c[key])!=length or any(type(v) not in (int,float) or not math.isfinite(v) for v in c[key]):raise ValueError('Explicit finite bar lanes required')
    if not isinstance(c['beamReturnLegWestXMm'],dict) or set(c['beamReturnLegWestXMm'])!={'top','bottom'} or any(type(v) not in (int,float) or not math.isfinite(v) for v in c['beamReturnLegWestXMm'].values()):raise ValueError('Two finite ordinary return positions required')
    if not 0<c['wingNormalOffsetMm']<145 or not 0<c['wingInnerFaceInsetMm']<200 or not 40<=c['postTopEndInsetMm']<=150 or not -180<c['lowerWingEndZMm']<=2250:raise ValueError('Six-bar geometry outside its explicit straight lower-post scope')
    if any(not -750<v<-180 for v in [*c['capPostEndLevelsZMm'],c['capWingEndZMm']]):raise ValueError('Cap end outside actual570-depth body')


def _six_bar_comparison(result,base,s,controls=None):
    """One explicit conventional replacement, in the unchanged solved concrete.

    SixH16 below2250, four continuousH16 above; no oversized wing U bend.
    Manufactured heads are explicit occupied volumes, not acquired resistance.
    """
    c=reference_six_bar_straight_frame_cage_settings() if controls is None else copy.deepcopy(controls);_admit_six_bar_settings(c)
    bars=[];heads=[];develop=[];link=s['linkDiameterMm'];tol=s['relativeBarToleranceMm']
    for old in base['longitudinalBars']:
        bar=copy.deepcopy(old)
        wall=bar['id'].split('/')[0];top=3170+base['geometry']['beamDepthsMm'][wall]
        if bar['kind']=='straight-post':
            p,q=bar['pointsXYZMm'];p=list(p)
            # Ordinary staggered cap heads avoid two50mm anchors sharing a
            #75mm bar lane. All bar endpoints and resulting mat clashes follow.
            p[2]=c['capPostEndLevelsZMm'][int(bar['id'].split('/')[-1])//2]
            bar=_path(bar['id'],c['postBarMm'],[p,[q[0],q[1],top-c['postTopEndInsetMm']]],'straight-post')
            develop.append({'id':bar['id'],'fullYieldGoodBondRequiredMm':16*s['steelYieldMPa']/(4*s['goodBondMPa']),
                'beamRunMm':top-c['postTopEndInsetMm']-3170,'axialEndAllowanceMm':2*tol,
                'adverseBeamRunMm':top-c['postTopEndInsetMm']-3170-2*tol,
                'adverseBeamReserveMm':top-c['postTopEndInsetMm']-3170-2*tol-16*s['steelYieldMPa']/(4*s['goodBondMPa']),
                'capStraightRunMm':-180-p[2],'capFullYieldStraightBondPasses':False,'capEnd':'TTH16 head, resistance unqualified'})
        elif 'hairpin' in bar['kind']:
            oldx=bar['pointsXYZMm'][0][0];west=result['geometry']['innerSpringXZMm'][0]-c['wingInnerFaceInsetMm'];x=12000-west if oldx>6000 else west
            cy=(bar['pointsXYZMm'][0][1]+bar['pointsXYZMm'][-1][1])/2
            for sign in (-1,1):
                bars.append(_path(bar['id'].replace('wing-hairpin','wing-straight/'+str(sign)),c['lowerWingBarMm'],[[x,cy+sign*c['wingNormalOffsetMm'],c['capWingEndZMm']],[x,cy+sign*c['wingNormalOffsetMm'],c['lowerWingEndZMm']]],'straight-lower-wing'))
            continue
        elif bar['kind']=='ordinary-downturned-beam-bar':
            # Keep ordinary H10/150 fullforce bend; move both vertical returns
            # away from the actual horizontal post-link side limbs.
            layer=bar['id'].split('/')[2];leg=c['beamReturnLegWestXMm'][layer]
            yy=bar['pointsXYZMm'][0][1];z=top-69 if layer=='top' else 3170+69
            radius=(150.+10.)/2;start=leg+radius
            left=[[leg,yy,z-radius-550.],*_sample(lambda t:[start+radius*math.cos(t),yy,z-radius+radius*math.sin(t)],math.pi,math.pi/2)]
            right=[[12000-p[0],p[1],p[2]] for p in reversed(left)]
            bar=_path(bar['id'],10.,left+right,'ordinary-downturned-beam-bar',150.)
        bars.append(bar)
    for bar in bars:
        if bar['kind'] not in ('straight-post','straight-lower-wing'):continue
        for end,p in enumerate((bar['pointsXYZMm'][0],bar['pointsXYZMm'][-1])):
            if end and bar['kind']=='straight-post':continue
            x,y,z=p;lo,hi=(z,z+33.) if end==0 else (z-33.,z)
            heads.append({'id':bar['id']+'/head/'+str(end),'barId':bar['id'],'product':'Leviat Ancon TTH16',
                'boxXYZMm':[x-25,y-25,lo,x+25,y+25,hi],
                'barDiameterMm':16.,'headDiameterMm':50.,'headLengthMm':33.,'torqueNm':110.,
                'resistanceAccepted':False})
    pairs=_pairs(bars,s);cover=_main_bar_cover(result,bars,base['geometry'],s)
    # Finite heads must clear every independent main bar, every other head and
    # every source ideal link. Bounding boxes enclose the actual circular heads.
    head_head=[];head_bar=[];head_link=[];head_cover=[]
    for head in heads:
        box=head['boxXYZMm'];wall=head['id'].split('/')[0]
        for bar in bars:
            if bar['id']==head['barId'] or not bar['id'].startswith(wall+'/'):continue
            distance=min(_segment_box_distance(p,q,box) for p,q in zip(bar['pointsXYZMm'],bar['pointsXYZMm'][1:]))
            head_bar.append({'head':head['id'],'bar':bar['id'],'adverseClearanceLowerBoundMm':distance-bar['diameterMm']/2-2*math.sqrt(3)*tol-bar['arcChordErrorBoundMm']})
        for other in heads:
            if other['id']<=head['id'] or not other['id'].startswith(wall+'/'):continue
            head_head.append({'a':head['id'],'b':other['id'],'adverseClearanceLowerBoundMm':_boxes_clear(box,other['boxXYZMm'])-2*math.sqrt(3)*tol})
        for hoop in base['idealClosedLinks']:
            if not hoop['id'].startswith(wall+'/'):continue
            lower=_boxes_clear(box,_path_box(hoop['pointsXYZMm']))-link/2-2*math.sqrt(3)*tol-hoop['arcChordErrorBoundMm']
            if lower<0:
                lower=min(_segment_box_distance(p,q,box) for p,q in zip(hoop['pointsXYZMm'],hoop['pointsXYZMm'][1:]))-link/2-2*math.sqrt(3)*tol-hoop['arcChordErrorBoundMm']
            head_link.append({'head':head['id'],'link':hoop['id'],'adverseClearanceLowerBoundMm':lower})
        if box[2]<-180:
            capx=4500. if box[0]<6000 else 7500.;capy=11667.5 if wall=='outer-north' else 8050.
            value=min(box[0]-(capx-300),capx+300-box[3],box[1]-(capy-300),capy+300-box[4],box[2]+750,-180-box[5])
        else:
            # All upper wing heads are wholly below the2250 spring in the
            # actual constant393-wide abutment. No tapered head interpolation.
            cy=next(row['physicalPointMm'][1] for row in result['nativeVertical']['native']['memberCuts'] if row['memberId'].startswith(wall+'/upstand/'))
            xlo,xhi=(4307.5,result['geometry']['innerSpringXZMm'][0]) if box[0]<6000 else (12000-result['geometry']['innerSpringXZMm'][0],7692.5)
            value=min(box[0]-xlo,xhi-box[3],box[1]-(cy-145),cy+145-box[4])
            if box[5]>result['geometry']['innerSpringXZMm'][1]:raise ValueError('Wing head leaves actual constant lower post')
            # A head below the spring can still approach the sloped face above
            # it diagonally. Check the entire finite box against that real face,
            # rather than mistaking a rectangular lower slice for cover proof.
            xmin,xmax=(box[0],box[3]) if box[0]<6000 else (12000-box[3],12000-box[0])
            profile_box=[xmin,0.,box[2],xmax,0.,box[5]];poly=result['geometry']['westPolygonXZMm']
            edges=[(u,v) for u,v in zip(poly,poly[1:]+poly[:1]) if not (u[1]==v[1] and u[1] in (-180,3170))]
            value=min(value,min(_segment_box_distance([u[0],0,u[1]],[v[0],0,v[1]],profile_box) for u,v in edges))
        head_cover.append({'head':head['id'],'adverseCoverLowerBoundMm':value-s['settingToleranceMm']-tol})
    main_link=[]
    for bar in bars:
        for hoop in base['idealClosedLinks']:
            if not hoop['id'].startswith(bar['id'].split('/')[0]+'/'):continue
            lower=_boxes_clear(_path_box(bar['pointsXYZMm']),_path_box(hoop['pointsXYZMm']))-(bar['diameterMm']+link)/2-math.sqrt(3)*tol-bar['arcChordErrorBoundMm']-hoop['arcChordErrorBoundMm']
            if lower<0:
                lower=min(_segment_box_distance(u,v,[min(p[k],q[k])-tol for k in range(3)]+[max(p[k],q[k])+tol for k in range(3)])
                    for p,q in zip(bar['pointsXYZMm'],bar['pointsXYZMm'][1:])
                    for u,v in zip(hoop['pointsXYZMm'],hoop['pointsXYZMm'][1:]))-(bar['diameterMm']+link)/2-bar['arcChordErrorBoundMm']-hoop['arcChordErrorBoundMm']
            main_link.append({'bar':bar['id'],'link':hoop['id'],'adverseClearanceLowerBoundMm':lower})
    cap_interfaces=[]
    for cap in base['capInterfaces']:
        wall='outer-north' if cap['id'] in ('P25','P26') else 'court-north';side='west' if cap['id'] in ('P25','P28') else 'east'
        starters=[(bar['pointsXYZMm'][0],bar['diameterMm']) for bar in bars if bar['id'].startswith(wall+'/'+side+'/')]
        frame_y=next(row['physicalPointMm'][1] for row in result['nativeVertical']['native']['memberCuts'] if row['memberId'].startswith(wall+'/upstand/'))
        offset=frame_y-cap['xyMm'][1]
        mat=_headed_mat_comparison(cap,starters,result['nativeVertical']['native'].get('capCuts',[]),s,{'NS':[-210.,40.,210.],'EW':[value+offset for value in c['capMatEWFrameOffsetsMm']]})
        cap_heads=[head for head in heads if head['id'].startswith(wall+'/'+side+'/') and head['boxXYZMm'][2]<-180]
        comparisons=[]
        for head in cap_heads:
            box=[head['boxXYZMm'][k]-cap['xyMm'][k] if k<2 else head['boxXYZMm'][k] for k in range(3)]+[head['boxXYZMm'][k]-cap['xyMm'][k-3] if k<5 else head['boxXYZMm'][k] for k in range(3,6)]
            for matbar in mat['straightMatBars']:
                p,q=matbar['pointsLocalXYWorldZMm'];value=_segment_box_distance(p,q,box)-6.-2*math.sqrt(3)*tol
                comparisons.append({'starterHead':head['id'],'matBar':matbar['id'],'adverseClearanceLowerBoundMm':value})
            for mathead in mat['headEnvelopes']:
                comparisons.append({'starterHead':head['id'],'matHead':mathead['id'],'adverseClearanceLowerBoundMm':_boxes_clear(box,mathead['boxXYZMm'])-2*math.sqrt(3)*tol})
        cap_interfaces.append({'id':cap['id'],'sourceSizeMm':[600.,600.,570.],'headedMat':mat,
            'starterHeadMatComparisons':comparisons,'minimumStarterHeadMatAdverseClearanceMm':min(row['adverseClearanceLowerBoundMm'] for row in comparisons),
            'pileAndGridJointAccepted':False})
    actual=_actual_path_screens(result,bars,s);worst=max(actual,key=lambda row:row['linearUniaxialRatio'] if row['linearUniaxialRatio'] is not None else math.inf)
    endpoints=_position_endpoint_screens(result,actual,s);worst_endpoint=max(endpoints,key=lambda row:row['linearUniaxialRatio'] if row['linearUniaxialRatio'] is not None else math.inf)
    evaluated_counts={'headHead':len(head_head),'headMainBar':len(head_bar),'headIdealLink':len(head_link),'mainBarIdealLink':len(main_link)}
    # Retain the adverse witness for each moving entity instead of thousands of
    # irrelevant positive link pairs. Every pair above is actually evaluated.
    def witnesses(rows,key):
        found={}
        for row in rows:
            identity=row[key]
            if identity not in found or row['adverseClearanceLowerBoundMm']<found[identity]['adverseClearanceLowerBoundMm']:found[identity]=row
        return list(found.values())
    head_bar=witnesses(head_bar,'head');head_link=witnesses(head_link,'head');main_link=witnesses(main_link,'bar')
    geometry_pass=(min(row['adverseSurfaceClearanceLowerBoundMm'] for row in pairs)>=s['minimumIndependentClearMm']
        and min(row['adverseSurfaceCoverLowerBoundMm'] for row in cover)>=s['minimumCoverMm']
        and min(row['adverseClearanceLowerBoundMm'] for row in head_head+head_bar)>=s['minimumIndependentClearMm']
        and min(row['adverseClearanceLowerBoundMm'] for row in head_link+main_link)>=0
        and min(row['adverseCoverLowerBoundMm'] for row in head_cover)>=s['minimumCoverMm']
        and min(row['minimumStarterHeadMatAdverseClearanceMm'] for row in cap_interfaces)>=s['minimumIndependentClearMm']
        and all(min(row['headedMat'][key] for key in ('minimumHeadHeadAdverseEnvelopeClearMm','minimumHeadStarterAdverseClearMm','minimumMatStarterAdverseClearMm'))>=s['minimumIndependentClearMm'] and row['headedMat']['minimumHeadSurfaceAdverseCoverMm']>=s['minimumCoverMm'] for row in cap_interfaces)
        and min(row['adverseBeamReserveMm'] for row in develop)>=0)
    section_pass=all(row['linearUniaxialRatio'] is not None and row['linearUniaxialRatio']<=1 for row in actual+endpoints)
    beam_screens=[row for row in base['sectionScreens'] if '/upstand/' in row['memberId']]
    section_pass=section_pass and all(row['linearUniaxialRatio'] is not None and row['linearUniaxialRatio']<=1 for row in beam_screens) and all(row['linkFlowRatio']<=1 for row in base['sectionScreens'])
    return {'schema':'str-straight-frame-six-h16-comparison/1','authoredLayout':'Four continuousH16 plus two straight lower-wingH16; ordinary H10 beams; source570caps.',
        'settings':c,'sourceCaseId':base['sourceCaseId'],'sourceSHA256':base['sourceSHA256'],
        'solvedConcreteGeometryUnchanged':True,'sameActualSourceCuts':True,'nativeSourceSHA256':result['sourceSHA256'],
        'simultaneousCutDigest':base['simultaneousCutDigest'],'longitudinalBars':bars,'starterAndWingHeads':heads,
        'postFullYieldDevelopment':develop,'mainBarPairs':pairs,'mainBarCover':cover,
        'minimumMainBarAdverseClearanceMm':min(row['adverseSurfaceClearanceLowerBoundMm'] for row in pairs),
        'minimumMainBarAdverseCoverMm':min(row['adverseSurfaceCoverLowerBoundMm'] for row in cover),
        'headHeadComparisons':head_head,'headBarComparisons':head_bar,'headIdealLinkComparisons':head_link,'headCover':head_cover,
        'mainIdealLinkComparisons':main_link,'headedCapInterfaces':cap_interfaces,'actualPathSectionScreens':actual,'worstActualPathSectionScreen':worst,
        'evaluatedPairCounts':evaluated_counts,'pairReceiptScope':'Every pair evaluated; adverse witness per moving bar/head retained for head/bar and bar-or-head/ideal-link families.',
        'adversePositionEndpointScreens':endpoints,'worstAdversePositionEndpointScreen':worst_endpoint,
        'idealLinkToleranceScope':'Source links are the shared cage reference: globalsetting tolerance cancels in main/link interaction; each mainbar has its own relative±5mm box. No link shape or135hook manufacturing tolerance has been invented.',
        'manufacturerSource':{'url':'https://www.ancon.co.uk/downloads/81/Reinforcing%20Bar%20Couplers%20UK%20IRE%20Edition.pdf','edition':'September2026 UK and Ireland','page':14,'observedDate':'2026-11-20','minimumConcreteGrade':'C32/40'},
        'sourceComparisonSteelStressMPa':s['steelYieldMPa']*s['strengthSteelFraction'],'physicalFullYieldMPa':s['steelYieldMPa'],
        'fullYieldH16HeadTensionKN':math.pi*16**2/4*s['steelYieldMPa']/1000,
        'uniformNetH16HeadBearingAtFullYieldMPa':(16**2*s['steelYieldMPa'])/(50**2-16**2),
        'allNecessaryGeometricPathComparisonsPass':geometry_pass,'allNecessarySectionComparisonsWithinOne':section_pass,
        'beamSectionScreens':beam_screens,'linkFlowScreens':base['sectionScreens'],
        'candidateAccepted':False,'headResistanceAccepted':False,'localJointAndConfinementAccepted':False,
        'installedAcceptance':False,'scope':'Necessary actual-path section and whole-route geometry comparison only. Head concrete grade, bearing/cones/splitting, curtailed-wing load introduction, cap/pile/grid, manufactured135hook/cross-tie closure and complete correlated programme remain unqualified. No steel-stiffness or changed RC/G credit.'}


def _path_box(points):return [min(p[k] for p in points) for k in range(3)]+[max(p[k] for p in points) for k in range(3)]


def _segment_box_distance(p,q,box):
    """Exact minimum of piecewise-quadratic distance to a finite AABB."""
    cuts=[0.,1.]
    for k in range(3):
        if q[k]!=p[k]:cuts.extend((v-p[k])/(q[k]-p[k]) for v in (box[k],box[k+3]) if 0<(v-p[k])/(q[k]-p[k])<1)
    best=math.inf
    for a,b in zip(sorted(set(cuts)),sorted(set(cuts))[1:]):
        mid=(a+b)/2;aa=bb=0.
        for k in range(3):
            value=p[k]+mid*(q[k]-p[k]);target=box[k] if value<box[k] else box[k+3] if value>box[k+3] else None
            if target is not None:
                delta=q[k]-p[k];aa+=delta**2;bb+=delta*(p[k]-target)
        t=max(a,min(b,-bb/aa)) if aa else mid
        best=min(best,math.sqrt(sum(max(0.,box[k]-(p[k]+t*(q[k]-p[k])),p[k]+t*(q[k]-p[k])-box[k+3])**2 for k in range(3))))
    return best


def assess_six_bar_straight_frame_cage(result,settings=None):
    """Pure callable replacement comparison; never changes the native case."""
    base=assess_straight_frame_cage(result)
    return _six_bar_comparison(result,base,reference_straight_frame_cage_settings(),settings)


def assess_straight_frame_cage(result,settings=None):
    if isinstance(settings,dict) and settings.get('schema')=='str-straight-frame-six-bar-settings/1':
        return _selected_six_bar_result(result,settings)
    s=reference_straight_frame_cage_settings() if settings is None else copy.deepcopy(settings);_admit(s)
    if not isinstance(result,dict) or result.get('schema')!='str-masonry-frame-a-result/1' or not isinstance(result.get('geometry'),dict):raise ValueError('Actual separate masonry/straight-frame result required')
    native=result.get('nativeVertical',{}).get('native',{})
    if native.get('schema')!='str-masonry-frame-a-compatible-frame-result/1' or not isinstance(native.get('memberCuts'),list) or not native['memberCuts']:raise ValueError('Actual source-bound compatible frame cuts required')
    sources=result.get('sourceSHA256',{})
    for path in (CAGE,WATER,GRID):
        if sources.get(path)!=hashlib.sha256((ROOT/path).read_bytes()).hexdigest():raise ValueError('Stale or missing actual cage/material/source binding: '+path)
    for row in native['memberCuts']:
        if any(type(row.get(k)) not in (int,float) or not math.isfinite(row[k]) for k in ('breadthMm','depthMm','axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')):raise ValueError('Finite simultaneous signed section cuts required')
    request=result.get('request')
    if not isinstance(request,dict) or request.get('schema')!='str-masonry-frame-a-case/1' or request.get('sourceSHA256')!=sources:raise ValueError('Actual full controlling A case required, not a compact receipt or detached force vector')
    house=request['verticalCase']['monolithicCase']['houseCase'];joined=house['joinedCase']
    for row in native['memberCuts']:
        if row['kind']=='upstand':
            depth=joined['geometry']['outerUpstandDepthMm' if row['memberId'].startswith('outer-north/') else 'courtUpstandDepthMm']
            if row['breadthMm']!=house['northUpstandWidthMm'] or row['depthMm']!=depth:raise ValueError('Native cut section differs from actual authored beam; no old-force geometry substitution')
    bars,links,development,caps,geometry=_bar_paths(result,s);pairs=_pairs(bars,s);screen=_screens(result,s)
    cover=_main_bar_cover(result,bars,geometry,s)
    worst=max(screen,key=lambda r:r['linearUniaxialRatio'] if r['linearUniaxialRatio'] is not None else math.inf)
    full=s['steelYieldMPa'];beam_force=math.pi*s['beamBarMm']**2/4*full
    required=beam_force*(1/(s['minimumCoverMm']+s['beamBarMm']/2)+1/(2*s['beamBarMm']))/s['concreteCompressionMPa']
    failures=[row for row in pairs if row['adverseSurfaceClearanceLowerBoundMm']<row['requiredClearanceMm']]
    return {'schema':'str-straight-frame-cage-result/1','sourceCaseId':native['caseId'],'settings':s,
        'authoredCageSettingsMatchCase':request.get('straightFrameCage')==s,
        'sourceSHA256':{path:hashlib.sha256((ROOT/path).read_bytes()).hexdigest() for path in (METHOD,CAGE,WATER,GRID)},
        'nativeSourceSHA256':sources,'simultaneousCutDigest':_hash(native['memberCuts']),
        'geometry':geometry,'mainBarCover':cover,'minimumMainBarAdverseCoverMm':min(x['adverseSurfaceCoverLowerBoundMm'] for x in cover),'longitudinalBars':bars,'idealClosedLinks':links,'fullForceDevelopment':development,
        'mainBarPairs':pairs,'failedMainBarPairCount':len(failures),'minimumMainBarAdverseClearanceMm':min(r['adverseSurfaceClearanceLowerBoundMm'] for r in pairs),
        'beamFullYieldMandrelRequiredMm':required,'authoredBeamMandrelMm':s['beamMandrelMm'],
        'beamFullYieldMandrelComparatorPasses':s['beamMandrelMm']>=required,
        'capInterfaces':caps,'sectionScreens':screen,'worstSectionScreen':worst,
        'allSectionComparisonsWithinOne':all(r['linearUniaxialRatio'] is not None and r['linearUniaxialRatio']<=1 and r['linkFlowRatio']<=1 for r in screen),
        'actualJointPostBarCoverComparatorPasses':geometry['actualBeamPostBarAdverseCoverMm']>=s['minimumCoverMm'],
        'closedLinkHookClosure':{'scheme':'Conventional manufactured135-degree hooks; NOT an ideal welded loop approval.',
            'tailReservationMm':80.,'manufacturedCentrelineAndRibEnvelopeProvided':False,'hookClosureGeometryAccepted':False,
            'primarySource':'https://heatonmanufacturing.co.uk/rebar-stirrups/',
            'scope':'Ideal closed perimeters above do not prove the physical two-hook closure. Allhook tails and cross-ties must be explicitly routed before fabrication acceptance.'},
        'candidateAccepted':False,'jointPanelAccepted':False,'capGridJointAccepted':False,'pileInterfaceAccepted':False,
        'reinforcementAccepted':False,'installedAcceptance':False,'solvedGeometrySuppliesDemand':True,
        'scope':'Complete conventional main-bar route and ideal closed-link schedule through both northern frames, independent masonry abutments and actual finite caps. Actual simultaneous signed source actions only; closurehooks, cross-tie bracing, localjoint struts, cap/grid/pile, full loadprogramme and environmental acceptance remain unearned.'}


def _selected_six_bar_result(result,settings):
    _admit_six_bar_settings(settings)
    base=assess_straight_frame_cage(result)
    six=_six_bar_comparison(result,base,reference_straight_frame_cage_settings(),settings)
    retired={'settings':base['settings'],'worstFourCoreOnlySectionScreen':base['worstSectionScreen'],
        'allSectionComparisonsWithinOne':base['allSectionComparisonsWithinOne'],
        'note':'Historical four-coreH12/wingU control; its bars and cap mats are not the selected authored route.'}
    # Preserve the native result interface while making its authored alternative
    # unambiguous. No defaultH12 setting or failed hookmat is labelled sixH16.
    base.update({'settings':copy.deepcopy(settings),'selectedRoute':'six-straight-H16-with-manufactured-head-comparison',
        'authoredCageSettingsMatchCase':result['request'].get('straightFrameCage')==settings,
        'variantRole':'actual-authored-cage-candidate' if result['request'].get('straightFrameCage')==settings else 'explicit-postprocessing-alternative-in-unchanged-concrete',
        'fourCoreHairpinControl':retired,'longitudinalBars':six['longitudinalBars'],
        'mainBarPairs':six['mainBarPairs'],'mainBarCover':six['mainBarCover'],
        'failedMainBarPairCount':sum(row['adverseSurfaceClearanceLowerBoundMm']<row['requiredClearanceMm'] for row in six['mainBarPairs']),
        'minimumMainBarAdverseClearanceMm':six['minimumMainBarAdverseClearanceMm'],
        'minimumMainBarAdverseCoverMm':six['minimumMainBarAdverseCoverMm'],
        'capInterfaces':six['headedCapInterfaces'],'starterAndWingHeads':six['starterAndWingHeads'],
        'sectionScreens':six['actualPathSectionScreens']+six['beamSectionScreens'],
        'worstSectionScreen':six['worstActualPathSectionScreen'],
        'allSectionComparisonsWithinOne':six['allNecessarySectionComparisonsWithinOne'],
        'fullForceDevelopment':six['postFullYieldDevelopment']+[row for row in base['fullForceDevelopment'] if '/beam/' in row['id']],
        'completeNecessaryGeometricPathComparisonPasses':six['allNecessaryGeometricPathComparisonsPass'],
        'sixBarConventionalComparison':{key:value for key,value in six.items() if key not in ('longitudinalBars','mainBarPairs','mainBarCover','headedCapInterfaces','actualPathSectionScreens','beamSectionScreens','starterAndWingHeads')},
        'scope':six['scope']})
    base['geometry']=copy.deepcopy(base['geometry'])
    base['geometry']['actualBeamPostBarAdverseCoverMm']-=2.
    base['geometry']['source200BeamPostBarCoverMm']-=2.
    base['actualJointPostBarCoverComparatorPasses']=base['geometry']['actualBeamPostBarAdverseCoverMm']>=reference_cage_case()['minimumCoverMm']
    return base


def reference_straight_frame_cage_result(root=ROOT):
    proof=json.loads((Path(root)/'project/str/studies/masonry-frame-a-proof.json').read_text())
    result=copy.deepcopy(proof['baseline'])
    result['request']=proof['authoredNumericalCase']
    return result




def render_straight_frame_cage(result,assessment):
    import html
    six=assessment['settings']['schema']=='str-straight-frame-six-bar-settings/1'
    g=result['geometry'];s=reference_straight_frame_cage_settings() if six else assessment['settings'];rows=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1300 1000">',
        '<rect width="1300" height="1000" fill="#faf8f2"/><style>text{font:14px sans-serif;fill:#253941}.small{font-size:12px}.hold{fill:#a54a38}</style>',
        '<text x="32" y="34" font-size="22">CONVENTIONAL STRAIGHT FRAME: WHOLE REINFORCEMENT ROUTE</text>',
        '<text x="32" y="60">Actual simultaneous source case '+html.escape(assessment['sourceCaseId'])+' / necessary comparisons only</text>']
    def pt(x,z):return 40+(x-4200)*.19,835-(z+750)*.16
    def path(points):return ' '.join(('M' if i==0 else 'L')+f'{pt(p[0],p[2])[0]:.3f},{pt(p[0],p[2])[1]:.3f}' for i,p in enumerate(points))
    poly=[[x,0,z] for x,z in g['westPolygonXZMm']]
    rows.append('<path d="'+path(poly)+' Z" fill="#d1dcd8" stroke="#65796f"/>')
    rows.append('<path d="'+path([[12000-p[0],p[1],p[2]] for p in poly])+' Z" fill="#d1dcd8" stroke="#65796f"/>')
    top=3170+assessment['geometry']['beamDepthsMm']['court-north']
    beam=[[4307.5,0,3170],[7692.5,0,3170],[7692.5,0,top],[4307.5,0,top]]
    rows.append('<path d="'+path(beam)+' Z" fill="#d1dcd8" stroke="#65796f"/>')
    for b in assessment['longitudinalBars']:
        if not b['id'].startswith('court-north/'):continue
        colour='#284e7d' if b['kind']=='straight-post' else '#a76d35' if 'wing' in b['id'] else '#a24542'
        rows.append('<path d="'+path(b['pointsXYZMm'])+'" fill="none" stroke="'+colour+'" stroke-width="1.5"/>')
    for head in assessment.get('starterAndWingHeads',[]):
        if not head['id'].startswith('court-north/'):continue
        box=head['boxXYZMm'];x,y=pt(box[0],box[5]);xx,yy=pt(box[3],box[2])
        rows.append(f'<rect x="{x}" y="{y}" width="{xx-x}" height="{yy-y}" fill="#a76d35"/>')
    for x in (4500,7500):
        a,b=pt(x-300,-180);c,d=pt(x+300,-750)
        rows.append(f'<rect x="{a}" y="{b}" width="{c-a}" height="{d-b}" fill="none" stroke="#65796f"/>')
    wing_z=assessment['settings']['lowerWingEndZMm'] if six else 2350
    for z,label in ((-680,'−680 / −600 staggered heads' if six else '−680 continuous starters'),(-180,'−180 cap top'),(wing_z,f'{wing_z:.0f} headed lower bars' if six else '2350 independent wing U crown'),(3170,'3170 beam underside')):
        x,y=pt(4307.5,z);rows.append(f'<text class="small" x="42" y="{y-8}">{label}</text>')
    rows.extend(['<text x="750" y="118">ACTUAL GEOMETRY AND FULL-YIELD ANCHORAGE</text>',
        f'<text class="small" x="750" y="149">Solved beam width {assessment["geometry"]["beamNormalWidthMm"]:.0f} mm; post normal 290 mm</text>',
        '<text class="small" x="750" y="176">'+('Post: four continuous H16; six H16 below2250' if six else 'Post: four straight H12; no curved arch bars or laps')+'</text>',
        '<text class="small" x="750" y="203">Beam: four H10, staggered ordinary downward tails</text>',
        '<text class="small" x="750" y="230">'+('Lower wing: two straight H16 with50 ×33 TTH16 heads' if six else 'Separate H10 hairpin inside each direct-bearing abutment')+'</text>',
        f'<text class="small" x="750" y="257">H10 mandrel required {assessment["beamFullYieldMandrelRequiredMm"]:.3f} / authored {s["beamMandrelMm"]:.0f} mm</text>',
        f'<text class="small" x="750" y="284">Poor-bond straight tails {s["beamStraightTailMm"]:.0f} mm; no hook reduction</text>',
        f'<text class="small" x="750" y="311">Main-bar adverse clearance ≥ {assessment["minimumMainBarAdverseClearanceMm"]:.3f} mm</text>',
        '<text class="hold" x="750" y="360">'+('ACTUAL WIDENED BEAM: SAME-CASE NECESSARY CHECKS' if assessment['geometry']['beamNormalWidthMm']>=290 else 'REJECT THE SOURCE200 JOINT FOR STRAIGHT POST BARS')+'</text>',
        f'<text class="small" x="750" y="389">Actual worst nominal section comparison {assessment["worstSectionScreen"]["linearUniaxialRatio"]:.4f}; no resistance acceptance.</text>',
        '<text class="small" x="750" y="416">'+('Concrete geometry and simultaneous cuts are source-bound.' if assessment['geometry']['beamNormalWidthMm']>=290 else 'Use one290-wide beam and replay its real plate/RC union.')+'</text>',
        '<text class="hold" x="750" y="465">REJECT INHERITANCE OF THE OLD570 CAP HOOK ASSEMBLY</text>',
        '<text class="small" x="750" y="494">Full-force H12 needs200 mm mandrel; actual source cap</text>',
        '<text class="small" x="750" y="521">top/bottom return envelopes conflict after tolerances.</text>',
        '<text class="small" x="750" y="548">650 clears top/bottom only; orthogonal hook fit fails.</text>',
        '<text class="small" x="750" y="575">Straight headed mats need actual C32/40/local proof.</text>',
        '<text class="hold" x="750" y="624">Closed-link135° hooks and cross-tie closure are not proved.</text>',
        '<text class="small" x="750" y="653">Ideal closed perimeters are not a fabrication schedule.</text>',
        '<text class="small" x="32" y="902">Blue: continuous post bars. Red: beam bars and ordinary returns. Ochre: independent lower-wing bars and manufactured heads.</text>',
        '<text class="small" x="32" y="930">View shows the court frame; normal planes are projected together. Full3D routes and exact named caps accompany the calculation.</text>',
        '<text class="hold" x="32" y="963">No cage, joint, material, moisture, roof, pile or construction acceptance is asserted.</text></svg>'])
    return '\n'.join(rows)+'\n'


if __name__=='__main__':
    import sys
    if sys.argv[1:]==['--read']:
        print(json.dumps(reference_straight_frame_cage_settings(),allow_nan=False))
    else:
        data=json.load(sys.stdin)
        if set(data)!={'result','settings'}:raise ValueError('Exact actual-result/settings request required')
        print(json.dumps(assess_straight_frame_cage(data['result'],data['settings']),allow_nan=False))
