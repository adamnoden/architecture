import copy
import hashlib
import json
import math
from pathlib import Path
import sys

from continuous_rc_portal import build_continuous_rc_portal, load_continuous_rc_source, reference_continuous_rc_case, solve_continuous_rc_case, physical_schedule
from distributed_floor_compatibility import _admit_distributed, _bounds, native_intermediate_support_ports, reference_distributed_floor_request
from joined_successor_kernel import FrameModel, l_section, rectangle_contact_quadrature, rectangle_section
from joined_successor_compatibility import _wrench_at
from perforated_floor_condensation import compile_perforated_floor
from retained_components import evaluate_retained_components


METHOD='project/str/studies/joined_rc_floor.py'
VIEW='project/str/studies/joined_rc_floor_views.py'


def load_joined_rc_floor_source(root):
    root=Path(root);portal=load_continuous_rc_source(root)
    return {'root':root,'portal':portal,'floor':portal['lower']['parent'],
        'identities':{**portal['identities'],**{path:hashlib.sha256((root/path).read_bytes()).hexdigest() for path in (METHOD,VIEW)}}}


def reference_joined_rc_floor_case(source):
    return {'schema':'str-joined-rc-floor-case/1','sourceSHA256':source['identities'],
        'portal':reference_continuous_rc_case(source['portal']),
        'floor':reference_distributed_floor_request(source['floor']),
        'geometry':{'outerUpstandDepthMm':750,'courtUpstandDepthMm':650},
        'portalDPCNormalMode':None,'portalDPCNormalIntegration':None,'portalDPCQuadratureOrder':2,'portalDPCNormalSubdivisions':1,'portalDPCInsetMm':0,
        'floorBoundary':'passive-floor-receiving-local-portal-challenges',
        'northUnion':'full-3D-upstand-owns-central-north-band-material',
        'use':'unqualified-eight-path-joined-comparison'}


def _add_L_paths(model,request,source):
    frame=model['model'];grid=model['grid'];geometry=source['successor']['values']['floor-portal-monolithic-drag']['geometry']
    collector=source['successor']['values']['floor-portal-monolithic-drag'];material=request['memberLaw'];joint=request['jointLaw']
    corners=[];joints=[]
    for corner,head_id,sx,sy in [('SW','P01',1,1),('SE','P04',-1,1),('NW','P07',1,-1),('NE','P10',-1,-1)]:
        head=next(row for row in grid['heads'] if row['id']==head_id);origin=head['xy']
        def world(u,v,z):return [origin[0]+sx*u,origin[1]+sy*v,z]
        section=l_section(geometry['wallUAndLegVLimitsMm'][0][0],request['cornerWidthsMm'][corner],geometry['wallUAndLegVLimitsMm'][1][1])
        cx,cy=section['centreUV']
        if abs(cx)>head['capXY'][0]/2 or abs(cy)>head['capXY'][1]/2:raise ValueError('L-path centroid lies outside actual cap')
        plate=source['successor']['values']['current-house-lateral']['capillarySplice']['plateZ']
        top=frame.node(corner+'/collector',world(cx,cy,3170))
        upper=frame.node(corner+'/DPC-upper',world(cx,cy,plate[1]));lower=frame.node(corner+'/DPC-lower',world(cx,cy,plate[0]))
        bottom=frame.node(corner+'/wall-foot',world(cx,cy,head['capZ'][1]))
        orientation=[sx*section['principalYUV'][0],sy*section['principalYUV'][1],0]
        frame.member(corner+'/upper-wall',upper,top,section,material,y_axis=orientation)
        frame.member(corner+'/lower-wall',bottom,lower,section,material,y_axis=orientation)
        cap_grid_z=sum(grid['girders']['outer-W']['z'])/2
        frame.member(corner+'/corner-cap',head_id,bottom,rectangle_section(*head['capXY']),material,
            physical_start=[*head['xy'],cap_grid_z],physical_end=[*head['xy'],head['capZ'][1]],y_axis=[0,1,0])
        for index,rectangle in enumerate(section['rectangles']):
            for sample,(u,v,area) in enumerate(rectangle_contact_quadrature(rectangle)):
                frame.spring(corner+'/compression/'+str(index)+'/'+str(sample),upper,lower,world(u,v,sum(plate)/2),[0,0,1],joint['compressionStiffnessKNPerMm3']*area,'compression')
        for index,row in enumerate(collector['groundSplice']['knownMainBarAxes']):
            u,v=row['legacyBlindBoreXYMm']
            frame.spring(corner+'/tie/'+str(index),upper,lower,world(u,v,sum(plate)/2),[0,0,1],joint['tieStiffnessKNPerMm'],'tension')
        blocks=source['successor']['values']['current-house-ground-ties']['outer']['DPC']['threeThickBlocksPlanLocal'];offset=blocks[0][2]/2
        for index,(u,v,width,depth) in enumerate(blocks):
            for axis in (0,1):
                direction=[0,0,0];direction[axis]=1
                frame.spring(corner+'/key/'+str(index)+'/'+str(axis),upper,lower,world(u+width/2-offset,v+depth/2-offset,sum(plate)/2),direction,joint['shearKeyStiffnessKNPerMm'])
        rectangles=[]
        for u,v,U,V in section['rectangles']:
            x,y,_=world(u,v,0);X,Y,_=world(U,V,0)
            rectangles.append([min(x,X),min(y,Y),max(x,X),max(y,Y)])
        corners.append({'id':corner,'originXYMm':origin,'rectangles':rectangles,'node':top})
        joints.append({'id':corner,'upper':upper,'lower':lower,'originXYZMm':world(cx,cy,sum(plate)/2)})
    return corners,joints


