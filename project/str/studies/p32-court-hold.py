"""Regenerate the P32 court hold-down and local starter layout."""
import argparse
import json
import math
from pathlib import Path

import court_head_assembly as block
import court_tie_starter_paths as paths
import court_tie_starter_plan as plan

HERE = Path(__file__).resolve().parent


def comparison():
    connector = block.evaluate()
    cage = paths.compare(HERE)
    assert cage['head'] == connector['head'] and cage['headXY'] == connector['capAxis']
    # Compare the tension-steel couple at equal assumed steel stress and
    # unchanged compression resultant. This prices the lever change only.
    reference_z = {'bottomEW':-572, 'bottomNS':-552, 'topEW':-238, 'topNS':-238}
    per_bar_kn = math.pi*20**2/4*(500/1.15)/1000
    penalties = {}
    for key, row in cage['P32trialMats'].items():
        delta = row['centroidStationAndZ'][1]-reference_z[key]
        penalties[key] = {'barCount':len(row['stationAndZ']), 'centroidChangeMm':delta,
                          'lossOfSteelCoupleKNm':len(row['stationAndZ'])*per_bar_kn*abs(delta)/1000}
    theta = math.radians(cage['firstHeadingSouthOfWestDeg'])
    return {'connector':connector,'cage':cage,'changedBeamLevers':penalties,
            'westBendFullYieldH22ForceTurnKN':2*(math.pi*22**2/4)*(500/1.15)*math.sin(theta/2)/1000,
            'admitted':False}


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    check=parser.parse_args().check
    record=comparison()
    outputs={'p32-court-hold.json':json.dumps(record,indent=2,ensure_ascii=False)+'\n',
             'p32-head-block.svg':block.figure(record['connector']),
             'p32-starter-plan.svg':plan.figure(record['cage'])}
    for filename, generated in outputs.items():
        path=HERE/filename
        if check:
            if path.read_text()!=generated:
                raise ValueError(f'Stale {filename}')
        else:
            path.write_text(generated)
    print('P32 connector, starter clearances and construction drawings reproduce.')
