import assert from 'node:assert/strict'
import {test} from 'node:test'
import {compileOrthographicSectionView, hostedFacadeGeometry, sectionProjectionBasis, type HostedFacade} from './section-view.js'
import type {ModelFace3D} from '../publication-drawing/projection-3d.js'

const near = (a: number, b: number) => Math.abs(a - b) < 1e-5
const facade: HostedFacade = {
  id: 'far-asymmetric-elevation', axis: 'x', plane: 4000,
  start: 0, end: 6000, bottom: 0, top: 3600,
  openings: [
    {id: 'upper-window', start: 1500, end: 2600, sill: 1500, head: 2900,
      grid: {columns: 3, rows: 4}},
    {id: 'lower-window', start: 3800, end: 4800, sill: 300, head: 1100}
  ]
}
const roof: ModelFace3D = {
  id: 'asymmetric-roof-field',
  vertices: [
    {x: 2000, y: 0, z: 4800},
    {x: 4000, y: 0, z: 3600},
    {x: 4000, y: 6000, z: 3600},
    {x: 2000, y: 6000, z: 4800}
  ]
}
const section = {axis: 'x', at: 5000, looking: 'negative'} as const
const create = (options: {wall?: HostedFacade; roof?: ModelFace3D; cutFaces?: ModelFace3D[]} = {}) =>
  compileOrthographicSectionView({
    section, facades: [options.wall ?? facade], contextFaces: [options.roof ?? roof], cutFaces: options.cutFaces
  })
const containsLine = (
  output: ReturnType<typeof create>['background'],
  testLine: (q: typeof output[number]) => boolean
) => output.some(testLine)

test('hosted window is an actual absence of wall and shares its source with sash grids', () => {
  const {faces, details} = hostedFacadeGeometry(facade)
  assert.ok(faces.length > 10)
  assert.equal(details.length, 5) // two mullions and three transoms, no free-floating duplicate frame
  assert.ok(details.every(d => d.meaning === 'hosted-aperture:far-asymmetric-elevation/upper-window'))
  assert.ok(!faces.some(f => {
    const ys = f.vertices.map(q => q.y), zs = f.vertices.map(q => q.z)
    return Math.min(...ys) >= 1500 && Math.max(...ys) <= 2600 &&
      Math.min(...zs) >= 1500 && Math.max(...zs) <= 2900
  }))
  const output = create()
  assert.equal(output.cut.length, 0) // no invented solid cut from arbitrary surfaces
  assert.ok(containsLine(output.background, s => near(s.a.z, 3600) && near(s.b.z, 3600) &&
    s.meaning.includes('far-asymmetric-elevation')))
  assert.ok(containsLine(output.background, s => near(s.a.z, 4800) && near(s.b.z, 4800) &&
    s.meaning.includes('asymmetric-roof-field')))
  assert.ok(output.background.some(s => s.meaning.includes('upper-window')))
})

test('unrelated geometry cannot produce a hosted aperture; invalid hosts and overlap fail closed', () => {
  assert.throws(() => hostedFacadeGeometry({...facade, openings: [
    {...facade.openings[0], end: 6100}
  ]}), /does not fit host/)
  assert.throws(() => hostedFacadeGeometry({...facade, openings: [
    facade.openings[0], {...facade.openings[0], id: 'intersecting-window', start: 1600}
  ]}), /overlap/)
  assert.throws(() => hostedFacadeGeometry({...facade, openings: [
    facade.openings[0], {...facade.openings[0]}
  ]}), /Duplicate/)
  assert.throws(() => hostedFacadeGeometry({...facade, openings: [
    {...facade.openings[0], grid: {columns: 0, rows: 3}}
  ]}), /grid/)
})

