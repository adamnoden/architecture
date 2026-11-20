import hashlib
import json
import math
from pathlib import Path
import runpy
import sys

from distributed_floor_compatibility import load_distributed_floor_source, native_intermediate_support_ports
from joined_successor_compatibility import _grid, _wrench_at
from joined_successor_kernel import FrameModel, cross, rectangle_section


METHOD = 'project/str/studies/north_portal_receiving.py'
MATERIAL_FIELDS = ('mode','elasticModulusMPa','poissonRatio','flexuralFactor','torsionFactor','shearAreaFactor')
GAUSS = [(0.1834346424956498,0.362683783378362),(-0.1834346424956498,0.362683783378362),
         (0.525532409916329,0.3137066458778873),(-0.525532409916329,0.3137066458778873),
         (0.7966664774136267,0.2223810344533745),(-0.7966664774136267,0.2223810344533745),
         (0.9602898564975363,0.1012285362903763),(-0.9602898564975363,0.1012285362903763)]


def load_north_receiving_source(root):
    root = Path(root)
    source = load_distributed_floor_source(root)
    return {'schema':'str-north-portal-receiving-source/1','parent':source,
            'identities':{**source['identities'],METHOD:hashlib.sha256((root/METHOD).read_bytes()).hexdigest()}}


def reference_north_receiving_case(source):
    return {'schema':'str-north-portal-receiving-case/1','sourceSHA256':source['identities'],
            'gridLaw':None,'pierLaw':None,'dpcLaw':None,'dpcIntervalZMm':None,
            'portBoundary':'source-mean-skewbacks-only',
            'headBoundary':'source52-ideal-pinned-translations-free-rotations',
            'use':'unqualified-lower-receiver-operator'}


def _exact(value,fields,label):
    if not isinstance(value,dict) or set(value)!=set(fields):
        raise ValueError('Expected exact '+label+' fields')


def _finite(value):
    return type(value) in (int,float) and math.isfinite(value)


def _material(value,label):
    _exact(value,MATERIAL_FIELDS,label)
    if value['mode']!='authored-linear-comparison' or any(not _finite(value[key]) for key in MATERIAL_FIELDS if key!='mode'):
        raise ValueError('Missing finite authored '+label)
    if value['elasticModulusMPa']<=0 or not 0<=value['poissonRatio']<.5 or any(not 0<value[key]<=1 for key in ('flexuralFactor','torsionFactor','shearAreaFactor')):
        raise ValueError('Unsupported '+label+' domain')


def portal_geometry(source):
    h = source['parent']['retained']['values']['project/had/studies/water-replan.json']['model']
    portal = h['insulatedPortal']
    tie = source['parent']['retained']['values']['project/str/studies/open-loggia-support.json']['north_arches']['tie_and_bore']
    if tie['bore_axis_z']!=portal['tie']['centre'] or tie['bore_dia']<=0:
        raise ValueError('The actual portal tie and structural bore datums differ')
    grid = source['parent']['successor']['values']['current-house-grid']
    openings = {row['wall']:row for row in h['openings']['GROUND'] if row['id'] in ('garden-entry','grand-court-entry-north')}
    if set(openings)!=set(('outer-north','court-north')) or any(row['width']!=portal['rawSpan'] for row in openings.values()):
        raise ValueError('Actual northern portal opening identities or spans require an updated receiving adapter')
    radius,thickness = portal['rawRadius'],portal['ring']
    angle = math.asin(portal['rawSpan']/(2*radius))
    centre_z = portal['centreZ']
    mean_z = centre_z+(radius+thickness/2)*math.cos(angle)
    shoulder_z = centre_z+(radius+thickness)*math.cos(angle)
    rows = []
    for wall,normal_key,head_names in [('court-north','courtNS',('P28','P30')),('outer-north','gardenNS',('P25','P26'))]:
        centre = openings[wall]['centre']
        normal_bounds = portal['piers'][normal_key]
        for side,which,head_name,sign in [('west','westEW',head_names[0],-1),('east','eastEW',head_names[1],1)]:
            along_bounds = portal['piers'][which]
            if abs(tie['bore_axis_NS']-(normal_bounds[1]-normal_bounds[0])/2)>1e-6:
                raise ValueError('An eccentric source tie bore requires updated RC section centroids and no silent recentering')
            if tie['bore_axis_z']+tie['bore_dia']/2>portal['rawSpring']:
                raise ValueError('The source tie bore enters the radial skewback; no voussoir drilling is inferred')
            footprint = [along_bounds[0],normal_bounds[0],along_bounds[1],normal_bounds[1]]
            head = next(row for row in grid['heads'] if row['id']==head_name)
            cap = [head['xy'][0]-head['capXY'][0]/2,head['xy'][1]-head['capXY'][1]/2,
                   head['xy'][0]+head['capXY'][0]/2,head['xy'][1]+head['capXY'][1]/2]
            if any(a<b-1e-6 for a,b in zip(footprint[:2],cap[:2])) or any(a>b+1e-6 for a,b in zip(footprint[2:],cap[2:])):
                raise ValueError('Actual north RC pier footprint is not contained in its named existing cap')
            mean_x = centre+sign*(radius+thickness/2)*math.sin(angle)
            outer_x = centre+sign*(radius+thickness)*math.sin(angle)
            inner_x = centre+sign*radius*math.sin(angle)
            wall_id = 'loggia-'+side+'-weather'
            side_wall = next(row for row in h['groundWalls'] if row['id']==wall_id)
            floor_x = side_wall['a'][0]
            if not any(port['wallId']==wall and port['xyMm'][0]==floor_x for port in native_intermediate_support_ports(source['parent'])):
                raise ValueError('The actual loggia wall and native floor receiver no longer share a port')
            floor_y = sum(normal_bounds)/2
            floor_z = source['parent']['successor']['values']['floor-portal-monolithic-drag']['geometry']['soffitAndOrdinarySlabTopZMm'][0]
            rows.append({'id':'NORTH/LOWER-RC/'+wall+'/'+side,'wallId':wall,'side':side,'headId':head_name,
                         'footprintXYMm':footprint,'footCentroidXYMm':[(along_bounds[0]+along_bounds[1])/2,floor_y],
                         'baseZMm':head['capZ'][1],'rawSpringZMm':portal['rawSpring'],'shoulderTopZMm':shoulder_z,
                         'bevelInnerXMm':inner_x,'bevelOuterXMm':outer_x,
                         'skewbackXYZMm':[mean_x,floor_y,mean_z],
                         'floorReceiverId':'FLOOR/RECEIVER/'+wall+'/'+str(floor_x),
                         'floorReceiverXYZMm':[floor_x,floor_y,floor_z],
                         'floorToPierCentroidAlongMm':floor_x-(along_bounds[0]+along_bounds[1])/2,
                         'missingVerticalToFloorMm':floor_z-mean_z,
                         'sourceRCSectionMm':[along_bounds[1]-along_bounds[0],normal_bounds[1]-normal_bounds[0]],
                         'tieForceXYZMm':[(along_bounds[0]+along_bounds[1])/2,normal_bounds[0]+tie['bore_axis_NS'],tie['bore_axis_z']],
                         'tieBoreDiameterMm':tie['bore_dia'],
                         'capFootprintXYMm':cap,'capGridAxisZMm':sum(grid['girders']['outer-W']['z'])/2,
                         'capTopZMm':head['capZ'][1],'capHeadZMm':head['capZ'][0]})
    return rows



