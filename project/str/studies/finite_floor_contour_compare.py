"""Compare all relative contour/wall motions at unchanged physical port stations."""
import argparse, copy, hashlib, json, math
from pathlib import Path
import numpy as np
from scipy.linalg import eigvalsh
from finite_floor_contour_run import source_input


def compare(paths):
    captures=[json.loads(Path(p).read_bytes()) for p in paths]
    for capture in captures:
        if capture['schema']!='ovids-house/str-finite-floor-contour-experiment/1' or any(capture[k] for k in ['nativeFloorAdmission','globalReplacementAvailable','jointResistanceAvailable','nativeConstitutiveEquivalence','outerBandAndChordInterfaceAvailable']):
            raise ValueError('unsupported contour comparison/acceptance')
    first=captures[0]
    root=Path(__file__).resolve().parents[3]
    if first['inputs']!=source_input(root):raise ValueError('stale current contour authored/native source')
    methods={name:hashlib.sha256(Path(__file__).with_name(name).read_bytes()).hexdigest()
             for name in ['finite_floor_contour.py','finite_floor_contour_run.py']}
    if first['methodSHA256']!=methods:raise ValueError('stale current contour execution method')
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
            'fixedAuthoredContourLayersAndDepthGlobalPitchSensitivityOnly':True,'allMotionEnergySensitivityOnly':True,'convergenceAcceptanceClaimed':False,
            'nativeFloorAdmission':False,'jointResistanceAvailable':False}

def check_receipt(retained, actual):
    """Exact provenance/shape, existing1e-12 absolute numerical replay screen.

    LAPACK eigenvalue roundoff differs across runner CPUs. This is the same
    scalar replay tolerance as the ordering control, not mesh acceptance.
    """
    left=copy.deepcopy(retained);right=copy.deepcopy(actual)
    keys=('maximumRelativeEnergySensitivity','minimumRelativeEnergyChange','maximumRelativeEnergyChange')
    if len(left['comparisons'])!=len(right['comparisons']):
        raise ValueError('changed contour comparison count')
    for i,(old,new) in enumerate(zip(left['comparisons'],right['comparisons'])):
        for key in keys:
            a=old.pop(key);b=new.pop(key)
            if type(a) not in (int,float) or type(b) not in (int,float) or not math.isfinite(a) or not math.isfinite(b) or abs(a-b)>1e-12:
                raise ValueError('contour scalar replay differs beyond1e-12: '+str(i)+'/'+key+' '+str(a)+' -> '+str(b))
    if json.dumps(left,sort_keys=True)!=json.dumps(right,sort_keys=True):
        raise ValueError('changed exact contour source, method, capture, ports, mesh or claim boundary')


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('captures',nargs='+',type=Path);p.add_argument('--out',type=Path,required=True);p.add_argument('--check',action='store_true');a=p.parse_args();r=compare(a.captures);text=json.dumps(r,indent=2)+'\n'
    if a.check:
        check_receipt(json.loads(a.out.read_text()),r)
    else:a.out.write_text(text)
    print(json.dumps(r['comparisons']))
