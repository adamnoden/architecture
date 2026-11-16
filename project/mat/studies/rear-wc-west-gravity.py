"""Source-bound gravity routing comparison for the rear WC and shower."""
from hashlib import sha256
from json import dumps, loads
from math import atan2, hypot, pi
from pathlib import Path
from sys import argv

root = Path(argv[1])
here = Path(__file__).resolve().parent
sources = [
    'project/mat/studies/whole-house-service-baseline.json',
    'project/ias/studies/fitted-wc-schedule.json',
    'project/had/studies/open-north-loggia.json',
    'project/str/studies/current-house-lateral.json',
    'project/mat/studies/loggia-soffit.json',
]
raw = [(root / name).read_bytes() for name in sources]
services, fitted, house, lateral, section = map(loads, raw)
wc = fitted['rear']
rear = services['rewinds']['rearSource27']
shower = services['interfaces']['rearShowerDrop']
_, old_y, sleeve = rear['retainedFloorPort']
ffl = section['section']['z']['floor']
old_route = next(r for r in services['otherDuties'] if r['id']=='rear-soil')['path']
west_pier = next(p for p in lateral['RClegs']['piers']
                if max(x for x,y in p['polygon'])<2000 and min(y for x,y in p['polygon'])>9000)
pier_south = min(y for x,y in west_pier['polygon'])
ground_arches = [a for a in house['archOpeningRegister']['GROUND'] if a['wall']=='outer-west']
old_shower_axis = shower['branch'][1]
gradient = shower['gradient']
setting = 10
stack_x = -300
candidate_y = 9400
west_chase = rear['lowBox']
tube_od = 110

def axis_run(points,start_z):
    # Square plan lengths bound tangentially replacing these corners with
    # smooth bends. Allow further developed length for the as-built route.
    length = sum(hypot(x-a,y-b) for (x,y),(a,b) in zip(points,points[1:]))
    return {'planMM':points,'squarePlanLengthMM':length,'fallMM':length/gradient,
            'endAxisZMm':start_z-length/gradient}

def wall_routes(y):
    spigot_x, spigot_y, local_z = wc['soilSpigotTip']
    # Retain the 35 mm connector land in the conservative branch origin.
    connector_x = spigot_x+35
    wc_points = [(connector_x,spigot_y),(510,spigot_y),(510,y),(0,y)]
    shower_x,shower_y,shower_z = old_shower_axis
    shower_points = [(shower_x,shower_y),(shower_x,y),(0,y)]
    return axis_run(wc_points,ffl+local_z),axis_run(shower_points,shower_z)

def annulus_clear(y,z,arch):
    h = arch['head']-arch['spring']
    w = arch['width']
    r = (w*w+4*h*h)/(8*h)
    centre_z = arch['head']-r
    horizontal = abs(y-arch['centre'])
    vertical = z-centre_z
    spring_angle = atan2(arch['spring']-centre_z,w/2)
    radius = r+arch['radialRingTrial']
    angle = atan2(vertical,horizontal)
    # Treat the full circle as a conservative check where the projection
    # would lie outside the actual segmental arch. Expose that distinction.
    return {'arch':arch['id'],'arcProjectionInActualSector':spring_angle<=angle<=pi-spring_angle,
            'archOuterRadiusMm':radius,
            'clearToOuterRingBareMM':hypot(horizontal,vertical)-radius-sleeve/2,
            'clearToOuterRingAfter10Mm':hypot(horizontal,vertical)-radius-sleeve/2-setting}

def line_to_interval(value,start,end):
    return max(start-value,value-end,0)

def vent_openings(y):
    bounds = {'outer-west':(0,stack_x,y),'outer-east':(12000,stack_x,y),
              'outer-south':(0,y,stack_x),'outer-north':(12000,y,stack_x)}
    out = []
    for floor, rows in house['openings'].items():
        for opening in rows:
            if opening['wall'] not in bounds:
                continue
            wall,normal,along=bounds[opening['wall']]
            centre,w=opening['centre'],opening['width']
            d=hypot(wall-normal,line_to_interval(along,centre-w/2,centre+w/2))
            if d < 3000:
                head=opening.get('head')
                out.append({'floor':floor,'opening':opening['id'],'planDistanceMm':d,
                            'headZMm':None if head is None else head+(ffl if floor=='FIRST' else 0)})
    return out

upper,lower=wall_routes(candidate_y)
near_arch=next(a for a in ground_arches if a['id']=='west-window-3')
arch_controls=[]
for y in (9500,candidate_y):
    trial=wall_routes(y)[1]
    arch_controls.append({'wallYMm':y,'showerWallAxisZMm':trial['endAxisZMm'],
                          **annulus_clear(y,trial['endAxisZMm'],near_arch)})