def receiving_path_catalogue(source):
    h = source['parent']['retained']['values']['project/had/studies/water-replan.json']['model']
    axes = source['parent']['retained']['policy']['axes']
    portal_ids = {pier['floorReceiverId']:pier for pier in portal_geometry(source)}
    rows = []
    for port in native_intermediate_support_ports(source['parent']):
        wall = port['wallId'];point = port['xyMm']
        axis = 0 if wall.endswith(('south','north')) else 1
        low,high = (axes['A'],axes['B']) if wall.startswith('outer-') else (axes['C'],axes['E'])
        openings = sorted((row['centre']-row['width']/2,row['centre']+row['width']/2) for row in h['openings']['GROUND'] if row['wall']==wall)
        along = point[axis]
        left = max([low,*[right for _,right in openings if right<along]])
        right = min([high,*[left for left,_ in openings if left>along]])
        if any(a<along<b for a,b in openings):
            raise ValueError('A source floor receiver is inside its actual lower opening')
        if port['id'] in portal_ids:
            kind = 'north-rc-pier-masonry-spandrel-chain'
            mechanics = f'The finite lower RC/cap/52-head operator is implemented. The{portal_ids[port["id"]]["missingVerticalToFloorMm"]:.3f}mm mean-skewback-to-floor path, masonry spandrel/ring/tie and physical DPC remain missing.'
        elif wall.startswith('court-') and all(value in (axes['C'],axes['E']) for value in point):
            kind = 'court-corner-wall-union'
            mechanics = 'Existing L-section/frame mechanics can represent an authored homogeneous comparison; actual unequal clear-leg union, masonry contact/shear, dry-side support footprint and corner load transfer still need assembly.'
        elif wall=='court-south':
            kind = 'south-court-arch-and-bridge-jamb'
            mechanics = 'The source bridge/jamb position is known. Full-height material, arch/thrust/hold-down and finite floor/cold-grid joining laws are not an earned RC column.'
        else:
            kind = 'outer-clear-pier' if wall.startswith('outer-') else 'court-clear-pier'
            mechanics = 'Prismatic six-DOF member mechanics exist. Actual masonry modulus, compression/contact/sliding laws, adjacent arch coupling, floor seating and DPC route remain unprovided; no rigid lateral or tensile wall support is inferred.'
        rows.append({**port,'physicalLocationId':str(point[0])+'/'+str(point[1]),'pathKind':kind,
                     'clearGroundAlongIntervalMm':[left,right],
                     'sourceFloorLoopCoreWidthMm':source['parent']['successor']['values']['current-house-floor-stops']['newLoops']['outer' if wall.startswith('outer-') else 'court']['coreWidthDepth'][0],
                     'lowerMaterialLaw':None,
                     'implementedMechanics':mechanics,'completeFloorReceiverPath':False})
    counts = {kind:sum(row['pathKind']==kind for row in rows) for kind in sorted({row['pathKind'] for row in rows})}
    return {'namedPortCount':len(rows),'physicalLocationCount':len({row['physicalLocationId'] for row in rows}),
            'pathKinds':counts,'ports':rows,
            'additionalWholeHouseReceivers':'This perimeter/courtyard port list owns perimeter/courtyard loop reception, not every internal floor, stair, wet beam or ceiling support. Their actual source inventories also have to join a complete house.'}

