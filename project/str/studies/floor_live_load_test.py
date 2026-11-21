import copy
import math
from pathlib import Path
import unittest

from joined_successor_kernel import FrameModel
from plate_bending_recovery import recover_plate_bending
from vertical_floor_plate import assemble_vertical_plate,condense_vertical_plate,recover_vertical_plate
from vertical_rc_floor import fresh_net_floor_live_load


def specimen():
    cells=[[x,y,x+500,y+500] for x in (0,500) for y in (0,500)]
    law={'elasticModulusMPa':33000,'poissonRatio':.2,'thicknessMm':200,'flexuralFactor':.25,'shearFactor':.5,'unitWeightKNPerM3':25}
    corners=((0,0),(1000,0),(1000,1000),(0,1000));frame=FrameModel()
    for i,(x,y) in enumerate(corners):frame.node('F'+str(i),[x,y,3270])
    def boundary(point,axis):return [(corners.index(point),1.)] if axis==0 and point in corners else None
    assembled=assemble_vertical_plate(cells,law,boundary,4)
    rigid=[[1.]*4,[p[1]/1000 for p in corners],[-p[0]/1000 for p in corners]]
    operator=condense_vertical_plate(assembled,rigid)
    return {'model':frame,'families':{'external-Q':{'unchanged':[1.,2.,3.,4.,5.,6.]}},'verticalFloor':{'request':{'freshUniformLiveKPa':0},'operator':operator,
        'portTerms':[[(f'F{i}',[0,0,1,0,0,0])] for i in range(4)]}},cells,law


class IndependentFloorLiveLoadTest(unittest.TestCase):
    def test_net_pressure_has_its_own_factor_and_exact_first_moments(self):
        model,_,_=specimen();model['verticalFloor']['request']['freshUniformLiveKPa']=2
        before=copy.deepcopy(model['families']);load=fresh_net_floor_live_load(model);r=load['evidence']
        self.assertEqual(r['characteristicQKN'],2);self.assertEqual(r['appliedQKN'],3);self.assertEqual(r['combinationFactor'],1.5)
        self.assertEqual(r['addedPhysicalMassKN'],0);self.assertFalse(r['legacyGrossGFlagRequired']);self.assertFalse(r['candidateAccepted'])
        self.assertLess(max(abs(v) for v in r['sourceForceAndFirstMomentResidualKN_KNm']),1e-10)
        self.assertLess(max(abs(a-b) for a,b in zip(r['appliedWrenchKN_KNm'],[0,0,-3,-1.5,1.5,0])),1e-10)
        self.assertEqual(model['families'],before)

    def test_zero_then_positive_then_zero_is_reversible_without_mutating_G(self):
        model,_,_=specimen();operator=model['verticalFloor']['operator'];original=list(operator['condensedSelfG'])
        zero=fresh_net_floor_live_load(model);self.assertEqual(zero['loads'],{})
        model['verticalFloor']['request']['freshUniformLiveKPa']=2;positive=fresh_net_floor_live_load(model);self.assertTrue(positive['loads'])
        model['verticalFloor']['request']['freshUniformLiveKPa']=0;self.assertEqual(fresh_net_floor_live_load(model),zero)
        self.assertEqual(operator['condensedSelfG'],original)

    def test_particular_displacement_bending_and_work_include_actual_Q(self):
        model,cells,law=specimen();operator=model['verticalFloor']['operator'];g_factor=.9
        def recover(q):
            model['verticalFloor']['request']['freshUniformLiveKPa']=q;live=fresh_net_floor_live_load(model);factor=g_factor+live['pressureRatioToSelfG']
            adjusted={**operator,'assembled':{**operator['assembled'],'force':{i:factor*v for i,v in operator['assembled']['force'].items()}}}
            r=recover_vertical_plate(adjusted,[0.]*4)
            bending=recover_plate_bending({'request':{'plateLaw':law},'plate':{'cellsXYMm':cells,'physicalRecovery':r}})
            return r,bending
        zero,b0=recover(0);positive,b1=recover(2);ratio=1.5/.9
        self.assertGreater(zero['maximumDeflectionMm'],0)
        self.assertAlmostEqual(positive['maximumDeflectionMm']/zero['maximumDeflectionMm'],ratio,9)
        self.assertAlmostEqual(positive['physicalPlateStrainEnergyKNmm']/zero['physicalPlateStrainEnergyKNmm'],ratio**2,9)
        p0=max(abs(v) for c in b0['cells'] for s in c['gaussSamples'] for v in s['momentKNmPerM'])
        p1=max(abs(v) for c in b1['cells'] for s in c['gaussSamples'] for v in s['momentKNmPerM'])
        self.assertGreater(p0,0);self.assertAlmostEqual(p1/p0,ratio,9)
        self.assertLess(positive['workRelativeResidual'],1e-10)

    def test_Q_uses_actual_assembled_selfG_pressure_not_mutable_density_label(self):
        model,_,_=specimen();model['verticalFloor']['request'].update(freshUniformLiveKPa=2,plateLaw={'unitWeightKNPerM3':1})
        live=fresh_net_floor_live_load(model);self.assertAlmostEqual(live['pressureRatioToSelfG'],.6,12)
        self.assertEqual(live['evidence']['appliedQKN'],3)

    def test_negative_nonfinite_oversize_and_missing_map_reject(self):
        model,_,_=specimen()
        for q in (-1,6,float('nan'),float('inf'),True):
            model['verticalFloor']['request']['freshUniformLiveKPa']=q
            with self.assertRaises(ValueError):fresh_net_floor_live_load(model)
        model['verticalFloor']['request']['freshUniformLiveKPa']=2;model['verticalFloor']['portTerms'].pop()
        with self.assertRaises(ValueError):fresh_net_floor_live_load(model)

if __name__=='__main__':unittest.main()
