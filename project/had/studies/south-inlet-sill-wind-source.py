from contextlib import redirect_stdout
from hashlib import sha1
from io import StringIO
from json import dumps, loads
from math import isclose
from pathlib import Path
from runpy import run_path
import sys


root = Path(__file__).resolve().parents[3]
native_path = 'project/str/studies/reconciled-corner-portals.py'
native_receipt_path = 'project/str/studies/reconciled-corner-portals.json'
opening_path = 'project/str/studies/house-corner-rewind.json'
window_id = 'south-window-4'


class PressureRecorder:
    size = 0

    def __init__(self):
        self.rows = []

    def normal(self, rhs, side, force, elevation, node_z, at=None):
        self.rows.append((side, force, elevation, node_z, at))


def resultant(rows, axes, station):
    force = sum(row[1] for row in rows) / 1000
    first_x = sum(row[1] * station(axes[row[0]] if row[4] is None else row[4]) for row in rows) / 1e6
    first_z = sum(row[1] * row[2] for row in rows) / 1e6
    return {'forceKN': force, 'firstMomentXKNm': first_x, 'firstMomentZKNm': first_z}


def blob(path):
    data = (root / path).read_bytes()
    return sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()


def close(first, second):
    return isclose(first, second, abs_tol=1e-8, rel_tol=0)


def project_source():
    original_argv = sys.argv[:]
    try:
        sys.argv = [str(root / native_path), '--check']
        with redirect_stdout(StringIO()):
            native = run_path(str(root / native_path), init_globals={'definitionsOnly': True})
    finally:
        sys.argv = original_argv

    window = next(row for row in native['ground'] if row['id'] == window_id and row['side'] == 'outer-south')
    upper = next(row for row in native['upstairs'] if row['id'] == window_id and row['side'] == window['side'])
    recorder = PressureRecorder()
    native['Portal'].pressure(recorder, window, upper)
    ground_rows = [row for row in recorder.rows if row[3] < native['floor']]
    by_side = [(0, None), (0, None), (1, None), (1, None)]
    assert len(ground_rows) == 8 and [(row[0], row[4]) for row in ground_rows] == by_side * 2
    assert all(row[2] == row[3] for row in ground_rows)

    axes = native['axes']
    station = lambda x: native['in_plane_station'](window, x)
    window_wind = resultant(ground_rows[:4], axes, station)
    opaque = resultant(ground_rows[4:], axes, station)
    gross = resultant(ground_rows, axes, station)
    old = loads((root / native_receipt_path).read_bytes())
    assert list(axes) == old['jambAxes'] and [native['base'], native['floor'], native['top']] == old['supportZ']
    portal_ax = sorted(station(axis) for axis in axes)
    assert close(sum(portal_ax) / 2, window['new'])
    assert close(window_wind['firstMomentZKNm'] / window_wind['forceKN'] * 1000,
                 native['opening_centroid'](window['sill'], 0))

    pressure = window_wind['forceKN'] / window['area']
    z_bounds = [native['base'], native['floor']]
    gross_width_mm = gross['forceKN'] * 1e6 / (pressure * (z_bounds[1] - z_bounds[0]))
    gross_x = [round(window['new'] - gross_width_mm / 2, 8), round(window['new'] + gross_width_mm / 2, 8)]
    assert close(gross['firstMomentXKNm'], gross['forceKN'] * window['new'] / 1000)
    assert close(gross['firstMomentZKNm'], gross['forceKN'] * sum(z_bounds) / 2000)

    return {
        'schema': 'had-south-inlet-sill-native-wind/1',
        'method': 'reconciled-corner-portals.py::Portal.pressure',
        'sources': {path: blob(path) for path in [native_path, native_receipt_path, opening_path]},
        'windowId': f'GROUND/{window_id}',
        'pressureKPa': pressure,
        'portalAxesXMm': portal_ax,
        'grossProjectedBay': {'x': gross_x, 'z': z_bounds},
        'resultants': {'window': window_wind, 'combinedOpaque': opaque, 'gross': gross},
    }


if __name__ == '__main__':
    result = dumps(project_source(), indent=2) + '\n'
    target = Path(__file__).with_suffix('.json')
    if '--check' in sys.argv:
        assert target.read_text() == result, 'Reproduce the south inlet native wind projection'
    elif '--write' in sys.argv:
        target.write_text(result)
    else:
        sys.stdout.write(result)