def _admit(case,source,piers):
    _exact(case,('schema','sourceSHA256','gridLaw','pierLaw','dpcLaw','dpcIntervalZMm','portBoundary','headBoundary','use'),'north receiving case')
    if case['schema']!='str-north-portal-receiving-case/1' or case['sourceSHA256']!=source['identities']:
        raise ValueError('Stale or unsupported north receiving source')
    if case['use']!='unqualified-lower-receiver-operator' or case['portBoundary']!='source-mean-skewbacks-only':
        raise ValueError('Complete floor receiving use rejects: masonry spandrel, arch and tie-to-floor path remains absent')
    if case['headBoundary']!='source52-ideal-pinned-translations-free-rotations':
        raise ValueError('Only the explicit source52 ideal head comparison is implemented')
    _material(case['gridLaw'],'grid material law');_material(case['pierLaw'],'pier material law')
    law = case['dpcLaw']
    _exact(law,('mode','normalStiffnessKNPerMm3','shearStiffnessKNPerMm3'),'finite DPC comparison law')
    if law['mode']!='authored-bilateral-elastic-comparison' or any(not _finite(law[key]) or law[key]<=0 for key in law if key!='mode'):
        raise ValueError('Only an explicit finite bilateral DPC comparison is supported; no compression-only or installed joint is inferred')
    interval = case['dpcIntervalZMm']
    if not isinstance(interval,list) or len(interval)!=2 or not all(map(_finite,interval)) or not max(pier['baseZMm'] for pier in piers)<interval[0]<interval[1]<min(pier['rawSpringZMm'] for pier in piers):
        raise ValueError('Supply an explicit portal DPC interval inside the actual lower pier; no north portal cut is silently inherited from an outer L')
    if interval[1]>=min(pier['tieForceXYZMm'][2]-pier['tieBoreDiameterMm']/2 for pier in piers):
        raise ValueError('The portal DPC comparison must remain below the actual tie bore; no perforated bed or crossing is inferred')


def _cross_matrix(point,origin):
    basis = []
    for index in range(6):
        force = [0.,0.,0.];moment = [0.,0.,0.]
        if index<3:force[index]=1.
        else:moment[index-3]=1000.
        shift = cross([a-b for a,b in zip(point,origin)],force)
        basis.append([*force,*[a+b for a,b in zip(moment,shift)]])
    return list(map(list,zip(*basis)))


def _section_at(pier,z):
    x0,y0,x1,y1 = pier['footprintXYMm']
    if z>pier['rawSpringZMm']:
        fraction = (z-pier['rawSpringZMm'])/(pier['shoulderTopZMm']-pier['rawSpringZMm'])
        boundary = pier['bevelInnerXMm']+(pier['bevelOuterXMm']-pier['bevelInnerXMm'])*fraction
        if pier['side']=='west':x1=boundary
        else:x0=boundary
    if x1<=x0:
        raise ValueError('No positive actual RC section survives at the requested skewback cut')
    width,depth = x1-x0,y1-y0
    radius = pier.get('tieBoreDiameterMm',0)/2
    tie_z = pier.get('tieForceXYZMm',[0,0,-math.inf])[2]
    gap = 2*math.sqrt(max(0.,radius**2-(z-tie_z)**2)) if abs(z-tie_z)<radius else 0.
    area = width*(depth-gap)
    if area<=0:
        raise ValueError('The source tie bore removes the complete RC receiving section')
    torsion = 2*rectangle_section(width,(depth-gap)/2)['J'] if gap else rectangle_section(width,depth)['J']
    return {'A':area,'Ixx':width*(depth**3-gap**3)/12,'Iyy':(depth-gap)*width**3/12,'J':torsion,
            'centroidXYZMm':[(x0+x1)/2,(y0+y1)/2,z],'widthXMm':width,'widthYMm':depth,'tieBoreVoidWidthYMm':gap}