vent=vent_openings(candidate_y)
closest_raw=min(line_to_interval(candidate_y,a['centre']-a['width']/2,a['centre']+a['width']/2)
                for a in ground_arches)
west_nominal_eave_x=-house['roofDevelopment']['overhang']
west_box_extension=west_chase[1]-candidate_y

report = {
    'status':'Geometric challenger. Retain fixture and shower trap. No route, wall support, finished assembly, product material or site adoption.',
    'sourceHashes':dict(zip(sources,(sha256(b).hexdigest() for b in raw))),
    'retainedWC':{'panBoxMM':wc['pan'],'spigotXYAndLocalZMm':wc['soilSpigotTip'],
                  'currentlyFormedPortXYAndDiameterMm':rear['retainedFloorPort'],
                  'currentPortDisposition':'Delete from new design only after adoption and a recast coordinated cage. A real formed opening must be assessed; no infill strength credit.'},
    'geometry':{'westWallExitYMm':candidate_y,'outerStackXyMm':[stack_x,candidate_y],
                'sleeveDiameterMm':sleeve,'nearestRawWestOpeningToSleeveEdgeMm':closest_raw-sleeve/2,
                'continuousPierSouthYMm':pier_south,'sleeveToContinuousPierAfter10Mm':pier_south-candidate_y-sleeve/2-setting,
                'oldWallExitYMm':old_y,'existingGroundWallExitUsedAsNew':False,
                'rejectDirectUpperCopyOfExistingExit':'At retained Y the upper sleeve cuts through the continuous west RC L.',
                'oldAboveGroundWestExitAxisZMm':old_route[2][2]},
    'routing':{'gradient':'1:40', 'upperWC':upper, 'independentLowerShower':lower,
               'existingShowerTrapAndFirstBranchMM':shower['branch'][:2],
               'newShowerAxisAboveOldStackJunctionMm':lower['endAxisZMm']-shower['branch'][-1][2],
               'upperWallSleeveUndersideAboveFFLMm':upper['endAxisZMm']-ffl-sleeve/2,
               'upperAxisAtExteriorStackZMm':upper['endAxisZMm']-abs(stack_x)/gradient,
               'lowerAxisAtExteriorStackZMm':lower['endAxisZMm']-abs(stack_x)/gradient,
               'wallSleeveScope':'Form two separate permanent sleeves between openings; restore inner air/wet and outer drained boundaries. No drilling the current L or reliance on a cavity pipe.'},
    'archControls':arch_controls,
    'chase':{'existingUpperLowBoxMM':west_chase,'extensionSouthMM':west_box_extension,
             'straightTubeNominalODMm':tube_od,'straightBodyGrossWidthReserveMm':west_chase[2]-tube_od,
             'comparison':'DN100 Ensign Agilium AP000 3 m / 110 OD above-ground body; use no coupling inside the 150-wide straight run. EC002 actual 170×137 coupling needs constituent, rotation and end-cover access. Exterior material, fire and installation unadmitted.'},
    'terminal':{'nearExternalOpenings':vent,'minVentZFromKnownOpeningHeadsMm':max(v['headZMm'] for v in vent if v['headZMm'] is not None)+900,
                'nominalRoofEaveDatumMm':house['roofDevelopment']['eavesDatum'],
                'straightPipeClearToNominalOuterOverhangAfter10Mm':west_nominal_eave_x-stack_x-tube_od/2-setting,
                'control':'AD H 900 mm above any opening within 3 m. Recheck actual operable openings, outlets, eave, gutter, roof vent support and maintenance. Keep WC/shower branch junctions independently accessible, site outfall invert, backwater and cleanout unproved.'},
}
assert wc['stack']==rear['retainedFloorPort'] and gradient==40
assert pier_south<old_y<max(y for x,y in west_pier['polygon'])
assert arch_controls[0]['arcProjectionInActualSector'] and arch_controls[0]['clearToOuterRingBareMM']<0
assert min(annulus_clear(candidate_y,lower['endAxisZMm'],a)['clearToOuterRingAfter10Mm'] for a in ground_arches)>25
assert report['routing']['upperWallSleeveUndersideAboveFFLMm']>30
assert all(v['headZMm'] is not None for v in vent)

target=here/'rear-wc-west-gravity.json'
text=dumps(report,indent=2,sort_keys=True)+'\n'
if '--check' in argv:
    assert target.read_text()==text
else:
    target.write_text(text)
