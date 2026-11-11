"""Conditional next inner geometry and explicit falsifiers; no admission.

Standard library only. Coordinates are authored comparison inputs, not a
recovered drawing. This does not modify or replace frozen source 4eb505e4.
It deliberately supplies no new frame, stock, hydraulic or native wind pass.
"""
from pathlib import Path
import argparse,hashlib,json,math

def interval_overlap(a,b):return max(0.,min(a[1],b[1])-max(a[0],b[0]))
def box_overlap(a,b):return [interval_overlap(x,y) for x,y in zip(a,b)]
def distance_point_square(point,centre,half):
    return math.hypot(*[max(0.,abs(a-b)-half) for a,b in zip(point,centre)])
def inside_plan(point,box):
    return all(bounds[0]<=v<=bounds[1] for v,bounds in zip(point,box[:2]))

def calculate():
    primary_shift=200.;lower_shift=10.
    p_old={'SW':6605.75,'NW':6620.375,'NE':6635.,'SE':6620.375}
    l_old={'SW':6400.625,'NW':6415.,'NE':6400.625,'SE':6386.25}
    pb={k:v+primary_shift for k,v in p_old.items()}
    lb={k:v+lower_shift for k,v in l_old.items()}
    front=6735+primary_shift;rear=6830+primary_shift;cap=[6860+primary_shift,6880+primary_shift]
    lfront={k:v+140 for k,v in lb.items()};lrear={k:v+245 for k,v in lb.items()}
    carrier={k:v-26.9 for k,v in pb.items()}
    p_arm_axis={k:v-14.4 for k,v in pb.items()}
    wet_q=4615.;leaf_q=4618.;hinge=7200.;fixed_toe=7080.
    roof_toe=[4525.,7290.188717651048]
    roof_at_fixed_q=roof_toe[1]-(wet_q-roof_toe[0])*math.tan(math.radians(25))
    roof_at_hinge_q=roof_toe[1]-(leaf_q-roof_toe[0])*math.tan(math.radians(25))
    leaf_toe={k:v+75 for k,v in pb.items()}
    leaf_length={k:hinge-v for k,v in leaf_toe.items()}
    max_leaf=max(leaf_length.values())
    spill_installed={k:v-5 for k,v in lfront.items()}
    spill_stowed={k:v+80 for k,v in spill_installed.items()}
    spill_below=max(carrier[k]-spill_stowed[k] for k in pb)
    arm_z=6720.;arm_depth=40.;screen=25.

    # These are geometric head hypotheses only, not rated heads or a support.
    head_axis=(5100.,5100.);old_head_axis=(4500.,4500.)
    dogleg_shift=math.dist(head_axis,old_head_axis);bend_r=150.
    straight=dogleg_shift-2*bend_r
    dogleg_length=straight+math.pi*bend_r
    bowl_floor=pb['SW']-5;upper_joint=6300.;lower_joint=6000.
    pipe_length=(lower_joint+750)+dogleg_length+(bowl_floor-upper_joint)
    head_rim=rear+25
    catch_floor=lfront['SW']+70
    collar=catch_floor+100;drip=catch_floor+123
    catch_half=(255.,130.)
    catch_box=[head_axis[0]-catch_half[0],head_axis[1]-catch_half[1],510.,260.]

    # Frozen local source uses one uniform lowest-bed frame on each face.
    # Applying the same actual corner grade to both arms translates this
    # intersection vertically; it cannot resolve the plan conflict.
    old_l_axis=6386.25-14
    old_south_arm=[[4525.,4675.],[4335.,4800.],[old_l_axis-12.5,old_l_axis+12.5]]
    old_west_arm=[old_south_arm[1],old_south_arm[0],old_south_arm[2]]
    old_primary_south=[[4725.,4875.],[4335.,4725.],[6605.75-26.5,6605.75-1.5]]
    old_primary_west=[old_primary_south[1],old_primary_south[0],old_primary_south[2]]
    ports={'normal':[4765.,4610.],'service':[4610.,4765.]}
    separation=math.dist(ports['normal'],ports['service'])
    nearest=distance_point_square(ports['normal'],ports['service'],125)
    receptor_half=190.
    normal_inside_receptor=all(abs(a-b)<=receptor_half for a,b in zip(ports['normal'],ports['service']))
    service_bed=lb['SE'];skirt_top=service_bed-10;skirt_bottom=skirt_top-220
    receiver_floor=6100.;receiver_rim=6310.;receiver_water=70.
    area=math.pi*(150/1000)**2/4*.5
    duty=3.60375
    orifice_head=(duty/1000/(.6*area))**2/(2*9.81)*1000
    # Longest permitted leaf at the near face of the proposed catch. This is
    # an admissible envelope collision, not an invented as-built graded leaf.
    catch_near_q=catch_box[1]
    possible_leaf_collision=None
    if 0<=catch_near_q-leaf_q<=max_leaf:
        z=hinge-math.sqrt(max_leaf**2-(catch_near_q-leaf_q)**2)
        possible_leaf_collision=dict(q=catch_near_q,z=z,catchRim=rear+50,
          intrusionBelowCatchRim=rear+50-z,
          condition='Longest permitted leaf at a p station overlapping the catch. Exact graded leaf and end joints are not authored.')
    # The earlier5000-axis510 catch intersects the perpendicular cap.
    previous_catch_near_p=5000-255
    old_bowl_roof_z=roof_toe[1]+(roof_toe[0]-4405)*math.tan(math.radians(25))

    return dict(status='CONDITIONAL NEXT GEOMETRY; REJECT FOR SELECTION AND ORDINARY-RENEWAL CLAIM',
      units='mm, kg, L/s unless stated; SW uses global x/y with courtward increase; reflect x about 6000 for SE.',
      sourceSHA256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
      evidenceBoundary='All results here are finite geometry/arithmetic screens. No new local frame, complete stock, hydraulic rating, native pressure, source-point reaction or temporary-works run is supplied.',
      currentComparison=dict(primaryShift=primary_shift,lowerShift=lower_shift,
        primary=dict(wetQ=[4375,4725],waterComparison=200,beds=pb,front=front,rear=rear,capBottomTop=cap,
          carrierBottom=carrier,armAxisBelowBed=14.4,armAxis=p_arm_axis,releaseQ=4380),
        lower=dict(wetQ=[4375,4800],waterComparison=220,beds=lb,frontDepth=140,rearDepth=245,
          front=lfront,rear=lrear,carrierLowest=lb['SE']-26.9,windowHead=6300,
          nominalCarrierToWindow=lb['SE']-26.9-6300,releaseQ=4335),
        roots=dict(primaryP=[5025,6000,6975],lowerP=[5041.6666667,6000,6958.3333333],
          primaryRailQZ=[4235,6880],lowerRailQZ=[4235,6730],
          existingRootStemsQ=[3850,3985],baseZ=6660,
          qualifications='Topology only. Direct permanent root welds, new stock and receiving box are not adopted; the old 6-bolt feet and 60 kg/m caps do not bind this new load allocation.'),
        proposedPrimaryExteriorDrop=dict(centreQ=4340,sectionAlongRadial=[60,20,3],solidQ=[4330,4350],
          reason='The raised arm cannot descend at q4235 through the continuous lower rail. Exact new header/drop joints and local sheet jogs are not modelled.'),
        primaryArmStations=[4800,5325,5775,6225,6675,7200],lowerArmStations=[4600,5100,5550,6000,6450,6900,7400],
        secondaryOwnership='Proposed: primary fixed frame/cassette, including collars around retained fixed primary stubs. Lower wet pan retains separate roots. This invalidates the old dry/wind/root allocation.',
        discardedLowerHandoff='Discard the bed-level 90 mm shoe/60 mm tongue. A separate removable over-rear chute is required; its exact lower bend, support, motion and wet closure are not yet authored.',
        secondaryFixedProfileControl=[[4545,7107.3288],[4565,7085],[4346,6990]],secondaryBaffleTop=[4565,7145]),
      hingedPrimaryLeaf=dict(wetPlaneQ=wet_q,leafQ=leaf_q,hingeAxisQ=leaf_q,hingeZ=hinge,fixedToeZ=fixed_toe,
        normalOverlap=hinge-fixed_toe,normalToeByCorner=leaf_toe,normalToeAboveBed=75,
        lengthByCorner=leaf_length,maximumStowedQ=leaf_q+max_leaf,
        fixedRibRoofwardQ=[wet_q-20,wet_q],secondaryBaffleQ=4565,
        nominalRibToBaffle=wet_q-20-4565,
        roofAtFixedPlaneZ=roof_at_fixed_q,roofContinuationAtHingeZ=roof_at_hinge_q,
        roofAboveHingeAnd20Stock=roof_at_hinge_q-hinge-20,
        fixedToeToPrimaryRear=fixed_toe-rear,stowedUndersideToCap=hinge-cap[1],
        possibleRetainedCatchSweep=possible_leaf_collision,
        qualifications=['A hinge replaces the old vertical slider. Normal and stowed stock, wind, locks, rotation, wet overlaps and actual longitudinal joints are not modelled.',
          'Head/catch/support removal must precede rotation wherever the complete swept geometry requires it. No inherited 1171-state result applies.',
          'The 75 mm toe is nominal, not a movement-qualified under-leaf opening. The sheet creates 243/107 mm longitudinal lanes; ribs and joints must be deducted.',
          'The roof screen is at the declared hinge axis q4618, not the q4615 fixed wet plane. The 20 mm top envelope is a declared screen; a hinge bearing, lock and full swept stock are not authored.']),
      headArmCorridor=dict(axisZ=arm_z,depth=arm_depth,
        upperNominal=min(carrier.values())-(arm_z+arm_depth/2),
        lowerNominal=arm_z-arm_depth/2-max(lrear.values()),
        upperAfter25=min(carrier.values())-(arm_z+arm_depth/2)-screen,
        lowerAfter25=arm_z-arm_depth/2-max(lrear.values())-screen,
        scope='25 mm on each side is a declared screening envelope, not a proved paired native/local/ground movement allowance. No physical arm/fork or force path is admitted.'),
      normalHeadHypothesis=dict(axisXY=head_axis,bowlGrossPlan=[190,190],bowlFloor=bowl_floor,bowlRim=head_rim,
        upperSpoolJoint=upper_joint,lowerLeaderAxis=old_head_axis,lowerSpoolJoint=lower_joint,
        headBottomAfter800=upper_joint+800,headTopAfter800=head_rim+800,
        hoist8350MarginBeforeRigging=8350-head_rim-800,aboveClosedGate6640After800=upper_joint+800-6640,
        catchGrossPlan=[510,260],catchPlanBox=catch_box,catchFloor=catch_floor,catchRim=rear+50,
        catchWaterComparison=70,returnClearSection=[300,120],returnFloor=lfront['SW']+55,
        collarODClear=[198,194],collarTop=collar,dripRingOD=218,dripRingZ=drip,
        lowestWetJoint=bowl_floor-5,jointToDripAfter10=bowl_floor-5-drip-10,
        perpendicularCapClearanceNominal=catch_box[0]-4800,
        previous5000CatchPerpendicularCapOverlap=4800-previous_catch_near_p,
        qualifications=['The 190 mm bowl and 300 mm return are geometry hypotheses, not hydraulic capacities. Spout necks, pressure losses, outlet rating and possible larger bowl remain unresolved.',
          'No head support/shoulder/fork/notch/catch arm has a complete located solid, stock inventory or moment connection. The old 6860 arm and 75 kg/40 kg/4500-point bounds are not inherited.',
          'The SE lower head has different bowl/pipe elevations and is not the reflected SW high head. Its upper extension, side-entry or low-spout solution remains undesigned.',
          'The catch floor/return may be submerged in adverse lower states. Actual backflow, dry-collar water level and safe emergency spill require the full hydraulic route.']),
      skyApertureRevision=dict(oldClearPlan=[4800,7200,4800,7200],
        oneProposedCatchPlanM2=510*260/1e6,oneProposedCatchRainAt216MMhLps=510*260/1e6*.06,
        twoEqualPlanCatchesM2=2*510*260/1e6,twoEqualPlanCatchRainAt216MMhLps=2*510*260/1e6*.06,
        qualification='The 2400 mm square cannot remain labelled unobstructed. The two-catch figure assumes the same plan for the still-undesigned SE head. Supports, spouts and stowed leaves add projections. The 3.60375 L/s full inward-catchment hydraulic comparison avoids credit for this unproved remaining aperture.'),
      leaderLength=dict(diagonalShift=dogleg_shift,bendR=bend_r,straightLength=straight,
        twoBendsLength=math.pi*bend_r,doglegDeveloped=dogleg_length,extraOver300Vertical=dogleg_length-300,
        fromBuriedDatumMinus750ToBowlFloor=pipe_length,remainingWithin8400=8400-pipe_length,
        qualification='Only these declared centreline lengths. Flange take-up, buried offsets, lower-source datum and all component quantities remain to be reconciled.'),
      completeBodyHandling=dict(primarySpillStroke=80,primarySpillInstalledToe=spill_installed,
        primarySpillRetractedToe=spill_stowed,primarySpillRetractedTop=front+80,
        spillTopToCapUnderside=cap[0]-front-80,maximumSpillBelowCarrier=spill_below,
        proposedPrimaryCarrierRest=6350,lowestSpillOnPrimaryRest=6350-spill_below,
        primaryRestSpillToTroughFloorAfter25=6350-spill_below-6100-25,
        lowerCarrierRest=6300,troughFloor=6100,troughRim=6250,stageFloor=5540,
        primaryTopToOpenGate7140=7140-cap[1],
        qualification='The primary needs actual two-saddle support with a void for the long spill. A solid 650 mm square pad and old 261 mm part-height assumption cannot be inherited. No complete swept transfer/reverse receipt is supplied.'),
      firstDiversionProposal=dict(status='UNIMPLEMENTED; REJECT CURRENT TWO-PORT POSITIONS',
        dutyLps=duty,ports150LocalSW=ports,SEReflection='x=12000-x; y unchanged',
        proposedSequence=['Install and support the independent temporary receiving route while the service top blank remains closed.',
          'Prove full flow, continuous rain capture and movement clearances before opening the service blank.',
          'Open service takeoff, then positively blank the normal outlet before any head/spout joint is released.',
          'Keep normal and service route isolation reversible and independently capture leaks from a mis-seated blank.'],
        assumedVentilatedHalfArea150OrificeHeadMM=orifice_head,
        skirt=dict(square=250,length=220,top=skirt_top,bottom=skirt_bottom,roofHungMass='NOT INVENTORIED'),
        receptor=dict(clearSquare=380,floor=receiver_floor,rim=receiver_rim,waterComparison=receiver_water,
          nominalRadialNoncontact=(380-250)/2,unearnedScreeningMotionSettingBudget=53,
          nominalOverlap=receiver_rim-skirt_bottom,nominalBottomToFloor=skirt_bottom-receiver_floor,
          skirtImmersionAt70Water=max(0,receiver_floor+receiver_water-skirt_bottom)),
        collisions=dict(portCentreSeparation=separation,skirtNearestCornerToNormalPipeAxis=nearest,
          skirtToRetained154PipeIntrusion=77-nearest,normalPipeCentreInside380Receptor=normal_inside_receptor,
          normalPortCentreInsideOppositeCornerArm=inside_plan(ports['normal'],old_west_arm),
          servicePortCentreInsideOppositeCornerArm=inside_plan(ports['service'],old_south_arm)),
        requirements=['The proposed skirt collides with the retained normal spool. The receptor also encloses its axis; no first-opening capture pass exists.',
          'Actual corner trimmers and port placement must clear both face carriers, not merely the same-face arm.',
          'The ground outlet/receiving territory, wind shroud, venting, emergency spill, skin/water pressure and movable lower-pipe joints are not located.',
          'Do not introduce an unmodelled rigid roof-to-ground pipe connection. Any roof-hung temporary skirt, wet loading or flexible-joint force requires an explicit source term.']),
      exactNegativeControls=dict(
        lowerCornerArms={'southSolidXYZ':old_south_arm,'westSolidXYZ':old_west_arm,
          'intersectionDimensions':box_overlap(old_south_arm,old_west_arm),
          'conclusion':'Full 150 x 150 x 25 mm intersection in the frozen uniform lowest-bed comparison. Applying a common corner grade to both arms merely translates the conflict. A real corner frame is missing.'},
        primaryCornerArms={'southSolidXYZ':old_primary_south,'westSolidXYZ':old_primary_west,
          'intersectionDimensions':box_overlap(old_primary_south,old_primary_west),
          'conclusion':'Zero nominal plan clearance at the perpendicular arm ends; finite mitres/clearance remain unproved.'},
        secondarySheetCrossing={'sheetQ':4346,'sheetZ':[6421.25,6990],
          'primaryArmQ':[4235,4725],'primaryArmZ':[6605.75-26.5,6605.75-1.5],
          'conclusion':'The frozen primary crossarms cross the continuous secondary sheet. Moving p stations only avoided the lower hangers.'},
        lowShoeRearWall={'downlegQ':4346,'rearWallQ':4375,'downlegToeAboveBed':35,'rearWallHeight':125,
          'deficitToRearWallTop':90,
          'conclusion':'The low shoe cannot convey water across the intact rear wall; its wet opening/pressure seal was never authored.'},
        oldHeadLift={'axis':[4500,4500],'bowlRoofwardEdge':4405,'roofZAtEdge':old_bowl_roof_z,
          'exampleBowlRim':6795,'exampleTopAfter800':7595,
          'sweptReachAboveRoofAtEdge':7595-old_bowl_roof_z,
          'conclusion':'Continuous upward extraction crosses slate. Moving only an upper head outside the ring is a new topology.'},
        wholeDoglegLift={'horizontalPipeTop':6227,'topAfter800':7027,'lowestOldLowerCarrier':6359.35,
          'conclusion':'A connected under-pan dogleg cannot lift with the upper head; separate whole spools and their own routes are needed.'}),
      hydraulicHolds=dict(relative25Earned=False,capacityCalculatedHere=False,
        lowerStageOrCrestShape='Use the separately source-bound high-back/leaf studies. This source does not establish the crest, corner, under-leaf or spout route.',
        leafAuditControls={'net175CommonLevelNormalReserve':1.971895918,
          'front107OnlyNormalReserve':-15.750920863,
          'oneFullNormalCrossingClearLength':399.515919657,'oneFullBlockedCrossingClearLength':467.239475013,
          'twoSerialNormalCrossingsEachClearLength':565.000831963,'twoSerialBlockedCrossingsEachClearLength':660.77640244,
          'qualification':'Historical audit controls, conditional on Cd 0.6/common levels/clear openings. Exact canonical leaf receipt is the authority; ribs/ends/actual pressure distribution are unjoined.'},
        pressureBoundary={'selectedHistorical':6750,'proposedComparison':7100,'adopted':False}),
      stockAndWindHolds=['No complete next dry inventory or per-root allocation. Old 60 kg/m caps, centroid rectangles and 0/full native units cannot be inherited.',
        'Raising walls, lengthening spill/guides, adding high backs, baffle stock, collars, hinges, locks, secondary chute, heads and temporary skirts all require actual quantities.',
        'The fixed primary roof-lap projection to 7340.9029 and secondary baffle 7145 were not completely included in frozen 4eb pressure/stock.',
        'Cap/spill/hem/connection and apron-rib/standoff pressure needs actual full force return. Both normal and stowed leaf projections are required.',
        'New secondary support ownership and head location change wind moments and roof-root reactions. No native replay for this topology exists.',
        'Whole corner supports, wet joints and residual-stock groups require actual contacts. A rigid whole L-pan cannot inherit independent diagonal-half reactions.',
        'Root load introduction, thick-box/heel transition, field/member stiffness and the separate upstream floor/jamb structural conflict remain open.'],
      conclusion='Preserve as an adverse, concrete partial checkpoint. No ordinary rain-safe renewal, hydraulic, local-frame or global structural admission follows.')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=Path(__file__).with_suffix('.json'))
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args();result=calculate();contents=json.dumps(result,indent=2)+'\n'
    if args.check:assert args.output.read_text()==contents,'Rebuild the conditional next-geometry receipt'
    else:args.output.write_text(contents)
    print(json.dumps(dict(status=result['status'],output=str(args.output),source=result['sourceSHA256'],
      arm=result['headArmCorridor'],leaf=result['hingedPrimaryLeaf'],ports=result['firstDiversionProposal']['collisions'],
      leader=result['leaderLength']),indent=2))

if __name__=='__main__':main()