def pier_compliance(pier,material,interval,dpc_law,subdivisions=1):
    elastic = material['elasticModulusMPa']/1000
    shear = elastic/(2*(1+material['poissonRatio']))
    matrix = [[0.]*7 for _ in range(7)]
    volume = 0.
    tie_enabled = 'tieForceXYZMm' in pier
    tie_point = pier.get('tieForceXYZMm',pier['skewbackXYZMm'])
    radius = pier.get('tieBoreDiameterMm',0)/2
    features = [*interval,pier['rawSpringZMm'],tie_point[2]-radius,tie_point[2],tie_point[2]+radius]
    limits = sorted({pier['baseZMm'],pier['skewbackXYZMm'][2],*[z for z in features if pier['baseZMm']<z<pier['skewbackXYZMm'][2]]})
    def basis_at(section,z):
        top = _cross_matrix(pier['skewbackXYZMm'],section['centroidXYZMm'])
        tie = _cross_matrix(tie_point,section['centroidXYZMm'])
        return [row+[tie[index][0] if tie_enabled and z<tie_point[2] else 0.] for index,row in enumerate(top)]
    for low,high in zip(limits,limits[1:]):
        if low>=interval[0]-1e-6 and high<=interval[1]+1e-6:
            continue
        in_bore = radius>0 and low>=tie_point[2]-radius-1e-6 and high<=tie_point[2]+radius+1e-6
        left,right = (math.asin(max(-1,min(1,(low-tie_point[2])/radius))),math.asin(max(-1,min(1,(high-tie_point[2])/radius)))) if in_bore else (low,high)
        for segment in range(subdivisions):
            a = left+(right-left)*segment/subdivisions
            b = left+(right-left)*(segment+1)/subdivisions
            for point,weight in GAUSS:
                coordinate = (a+b)/2+(b-a)*point/2
                z = tie_point[2]+radius*math.sin(coordinate) if in_bore else coordinate
                section = _section_at(pier,z)
                basis = basis_at(section,z)
                flexibility = [1/(shear*material['shearAreaFactor']*section['A'])]*2+[1/(elastic*section['A']),
                    1/(elastic*material['flexuralFactor']*section['Ixx']),1/(elastic*material['flexuralFactor']*section['Iyy']),
                    1/(shear*material['torsionFactor']*section['J'])]
                dz = weight*(b-a)/2*(radius*math.cos(coordinate) if in_bore else 1.)
                volume += section['A']*dz/1e9
                for i in range(7):
                    for j in range(7):
                        matrix[i][j] += dz*math.fsum(basis[k][i]*flexibility[k]*basis[k][j] for k in range(6))
    z = sum(interval)/2
    section = _section_at(pier,z);basis = basis_at(section,z)
    kn,ks = dpc_law['normalStiffnessKNPerMm3'],dpc_law['shearStiffnessKNPerMm3']
    joint_compliance = [1/(ks*section['A'])]*2+[1/(kn*section['A']),1/(kn*section['Ixx']),1/(kn*section['Iyy']),1/(ks*(section['Ixx']+section['Iyy']))]
    joint = [[math.fsum(basis[k][i]*joint_compliance[k]*basis[k][j] for k in range(6)) for j in range(7)] for i in range(7)]
    total = [[a+b for a,b in zip(row,other)] for row,other in zip(matrix,joint)]
    return {'complianceMmMradPerKNKNm':[row[:6] for row in total[:6]],
            'rcOnlyComplianceMmMradPerKNKNm':[row[:6] for row in matrix[:6]],'jointComplianceMmMradPerKNKNm':[row[:6] for row in joint[:6]],
            'tieTopCouplingMmMradPerKN':[row[6] for row in total[:6]],'tieAxialComplianceMmPerKN':total[6][6],
            'integratedPartialRCVolumeM3':volume,'topRCSection':_section_at(pier,pier['skewbackXYZMm'][2]),
            'tieBoreSection':_section_at(pier,tie_point[2]),
            'scope':'Finite vertical-section Timoshenko complementary-energy comparison through the actual RC taper and transverse tie bore, truncated at the mean-skewback interface. The internal tie-force station has its own work-dual influence. No upper RC shoulder, spandrel, brick ring, upper floor, local3Dhole capacity or stabilising gravity is credited.'}


def _grid_operator(source,piers,material):
    grid = source['parent']['successor']['values']['current-house-grid']
    model = FrameModel();_grid(model,grid,material)
    ports = []
    for pier in piers:
        head = next(row for row in grid['heads'] if row['id']==pier['headId'])
        name = model.node(pier['id']+'/cap-top',[*head['xy'],head['capZ'][1]])
        model.member(pier['id']+'/finite-upper-cap',head['id'],name,rectangle_section(*head['capXY']),material,
                     physical_start=[*head['xy'],pier['capGridAxisZMm']],physical_end=[*head['xy'],head['capZ'][1]],y_axis=[0,1,0])
        ports.append(name)
    cases = []
    for port in ports:
        for axis in range(6):
            model.loads.clear()
            wrench = [0.]*6;wrench[axis] = 1. if axis<3 else 1000.
            model.load(port,wrench)
            result = model.solve()
            residual = _wrench_at(wrench[:3],model.nodes[port],[0,0,0])
            residual[3:] = [a+b for a,b in zip(residual[3:],wrench[3:])]
            head_rows = []
            for head in grid['heads']:
                reaction = result['supportWrenches'][head['id']]
                global_wrench = _wrench_at(reaction[:3],model.nodes[head['id']],[0,0,0])
                global_wrench[3:] = [a+b for a,b in zip(global_wrench[3:],reaction[3:])]
                residual = [a+b for a,b in zip(residual,global_wrench)]
                head_rows.append({'id':head['id'],'reactionKN_KNm':[*reaction[:3],*[value/1000 for value in reaction[3:]]]})
            residual = [*residual[:3],*[value/1000 for value in residual[3:]]]
            if max(abs(value) for value in residual)>1e-6:
                raise ValueError('The receiving-grid unit solve loses global six-component equilibrium')
            displacement = [value*(1 if axis<3 else 1000) for node in ports for axis,value in enumerate(result['displacements'][node])]
            cases.append({'complianceColumn':displacement,'heads':head_rows,'equilibriumResidualKN_KNm':residual})
    matrix = list(map(list,zip(*(case['complianceColumn'] for case in cases))))
    return {'complianceMmMradPerKNKNm':matrix,'unitCases':cases,'capPortXYZMm':[list(model.nodes[port]) for port in ports],
            'headIds':[head['id'] for head in grid['heads']],'headXYZMm':{head['id']:list(model.nodes[head['id']]) for head in grid['heads']},'nodeCount':len(model.nodes),'memberCount':len(model.members)}


