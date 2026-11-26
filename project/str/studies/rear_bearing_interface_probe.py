"""Source-specific unchanged-physics diagnostic of the rear membrane interface."""
import argparse,hashlib,json,math,sys,traceback
from pathlib import Path
import floor_section_model as native

def write(path,value):
    data=json.dumps(value,allow_nan=False);partial=path.with_suffix('.partial');partial.write_text(data);partial.replace(path)
def diagnose(model,raw,mid):
    data=model['joinedFloor'];floor=data['floor'];ports=floor['ports']
    u=[math.fsum(c*raw['displacements'][n][axis] for n,row in terms for axis,c in enumerate(row)) for terms in data['portTerms']]
    k=floor['condensedStiffnessKNPerMm'];f=floor['condensedForceKN']
    elastic=[sum(a*b for a,b in zip(row,u)) for row in k]
    stable=[math.fsum(a*b for a,b in zip(row,u)) for row in k]
    def wrench(values):
        return [math.fsum(values[3*i] for i in range(len(ports))),
            math.fsum(values[3*i+1] for i in range(len(ports))),
            math.fsum((p['originXYMm'][0]*values[3*i+1]-p['originXYMm'][1]*values[3*i])/1000+values[3*i+2] for i,p in enumerate(ports))]
    wind=[math.fsum(r['forceKN'][0] for r in model['housePressure']['reconciledFloorRows']),
        math.fsum(r['forceKN'][1] for r in model['housePressure']['reconciledFloorRows']),
        math.fsum((r['pointXYZMm'][0]*r['forceKN'][1]-r['pointXYZMm'][1]*r['forceKN'][0])/1000 for r in model['housePressure']['reconciledFloorRows'])]
    modes=[[v for p in ports for v in (1.,0.,0.)],[v for p in ports for v in (0.,1.,0.)],
        [v for p in ports for v in (-p['originXYMm'][1]/1000,p['originXYMm'][0]/1000,1.)]]
    rigids=[[math.fsum(a*b for a,b in zip(row,mode)) for row in k] for mode in modes]
    load_residual=[a-b for a,b in zip(wind,wrench(f))]
    complete=[a+b for a,b in zip(wrench([a-b for a,b in zip(elastic,f)]),wind)]
    return {'schema':'str-rear-membrane-interface-diagnostic/1','portCount':len(ports),'coordinateCount':len(u),
       'maximumDisplacementMmOrMrad':max(map(abs,u)),
       'condensedLoadWrenchKN_KNm':wrench(f),'sourcePressureWrenchKN_KNm':wind,
       'loadOnlyWrenchResidualKN_KNm':load_residual,'elasticWrenchKN_KNm':wrench(elastic),
       'stableSummationElasticWrenchKN_KNm':wrench(stable),'actualCompleteWrenchResidualKN_KNm':complete,
       'rigidModeMaximumStiffnessDefect':[max(map(abs,row)) for row in rigids],
       'maximumSymmetryDefect':max(abs(k[i][j]-k[j][i]) for i in range(len(k)) for j in range(i)),
       'nativeGuardToleranceUnchanged':1e-5,'operatorOrLoadChanged':False,'candidateAccepted':False}
