/** Conditional lower-cylinder cap/cart geometric challenger.
 * Nothing here represents a pressure-rated fitting or selected house.
 * The recovered flat face and eccentric cart centre are explicit candidate
 * inputs, not inferred catalogue properties.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';

const lowerPortXY=[10131.50,4018.71],lowerPortZ=380.;
const lowerSeatXY=[10195.,3970.];
const cartCentreXY=[9847.,4250.],maximumRetainedPartRadiusMM=400.;
const cartOverallRadiusMM=425.;
const lowerPortEnvelopeRadiusMM=45.;
const boltTangentMM=37, boltHeightMM=12, shaftRadiusMM=7;
const steelSettingEachMM=5.;
const vec=(a,b)=>a.map((x,i)=>x-b[i]);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const norm=a=>Math.hypot(...a);
const direction=vec(lowerSeatXY,lowerPortXY);
const length=norm(direction);
assert(length>0,'Port/seat must not coincide');
const outward=direction.map(x=>x/length);
const tangent=[-outward[1],outward[0]];

export function lowerCapPlanEnvelope(projectionMM,radiusMM=lowerPortEnvelopeRadiusMM){
  assert(Number.isFinite(projectionMM)&&projectionMM>=0);
  assert(Number.isFinite(radiusMM)&&radiusMM>=0);
  const d=vec(lowerPortXY,cartCentreXY);
  const along=dot(d,outward),across=Math.abs(dot(d,tangent));
  // Exact maximum radius for a radius-r vertical flange disc over a uniform
  // outward projection [0,d]. One disc tangent edge lies on the worst radial
  // line and the farther of the two axial end planes governs. No angular mesh.
  const maximumNormal=Math.max(Math.abs(along),Math.abs(along+projectionMM));
  const maximumRadialMM=Math.hypot(maximumNormal,across+radiusMM);
  return {
    projectionMM,radiusMM,maximumRadialMM,
    retainedR400ClearanceMM:maximumRetainedPartRadiusMM-maximumRadialMM,
    grossR425ClearanceMM:cartOverallRadiusMM-maximumRadialMM,
    marginAfterTwo5MMSettingsMM:maximumRetainedPartRadiusMM-maximumRadialMM-2*steelSettingEachMM,
    geometricRetentionCondition:maximumRadialMM<=maximumRetainedPartRadiusMM,
  };
}

function shaftStartToCylinderEnvelope(projectionMM,cylinder){
  assert(lowerPortZ-boltHeightMM>0&&lowerPortZ+boltHeightMM<cylinder.height);
  const fromCentre=vec(lowerPortXY,cylinder.centre);
  const shaftCentres=[-boltTangentMM,boltTangentMM].map(offset=>
    fromCentre.map((x,i)=>x+offset*tangent[i]+projectionMM*outward[i]));
  // Both starts lie within the vessel's height and point away from its axis.
  // Thus the bolt-plane shaft capsule governs on the modelled cylinder body.
  assert(shaftCentres.every(p=>dot(p,outward)>0));
  return Math.min(...shaftCentres.map(norm))-cylinder.body[2]/2-shaftRadiusMM;
}

function lowerCapDriverParking(projectionMM){
  // Local coordinates (normal, tangent, height from port). The parked face
  // stays normal to its straight rail. Its flat disc alone is enough to
  // falsify a parking/driver combination without assuming the shoe geometry.
  const driverLengthMM=240, leverLengthMM=150, handRadiusMM=50;
  const requiredMM=25, leverTravelDeg=15;
  const driverEndMM=projectionMM+driverLengthMM;
  const oldStopMM=60, proposedStopMM=280;
  const shaftGap=(stopMM)=>Math.max(projectionMM-stopMM,stopMM-driverEndMM,0)-shaftRadiusMM;
  const handGap=(outboard,angleDeg)=>{
    const angle=angleDeg*Math.PI/180;
    const handNormal=driverEndMM+leverLengthMM*Math.sin(angle);
    const handTangent=boltTangentMM+(outboard?1:-1)*leverLengthMM*Math.cos(angle);
    const fromDiscRim=Math.max(Math.hypot(handTangent,boltHeightMM)-lowerPortEnvelopeRadiusMM,0);
    return Math.hypot(handNormal-proposedStopMM,fromDiscRim)-handRadiusMM;
  };

  // The flat disc covers all four bolt-centred shaft lines in its plane.
  assert(Math.hypot(boltTangentMM,boltHeightMM)<lowerPortEnvelopeRadiusMM);
  const inboardWitnessDeg=10;
  return {
    requiredMM,oldStopMM,proposedStopMM,projectionMM,
    oldStopShaftSignedGapMM:shaftGap(oldStopMM),
    proposedStopShaftSignedGapMM:shaftGap(proposedStopMM),
    proposedStopShaftCentrelineDistanceMM:shaftGap(proposedStopMM)+shaftRadiusMM,
    shaftOnlyMinimumStopMM:driverEndMM+shaftRadiusMM+requiredMM,
    inboardLeverWitnessDeg:inboardWitnessDeg,
    inboardLeverHandGapMM:handGap(false,inboardWitnessDeg),
    // Throughout ±15° the outboard hand stays at least this far from the
    // disc in the transverse plane alone. Reflection covers all four bolts.
    outboardLeverHandGapLowerMM:Math.hypot(
      boltTangentMM+leverLengthMM*Math.cos(leverTravelDeg*Math.PI/180),boltHeightMM,
    )-lowerPortEnvelopeRadiusMM-handRadiusMM,
  };
}

export function lowerCapComparator(H=deriveCurrentHouse().model){
  const cylinder=H.architecturalServices.plant.cylinder;
  assert.deepEqual(cylinder.centre,[9830,4250]);
  assert.deepEqual(cylinder.body,[9450,3870,760,760]);
  assert.deepEqual(cylinder.westSeat,lowerSeatXY);
  assert.equal(cylinder.cartRadius,cartOverallRadiusMM);

  const recovered25=lowerCapPlanEnvelope(25);
  const reduced15=lowerCapPlanEnvelope(15);
  const rejected30=lowerCapPlanEnvelope(30);
  const d=vec(lowerPortXY,cartCentreXY);
  const across=Math.abs(dot(d,tangent))+lowerPortEnvelopeRadiusMM;
  const maximumProjection=retainedRadius=>Math.sqrt(retainedRadius**2-across**2)-dot(d,outward);
  const maximumProjectionBeforeR400MM=maximumProjection(maximumRetainedPartRadiusMM);
  const maximumProjectionAfterTwo5MMSettingsMM=maximumProjection(maximumRetainedPartRadiusMM-2*steelSettingEachMM);

  assert(recovered25.retainedR400ClearanceMM>4&&recovered25.retainedR400ClearanceMM<5);
  assert(recovered25.marginAfterTwo5MMSettingsMM<0);
  assert(reduced15.marginAfterTwo5MMSettingsMM>4);
  assert(rejected30.retainedR400ClearanceMM<0);
  assert(maximumProjectionBeforeR400MM>29&&maximumProjectionBeforeR400MM<30);

  return {
    status:'LOWER CAP GEOMETRY-ONLY; PRESSURE/RECEIVER/SEAL NOT QUALIFIED',
    selectedCylinderIdentity:{centre:cylinder.centre,body:cylinder.body,westSeat:cylinder.westSeat},
    candidateLowerPortXY:lowerPortXY,candidateLowerPortZ:lowerPortZ,
    proposedEccentricCartCentreXY:cartCentreXY,
    maximumRetainedPartRadiusMM,cartOverallRadiusMM,
    planDiscRadiusMM:lowerPortEnvelopeRadiusMM,
    boltPattern:{tangentOffsetMM:boltTangentMM,heightOffsetMM:boltHeightMM},
    steelSettingEachMM,
    originalRecoveredProjection:recovered25,
    thinnerUnselectedComparison:reduced15,
    rejectedLongerProjection:rejected30,
    maximumProjectionBeforeR400MM,maximumProjectionAfterTwo5MMSettingsMM,
    driverParking:{
      boundary:'Parked flange disc alone. Shoe, carrier, rails, arm, adjacent solids and tools remain separate.',
      recovered25:lowerCapDriverParking(recovered25.projectionMM),
      thinner15:lowerCapDriverParking(reduced15.projectionMM),
    },
    localCylinderEnvelope:{
      thinner15ShaftGapMM:shaftStartToCylinderEnvelope(reduced15.projectionMM,cylinder),
      cartSettingLimitShaftGapMM:shaftStartToCylinderEnvelope(maximumProjectionAfterTwo5MMSettingsMM,cylinder),
      boundary:'The 25 mm remote comparison at the local bolt/shell interface is conditional. The actual boss, socket, shell and clearance need a matched detail.',
    },
    holds:[
      'The 45 mm disc radius must include all bolt heads and a matched boss, not a drawn circular outline alone.',
      'The reduced 15 mm projection is not a factory pressure-rated fitting or an available gasket/seal/torque stack.',
      'The actual cylinder and cart centre, supports, pressure/touch-temperature duties, insulation and transport hardware must be verified together.',
      'Do not release the lower tail before its independent positive capture and zero-pressure proof, or borrow the old 595 mm cylinder handling sequence.',
    ],
  };
}
if(process.argv[1]===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(lowerCapComparator(),null,2));