def _multiply(a,b):
    return [[math.fsum(x*y for x,y in zip(row,column)) for column in zip(*b)] for row in a]


def _transpose(a):
    return list(map(list,zip(*a)))


def compile_north_receiving(case,source):
    piers = portal_geometry(source);_admit(case,source,piers)
    grid = _grid_operator(source,piers,case['gridLaw'])
    size = 6*len(piers)
    transform = [[0.]*size for _ in range(size)]
    for index,pier in enumerate(piers):
        wrench = _cross_matrix(pier['skewbackXYZMm'],grid['capPortXYZMm'][index])
        for i,row in enumerate(wrench):
            for j,value in enumerate(row):transform[index*6+i][index*6+j] = value/(1 if i<3 else 1000)
    matrix = _multiply(_transpose(transform),_multiply(grid['complianceMmMradPerKNKNm'],transform))
    tie_transform = [[0.]*len(piers) for _ in range(size)]
    for index,pier in enumerate(piers):
        basis = _cross_matrix(pier['tieForceXYZMm'],grid['capPortXYZMm'][index])
        for axis,row in enumerate(basis):tie_transform[index*6+axis][index] = row[0]/(1 if axis<3 else 1000)
    tie_top = _multiply(_transpose(transform),_multiply(grid['complianceMmMradPerKNKNm'],tie_transform))
    tie_tie = _multiply(_transpose(tie_transform),_multiply(grid['complianceMmMradPerKNKNm'],tie_transform))
    members = []
    for index,pier in enumerate(piers):
        member = pier_compliance(pier,case['pierLaw'],case['dpcIntervalZMm'],case['dpcLaw'])
        members.append(member)
        for i,row in enumerate(member['complianceMmMradPerKNKNm']):
            for j,value in enumerate(row):matrix[index*6+i][index*6+j] += value
        for i,value in enumerate(member['tieTopCouplingMmMradPerKN']):tie_top[index*6+i][index] += value
        tie_tie[index][index] += member['tieAxialComplianceMmPerKN']
    maximum = max(abs(value) for row in matrix for value in row)
    reciprocity = max(abs(matrix[i][j]-matrix[j][i]) for i in range(size) for j in range(size))/maximum
    if reciprocity>1e-8:
        raise ValueError('North receiver operator violates reciprocal work')
    factor = runpy.run_path(str(Path(__file__).with_name('structural-linear.py')))['factor']
    inverse = factor(matrix)
    stiffness = list(map(list,zip(*(inverse([float(i==j) for i in range(size)]) for j in range(size)))))
    catalogue = receiving_path_catalogue(source)
    return {'schema':'str-north-portal-receiving-result/1','sourceSHA256':source['identities'],'request':case,
            'status':'finite-lower-receiver-comparison','ports':piers,'partialPierMembers':members,
            'complianceMmMradPerKNKNm':matrix,'stiffnessKNKNmPerMmMrad':stiffness,'grid':grid,
            'reciprocityRelativeResidual':reciprocity,'gridWrenchTransform':transform,
            'tieTopCouplingMmMradPerKN':tie_top,'tieAxialComplianceMmPerKN':tie_tie,'tieGridWrenchTransform':tie_transform,
            'tieBoundary':'Independent source tie-force ports; zero force unless explicitly authored. No tie axial law, pretension, bearing, capacity or installed connection is inferred.',
            'coordinates':{'wrench':['Fx_kN','Fy_kN','Fz_kN','Mx_kNm','My_kNm','Mz_kNm'],
                           'displacement':['ux_mm','uy_mm','uz_mm','1000rx_rad','1000ry_rad','1000rz_rad'],
                           'work':'The dot product is kNmm. Moment1kNm is1000kNmm; rotation1mrad is0.001rad.'},
            'finiteLowerRCSubpaths':4,'completeFloorReceiverPaths':0,'receivingPathCatalogue':catalogue,
            'unresolvedFloorReceivingPorts':native_intermediate_support_ports(source['parent']),
            'geometrySvg':draw_north_receiving_geometry(piers,source,case['dpcIntervalZMm']),
            'installedAcceptance':False,'completeHouseProof':False,
            'diagnostics':[
                'Six work-dual coordinates describe a cut reference; they do not qualify a masonry hinge to transmit moment or invent an installed six-DOF connection.',
                'These ports terminate at the source mean-skewback cuts, not the floor receiving plane. RC does not extend through masonry to the floor.',
                'Vertical-section beam flexibility through the short bevel is a finite numerical approximation, not local3Dconfinement, skewback splitting, reinforcement anchorage or taper/warping acceptance.',
                'The actual source horizontal tie bore is removed from section area/inertias. Additive strip Saint-Venant torsion through the bore is an unqualified beam comparison; local3Dwarping, stress concentration, plate bearing and splitting remain absent.',
                f'The upper masonry spandrel, brick ring, visible tie, their contact/sliding/tension behavior and source upper-frame paths are not supplied by this operator. All{catalogue["namedPortCount"]} floor-receiving ports remain unresolved.',
                'Independent tie-end forces are boundary challenges, not automatically equilibrated two-ended ties. A joined bar needs equal/opposite end actions and its actual axial compatibility. Point-resultant stations do not model the source end-plate bearing distribution.',
                'The DPC interval is explicitly authored for comparison. Its finite bilateral normal/shear law is not an actual compression-only mineral bed, qualified positive retention or proof of a moisture break.',
                'Each complete source pier footprint lies inside its named existing cap. Upper cap transfer is finite from grid axis to cap top; the lower cap transfer remains the inherited rigid head-to-grid section assumption.',
                'All52 source heads restrain translation ideally and release rotation. No foundation/site resistance, settlement, soil stiffness or material/product acceptance is supplied.',
                'No old fixed-base roof/foundation result, retained floor/core mass, inferred full-height RC selfweight or new stabilising gravity is imported. Recover head actions only after solving upper-body compatibility against this same operator.'
            ]}