def _source_geometry_guard(source):
    parent=source['floor'];h=parent['retained']['values']['project/had/studies/water-replan.json']['model'];p=h['insulatedPortal']
    required={'rawSpan':2960,'rawSpring':2250,'rawRise':600,'ring':215,'coreAxial':215,'finishedAxial':775}
    if any(p.get(key)!=value for key,value in required.items()):
        raise ValueError('Source portal geometry changed: frozen reference challenger must be reauthored, not silently resized')
    if p['piers']['westEW']!=[4307.5,4520] or p['piers']['eastEW']!=[7480,7692.5] or p['piers']['courtNS']!=[7975,8190] or p['piers']['gardenNS']!=[11560,11775]:
        raise ValueError('Source pier placement changed: update actual cap/receiving geometry before reuse')
    floor=parent['successor']['values']['floor-portal-monolithic-drag']['geometry']['soffitAndOrdinarySlabTopZMm']
    if floor!=[3170,3370] or any(row['centre']!=6000 or row['width']!=p['rawSpan'] for row in h['openings']['GROUND'] if row['id'] in ('garden-entry','grand-court-entry-north')):
        raise ValueError('Changed opening centre/span or vertical floor datum needs explicit geometry reauthoring')


def _author_upstand_geometry(model,geometry,source):
    if not isinstance(geometry,dict) or set(geometry)!={'outerUpstandDepthMm','courtUpstandDepthMm'} or any(type(value) not in (int,float) or not math.isfinite(value) or not 400<=value<=900 for value in geometry.values()):
        raise ValueError('Authored finite400..900mm northern upstand depths required')
    frame=model['model'];law=model['request']['frameLaw'];family=model['families']['physical-G']
    def load(node,wrench):
        target=family.setdefault(node,[0.]*6)
        for i,value in enumerate(wrench):target[i]+=value
    def weight_component(nodes,xs,height,sign):
        for i,(a,b) in enumerate(zip(nodes,nodes[1:])):
            weight=(xs[i+1]-xs[i])*140*height/1e9*25*sign
            for node in (a,b):load(node,[0,0,-weight/2,0,0,0])
        for edge,node in ((4307.5,nodes[0]),(7692.5,nodes[-1])):
            weight=106.25*140*height/1e9*25*sign
            at=[(edge+frame.nodes[node][0])/2,frame.nodes[node][1],frame.nodes[node][2]]
            load(node,_wrench_at([0,0,-weight],at,frame.nodes[node]))
    h=source['floor']['retained']['values']['project/had/studies/water-replan.json']['model']
    for wall,row in model['wallFrames'].items():
        new_depth=geometry['outerUpstandDepthMm' if wall=='outer-north' else 'courtUpstandDepthMm']
        old_depth=row['west']['topMm']-3170;nodes=row['beamNodes'];xs=row['beamXMm']
        first_window=min(op['sill'] for op in h['openings']['FIRST'] if op['wall']==wall)
        if 3170+new_depth>3450+first_window:
            raise ValueError('Authored upstand intrudes into an actual upper window sill')
        weight_component(nodes,xs,old_depth,-1)
        for node in nodes:frame.nodes[node]=(*frame.nodes[node][:2],3170+new_depth/2)
        weight_component(nodes,xs,new_depth,1)
        for side in ('west','east'):
            row[side]['topMm']=3170+new_depth;row[side]['beamZMm']=3170+new_depth/2
        for name,member in model['members'].items():
            if name.startswith(wall+'/upstand/'):
                member['depthMm']=new_depth
                member['physicalStartMm']=[*member['physicalStartMm'][:2],3170+new_depth/2]
                member['physicalEndMm']=[*member['physicalEndMm'][:2],3170+new_depth/2]
    rebuilt=[]
    temporary=FrameModel();temporary.nodes=frame.nodes
    for name,a,b,matrix in frame.members:
        if name not in model['members']:
            rebuilt.append((name,a,b,matrix));continue
        member=model['members'][name]
        temporary.members=[]
        temporary.member(name,a,b,rectangle_section(member['depthMm'],member['breadthMm']),law,
            physical_start=member['physicalStartMm'],physical_end=member['physicalEndMm'],y_axis=[0,1,0])
        rebuilt.append(temporary.members[0])
    frame.members=rebuilt
    model['authoredUpstandGeometry']=geometry


