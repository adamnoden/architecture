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
const steelSettingEachMM=5.;
const vec=(a,b)=>a.map((x,i)=>x-b[i]);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const norm=a=>Math.hypot(...a);

export function lowerCapPlanEnvelope(projectionMM,radiusMM=lowerPortEnvelopeRadiusMM){
  assert(Number.isFinite(projectionMM)&&projectionMM>=0);
  assert(Number.isFinite(radiusMM)&&radiusMM>=0);
  const dir=vec(lowerSeatXY,lowerPortXY);
  const length=norm(dir);
  assert(length>0,'Port/seat must not coincide');
  const outward=dir.map(x=>x/length);
  const tangent=[-outward[1],outward[0]];
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

export function lowerCapComparator(){
  const H=deriveCurrentHouse().model;
  const cylinder=H.architecturalServices.plant.cylinder;
  assert.deepEqual(cylinder.centre,[9830,4250]);
  assert.deepEqual(cylinder.body,[9450,3870,760,760]);
  assert.deepEqual(cylinder.westSeat,lowerSeatXY);
  assert.equal(cylinder.cartRadius,cartOverallRadiusMM);

  const recovered25=lowerCapPlanEnvelope(25);
  const reduced15=lowerCapPlanEnvelope(15);
  const rejected30=lowerCapPlanEnvelope(30);
  const N=vec(lowerSeatXY,lowerPortXY).map(v=>v/norm(vec(lowerSeatXY,lowerPortXY)));
  const d=vec(lowerPortXY,cartCentreXY);
  const t=[-N[1],N[0]];
  const across=Math.abs(dot(d,t))+lowerPortEnvelopeRadiusMM;
  const maxProjectionBeforeR400MM=Math.sqrt(maximumRetainedPartRadiusMM**2-across**2)-dot(d,N);

  assert(recovered25.retainedR400ClearanceMM>4&&recovered25.retainedR400ClearanceMM<5);
  assert(recovered25.marginAfterTwo5MMSettingsMM<0);
  assert(reduced15.marginAfterTwo5MMSettingsMM>4);
  assert(rejected30.retainedR400ClearanceMM<0);
  assert(maxProjectionBeforeR400MM>29&&maxProjectionBeforeR400MM<30);

  return {
    status:'LOWER CAP GEOMETRY-ONLY; PRESSURE/RECEIVER/SEAL NOT QUALIFIED',
    selectedCylinderIdentity:{centre:cylinder.centre,body:cylinder.body,westSeat:cylinder.westSeat},
    candidateLowerPortXY:lowerPortXY,candidateLowerPortZ:lowerPortZ,
    proposedEccentricCartCentreXY:cartCentreXY,
    maximumRetainedPartRadiusMM,cartOverallRadiusMM,
    planDiscRadiusMM:lowerPortEnvelopeRadiusMM,
    steelSettingEachMM,
    originalRecoveredProjection:recovered25,
    thinnerUnselectedComparison:reduced15,
    rejectedLongerProjection:rejected30,
    maximumProjectionBeforeR400MM,
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
