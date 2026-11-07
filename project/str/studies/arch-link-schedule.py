"""Common cage stations for the eight corner windows. All elevations are global mm."""
from itertools import pairwise
from math import asin, ceil, cos, pi
import json
from pathlib import Path


def subdivide(stations, maximum, reserved):
    result = [stations[0]]
    for low, high in pairwise(stations):
        segments = 1 if (low, high) in reserved else ceil((high - low) / maximum)
        result.extend(low + (high - low) * step / segments for step in range(1, segments + 1))
    return result


barrier_rows = (4400, 4720)
guard_rows = (5430, 5570)
# 55 mm nominal elsewhere. The four reserved penetrations use one shop-set
# pair each. Specify and inspect the actual maximum pitch of 58 throughout,
# including BOTH intervals adjoining each port. A 58 mm pair cannot also
# take an additional +3 mm manufacturing error.
jamb_ports = [(z - 27, z + 27) for z in barrier_rows] + [(z - 29, z + 29) for z in guard_rows]
# The two short approach bays at the floor keep the actual 16 mm aggregate
# traversing the foot at Z3358. The top of the common jamb is at the spring
# centreline, whose nominal elevation follows the actual 1000/300 opening.
jamb_special = jamb_ports + [(3330, 3386)]
model = json.loads((Path(__file__).resolve().parents[2]/'had/studies/water-replan.json').read_text())['model']
opening = next(row for row in model['openings']['FIRST'] if row['wall']=='outer-south' and row['centre']==1800)
rise=opening['head']-opening['spring']; half=opening['width']/2; radius=half**2/(2*rise)+rise/2
angle=asin(half/radius);centre_radius=radius+215/2
spring=3450+opening['head']-radius+centre_radius*cos(angle)
arc=subdivide([0,2*centre_radius*angle],55,[])
jamb_control = sorted({3035, 4000, 5500, spring, *(v for pair in jamb_special for v in pair)})
jamb = subdivide(jamb_control, 55, jamb_special)
# Reposition local H10 pier links around both temporary and permanent sleeves.
pier_ports = [(z - 36, z + 36) for z in barrier_rows + guard_rows]
pier = subdivide(sorted({4000, 6200, *(v for pair in pier_ports for v in pair)}), 150, pier_ports)
assert max(b-a for a,b in pairwise(jamb)) == 58
assert max(b-a for a,b in pairwise(pier)) <= 150

def clear(side, rows, diameter):
    levels, bar = (pier, 10) if side == 'near' else (jamb, 6)
    return min(abs(row-z) for row in rows for z in levels) - (diameter+bar)/2

schedule = {
    'archH6CentrelineChainageFromNearSpring':arc, 'oppositeJambH6GlobalZ': jamb, 'nearPierH10GlobalZ': pier,
    'guardSleeveCentresGlobalZ': guard_rows, 'barrierSocketCentresGlobalZ': barrier_rows,
    'oppositeDrawnNominalSpacing': 55, 'oppositeRequiredMaximumAsBuilt': 58,
    'minimumBarDiameterComparison': .95 * 6,
    'H6AdverseResistanceNPerMM': pi*(.95*6)**2/4*500/1.15/58,
    'placing': 'Inspect joint socket/cage setout, every final spacing and minimum bar area. The two 58 mm sleeve bays have no positive pitch allowance. Cast the sockets with the cage rather than drilling the finished pier.'
}
