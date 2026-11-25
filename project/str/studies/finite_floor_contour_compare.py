"""Compare all relative contour/wall motions at unchanged physical port stations."""
import argparse, hashlib, json
from pathlib import Path
import numpy as np
from scipy.linalg import eigvalsh


def compare(paths):
    captures=[json.loads(Path(p).read_bytes()) for p in paths]
    for capture in captures:
        if capture['schema']!='ovids-house/str-finite-floor-contour-experiment/1' or any(capture[k] for k in ['nativeFloorAdmission','globalReplacementAvailable','jointResistanceAvailable','nativeConstitutiveEquivalence','outerBandAndChordInterfaceAvailable']):
            raise ValueError('unsupported contour comparison/acceptance')
    first=captures[0]
    for capture in captures[1:]:
        for field in ['inputs','ports','youngKNPerM2','poisson','floorLiveKPa','methodSHA256','runtime']:
            if capture[field]!=first[field]:raise ValueError('changed physical port/source/material comparison: '+field)
    # Fix the lower wall-end six ports solely to quotient common six rigid modes.
    keep=[i for i,p in enumerate(first['ports']) if not p['id'].startswith('wall/0/')]
    changes=[]
    for coarse,fine in zip(captures,captures[1:]):
        a=np.asarray(coarse['condensedStiffness'])[np.ix_(keep,keep)]
        b=np.asarray(fine['condensedStiffness'])[np.ix_(keep,keep)]
        values=eigvalsh(a,b)-1
        changes.append({'fromPitchMm':coarse['pitchMm'],'toPitchMm':fine['pitchMm'],
                        'maximumRelativeEnergySensitivity':float(abs(values).max()),
                        'minimumRelativeEnergyChange':float(values.min()),'maximumRelativeEnergyChange':float(values.max())})
    return {'schema':'ovids-house/str-finite-floor-contour-sensitivity/1','comparisons':changes,
            'captureSHA256':{Path(p).name:hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in paths},
            'processingMethodSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'allMotionEnergySensitivityOnly':True,'convergenceAcceptanceClaimed':False,
            'nativeFloorAdmission':False,'jointResistanceAvailable':False}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('captures',nargs='+',type=Path);p.add_argument('--out',type=Path,required=True);p.add_argument('--check',action='store_true');a=p.parse_args();r=compare(a.captures);text=json.dumps(r,indent=2)+'\n'
    if a.check:
        if a.out.read_text()!=text:raise SystemExit('stale finite contour sensitivity')
    else:a.out.write_text(text)
    print(json.dumps(r['comparisons']))