def _author_portal_contact(model,mode,order,subdivisions,inset):
    if mode not in ('bilateral','compression') or order not in (2,4,8):
        raise ValueError('Explicit comparison normalmode bilateral/compression and Gauss order2/4/8 required')
    if type(inset) not in (int,float) or not math.isfinite(inset) or not 0<=inset<=10:raise ValueError('Authored contact edge-loss comparison restricted0..10mm')
    if type(subdivisions) is not int or subdivisions not in (1,2,4,8):raise ValueError('Normal-direction composite Gauss subdivisions1/2/4/8 required')
    quadrature={2:[(-1/math.sqrt(3),1.),(1/math.sqrt(3),1.)],
        4:[(-.8611363115940526,.3478548451374538),(-.3399810435848563,.6521451548625461),(.3399810435848563,.6521451548625461),(.8611363115940526,.3478548451374538)],
        8:[(-.9602898564975363,.1012285362903763),(-.7966664774136267,.2223810344533745),(-.525532409916329,.3137066458778873),(-.1834346424956498,.362683783378362),(.1834346424956498,.362683783378362),(.525532409916329,.3137066458778873),(.7966664774136267,.2223810344533745),(.9602898564975363,.1012285362903763)]}[order]
    normal_quadrature=[(-1+(2*segment+coordinate+1)/subdivisions,weight/subdivisions) for segment in range(subdivisions) for coordinate,weight in quadrature]
    frame=model['model'];normal_ids={spring['id'] for spring in frame.springs if '/dpc/' in spring['id'] and spring['id'].endswith('/2')}
    frame.springs=[spring for spring in frame.springs if spring['id'] not in normal_ids]
    for pier in model['dpcNodes']:
        pier['nominalSourceFootprintXYMm']=list(pier['footprintXYMm'])
        x0,y0,x1,y1=pier['footprintXYMm'];x0+=inset;y0+=inset;x1-=inset;y1-=inset
        pier['footprintXYMm']=[x0,y0,x1,y1]
        width=x1-x0;depth=y1-y0;point=pier['pointMm']
        for i,(u,wu) in enumerate(quadrature):
            for j,(v,wv) in enumerate(normal_quadrature):
                x=(x0+x1)/2+width*u/2;y=(y0+y1)/2+depth*v/2
                area=width*depth*wu*wv/4
                frame.spring(pier['low'].split('/-')[0]+'/NORMAL/'+str(i)+'/'+str(j),pier['high'],pier['low'],[x,y,point[2]],[0,0,1],area*model['request']['dpcLaw']['normalStiffnessKNPerMm3'],mode)
    model['portalContact']={'normalMode':mode,'quadratureOrder':order,'normalSubdivisions':subdivisions,'authoredEdgeLossMm':inset,'physicalRetentionProvided':False}


