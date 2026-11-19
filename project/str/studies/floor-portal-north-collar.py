"""Locate a concealed concrete collar and developed crossing bars at the north Ls."""
from hashlib import sha256
from pathlib import Path
from sys import argv
from math import cos, sin, pi, asin, sqrt, hypot
from itertools import combinations
from json import loads, dumps
from court_tie_starter_paths import path,gauge,angles

root = Path(argv[1])
source_paths = [
    'project/str/studies/current-house-lateral.json',
    'project/str/studies/open-loggia-support.json',
    'project/str/studies/current-house-floor-stops.json',
    'project/had/studies/open-north-loggia.json',
    'project/mat/studies/loggia-soffit.json',
]
raw = [root.joinpath(name).read_bytes() for name in source_paths]
lateral, support, edge, house, finish = map(loads, raw)
R, phi = 165., 16.
stations = [175,325,475,625]
low,high=3315.,3331.
zlo,zhi=finish["section"]["slabZ"]
tails=850.
relative=5.
ordinary=[path(f'collector H12 U{u:+} Z{z}',12,[(u,-70,z),(u,930,z)])
     for u in (-21,21) for z in (3219,3256,3293,3330,3760,3797,3834,3871)]
corner_h20=[
    path(f'wing H20 U{u:+} V{v}',20,[(u,v,3100),(u,v,4300)])
    for u in [-27,27] for v in set((50,100,800,850)+tuple(p-70 for p in (50,100,800,850)))
]
# Proposed H10 horizontal face bars; register to same wall fixture.
wall_h10=[path(f'H10 wall face {s:+} Z{z}',10,[(s,-70,z),(s,930,z)])
          for s in (-35,35) for z in range(3300,4350,150)]
hoop_planes = [x+sign*45 for x in stations for sign in (-1,1)]
hoops = [path(f'closed H8 at station {v}',8,
             [(-31,v,3209),(31,v,3209),(31,v,3881),(-31,v,3881),(-31,v,3209)])
         for v in hoop_planes]

def swap(item):
    return ('swapped '+item[0],item[1],
            [((a[1],a[0],a[2]),(b[1],b[0],b[2])) for a,b in item[2]],item[3])

def returns(z):
    return [path(f'top H16 V{v} Z{z}',phi,
        [(R+tails,v,z)]+[(R*(1-sin(t)),v,z+R*(1-cos(t))) for t in angles(pi/2)] +
        [(0,v,z+R+tails)],R) for v in stations]

x_returns,y_returns=returns(low),[swap(o) for o in returns(high)]
witness=x_returns+y_returns
fixed=ordinary+[swap(o) for o in ordinary]
vertical=corner_h20+[swap(o) for o in corner_h20]
wall=wall_h10+[swap(o) for o in wall_h10]
all_hoops=hoops+[swap(o) for o in hoops]
a=651.5
routes=[]
for v in (115.5,167.5,219.5,271.5):
    r=a-v
    p=[(v,1200,3265)]
    p.extend((a-r*cos(t),a-r*sin(t),3265) for t in angles(pi/2))
    p.append((1200,v,3265))
    routes.append(path(f'H20 chord V{v}',20,p,r))

def report(A,B,settings):
    vals=[(min(gauge(x,y)['nominalIntervalMm'])-settings,x[0],y[0])
          for x in A for y in B]
    return min(vals)
bonds=[(gauge(x,y)['nominalIntervalMm'][0],x[0],y[0]) for x in x_returns for y in y_returns]
assert all(abs(gap)<.1 for gap,*_ in bonds)
slab=support["floor_fields"]
old=lateral["horizontalRoute"]
old_width=11335
collar_inside_axis=190.
wall_inside_axis=edge['newLoops']['outer']['coreWidthDepth'][0]/2
collar_arm=860.
collar_top=zhi+45
ffl=finish['section']['z']['floor']
side_width=collar_inside_axis-wall_inside_axis
added_plan=(2*collar_arm-side_width)*side_width/1e6
new_ecc=sum((115.5,167.5,219.5,271.5))/4
chord=old['chordDemand']*old_width/(old_width-new_ecc)
ft=500/1.15
steel_one=pi*phi**2/4*ft/1000
def interface(width):
    face = wall_inside_axis+width
    miss = max(0.,R-face)
    angle = asin(miss/R)
    tension = chord/(.60*4*cos(angle))
    return {
        'inboardFaceFromWallCentreMm':face,
        'extraRoomwardWidthBeyondOldCoreMm':width,
        'straightCrossingReservationMm':face-R,
        'localBendAngleAtFaceDegrees':angle*180/pi,
        'tensionPerCrossingH16KNAtSensitivity':tension,
        'additionalVerticalInterfaceActionKN':4*tension*sin(angle),
    }

