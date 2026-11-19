"""Locate one outward 160/180 section control before choosing a house structure."""
import json
from pathlib import Path
import runpy
import sys

D=Path(__file__).resolve().parent
geometry=runpy.run_path(str(D/'arch-width-geometry.py'))['control']
controls=[geometry(width) for width in (160,180)]
for control in controls:
    assert control['insideConcreteFace']==140
    assert control['minimumAsBuiltWidthComparison']==control['normalWidthNominal']-10
    assert control['parallelBarClearAfterTwo5']>25
    assert control['remainingOrdinaryGlass']>=70
output={
    'role':'One outward-widened RC inner arch and jamb, screened at160/180 nominal. Both are explicit proposals. The genuine outer masonry and full window opening stay the references.',
    'controls':controls,
    'continuedFoot':'The 225 foot and its 25 glass/50 drained gap remain distinct. Do not extrapolate the ordinary upper section into the floor cage.',
    'structuralHolds':['The new coupled kernel includes normal centroid offsets; complete absolute all-head gravity/wind transfer and minimum-section stiffness remain open.',
                       'Keep main H20 restraint, curved H16 tails, old and new closed hoops and real sleeves in one cage.',
                       'Conserve actual added-body gravity, count intersections once, and use a justified lower mass for any favourable axial strength.',
                       'Join the local L reference line/shear centre transition and end stiffness.',
                       'Qualify the rear-west barrier access at the fixed cabinet.'],
    'admitted':False
}
text=json.dumps(output,indent=2,sort_keys=True)+'\n'
path=Path(__file__).with_suffix('.json')
if '--check' in sys.argv:assert path.read_text()==text
else:path.write_text(text)