def build_joined_rc_floor(case,source):
    expected=reference_joined_rc_floor_case(source)
    if not isinstance(case,dict) or set(case)!=set(expected) or any(case[key]!=expected[key] for key in ('schema','sourceSHA256','floorBoundary','northUnion','use')):
        raise ValueError('Unsupported/stale exact joined RC floor case; no injected results or physical acceptance')
    _source_geometry_guard(source)
    floor_source=source['floor'];request=case['floor'];_admit_distributed(request,floor_source)
    model=build_continuous_rc_portal(case['portal'],source['portal'])
    _author_upstand_geometry(model,case['geometry'],source)
    _author_portal_contact(model,case['portalDPCNormalMode'],case['portalDPCQuadratureOrder'],case['portalDPCNormalSubdivisions'],case['portalDPCInsetMm'])
    if case['portalDPCNormalIntegration'] not in ('fixed-gauss','exact-active-patch') or case['portalDPCNormalIntegration']=='exact-active-patch' and case['portalDPCNormalMode']!='compression':
        raise ValueError('Explicit fixed-gauss or compression-only exact-active-patch integration required')
    model['portalContact']['integration']=case['portalDPCNormalIntegration']
    model['initialNormalSprings']=copy.deepcopy([spring for spring in model['model'].springs if '/NORMAL/' in spring['id']])
    if request['memberLaw']!=case['portal']['gridLaw']:
        raise ValueError('Joined floor and portal must use the same actual ground-grid material law')
    retained=evaluate_retained_components(request['componentCase'],floor_source['retained'])
    bodies=[row['geometry']['bodyRectangleXYMm'] for row in retained['components'] if row['kind']=='first-floor']
    physical_holes=[{'id':row['id'],'bounds':_bounds(row['shape'])} for row in retained['floorApertures']]
    h=floor_source['retained']['values']['project/had/studies/water-replan.json']['model'];principal=h['rooms']['principalBath']
    physical_holes.append({'id':'FLOOR-UNKNOWN/principal-wet-territory','bounds':[principal['westFinishedFace'],principal['southFinishedFace'],principal['eastFinishedFace'],principal['northFinishedFace']]})
    holes=[row['bounds'] for row in physical_holes]
    def reject(rectangles,path):
        for rectangle in rectangles:
            for aperture in physical_holes:
                bounds=aperture['bounds']
                if min(rectangle[2],bounds[2])-max(rectangle[0],bounds[0])>1e-6 and min(rectangle[3],bounds[3])-max(rectangle[1],bounds[1])>1e-6:
                    raise ValueError('APERTURE_INTERSECTS_STRUCTURAL_PATH: '+aperture['id']+' intersects '+path)
    band=request['edgeBand'];half=band['widthMm']/2;axes=floor_source['retained']['policy']['axes']
    if band['widthMm']!=140 or band['depthMm']!=200:
        raise ValueError('Actual140mm full upstand union requires the matching140×200 slab-level band, not overlapping wider concrete')
    loops=[]
    for family,low,high in [('outer',axes['A'],axes['B']),('court',axes['C'],axes['E'])]:
        for face,axis,datum in [('south',0,low),('east',1,high),('north',0,high),('west',1,low)]:
            loop={'id':family+'-'+face,'axis':axis,'datum':datum,'lo':low,'hi':high,'width':band['widthMm'],'depth':band['depthMm']}
            rectangle=[low,datum-half,high,datum+half] if axis==0 else [datum-half,low,datum+half,high]
            reject([rectangle],'FLOOR/BAND/'+loop['id']);holes.append(rectangle);loops.append(loop)
        junctions=[[x-half,y-half,x+half,y+half] for x in (low,high) for y in (low,high)]
        reject(junctions,'FLOOR/BAND/'+family+'/junctions');holes.extend(junctions)
    corners,joints=_add_L_paths(model,request,floor_source)
    for corner in corners:reject(corner['rectangles'],'FLOOR/CORNER/'+corner['id'])
    port_patches=list(corners);receivers=[]
    for wall,geometry in model['wallFrames'].items():
        stations=[]
        for node,x in zip(geometry['beamNodes'],geometry['beamXMm']):
            identifier='RC-FLOOR/'+node
            port_patches.append({'id':identifier,'originXYMm':[x,model['model'].nodes[node][1]],'rectangles':[],'node':node})
            stations.append({'id':identifier,'x':x})
        material=case['portal']['frameLaw'];height=geometry['west']['topMm']-3170;width=140
        shear=material['elasticModulusMPa']/(2*(1+material['poissonRatio']))
        phi=[12*material['elasticModulusMPa']*material['flexuralFactor']*height*width**3/12/(shear*material['shearAreaFactor']*height*width*(b['x']-a['x'])**2) for a,b in zip(stations,stations[1:])]
        datum=model['model'].nodes[geometry['beamNodes'][0]][1]
        face=[4307.5,datum-half,7692.5,datum+half];reject([face],'FLOOR/RC-UPSTAND/'+wall)
        receivers.append({'id':wall+'/full-upstand','axis':0,'datum':datum,'width':140,'lo':4307.5,'hi':7692.5,'stations':stations,'shearPhi':phi})
    law={key:value for key,value in request['membraneLaw'].items() if key!='mode'}
    law.update(thicknessMm=200,edgeElasticModulusMPa=band['elasticModulusMPa'],edgeFlexuralFactor=band['flexuralFactor'],edgeAxialRigidityKN=band['axialRigidityKN'])
    floor=compile_perforated_floor(bodies,holes,loops,port_patches,law,request['maxPitchMm'],boundary_receivers=receivers)
    modes=floor.pop('energyModes');terms=[]
    for port in port_patches:
        node=port['node'];master=model['model'].nodes[node];point=[*port['originXYMm'],3270]
        dx,dy,dz=[a-b for a,b in zip(point,master)]
        terms.extend([[(node,[1,0,0,0,dz,-dy])],[(node,[0,1,0,-dz,0,dx])],[(node,[0,0,0,0,0,1000])]])
    for index,vector in enumerate(modes):
        by_node={}
        for coefficient,port_terms in zip(vector,terms):
            for node,row in port_terms:
                target=by_node.setdefault(node,[0.]*6)
                for axis,value in enumerate(row):target[axis]+=coefficient*value
        model['model'].springs.append({'id':'JOINED-FLOOR/energy/'+str(index),'terms':list(by_node.items()),'stiffness':1.,'mode':'bilateral','gap':0.})
    model['joinedFloor']={'floor':floor,'portTerms':terms,'corners':corners,'joints':joints,'physicalHoles':physical_holes,
        'northBandMaterialUnion':'Original full3Dupstands provide all stiffness/mass across centralnorth140mm strips. These spans have no CST field or extra200mm band/chord stiffness.',
        'authoredUpstandGeometry':case['geometry'],
        'interpolation':'Source Timoshenko in-plane shape functions between existing upstand stations; exact work-dual physicalZ3270 transforms to full3Dbeam masters. Fibreline interpolation is a bounded displacement approximation under torsion/strong bending; refinement remains required.',
        'sourceSHA256':source['identities']}
    return model