def draw_north_receiving_geometry(piers,source,interval):
    from html import escape
    portal = source['parent']['retained']['values']['project/had/studies/water-replan.json']['model']['insulatedPortal']
    xlo = min(pier['capFootprintXYMm'][0] for pier in piers)-180
    xhi = max(pier['capFootprintXYMm'][2] for pier in piers)+180
    zlo = min(pier['capHeadZMm'] for pier in piers)-150
    zhi = max(pier['floorReceiverXYZMm'][2] for pier in piers)+350
    scale = .18
    width = (xhi-xlo)*scale+520
    height = (zhi-zlo)*scale+130
    def px(x):return 40+(x-xlo)*scale
    def pz(z):return 75+(zhi-z)*scale
    def polygon(points,fill,stroke,extra=''):
        data = ' '.join(f'{px(x):.3f},{pz(z):.3f}' for x,z in points)
        return f'<polygon points="{data}" fill="{fill}" stroke="{stroke}" stroke-width="1" {extra}/>'
    def label(x,y,text,size=13,weight='normal'):
        return f'<text x="{x:.3f}" y="{y:.3f}" font-size="{size}" font-weight="{weight}">{escape(str(text))}</text>'
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="{1500*height/width:.0f}" viewBox="0 0 {width:.3f} {height:.3f}" role="img" aria-label="Actual north RC taper and missing upper masonry receiving path">',
             '<rect width="100%" height="100%" fill="white"/>','<g font-family="sans-serif" fill="#222">',
             label(30,30,'NORTH PORTAL — ACTUAL LOWER RECEIVER BOUNDARY',20,'bold'),
             label(30,53,'Both north portal planes use this source section. The operator stops at the mean skewbacks.',13)]
    shown = [pier for pier in piers if pier['wallId']=='court-north']
    for pier in shown:
        x0,_,x1,_ = pier['footprintXYMm']
        base,spring,top = [pier[key] for key in ('baseZMm','rawSpringZMm','shoulderTopZMm')]
        if pier['side']=='west':
            full = [[x0,base],[x1,base],[x1,spring],[pier['bevelOuterXMm'],top],[x0,top]]
        else:
            full = [[x0,base],[x1,base],[x1,top],[pier['bevelOuterXMm'],top],[x0,spring]]
        parts.append(polygon(full,'#ddd','#777'))
        partial_top = pier['skewbackXYZMm'][2]
        section = _section_at(pier,partial_top)
        a = section['centroidXYZMm'][0]-section['widthXMm']/2
        b = section['centroidXYZMm'][0]+section['widthXMm']/2
        partial = [[x0,base],[x1,base],[x1 if pier['side']=='west' else b,spring],[b,partial_top],[a,partial_top],[x0,spring]]
        parts.append(polygon(partial,'#c7a37c','#654'))
        cx0,_,cx1,_ = pier['capFootprintXYMm']
        parts.append(polygon([[cx0,pier['capHeadZMm']],[cx1,pier['capHeadZMm']],[cx1,base],[cx0,base]],'#eee','#555'))
        bore_z = pier['tieForceXYZMm'][2];radius = pier['tieBoreDiameterMm']/2
        parts.append(polygon([[x0,bore_z-radius],[x1,bore_z-radius],[x1,bore_z+radius],[x0,bore_z+radius]],'white','#777'))
        parts.append(polygon([[x0,interval[0]],[x1,interval[0]],[x1,interval[1]],[x0,interval[1]]],'white','#777'))
        for z in interval:
            parts.append(f'<path d="M {px(x0):.3f} {pz(z):.3f} H {px(x1):.3f}" stroke="#333" stroke-width="1" stroke-dasharray="3 2"/>')
        q = pier['skewbackXYZMm'];f = pier['floorReceiverXYZMm']
        parts.append(f'<circle cx="{px(q[0]):.3f}" cy="{pz(q[2]):.3f}" r="4" fill="#222"/>')
        parts.append(f'<circle cx="{px(f[0]):.3f}" cy="{pz(f[2]):.3f}" r="4" fill="white" stroke="#333" stroke-width="1.5"/>')
        parts.append(f'<path d="M {px(q[0]):.3f} {pz(q[2]):.3f} L {px(f[0]):.3f} {pz(f[2]):.3f}" stroke="#777" stroke-width="1" stroke-dasharray="4 4"/>')
        parts.append(label(px((x0+x1)/2)-30,pz(base)+20,pier['headId'],12,'bold'))
    centre = (shown[0]['bevelInnerXMm']+shown[1]['bevelInnerXMm'])/2
    radius,thickness = portal['rawRadius'],portal['ring']
    angle = math.asin(portal['rawSpan']/(2*radius))
    points = [[centre+(radius+thickness)*math.sin(-angle+2*angle*i/60),portal['centreZ']+(radius+thickness)*math.cos(-angle+2*angle*i/60)] for i in range(61)]
    points += [[centre+radius*math.sin(angle-2*angle*i/60),portal['centreZ']+radius*math.cos(angle-2*angle*i/60)] for i in range(61)]
    parts.append(polygon(points,'#f4f4f4','#777','stroke-dasharray="4 3"'))
    floor = shown[0]['floorReceiverXYZMm'][2]
    parts.append(f'<path d="M {px(shown[0]["footprintXYMm"][0]):.3f} {pz(floor):.3f} H {px(shown[1]["footprintXYMm"][2]):.3f}" stroke="#777" stroke-width="1" stroke-dasharray="6 4"/>')
    tx = (xhi-xlo)*scale+80
    lines = [
        ('SOURCE GEOMETRY',16,'bold'),
        ('RC foot: '+str(shown[0]['sourceRCSectionMm'][0])+' × '+str(shown[0]['sourceRCSectionMm'][1])+' mm',13,'normal'),
        (f'Mean skewback Z{shown[0]["skewbackXYZMm"][2]:.3f} mm',13,'normal'),
        (f'RC shoulder Z{shown[0]["shoulderTopZMm"]:.3f} mm',13,'normal'),
        (f'Floor receiver Z{floor:g} mm',13,'normal'),
        (f'Missing upper path {shown[0]["missingVerticalToFloorMm"]:.3f} mm',13,'normal'),
        ('',13,'normal'),
        ('OPERATOR SCOPE',16,'bold'),
        ('Brown: finite partial RC below mean cut',13,'normal'),
        ('Grey RC shoulder: outside this operator',13,'normal'),
        ('Brick arch: source geometry only',13,'normal'),
        ('White bore: section through actual tie axis',13,'normal'),
        ('Open circles: unresolved floor ports',13,'normal'),
        ('Dashed connectors: absent upper path',13,'normal'),
        ('Four finite caps and all 52 grid heads',13,'normal'),
        ('Explicit finite bilateral DPC comparison',13,'normal'),
        ('No installed/contact/moisture acceptance',13,'normal'),
        ('',13,'normal'),
        ('0 COMPLETE FLOOR RECEIVING PATHS',14,'bold'),
        (f'All {len(native_intermediate_support_ports(source["parent"]))} floor receiver duties remain open',13,'normal'),
    ]
    y = 115
    for text,size,weight in lines:
        parts.append(label(tx,y,text,size,weight));y += 24
    parts.append('</g></svg>')
    return '\n'.join(parts)+'\n'

