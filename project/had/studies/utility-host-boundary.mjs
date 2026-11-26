/** Exact IAS host qualification withdrawal. No source geometry is exempted. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const semantic=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const utilityHostQualificationWithdrawal={
 sourcePath:'project/ias/studies/utility-host-revised-route.json',
 beforeBlob:'69e6b0aa5e1847f09c7ac3da3b98eec9bf1d5c0b',afterBlob:'6573da78a943647c900ae876d6b0701dbe2ca0cb',
 beforeSemanticSHA256:'21a28518dcb453826ce48fd2e5a80e39fa3511653834d9ee0f5311b8bd85e531',
 afterSemanticSHA256:'75c7062120609841d3bfd584f35261c210117c337dded76398a345cfbadc76c4',
 beforeScheduleBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',afterScheduleBlob:'a6bd16642da10406f74bbd0d4cabb8224525a60b',
 declaredPostCorrection:{appliesToDrawnPost:false,actualDrawnSectionMm:[20,20],actualDrawnWallMm:null,actualDrawnPostMechanicalScreen:false,
  diagnostics:['IAS_HOST_POST_SECTION_MISMATCH'],nonApplicability:'The drawn carrier post is 20 x 20 mm with unspecified wall; the retained 40 x 40 x 3 mm / I75000 comparison does not establish its mechanical capacity.'},
};
export function verifyUtilityHostQualificationWithdrawal(host){
 const r=utilityHostQualificationWithdrawal,copy=structuredClone(host);
 assert(copy?.postComparison,'IAS host post comparison is required');
 for(const[key,value]of Object.entries(r.declaredPostCorrection)){
  assert.deepEqual(copy.postComparison[key],value,'IAS host qualification withdrawal changed: '+key);
  delete copy.postComparison[key];
 }
 assert.equal(semantic(copy),r.beforeSemanticSHA256,'IAS host changed outside the exact declared post qualification withdrawal');
 assert.equal(semantic(host),r.afterSemanticSHA256,'IAS host corrected semantic boundary changed');
 return{...r,retainedComparisonSectionMm:copy.postComparison.section,retainedComparisonIMm4:copy.postComparison.requiredI_mm4,
  actualDrawnPostMechanicalScreen:false,appliesToDrawnPost:false,remainingCompleteHostSemanticsUnchanged:true,
  scope:'Preserve the old40x40x3/I75000 numerical comparison as historical non-applicable evidence. Explicitly deny its application to the actual20x20post with unknown wall. Every other complete host field is checked against the independently retained before-source semantic hash; no geometry or other qualification exclusion.'};
}