def _continuous_contact(pier,displacements,stiffness):
    low=displacements[pier['low']];high=displacements[pier['high']];cx,cy,z=pier['pointMm']
    def gap(point):
        x,y=point
        return high[2]-low[2]+(high[3]-low[3])*(y-cy)-(high[4]-low[4])*(x-cx)
    x0,y0,x1,y1=pier['footprintXYMm'];corners=[(x0,y0),(x1,y0),(x1,y1),(x0,y1)];polygon=[]
    for a,b in zip(corners,corners[1:]+corners[:1]):
        ga,gb=gap(a),gap(b)
        if ga<=0:polygon.append(a)
        if (ga<0<gb) or (gb<0<ga):
            ratio=ga/(ga-gb);polygon.append(tuple(x+(y-x)*ratio for x,y in zip(a,b)))
    area=normal=mx=my=0.
    if len(polygon)>=3:
        a=polygon[0]
        for b,c in zip(polygon[1:],polygon[2:]):
            triangle=abs((b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]))/2;area+=triangle
            for p,q in ((a,b),(b,c),(c,a)):
                point=[(x+y)/2 for x,y in zip(p,q)];force=-gap(point)*stiffness*triangle/3
                normal+=force;mx+=(point[1]-cy)*force;my-=(point[0]-cx)*force
    return {'physicalCompressedPolygonXYMm':polygon,'contactAreaMm2':area,'contactAreaFraction':area/((x1-x0)*(y1-y0)),
        'normalCompressionKN':normal,'momentAboutPierCutKNm':[mx/1000,my/1000],
        'maximumNormalCompressionMPa':max(0.,max(-gap(point)*stiffness*1000 for point in corners)),
        'maximumOpeningGapMm':max(0.,max(gap(point) for point in corners)),
        'relativeRotationXYMrad':[(high[i]-low[i])*1000 for i in (3,4)],
        'scope':'Exact clipped affine-gap Winkler compression area/pressure integration for inspection of the solved plane; difference from finite Gauss actions is quadrature error, not a new compatible solve or accepted material resistance.'}