test('opaque cut cap occludes the central background roof but does not delete it from source', () => {
  const cutFace: ModelFace3D = {id: 'cut-masonry',
    vertices: [
      {x: 5000, y: 2000, z: 3600}, {x: 5000, y: 3000, z: 3600},
      {x: 5000, y: 3000, z: 5000}, {x: 5000, y: 2000, z: 5000}
    ]}
  const v = create({cutFaces: [cutFace]})
  const ridge = v.background.filter(s => near(s.a.z, 4800) && near(s.b.z, 4800) &&
    s.meaning.includes('asymmetric-roof-field'))
  assert.equal(ridge.length, 2)
  assert.ok(ridge.some(s => near(s.b.y, 2000)))
  assert.ok(ridge.some(s => near(s.a.y, 3000)))
  assert.ok(v.cut.length > 0 && v.cut.every(s => s.role === 'cut'))
  assert.ok(v.retainedFaces.some(f => f.id === 'asymmetric-roof-field'))
})

test('cut plane removes forward faces; reversing viewpoint reverses the retained halfspace', () => {
  const opposite = compileOrthographicSectionView({
    section: {...section, looking: 'positive'},
    facades: [facade], contextFaces: [roof]
  })
  assert.equal(opposite.background.length, 0)
  assert.equal(opposite.retainedFaces.length, 0)
  assert.equal(sectionProjectionBasis({...section, looking: 'positive'}).horizontal[1], -1)
  assert.equal(sectionProjectionBasis({axis: 'y', at: 42, looking: 'negative'}).viewDirection[1], 1)
})

test('view clips straddling source faces without inventing section-plane boundary strokes', () => {
  const face: ModelFace3D = {id: 'straddles-cut', vertices: [
    {x: 4500, y: 0, z: 200}, {x: 5500, y: 0, z: 400},
    {x: 5500, y: 1500, z: 400}, {x: 4500, y: 1500, z: 200}
  ]}
  const view = compileOrthographicSectionView({section, contextFaces: [face]})
  assert.equal(view.cut.length, 0)
  assert.equal(view.retainedFaces.length, 1)
  assert.ok(view.retainedFaces[0].vertices.some(p => near(p.x, 5000)))
  assert.ok(!view.background.some(s => near(s.a.x, 5000) && near(s.b.x, 5000) &&
    near(s.a.z, 300) && near(s.b.z, 300) && Math.abs(s.a.y - s.b.y) > 100))
})

test('source mutations propagate to both wall termination and visible roof; no copied silhouette', () => {
  const height = 4020
  const amendedFacade = {...facade, top: height}
  const raisedRoof = {...roof, vertices: roof.vertices.map(p => ({
    ...p, z: p.z + (height - facade.top)
  }))}
  const view = create({wall: amendedFacade, roof: raisedRoof})
  assert.ok(view.background.some(s => near(s.a.z, height) && near(s.b.z, height) &&
    s.meaning.includes('far-asymmetric-elevation')))
  assert.ok(view.background.some(s => near(s.a.z, 5220) && near(s.b.z, 5220) &&
    s.meaning.includes('asymmetric-roof-field')))
  assert.ok(!view.background.some(s => near(s.a.z, 4800) && near(s.b.z, 4800) &&
    s.meaning.includes('asymmetric-roof-field')))
})

test('face ordering is stable, incorrect section caps/geometry are rejected', () => {
  const other: ModelFace3D = {id: 'other-field',
    vertices: [{x: 4500, y: 6200, z: 0}, {x: 4500, y: 6800, z: 0},
      {x: 4500, y: 6800, z: 4000}, {x: 4500, y: 6200, z: 4000}]}
  const one = compileOrthographicSectionView({section, facades: [facade], contextFaces: [other, roof]})
  const two = compileOrthographicSectionView({section, facades: [facade], contextFaces: [roof, other]})
  assert.deepEqual(one, two)
  assert.throws(() => create({cutFaces: [other]}), /not on the section plane/)
  assert.throws(() => create({roof: {...roof, vertices: roof.vertices.map((p, i) =>
    i === 2 ? {...p, z: p.z + 100} : p)}}), /Non-planar/)
  assert.throws(() => create({roof: {...roof, id: 'far-asymmetric-elevation:material:0:0'}}),
    /Duplicate section face/)
})
