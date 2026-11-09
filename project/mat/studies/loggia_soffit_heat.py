"""Two-dimensional dry wall-head cut. Standard-library finite volumes, per metre."""
from math import sqrt


def wall_head(step, brick_to_slab, glass=200):
    # Relative to the cold face of the warm west core and RC underside. The
    # side, top/bottom cuts not adjacent to prescribed air are adiabatic.
    x0, z0, width, height = -300, -700, 1200, 1100
    nx, nz = round(width/step), round(height/step)

    def material(x, z):
        if z >= 280:
            return "warm"
        if z >= 200:
            return 1.4                    # combined 65+15 wearing/service field
        if z >= 0:
            return 1.75                   # the continuous RC200 first floor
        if x < -167:
            return "warm"
        if x < -140:
            return .57
        if x < 0:
            return .77
        if x < glass:
            return .041
        if brick_to_slab and x < glass+152.5:
            return "cold" if x < glass+50 else .77
        if z >= -240:
            return .041
        if x >= glass+152.5 and z >= -280:
            return .57                    # thermally equivalent mineral lining
        if x >= glass+50 and x < glass+152.5 and z < -300:
            return .77
        return "cold"                     # open cavity and outdoor soffit air

    cells = {(i,j):material(x0+(i+.5)*step,z0+(j+.5)*step)
             for i in range(nx) for j in range(nz)}
    nodes = {ij:n for n, ij in enumerate(p for p,k in cells.items() if isinstance(k,float))}
    diag, rhs, edges, films = [0.]*len(nodes), [0.]*len(nodes), [], []
    for (i,j), n in nodes.items():
        k = cells[i,j]
        for adj in ((i+1,j),(i-1,j),(i,j+1),(i,j-1)):
            other = cells.get(adj)
            if other is None:
                continue
            if adj in nodes:
                g = 2*k*other/(k+other)
                diag[n] += g
                if n < nodes[adj]:
                    edges.append((n,nodes[adj],g))
            else:
                resistance, air = (.13,20.) if other=="warm" else (.04,0.)
                g = (step/1000)/(step/2000/k+resistance)
                diag[n] += g
                rhs[n] += g*air
                films.append((n,g,resistance,air))

    def apply(v):
        out = [d*t for d,t in zip(diag,v)]
        for a,b,g in edges:
            out[a] -= g*v[b]
            out[b] -= g*v[a]
        return out

    t = [10.]*len(nodes)
    r = [a-b for a,b in zip(rhs,apply(t))]
    p = [v/d for v,d in zip(r,diag)]
    rz = sum(a*b for a,b in zip(r,p))
    for _ in range(1600):
        ap = apply(p)
        alpha = rz/sum(a*b for a,b in zip(p,ap))
        t = [v+alpha*s for v,s in zip(t,p)]
        r = [v-alpha*s for v,s in zip(r,ap)]
        z = [v/d for v,d in zip(r,diag)]
        new = sum(a*b for a,b in zip(r,z))
        if sqrt(new)<1e-8:
            break
        p = [a+new/rz*b for a,b in zip(z,p)]
        rz = new
    else:
        raise ArithmeticError("Wall-head temperature did not converge")
    warm = sum(g*(air-t[n]) for n,g,_,air in films if air==20)
    cold = sum(g*(t[n]-air) for n,g,_,air in films if air==0)
    coldest = min(air-g*(air-t[n])/(step/1000)*res for n,g,res,air in films if air==20)
    assert abs(warm-cold)<1e-5
    return {"cellMM":step,"brickAndOpenCavityToRC":brick_to_slab,
            "fromRoomWPerM":round(warm,4),"lowestWarmSurfaceC":round(coldest,4)}