retained = interface(side_width)
narrow = interface(80)
no_collar = interface(0)
friction_force=retained['tensionPerCrossingH16KNAtSensitivity']

# The critical free surface is the re-entrant step at the old wall face.
# Each bar approaches it on the radial ray through the R165 arc centre.
def shoulder_cover(top, start_z, bar_diameter=phi, relative_setting=5):
    axis_to_corner=R-hypot(R-wall_inside_axis,start_z+R-top)
    return axis_to_corner,axis_to_corner-bar_diameter/2-relative_setting

lo_corner,lo_cover=shoulder_cover(collar_top,low)
hi_corner,hi_cover=shoulder_cover(collar_top,high)
old_corner,old_cover=shoulder_cover(zhi+40,high)
cover_required=25
receiver_h8_radius=4
combined_corner_setting=5
h8_legal_minimum_gap=(phi/2+receiver_h8_radius+combined_corner_setting+
                      cover_required+receiver_h8_radius+combined_corner_setting)
radius_to_corner_at_h8_minimum=R-h8_legal_minimum_gap
h8_minimum_top=high+R-sqrt(radius_to_corner_at_h8_minimum**2-
                           (R-wall_inside_axis)**2)
assert old_cover<cover_required<hi_cover<lo_cover
assert h8_minimum_top>collar_top and h8_minimum_top<ffl-15

assert retained['straightCrossingReservationMm']==25
assert narrow['additionalVerticalInterfaceActionKN']>10
assert no_collar['additionalVerticalInterfaceActionKN']>110

full_bond=phi/4*ft/2.1
mandrel=steel_one*1000*(1/36+1/(2*phi))/17
unitarea=pi*phi**2/4*1000/150
x=unitarea*ft/(.8*1000*17)
d=157-(3339-high)
z=d-.4*x
# Find actual neighbouring apertures independently in each outer face.
wing_sections = {
    'NW north': ('outer-north',[332.5,1192.5]),
    'NW west': ('outer-west',[10807.5,11667.5]),
    'NE north': ('outer-north',[10807.5,11667.5]),
    'NE east': ('outer-east',[10807.5,11667.5]),
}
apertures = {}
for wing,(face, span) in wing_sections.items():
    rows = [r for r in house['openings']['FIRST'] if r['wall']==face]
    nearest = min((max(r['centre']-r['width']/2-span[1],
                       span[0]-r['centre']-r['width']/2), r['id'],r['sill']) for r in rows)
    apertures[wing]={'wingAxisSpanMm':span,'nearestRawPlanReserveMm':nearest[0],
                     'nearestWindow':nearest[1],'sillAboveCollarTopMm':ffl+nearest[2]-collar_top}
assert all(row['nearestRawPlanReserveMm']==107.5 for row in apertures.values())
cabinet_x, cabinet_y, cabinet_w, cabinet_l = house['upperFurniture']['rear-cabinet']
emitter_x, emitter_y, emitter_w, emitter_l = house['upperFurniture']['service-emitter-principal-N']
nw_face_x = 332.5+collar_inside_axis
ordinary_finish = finish['section']['northOrdinaryY']
assert ordinary_finish[3]-ordinary_finish[2]==110
assert ordinary_finish[4]-ordinary_finish[3]==50
assert all(x<steel_one for x in [friction_force+r['action']['M']*.15/(z/1000)
        for r in slab if r['id'] in ('NW-W','NE')])
assert mandrel<2*R-phi and tails>full_bond

