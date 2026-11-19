"""Audit ONLY the pinned historical JLG-identified2018 IFC, not current196kg Pecolift.
Use an external environment with ifcopenshell0.8.5; no repository dependency added.
python pecolift-ifc-envelope-audit.py path/to/1001214402_ECOLIFT15_ORANGE_CLOSED_POSITION.ifc
The recovered distributor archive/hash and version boundary are in
../ias-03-pecolift-access-wip.md. Print full mesh spans, not a nominal chassis box.
"""
import hashlib
import sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.geom
EXPECTED={
    '1001214402_ECOLIFT15_ORANGE_CLOSED_POSITION.ifc':'570f3968a4584e4c210cdc95ec56c267ecd13c4248bc434d34e3acf57ec1b6d6',
    '1001214402_ECOLIFT15_ORANGE_ELEVATED_POSITION.ifc':'10a0a06c4d3f1a034a452235fe00b7517febd06199feffb5c5b98ba0f13be264',
}
p=Path(sys.argv[1]);assert hashlib.sha256(p.read_bytes()).hexdigest()==EXPECTED[p.name]
f=ifcopenshell.open(str(p))
units=[u for u in f.by_type('IfcProject')[0].UnitsInContext.Units if u.is_a('IfcSIUnit') and u.UnitType=='LENGTHUNIT']
assert len(units)==1 and units[0].Name=='METRE' and units[0].Prefix is None
els=f.by_type('IfcTransportElement');assert len(els)==1
settings=ifcopenshell.geom.settings();settings.set(settings.USE_WORLD_COORDS,True)
shape=ifcopenshell.geom.create_shape(settings,els[0]);v=shape.geometry.verts
axes=[v[i::3] for i in range(3)]
lo=[min(a)*1000 for a in axes];hi=[max(a)*1000 for a in axes]
span=[b-a for a,b in zip(lo,hi)]
print('HISTORICAL MODEL',els[0].Name)
print('world minimum mm',lo);print('world maximum mm',hi);print('full mesh span mm',span)
# Negative control: neither current990x700 nor old985x700 bounds this native model.
assert span[0]>990 and span[1]>700
print('NEGATIVE: nominal990x700 is not a gross mesh bound for THIS historical IFC')
print('Do not transfer model dimensions, axle or basket coordinates to current196kg without matched identity.')