def _solve_joined_rc_floor_fixed(model,source,name,multipliers):
    frame=model['model'];joined=model['joinedFloor'];original_ports=model['ports']
    probe_nodes={port['node'] for port in joined['floor']['ports']}
    probe_nodes.update(joint[key] for joint in joined['joints'] for key in ('upper','lower'))
    probe_nodes.update(joint[key] for joint in model['dpcNodes'] for key in ('low','high'))
    probes=[{'id':'READOUT/'+node,'node':node,'pointMm':list(frame.nodes[node])} for node in sorted(probe_nodes)]
    try:
        model['ports']=original_ports+probes
        result=solve_continuous_rc_case(model,source['portal'],name,multipliers)
    finally:model['ports']=original_ports
    raw={row['id'][8:]:[*row['value'][:3],*[value/1000 for value in row['value'][3:]]] for row in result['portMovementsMmMrad'] if row['id'].startswith('READOUT/')}
    result['portMovementsMmMrad']=[row for row in result['portMovementsMmMrad'] if not row['id'].startswith('READOUT/')]
    portal_contacts=[]
    for pier,row in zip(model['dpcNodes'],result['dpc']):
        q=[];wrench=[0.]*6
        for spring in frame.springs:
            if '/NORMAL/' not in spring['id'] or not any(node==pier['high'] for node,terms in spring['terms']):continue
            relative=sum(coefficient*raw[node][axis] for node,terms in spring['terms'] for axis,coefficient in enumerate(terms))
            active=spring['mode']=='bilateral' or relative<=1e-10
            force=spring['stiffness']*relative if active else 0.
            terms=next(terms for node,terms in spring['terms'] if node==pier['high'])
            wrench=[a-force*b for a,b in zip(wrench,terms)]
            area=spring['stiffness']/model['request']['dpcLaw']['normalStiffnessKNPerMm3']
            q.append({'id':spring['id'],'active':active,'forceOnUpperKN':-force,'relativeMm':relative,'areaWeightMm2':area,'normalCompressionMPa':-force/area*1000})
        width=pier['footprintXYMm'][2]-pier['footprintXYMm'][0];depth=pier['footprintXYMm'][3]-pier['footprintXYMm'][1]
        n=wrench[2];ex=-wrench[4]/n if n>1e-9 else None;ey=wrench[3]/n if n>1e-9 else None
        continuous=_continuous_contact(pier,raw,model['request']['dpcLaw']['normalStiffnessKNPerMm3'])
        shear_wrench=[0.]*6
        for spring in frame.springs:
            if '/dpc/' not in spring['id'] or not any(node==pier['high'] for node,terms in spring['terms']):continue
            relative=sum(coefficient*raw[node][axis] for node,terms in spring['terms'] for axis,coefficient in enumerate(terms))
            force=spring['stiffness']*relative
            terms=next(terms for node,terms in spring['terms'] if node==pier['high'])
            shear_wrench=[a-force*b for a,b in zip(shear_wrench,terms)]
        portal_contacts.append({'pierId':pier['pierId'],'normalMode':model['portalContact']['normalMode'],'quadratureOrder':model['portalContact']['quadratureOrder'],
            'normalCompressionKN':n,'momentAboutPierCutKNm':[wrench[3]/1000,wrench[4]/1000],
            'resultantEccentricityXYMm':[ex,ey],'physicalFootprintHalfWidthsXYMm':[width/2,depth/2],
            'thisResultantOutsideCompressionFootprint':n<-1e-9 or n>1e-9 and (abs(ex)>width/2+1e-8 or abs(ey)>depth/2+1e-8),
            'activeNormalSamples':sum(value['active'] for value in q),'normalSamples':q,'continuousPlaneContactInspection':continuous,
            'normalQuadratureActiveAreaMm2':sum(value['areaWeightMm2'] for value in q if value['active']),
            'normalQuadratureVsContinuousForceKN':n-continuous['normalCompressionKN'],
            'unqualifiedShearLawResultantKN':shear_wrench[:2],
            'shearWithoutNormalCompression':n<1e-8 and math.hypot(*shear_wrench[:2])>1e-8,
            'frictionOnlyRequiredCoefficient':math.hypot(*shear_wrench[:2])/n if n>1e-8 else None,
            'nominalSourceFootprintXYMm':pier['nominalSourceFootprintXYMm'],'effectiveContactFootprintXYMm':pier['footprintXYMm'],
            'scope':'The current solved resultant is necessary evidence. A bilateral resultant outside the footprint does not rule out redistribution in a separately solved unilateral system.'})
        row['kinematicCornerPressureIfFullContactMPa']=row.pop('cornerNormalCompressionMPa')
        row['bilateralFullContactWouldRequireTension']=row.pop('requiresNormalTension')
    corner_rows=[]
    for joint in joined['joints']:
        forces=[];wrench=[0.]*6
        for spring in frame.springs:
            if not spring['id'].startswith(joint['id']+'/'):continue
            relative=sum(coefficient*raw[node][axis] for node,row in spring['terms'] for axis,coefficient in enumerate(row))
            mode=spring['mode'];active=mode=='bilateral' or relative<=1e-10 if mode!='tension' else relative>1e-10
            force=spring['stiffness']*relative if active else 0.
            row=next(row for node,row in spring['terms'] if node==joint['upper'])
            wrench=[a-force*b for a,b in zip(wrench,row)]
            forces.append({'id':spring['id'],'mode':mode,'active':active,'forceKN':force,'relativeMm':relative})
        corner_rows.append({'id':joint['id'],'springs':forces,'forceOnUpperKN_KNm':[*wrench[:3],*[value/1000 for value in wrench[3:]]],
            'activeCompressionSamples':sum(row['active'] and row['mode']=='compression' for row in forces),
            'unqualifiedTieTensionKN':sum(row['forceKN'] for row in forces if row['mode']=='tension')})
    vector=[sum(value*raw[node][axis] for node,row in terms for axis,value in enumerate(row)) for terms in joined['portTerms']]
    stiffness=joined['floor']['condensedStiffnessKNPerMm']
    forces=[sum(k*u for k,u in zip(row,vector)) for row in stiffness]
    floor_energy=.5*sum(a*b for a,b in zip(vector,forces));floor_ports=[];floor_residual=[0.]*6
    for i,port in enumerate(joined['floor']['ports']):
        force=[forces[3*i],forces[3*i+1],0.];moment=[0,0,forces[3*i+2]*1000]
        point=[*port['originXYMm'],3270]
        wrench=_wrench_at(force,point,[0,0,0]);wrench[3:]=[a+b for a,b in zip(wrench[3:],moment)]
        floor_residual=[a+b for a,b in zip(floor_residual,wrench)]
        floor_ports.append({'id':port['id'],'physicalPointMm':point,'displacementMmMrad':vector[3*i:3*i+3],
            'forceOnFloorKN_KNm':[*force,0,0,forces[3*i+2]]})
    residual=[*floor_residual[:3],*[value/1000 for value in floor_residual[3:]]]
    if max(abs(value) for value in residual)>1e-5:raise ValueError('Passive joined floor loses six-component interface wrench equilibrium')
    result.update(fourLComparisonInterfaces=corner_rows,joinedFloorPortCount=len(joined['floor']['ports']),
        northPhysicalReceiverCount=4,unresolvedReceivingPortCount=28,completeReceivingPaths=0,sourceSHA256=source['identities'],
        floorRestraint='Actual perforated source membrane/bands, four finite Lpaths and full3D RCupstands share this solve; no rigid diaphragm.',
        floorInterfacePorts=floor_ports,floorInterfaceWrenchResidualKN_KNm=residual,floorCondensedPortStrainEnergyKNmm=floor_energy,
        initialContactGuessFromCase=model.get('initialContactGuess',{}).get('name'),
        authoredUpstandGeometry=model['authoredUpstandGeometry'],portalContact=model['portalContact'],portalNormalContactResults=portal_contacts)
    return result