def solve_north_receiving_boundary(result,boundary):
    fields = ('schema','mode','values')
    if isinstance(boundary,dict) and 'tieForcesKN' in boundary:
        fields = (*fields,'tieForcesKN')
    _exact(boundary,fields,'explicit north receiving boundary')
    if boundary['schema']!='str-north-portal-boundary/1' or boundary['mode'] not in ('authored-port-wrenches','authored-port-displacements'):
        raise ValueError('Choose an explicit force or displacement boundary comparison')
    values = boundary['values'];size = 6*len(result['ports'])
    tie = boundary.get('tieForcesKN',[0.]*len(result['ports']))
    if not isinstance(values,list) or len(values)!=size or not all(map(_finite,values)):
        raise ValueError('Every actual skewback needs six finite source-coordinate boundary values')
    if not isinstance(tie,list) or len(tie)!=len(result['ports']) or not all(map(_finite,tie)):
        raise ValueError('Each actual internal tie station needs one finite axial force')
    offset = [math.fsum(a*b for a,b in zip(row,tie)) for row in result['tieTopCouplingMmMradPerKN']]
    if boundary['mode']=='authored-port-wrenches':
        force = values
        displacement = [math.fsum(a*b for a,b in zip(row,force))+other for row,other in zip(result['complianceMmMradPerKNKNm'],offset)]
    else:
        displacement = values
        force = [math.fsum(a*(b-c) for a,b,c in zip(row,displacement,offset)) for row in result['stiffnessKNKNmPerMmMrad']]
    tie_displacement = [math.fsum(result['tieTopCouplingMmMradPerKN'][j][i]*force[j] for j in range(size))
                        +math.fsum(value*t for value,t in zip(result['tieAxialComplianceMmPerKN'][i],tie)) for i in range(len(tie))]
    grid_force = [math.fsum(a*b for a,b in zip(row,force))+math.fsum(a*b for a,b in zip(trow,tie))
                  for row,trow in zip(result['gridWrenchTransform'],result['tieGridWrenchTransform'])]
    heads = []
    for index,head in enumerate(result['grid']['headIds']):
        vector = [math.fsum(value*case['heads'][index]['reactionKN_KNm'][axis] for value,case in zip(grid_force,result['grid']['unitCases'])) for axis in range(6)]
        heads.append({'id':head,'reactionKN_KNm':vector})
    equilibrium = [0.]*6
    for index,pier in enumerate(result['ports']):
        vector = force[index*6:index*6+6]
        wrench = _wrench_at(vector[:3],pier['skewbackXYZMm'],[0,0,0])
        wrench[3:] = [a+1000*b for a,b in zip(wrench[3:],vector[3:])]
        tie_wrench = _wrench_at([tie[index],0,0],pier['tieForceXYZMm'],[0,0,0])
        equilibrium = [a+b+c for a,b,c in zip(equilibrium,wrench,tie_wrench)]
    for row in heads:
        parent = result['grid']['headXYZMm'][row['id']]
        vector = row['reactionKN_KNm']
        wrench = _wrench_at(vector[:3],parent,[0,0,0])
        wrench[3:] = [a+1000*b for a,b in zip(wrench[3:],vector[3:])]
        equilibrium = [a+b for a,b in zip(equilibrium,wrench)]
    residual = [*equilibrium[:3],*[value/1000 for value in equilibrium[3:]]]
    if max(abs(value) for value in residual)>1e-6:
        raise ValueError('The compatible north receiving boundary loses six-component equilibrium')
    joints = []
    joint_z = sum(result['request']['dpcIntervalZMm'])/2
    for index,pier in enumerate(result['ports']):
        centre = [*pier['footCentroidXYMm'],joint_z]
        vector = force[index*6:index*6+6]
        wrench = _wrench_at(vector[:3],pier['skewbackXYZMm'],centre)
        wrench[3:] = [a+1000*b for a,b in zip(wrench[3:],vector[3:])]
        tie_wrench = _wrench_at([tie[index],0,0],pier['tieForceXYZMm'],centre)
        wrench = [a+b for a,b in zip(wrench,tie_wrench)]
        section = _section_at(pier,joint_z)
        pressures = [-wrench[2]/section['A']-wrench[3]*y/section['Ixx']+wrench[4]*x/section['Iyy']
                     for x in (-section['widthXMm']/2,section['widthXMm']/2) for y in (-section['widthYMm']/2,section['widthYMm']/2)]
        joints.append({'id':pier['id'],'upperExternalWrenchKN_KNm':[*wrench[:3],*[value/1000 for value in wrench[3:]]],
                       'fullContactAffinePressureRangeMPa':[1000*min(pressures),1000*max(pressures)],
                       'requiresBilateralNormalTension':min(pressures)<-1e-12,
                       'meanShearStressMPa':1000*math.hypot(wrench[0],wrench[1])/section['A'],
                       'localResistanceAcceptance':False,
                       'scope':'Necessary full-contact affine normal-pressure comparison only. Negative pressure demands the authored bilateral tensile branch; it is not available compression-only mineral contact. No friction, shear resistance, partial-contact redistribution or physical tie acceptance is inferred.'})
    return {'schema':'str-north-portal-boundary-result/1','sourceSHA256':result['sourceSHA256'],'boundary':boundary,
            'portWrenchesKN_KNm':force,'portDisplacementsMmMrad':displacement,'tieForcesKN':tie,'tieDisplacementsMm':tie_displacement,'heads':heads,
            'equilibriumResidualKN_KNm':residual,'jointNormalComparisons':joints,'strainEnergyKNmm':(math.fsum(a*b for a,b in zip(force,displacement))+math.fsum(a*b for a,b in zip(tie,tie_displacement)))/2,
            'installedAcceptance':False,'completeFloorReceiverPaths':0}


if __name__=='__main__':
    source = load_north_receiving_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:
        print(json.dumps(reference_north_receiving_case(source),allow_nan=False))
    else:
        print(json.dumps(compile_north_receiving(json.load(sys.stdin),source),allow_nan=False))
