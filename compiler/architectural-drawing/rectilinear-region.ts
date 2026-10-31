import { mm } from '../units.js'
import type { AdeModelPoint } from './model.js'
import type { AdeModelRect } from './topology.js'

const EPSILON = 1e-6

interface DirectedEdge {
  a: [number, number]
  b: [number, number]
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= EPSILON
const pointKey = (point: [number, number]): string => `${point[0]}:${point[1]}`
const uniqueSorted = (values: readonly number[]): number[] => [...new Set(values)].sort((a, b) => a - b)

const pointInRing = (x: number, y: number, ring: readonly AdeModelPoint[]): boolean => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].x
    const yi = ring[i].y
    const xj = ring[j].x
    const yj = ring[j].y
    const crosses = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (crosses) inside = !inside
  }
  return inside
}

const pointInEvenOddRegion = (x: number, y: number, rings: readonly (readonly AdeModelPoint[])[]): boolean =>
  rings.reduce((inside, ring) => pointInRing(x, y, ring) ? !inside : inside, false)

const pointInRect = (x: number, y: number, rect: AdeModelRect): boolean =>
  x > rect.x0 - EPSILON && x < rect.x1 + EPSILON && y > rect.y0 - EPSILON && y < rect.y1 + EPSILON

const simplifyRing = (ring: readonly [number, number][]): [number, number][] => {
  if (ring.length <= 3) return [...ring]
  let points = [...ring]
  let changed = true
  while (changed && points.length > 3) {
    changed = false
    const next: [number, number][] = []
    for (let index = 0; index < points.length; index += 1) {
      const prev = points[(index - 1 + points.length) % points.length]
      const current = points[index]
      const after = points[(index + 1) % points.length]
      const collinear = (near(prev[0], current[0]) && near(current[0], after[0])) ||
        (near(prev[1], current[1]) && near(current[1], after[1]))
      if (collinear) changed = true
      else next.push(current)
    }
    points = next
  }
  return points
}

const signedArea = (ring: readonly [number, number][]): number => {
  let area = 0
  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index]
    const [x2, y2] = ring[(index + 1) % ring.length]
    area += x1 * y2 - x2 * y1
  }
  return area / 2
}

const traceRings = (edges: readonly DirectedEdge[]): [number, number][][] => {
  const outgoing = new Map<string, DirectedEdge[]>()
  for (const edge of edges) {
    const key = pointKey(edge.a)
    const list = outgoing.get(key) ?? []
    list.push(edge)
    outgoing.set(key, list)
  }
  for (const [key, list] of outgoing) {
    if (list.length > 1) {
      throw new Error(`ADE rectilinear region has ambiguous point-touch topology at ${key}.`)
    }
  }

  const edgeId = (edge: DirectedEdge): string => `${pointKey(edge.a)}>${pointKey(edge.b)}`
  const unused = new Set(edges.map(edgeId))
  const byId = new Map(edges.map((edge) => [edgeId(edge), edge]))
  const rings: [number, number][][] = []

  while (unused.size > 0) {
    const firstId = [...unused].sort()[0]
    const first = byId.get(firstId)
    if (!first) throw new Error('ADE rectilinear region internal edge lookup failure.')
    const startKey = pointKey(first.a)
    const ring: [number, number][] = [first.a]
    let current = first

    while (true) {
      const currentId = edgeId(current)
      if (!unused.delete(currentId)) throw new Error(`ADE rectilinear region repeated boundary edge ${currentId}.`)
      const endKey = pointKey(current.b)
      if (endKey === startKey) break
      ring.push(current.b)
      const next = (outgoing.get(endKey) ?? []).find((candidate) => unused.has(edgeId(candidate)))
      if (!next) throw new Error(`ADE rectilinear region has an open boundary at ${endKey}.`)
      current = next
    }

    const simplified = simplifyRing(ring)
    if (simplified.length < 4) throw new Error('ADE rectilinear region collapsed below four corners.')
    rings.push(simplified)
  }

  return rings.sort((a, b) => {
    const areaDifference = Math.abs(signedArea(b)) - Math.abs(signedArea(a))
    if (!near(areaDifference, 0)) return areaDifference
    const minA = [Math.min(...a.map((point) => point[0])), Math.min(...a.map((point) => point[1]))]
    const minB = [Math.min(...b.map((point) => point[0])), Math.min(...b.map((point) => point[1]))]
    return minA[0] - minB[0] || minA[1] - minB[1]
  })
}

export const subtractRectilinearRectangles = (
  rings: readonly (readonly AdeModelPoint[])[],
  cutouts: readonly AdeModelRect[]
): readonly (readonly AdeModelPoint[])[] => {
  if (cutouts.length === 0) return rings
  if (rings.length === 0) throw new Error('ADE rectilinear subtraction requires at least one source ring.')

  const points = rings.flat()
  const xs = uniqueSorted([
    ...points.map((point) => point.x),
    ...cutouts.flatMap((rect) => [rect.x0, rect.x1])
  ])
  const ys = uniqueSorted([
    ...points.map((point) => point.y),
    ...cutouts.flatMap((rect) => [rect.y0, rect.y1])
  ])
  if (xs.length < 2 || ys.length < 2) throw new Error('ADE rectilinear subtraction has insufficient coordinate breaks.')

  const filled: boolean[][] = Array.from({ length: xs.length - 1 }, () => Array<boolean>(ys.length - 1).fill(false))
  for (let xi = 0; xi < xs.length - 1; xi += 1) {
    for (let yi = 0; yi < ys.length - 1; yi += 1) {
      const cx = (xs[xi] + xs[xi + 1]) / 2
      const cy = (ys[yi] + ys[yi + 1]) / 2
      const inSource = pointInEvenOddRegion(cx, cy, rings)
      const inCutout = cutouts.some((rect) => pointInRect(cx, cy, rect))
      filled[xi][yi] = inSource && !inCutout
    }
  }

  const isFilled = (xi: number, yi: number): boolean =>
    xi >= 0 && yi >= 0 && xi < xs.length - 1 && yi < ys.length - 1 && filled[xi][yi]

  const edges: DirectedEdge[] = []
  for (let xi = 0; xi < xs.length - 1; xi += 1) {
    for (let yi = 0; yi < ys.length - 1; yi += 1) {
      if (!filled[xi][yi]) continue
      const x0 = xs[xi]
      const x1 = xs[xi + 1]
      const y0 = ys[yi]
      const y1 = ys[yi + 1]
      if (!isFilled(xi, yi - 1)) edges.push({ a: [x0, y0], b: [x1, y0] })
      if (!isFilled(xi + 1, yi)) edges.push({ a: [x1, y0], b: [x1, y1] })
      if (!isFilled(xi, yi + 1)) edges.push({ a: [x1, y1], b: [x0, y1] })
      if (!isFilled(xi - 1, yi)) edges.push({ a: [x0, y1], b: [x0, y0] })
    }
  }

  if (edges.length === 0) throw new Error('ADE rectilinear subtraction removed the entire source region.')
  return traceRings(edges).map((ring) => ring.map(([x, y]) => ({ x: mm(x), y: mm(y) })))
}