def seed_joined_rc_floor_contact(model,source,previous):
    if previous.get('sourceSHA256')!=source['identities'] or previous.get('contactIntegrationStatus')!='exact-positive-affine-patch-compatible':
        raise ValueError('Only a current-method converged contact geometry may seed a numerical initial guess')
    if model['portalContact']['integration']!='exact-active-patch':raise ValueError('A numerical contact guess cannot replace fixed-Gauss evidence')
    if len(previous['portalNormalContactResults'])!=len(model['dpcNodes']) or any(row['pierId']!=pier['pierId'] or row['effectiveContactFootprintXYMm']!=pier['footprintXYMm'] for row,pier in zip(previous['portalNormalContactResults'],model['dpcNodes'])):
        raise ValueError('Changed physical bearing faces need a fresh contact seed')
    model['initialContactGuess']=copy.deepcopy(previous)


def _exact_patch_springs(model,result):
    frame=model['model'];frame.springs=[spring for spring in frame.springs if '/NORMAL/' not in spring['id']]
    stiffness=model['request']['dpcLaw']['normalStiffnessKNPerMm3']
    for pier,row in zip(model['dpcNodes'],result['portalNormalContactResults']):
        polygon=row['continuousPlaneContactInspection']['physicalCompressedPolygonXYMm']
        if len(polygon)<3:continue
        a=polygon[0];counter=0
        for b,c in zip(polygon[1:],polygon[2:]):
            area=abs((b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]))/2
            if area<=1e-12:continue
            for p,q in ((a,b),(b,c),(c,a)):
                x,y=[(u+v)/2 for u,v in zip(p,q)]
                frame.spring(pier['low'].split('/-')[0]+'/NORMAL/exact/'+str(counter),pier['high'],pier['low'],[x,y,pier['pointMm'][2]],[0,0,1],area*stiffness/3)
                counter+=1


def solve_joined_rc_floor(model,source,name,multipliers):
    frame=model['model'];frame.springs=[spring for spring in frame.springs if '/NORMAL/' not in spring['id']]+copy.deepcopy(model['initialNormalSprings'])
    if model.get('initialContactGuess') is not None:
        _exact_patch_springs(model,model['initialContactGuess'])
    result=_solve_joined_rc_floor_fixed(model,source,name,multipliers)
    if model.get('initialContactGuess') is not None:result['initialContactGuessFromCase']=model['initialContactGuess']['name']
    if model['portalContact']['integration']=='fixed-gauss':
        result['contactIntegrationStatus']='fixed-gauss-comparison-with-exact-plane-error'
        return result
    history=[]
    for iteration in range(16):
        errors=[]
        for row in result['portalNormalContactResults']:
            continuous=row['continuousPlaneContactInspection']
            errors.append([abs(row['normalCompressionKN']-continuous['normalCompressionKN']),
                *[abs(a-b) for a,b in zip(row['momentAboutPierCutKNm'],continuous['momentAboutPierCutKNm'])]])
        error=max(value for row in errors for value in row)
        negative=min(sample['forceOnUpperKN'] for row in result['portalNormalContactResults'] for sample in row['normalSamples'])
        history.append({'iteration':iteration,'maximumExactNOrMomentResidualKN_KNm':error,'minimumCurrentPatchNormalForceKN':negative})
        if error<1e-7 and negative>=-1e-8:
            result['contactIntegrationStatus']='exact-positive-affine-patch-compatible'
            result['exactPatchIterations']=history
            return result
        if min(row['continuousPlaneContactInspection']['contactAreaMm2'] for row in result['portalNormalContactResults'])<1e-8:
            result['contactIntegrationStatus']='neutral-or-lost-normal-contact-needs-distinct-boundary-law'
            result['exactPatchIterations']=history
            return result
        _exact_patch_springs(model,result)
        result=_solve_joined_rc_floor_fixed(model,source,name,multipliers)
    raise ValueError('Exact compression contact patch failed to converge; no compatible physical branch is accepted')


def joined_physical_schedule(model):
    schedule=physical_schedule(model)
    old=schedule['floorUpstandVolumeM3']
    new=3385*140*sum(row['west']['topMm']-3170 for row in model['wallFrames'].values())/1e9
    schedule['floorUpstandVolumeM3']=new;schedule['RCVolumeM3']+=new-old;schedule['physicalGKN']+=(new-old)*25
    schedule['authoredUpstandGeometry']=model['authoredUpstandGeometry']
    schedule['massAccounting']+=' Joined geometry rebuilds actual upstand centroids, stiffness, physical volume and own load when authored depth changes; central north bands remain omitted from floor stiffness.'
    return schedule


