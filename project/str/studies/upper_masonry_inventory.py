"""Disjoint ordinary upper clear-core material; no arch/infill mass credit."""
import math

from foundation_solid_weight import disjoint_solid_union, subtract_box
from vertical_rc_floor import clear_intervals


def _subtract(rows, boxes):
    for box in boxes:
        rows = [{**row, 'boxXYZMm': piece} for row in rows
            for piece in subtract_box(row['boxXYZMm'], box)]
    return rows


def upper_clear_core_inventory(house, axes, rc_rectangles, seats, density=20.,
        bottom_z=3370., top_z=6540., pad_depth=10.):
    values = (density, bottom_z, top_z, pad_depth)
    if any(type(v) not in (int, float) or not math.isfinite(v) for v in values) or not 0 <= density <= 30 or not 0 < pad_depth < top_z-bottom_z:
        raise ValueError('Finite explicit upper body density, datums and positive pad thickness required')
    rows = []
    for family, lo, hi in (('outer', axes['A'], axes['B']), ('court', axes['C'], axes['E'])):
        for face, axis, datum in (('south',0,lo), ('east',1,hi), ('north',0,hi), ('west',1,lo)):
            name = family+'-'+face; holes = []
            for opening in house['archOpeningRegister']['FIRST']:
                if opening['wall'] == name:
                    reserve = opening['radialRingTrial']
                    holes.append((opening['centre']-opening['width']/2-reserve,
                        opening['centre']+opening['width']/2+reserve))
            for a,b in clear_intervals(lo-70,hi+70,holes):
                r = [a,datum-70,b,datum+70] if axis == 0 else [datum-70,a,datum+70,b]
                rows.append({'id': 'UPPER-CLEAR/'+name+'/'+str(a), 'kind': 'ordinary-upper-core',
                    'boxXYZMm': [r[0],r[1],bottom_z,r[2],r[3],top_z]})
    for wall in house['upperWalls']:
        if (wall['a'][0] == wall['b'][0]) == (wall['a'][1] == wall['b'][1]):
            raise ValueError('Actual finite axis-aligned upper wall required')
        axis = 0 if wall['a'][0] != wall['b'][0] else 1
        lo = max(axes['A']-70, min(wall['a'][axis],wall['b'][axis]))
        hi = min(axes['B']+70, max(wall['a'][axis],wall['b'][axis]))
        if hi <= lo: continue
        c0,c1 = wall['structuralCore']
        if c1 <= c0: raise ValueError('Positive actual upper wall core required')
        for a,b in clear_intervals(lo,hi,wall.get('holes',[])):
            r = [a,c0,b,c1] if axis == 0 else [c0,a,c1,b]
            rows.append({'id': 'UPPER-CLEAR/'+wall['id']+'/'+str(a), 'kind': 'ordinary-upper-core',
                'boxXYZMm': [r[0],r[1],bottom_z,r[2],r[3],top_z]})
    bodies = _subtract(disjoint_solid_union(rows),
        [[r[0],r[1],bottom_z,r[2],r[3],top_z] for r in rc_rectangles])
    # As for arch reservations, use only uninterrupted vertical columns here.
    # A full-height projected service strip withholds the unknown load path
    # above/below the real circular hole; it is not an exact net-hole takeoff.
    wall_axes = {family+'-'+face:(axis,datum) for family,lo,hi in
        (('outer',axes['A'],axes['B']),('court',axes['C'],axes['E']))
        for face,axis,datum in (('south',0,lo),('east',1,hi),('north',0,hi),('west',1,lo))}
    service_omissions=[]
    for port in house.get('exteriorPortGeometry',[]):
        if port['p'][2]+port['r']<=bottom_z or port['p'][2]-port['r']>=top_z:continue
        if port['wall'] not in wall_axes:raise ValueError('Upper service hole has no supported source wall')
        axis,datum=wall_axes[port['wall']];u=port['p'][axis];r=port['r']
        rectangle=[u-r,datum-70,u+r,datum+70] if axis==0 else [datum-70,u-r,datum+70,u+r]
        box=[rectangle[0],rectangle[1],bottom_z,rectangle[2],rectangle[3],top_z]
        service_omissions.append({'id':port['id'],'boxXYZMm':box,
            'actualHoleCentreXYZMm':port['p'],'actualHoleRadiusMm':r,
            'policy':'full-height projected clear-column omission; not exact circular-hole volume'})
    bodies=_subtract(bodies,[r['boxXYZMm'] for r in service_omissions])
    seat_ids = set(); pads = []; columns = []
    for seat in seats:
        if set(seat) != {'id','xyMm','padWidthMm','settingToleranceMm'} or seat['id'] in seat_ids:
            raise ValueError('Exact unique named bearing seats required')
        seat_ids.add(seat['id']); x,y = seat['xyMm']; w,t = seat['padWidthMm'],seat['settingToleranceMm']
        if any(type(v) not in (int,float) or not math.isfinite(v) for v in (x,y,w,t)) or w <= 0 or t < 0:
            raise ValueError('Finite positive pad width and nonnegative setting required')
        expanded = [x-w/2-t,y-w/2-t,bottom_z,x+w/2+t,y+w/2+t,top_z]
        residual = _subtract([{'id':'fit','boxXYZMm':expanded}], [row['boxXYZMm'] for row in bodies])
        if residual: raise ValueError('Complete pad plus setting envelope leaves actual clear masonry: '+seat['id'])
        column = [x-w/2,y-w/2,bottom_z,x+w/2,y+w/2,top_z-pad_depth]
        pad = [x-w/2,y-w/2,top_z-pad_depth,x+w/2,y+w/2,top_z]
        if any(not (column[3] <= r['boxXYZMm'][0] or r['boxXYZMm'][3] <= column[0]
                or column[4] <= r['boxXYZMm'][1] or r['boxXYZMm'][4] <= column[1]) for r in columns):
            raise ValueError('Bearing columns overlap; independent body weight cannot be duplicated')
        columns.append({'id':seat['id'],'boxXYZMm':column,'xyMm':[x,y]})
        pads.append({'id':seat['id']+'/PAD','boxXYZMm':pad,'xyMm':[x,y]})
    free = _subtract(bodies,[r['boxXYZMm'] for r in columns+pads])
    def takeoff(items):
        volume = 0.; first = [0.,0.,0.]
        for row in items:
            a,b,c,d,e,f = row['boxXYZMm']; v = (d-a)*(e-b)*(f-c)/1e9
            volume += v
            for i,centre in enumerate(((a+d)/2,(b+e)/2,(c+f)/2)):first[i] += v*centre
        return {'volumeM3':volume,'physicalGKN':volume*density,
            'volumeFirstMomentsM3Mm':first,'weightFirstMomentsKNMm':[v*density for v in first]}
    full, free_tot, column_tot, pad_removed = map(takeoff,(bodies,free,columns,pads))
    if abs(full['volumeM3']-sum(r['volumeM3'] for r in (free_tot,column_tot,pad_removed))) > 1e-10:
        raise ValueError('Upper body/seat/pad replacement loses or duplicates actual material')
    return {'schema':'str-upper-clear-masonry-inventory/1','bodyBoxes':bodies,'freeTopBodyBoxes':free,
        'serviceColumnOmissions':service_omissions,'serviceHeadAndSillGravityIncluded':False,
        'seatColumns':columns,'padBoxes':pads,'fullMasonryBeforePads':full,'freeTopMasonry':free_tot,
        'seatMasonry':column_tot,'removedPadMasonry':pad_removed,'densityKNPerM3':density,
        'masonryPhysicalGKN':full['physicalGKN']-pad_removed['physicalGKN'],
        'archSpandrelSillAndFinishIncluded':False,'wallLateralResistanceCredited':False,
        'materialAccepted':False,'candidateAccepted':False}