nums={
  'sourceHashes':dict(zip(source_paths,[sha256(b).hexdigest() for b in raw])),
  'scope':'Preferred concealed collar geometry. No D-region, full local stiffness, full floor-mesh transitions or final coupled structure adoption.',
  'cornerCandidate': {
      'sameExistingSoffitOrdinarySlabTopAndCollarTopZmm':[zlo,zhi,collar_top],
      'nominalCollarAndActuallyCommonContactDepthMm':[collar_top-zlo,zhi-zlo],
      'FFLAndFinishUndersideZmm':[ffl,ffl-15],
      'residualServiceHeightUnder15FinishMm':ffl-15-collar_top,
      'unchangedExteriorGlassCavityAndBrickMm':
          [ordinary_finish[3]-ordinary_finish[2],ordinary_finish[4]-ordinary_finish[3],
           ordinary_finish[5]-ordinary_finish[4]],
      'newThickeningPlanAreaM2PerCorner':added_plan,
      'oldConcreteUnitWeightAdditionalDeadKNPerCorner':added_plan*(collar_top-zhi)/1000*25,
      'allNearestApertures':apertures,
      'NWRearCabinetPlanOverlapInWestStripXYmm':
          [min(nw_face_x,cabinet_x+cabinet_w)-cabinet_x,
           min(11667.5,cabinet_y+cabinet_l)-max(10807.5,cabinet_y)],
      'NENorthEmitterPlanGapToNearestCollarXmm':10807.5-(emitter_x+emitter_w),
      'slabOnRemoteSideMustRemainZ3370':True,
      'placingFace':'Monolithic layout. Do not introduce a pour joint by using the internal verification plane.',
  },
  'bendShoulderGeometry':{
      'actualStepUAndZmm':[wall_inside_axis,collar_top],
      'lowerUpperAxisToSteppedFreeCornerMm':[lo_corner,hi_corner],
      'lowerUpperSteelCoverAfter5SettingMm':[lo_cover,hi_cover],
      'old3410UpperSteelCoverAfter5SettingMm':old_cover,
      'requiredNoFurtherReceiverCoverMm':cover_required,
      'nominalMinimumShoulderTopToFitH8RadiallyAheadOfUpperH16Mm':h8_minimum_top,
      'remainingFinishedFloorVoidIfH8MinimumTopUsedMm':ffl-15-h8_minimum_top,
      'radialLineForceOldBondedShearWitnessNPerMm':friction_force*1000/R,
      'separate90DegreeBendResultantAtOldWitnessKN':sqrt(2)*friction_force,
            'scope':'Exact re-entrant corner cover, not stress-spread, confinement, crack-width or positive welded development. A conventional radially additional H8 cannot fit the selected vertical budget. Locate confinement beside the bend or externally around a developed alternative strut.',
  },
  'interfaceComparisons':{
      'chosen':retained,'tooNarrowRoomwardExtension':narrow,'unchanged140Core':no_collar,
      'shallower195BodyAlternative':{
          'notionalUpperSurfaceZmm':zlo+195,
          'topH16CoverAfter5MmSettingsMm':zlo+195-high-phi/2-5,
          'requiredLocalTopCoverMm':25,
      },
      'oldGeneralPlainTractionAt200CommonDepthMPa':chord*1000/(860*(zhi-zlo)),
      'counterfactual240GrossTractionMPaNotAdmitted':chord*1000/(860*(collar_top-zlo)),
  },
  'actualTopReplacement':{
      'barShapeRAndDiameterMm':[R,phi],'topAxisZByDirectionMm':[low,high],
      'westCornerLocalAlongWingStationsMm':stations,'reflectedToNorthEast':True,
      'shopHoopStationsMm':hoop_planes,'developedStraightEachSideAfterTangentMm':tails,
      'fixedWallH10RephasedZFirstTwoMm':[3300,3450],'fixedWallH10PitchMm':150,
      'adoptedDeckCageUnchangedOutsideStrip':True,
      'chord4H20AxesInboardFromOldWallCentreMm':[115.5,167.5,219.5,271.5],
      'chordBendRadiiMm':[536,484,432,380],'chordPlaneZmm':3265,
      'chordParallelSpacingAfter10SettingsMm':52-20-10,
  },
  'nearestMainH12InCombined5Fixture':report(witness,fixed,5),
  'nearestMainH12Independent10':report(witness,fixed,10),
  'nearestVerticalH20InIndependent10':report(witness,vertical,10),
  'nearestH10WallFacesInCombined5':report(witness,wall,5),
  'nearestHoopInIndependent10':report(witness,all_hoops,10),
  'nearestH20ChordInIndependent10':report(witness,routes,10),
  'closestNonCrossingH16':min(gauge(a,b)['afterTwo5mmSetoutsLowerMm']
      for layer in (x_returns,y_returns) for a,b in combinations(layer,2)),
  'crossedContacts':len(bonds),'old_new_chord':[old['chordDemand'],chord],
  'friction_force_per_rod':friction_force,'full_bond':full_bond,
  'mandrelNeedAndActual':[mandrel,2*R-phi], 'steel_one':steel_one,
  'new_top_d_z':[d,z], 'new_steelArea':unitarea,
  'slabComparison':[
      {'id':r['id'],'oldM':r['action']['M'],'oldV':r['action']['V'],
       'oldMPerOne150MmLayoutAtNewZ':r['action']['M']*.150/(z/1000),
       'gravityAndFrictionPerRodOldSensitivity':friction_force+r['action']['M']*.150/(z/1000)}
      for r in slab if r['id'] in ('NW-W','NE')
  ],
  'topH16CoverAfter5MmSetting':zhi-high-phi/2-5.,
}
def drawing():
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 620" width="1200" height="620" role="img" aria-label="Northern L collar plan and section">
    <rect width="1200" height="620" fill="#fffdf8"/>
    <g font-family="DejaVu Sans,Arial,sans-serif" fill="#20313a">
    <text x="42" y="49" font-size="25">NORTH L PIERS / CONCEALED FLOOR TRANSFER COLLAR</text>
    <text x="42" y="77" font-size="16">Northwest shown • east mirrors • the layer transition stays below the occupied floor</text>
    <path d="M42 100H1158" stroke="#7f9192"/>
    <text x="42" y="132" font-size="18">A / PLAN AT NORTHWEST</text>
    <path d="M90 184h465v74H163v272H90z" fill="#e5decd" stroke="#746956"/>
    <path d="M163 258h392v54H217v218h-54z" fill="#c6d8d7" stroke="#346978" stroke-width="2"/>
    <path d="M175 307h150v223H175z" stroke="#a2533d" stroke-width="1.5" stroke-dasharray="6 5" fill="none"/>
    <text x="230" y="352" font-size="16" fill="#a2533d">Rear cabinet</text>
    <text x="231" y="375" font-size="14">Keep base penetrations away</text>
    <text x="233" y="398" font-size="14">93 mm into footprint at west</text>
    <text x="230" y="467" font-size="16" fill="#346978">120 mm roomward strip</text>
    <text x="231" y="489" font-size="14">Repeat on both 860 mm wings</text>

    <text x="645" y="132" font-size="18">B / THROUGH ONE WING</text>
    <path d="M675 229H785V279H908V319H1135V477H675z" fill="#e5decd" stroke="#746956"/>
    <path d="M785 279H908V319H785z" fill="#c6d8d7" stroke="#346978" stroke-width="2"/>
    <path d="M906 280V477" stroke="#346978" stroke-width="2" stroke-dasharray="6 4"/>
    <path d="M1135 355H880q-137 0-137-124" fill="none" stroke="#346978" stroke-width="4"/>
    <path d="M645 243H1135" stroke="#a2533d" stroke-width="1.4" stroke-dasharray="6 4"/>
    <text x="935" y="231" font-size="15">FFL +3450</text>
    <text x="935" y="270" font-size="15">Collar top +3415</text>
    <text x="935" y="306" font-size="15">Adjacent slab top +3370</text>
    <text x="933" y="374" font-size="15" fill="#346978">H16 crosses before the turn</text>
    <text x="931" y="455" font-size="14">200 mm common contact</text>
    <text x="814" y="502" font-size="16">Primary soffit +3170 unchanged</text>
    <path d="M42 560H1158" stroke="#7f9192"/>
    <text x="42" y="587" font-size="15">Solid below removable finish. Hold the existing full insulated cavity. Load development inside the collar remains open.</text>
    </g></svg>"""


print(drawing() if '--svg' in argv else dumps(nums,indent=2))
