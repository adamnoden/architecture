"""Bounded PROJECT envelope counterexample; never a route/equipment verdict."""
import hashlib
import json
import math
from pathlib import Path
root = Path(__file__).resolve().parents[3]
b = (root / "project/had/studies/water-replan.json").read_bytes()
assert hashlib.sha1(f"blob {len(b)}\0".encode() + b).hexdigest() == "f7324121f59cc5f1707ea47640dd2b20c26b9bbb"
m = json.loads(b)["model"]
wall = next(w for w in m["groundWalls"] if w["id"] == "loggia-west-weather")
assert wall["holes"] == [] and wall["roomSide"] == "west"
face = wall["finishedFaces"][0]
assert face == 4280.5
# Authored contract, not matched current axle data. Gate initially south.
axis_x, axis_y = 3595, 10030
width, length, rear = 705, 1075, 125
front = length - rear
# At east-facing endpoint, gate-end corners are (x+front,y +/- width/2).
endpoint_x = axis_x + front
assert all(wall["a"][1] <= axis_y + s * width / 2 <= wall["b"][1] for s in [-1, 1])
intrusion = endpoint_x - face
assert intrusion == 264.5 and intrusion > 0
radius = math.hypot(front, width / 2)
actual_bound = face - 25 - radius
guarded_bound = face - 18 - 25 - radius
assert math.isclose(radius, 1013.289321567, abs_tol=0.01)
print(f"REJECTED specified direct pivot: wall intrusion {intrusion:.1f} mm")
print(f"Corner radius {radius:.3f}; isolated-wall sufficient axis X <= {actual_bound:.3f}; with authored18 guard <= {guarded_bound:.3f}")
print("No global absence, admitted product, people, return or complete route claim.")