def joined_diagnostics():
    return [
        'Eight finite receiving paths are assembled numerically: four source L paths and four authored RC north portal chains. The26 floor coordinates are4L boundary stations plus22 internal upstand stations, not26 canonical receiving packets.',
        'Full3D RCupstands exclusively own centralnorth140mm strip material and stiffness. The CSTfield excludes the strip and the optional kernel receiver hook skips its old slab-band/chord stiffness. No lower slab strip is counted twice.',
        'The existing CST mesh, Schur condensation and positive-energy modes are reused. The additive receiver hook preserves every default result; source-bound actual96-programme/refinement evidence is genuinely regenerated.',
        'Physical floor work is transformed atZ3270 to actual3545/3495mm beam masters (or authored changed-depth centroids). Timoshenko in-plane interpolation on the fibreline is a bounded kinematic approximation under torsion/strong bending. Exact global wrench and energy conservation do not qualify that local approximation; mesh/geometry perturbations remain explicit.',
        'The old reference portal profile is guarded against source opening, pier or datum drift. Joined upstand depths are explicit authored inputs; changes rebuild beam centroids/members, column end offsets, physical selfweight, floor interpolation and responses. Source upper sill clashes reject.',
        'Negative bilateral corner pressure means loss of full contact, not automatic failure of partial compression contact. Actual compression-only springs use unchanged authored normal stiffness and no normal tension branch. Solved resultants, continuous clipped affine contact area/pressure and quadrature error are reported separately.',
        'Fixed-Gauss contact reports exact clipped-plane integration error. The explicit exact-active-patch alternative triangulates the positive affine patch and reuses the same FrameModel with exact degree2 tangent integration until N/M and compressed region agree. Intermediate bilateral tangent patches are not accepted contact results. Zero/neutral contact remains a distinct unsupported boundary. No physical bedding resistance follows from stiffness.',
        'Explicit0.9physicalG, noQ, signed2.25kPa pressures are sensitivity challenges.2.25kPa is the bound source pressure recipe without another multiplier; no accidental refactor or accepted favourable Gminimum is implied. Source density, infill/finish minimum mass and occupied combinations remain unqualified.',
        'Portal DPCshear remains an explicitly authored bilateral shear law independent of normal contact. Zero-normal-force plus nonzero shear cannot be carried by friction-only bedding. Installed key overlap, gap/free travel, material strength and positive shear connections are absent and never inferred.',
        'The four Lpaths retain explicitly unqualified normal compression/tension tie/key comparison laws. Their recovered tensions, active contact and forces are supplied, but no actual anchor strength, splices, coldjoint capacity or installed thermal detail is accepted.',
        'All native slabGMAX overlap, loggia adjoining-wall actions and historical roof actions withheld by the portal challenger remain withheld. Passive floor-only coupling adds no new gravity, false closed-door load or old fixed-base roof/head increment.',
        'The new4H16/H8post/ring cage is authored only. Existing jamb transverse reinforcement, floor140mm cage placing, cap anchorage, arch-column bar transitions, joint panels, shear/torsion, second-order strength, finishes and infill supports remain unqualified.',
        'No source-normal anchor duty is declared mandatory solely because a bilateral comparison has edge tension. Conversely numerical compression-only compatibility does not release material, pressure, shear, gap, minimumG or physical anchorage obligations.',
        'The explicit5mm contact-edge-loss adverse case reduces the effective bearing face within the source footprint; it is an authored tolerance challenge, not evidence that actual construction tolerance is5mm.',
        'All52heads retain ideal translations/free rotations and inherited lower-cap offsets. No soil resistance/settlement, raised715ground datum, selected floor path, roof adoption, owner transom approval or complete-house proof is supplied. All28 canonical complete receiving duties stay open.'
    ]


def run_joined_rc_floor_case(case,source,boundary):
    if not isinstance(boundary,dict) or set(boundary)!={'schema','name','multipliers'} or boundary['schema']!='str-joined-rc-floor-boundary/1' or not isinstance(boundary['name'],str) or not boundary['name'] or not isinstance(boundary['multipliers'],dict):
        raise ValueError('Explicit joined floor load-family boundary required; no injected result')
    model=build_joined_rc_floor(case,source)
    result=solve_joined_rc_floor(model,source,boundary['name'],boundary['multipliers'])
    from joined_rc_floor_views import draw_joined_rc_floor
    return {'schema':'str-joined-rc-floor-result/1','sourceSHA256':source['identities'],'request':case,'boundary':boundary,
        'native':result,'schedule':joined_physical_schedule(model),'floor':model['joinedFloor']['floor'],
        'diagnostics':joined_diagnostics(),'drawings':{'floor.svg':draw_joined_rc_floor(model,result)},
        'unresolvedReceivingPorts':native_intermediate_support_ports(source['floor']),'completeReceivingPaths':0,
        'candidateAccepted':False,'installedAcceptance':False,'roofAdoption':False,'completeHouseProof':False}


if __name__=='__main__':
    source=load_joined_rc_floor_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:print(json.dumps(reference_joined_rc_floor_case(source),allow_nan=False))
    elif not sys.argv[1:]:
        request=json.load(sys.stdin)
        if set(request)!={'case','boundary'}:raise ValueError('Exact case and boundary fields required')
        print(json.dumps(run_joined_rc_floor_case(request['case'],source,request['boundary']),allow_nan=False))
    else:raise SystemExit('Use --read or send the explicit case and load boundary on stdin')
