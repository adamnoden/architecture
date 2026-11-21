import assert from 'node:assert/strict'
import test from 'node:test'
import { readFloorSectionCuts, recoverFloorSectionCuts } from './current-design/structural-floor-cuts.js'

function field(rectangles: number[][], moment: (x: number,y: number) => number[]) {
  const g = 1/Math.sqrt(3)
  return { maximumAbsoluteBendingPlusTwistingKNmPerM: 999, localStressConvergenceProven: false,
    cells: rectangles.map(r => ({ rectangleXYMm:r, gaussSamples: [-g,g].flatMap(xi => [-g,g].map(eta => {
      const x=(r[0]!+r[2]!+xi*(r[2]!-r[0]!))/2, y=(r[1]!+r[3]!+eta*(r[3]!-r[1]!))/2
      return { xyMm:[x,y],momentKNmPerM:moment(x,y) }
    })) })) }
}
const close = (a: number,b: number) => assert.ok(Math.abs(a-b)<1e-9,`${a} differs from ${b}`)

test('fixed physical cuts integrate signed moments and absolute zero-crossings without bridging holes or erasing peaks', () => {
  const physical = field([[0,0,1000,400],[0,600,1000,1000]],(_x,y) => [y/10-50,2,10])
  const result = recoverFloorSectionCuts(physical,[{id:'STR/south-x',normal:'x',positionMm:250,intervalMm:[0,1000]}])
  const cut=result.cuts[0]!
  close(cut.signedNormalMomentKNm,0);close(cut.signedTwistingMomentKNm,8)
  close(cut.absoluteBendingPlusTwistingKNm,32)
  assert.equal(cut.materialWidthMm,800);assert.deepEqual(cut.gapsMm,[[400,600]])
  assert.equal(result.rawPointEnvelopeKNmPerM,999)
  assert.equal(result.stripResistanceAccepted,false);assert.equal(result.localStressConvergenceProven,false)
  const continuous=recoverFloorSectionCuts(field([[0,0,1000,1000]],(_x,y)=>[y/10-50,2,10]),
    [{id:'STR/zero-crossing',normal:'x',positionMm:250,intervalMm:[0,1000]}]).cuts[0]!
  close(continuous.absoluteBendingPlusTwistingKNm,35)
})

test('second geometry, changed cut and mesh subdivision preserve exact physical integration and unrelated raw control', () => {
  const moment=(x:number,y:number)=>[x/100+y/200,-x/40+y/80,x/250-y/500]
  const cuts=[{id:'STR/north-y',normal:'y',positionMm:700,intervalMm:[1200,3000]}]
  const a=recoverFloorSectionCuts(field([[1200,400,3000,1100]],moment),cuts)
  const b=recoverFloorSectionCuts(field([[1200,400,1800,1100],[1800,400,2400,1100],[2400,400,3000,1100]],moment),cuts)
  for (const key of ['signedNormalMomentKNm','signedTwistingMomentKNm','absoluteBendingPlusTwistingKNm'] as const) close(a.cuts[0]![key],b.cuts[0]![key])
  close(a.cuts[0]!.signedNormalMomentKNm,-78.75)
  const changed=recoverFloorSectionCuts(field([[1200,400,3000,1100]],moment),[{...cuts[0],positionMm:800}])
  assert.notEqual(a.cuts[0]!.signedNormalMomentKNm,changed.cuts[0]!.signedNormalMomentKNm)
  assert.equal(a.rawPointEnvelopeKNmPerM,changed.rawPointEnvelopeKNmPerM)
})

test('ambiguous faces, absent material, overlapping cells and invalid authored or recovered data reject explicitly', () => {
  const physical=field([[0,0,1000,1000]],()=>[1,2,3])
  const cut={id:'STR/x',normal:'x',positionMm:100,intervalMm:[0,1000]}
  assert.throws(()=>recoverFloorSectionCuts(physical,[{...cut,positionMm:0}]),/Ambiguous/)
  assert.throws(()=>recoverFloorSectionCuts(physical,[{...cut,positionMm:1100}]),/no physical material/)
  assert.throws(()=>recoverFloorSectionCuts({...physical,cells:[...physical.cells,...physical.cells]},[cut]),/Overlapping/)
  for (const bad of [[cut,cut],[{...cut,positionMm:NaN}],[{...cut,normal:'z'}],[{...cut,intervalMm:[10,0]}],[{...cut,resistanceAccepted:true}]]) assert.throws(()=>readFloorSectionCuts(bad))
  assert.throws(()=>recoverFloorSectionCuts({...physical,cells:[{...physical.cells[0]!,gaussSamples:physical.cells[0]!.gaussSamples.slice(0,3)}]},[cut]),/four-point/)
  assert.throws(()=>recoverFloorSectionCuts({...physical,cells:[{...physical.cells[0]!,gaussSamples:[...physical.cells[0]!.gaussSamples.slice(0,3),physical.cells[0]!.gaussSamples[0]!]}]},[cut]),/four-point/)
})
