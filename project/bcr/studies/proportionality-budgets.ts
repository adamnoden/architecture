/** Planning-precision burdens, not prices, lifetimes, carbon or performance scores. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d} from '../../../compiler/reference-house/georgian/layout-revision.js'
if(d.id!=='RH-LAYOUT-REVISION-02'||d.shell!==12000||d.court.width!==3500||d.court.x!==4250||d.roof.ridgeInset!==2125||d.roof.upperPitchDeg!==25||d.floor.finish!==20||d.floor.deck!==22||d.floor.joist!==238||d.floor.serviceVoid!==55||d.floor.ceiling!==15)throw Error('Reappraise changed house basis')
const units={wallAreaM2:100,floorAreaM2:100,wallRunM:10,windowNominalMm:[1000,2100],qualification:'unit comparisons, not house quantities or selected fabrication dimensions'}
const wall={ordinaryFinishMm:15,removableTrialMm:15+18+12,extraDepthMm:30,extraRoomFootprintPer10mM2:.3,extraPackageSpacePer100m2M3:3,panelMaterialPer100m2M3:1.2,supportZonePer100m2M3:1.8,panelFaceM2:.6*.9,faceUnitsPer100m2BeforeCuts:Math.ceil(100/(.6*.9))}
const floor={ordinaryMm:20+22+238+55+15,platformTrialMm:15+25+20+22+238+55+15,extraMm:40,extraPackageSpacePer100m2M3:4,wetTrialMm:12.5+1+3+10,wetOverrunBeforeFallsMm:6.5}
const skirting={ordinaryProjectionMm:18,deepTrialProjectionMm:45,westGalleryNominalMm:1015,ordinaryResidualMm:1015-36,deepResidualMm:1015-90,differenceMm:54}
const openings={nominalPerimeterM:2*(1+2.1),qualification:'One hypothetical extra continuous cassette interface adds roughly this nominal perimeter per opening; no selected section, gasket count or quantity takeoff'}
const innerEdge=4*d.court.width/1000,ridge=4*(d.shell-2*d.roof.ridgeInset)/1000,hipPlan=4*Math.SQRT2*d.roof.ridgeInset/1000
const riseHalf=d.roof.ridgeInset*Math.tan(d.roof.upperPitchDeg*Math.PI/180),riseFull=d.court.x*Math.tan(d.roof.upperPitchDeg*Math.PI/180)
const roof={nominalOuterEaveM:4*d.shell/1000,nominalInnerEaveM:innerEdge,ridgeRingM:ridge,outerHipPlanM:hipPlan,innerValleyPlanM:hipPlan,outwardOnlyControl:{collectorEdgeM:48,highCourtTerminationM:14,outerHipPlanM:2*hipPlan,innerValleyPlanM:0,highCourtEdgeMm:d.roof.eaves+riseFull,aboveCurrentRidgeMm:riseFull-riseHalf,aboveCurrentCourtEaveMm:riseFull},qualification:'ideal wall-line geometry only, not covering quantities or an adopted alternative; edge functions are not interchangeable cost units'}
const lowTwinCourtTrial={stripCount:2,runM:4.25,widthM:.3,lidAreaM2:2*4.25*.3,combinedBandM:.75,bandAreaM2:4.25*.75,qualification:'pinned low-twin RWT06/BCR-WATER snapshot, not later higher relief or an adopted floor'}
const stockBoardExample={source:'British Gypsum Gyproc WallBoard 12.5 mm PDS 17 October 2025, p1',sheetM:[1.2,2.4],minimumMassKgPerM2:7.7,minimumSheetMassKg:1.2*2.4*7.7,qualification:'manufacturer minimum, not handling mass ceiling or a V2 panel specification'}
if(floor.platformTrialMm-floor.ordinaryMm!==40||Math.abs(wall.panelMaterialPer100m2M3+wall.supportZonePer100m2M3-wall.extraPackageSpacePer100m2M3)>1e-9||skirting.ordinaryResidualMm-skirting.deepResidualMm!==54)throw Error('Budget arithmetic failed')
const result={basis:d.id,units,wall,floor,skirting,openings,roof,lowTwinCourtTrial,stockBoardExample,excluded:'No whole-house bill, purchase price, maintenance frequency, labour duration, service life, replacement count, reliability ranking or embodied-carbon total is established'}
const path=fileURLToPath(new URL('proportionality-budgets.json',import.meta.url)),content=JSON.stringify(result,null,2)+'\n'
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error('Retained budget stale')}else writeFileSync(path,content)
console.log(content)
