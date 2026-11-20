import copy
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
import unittest

from continuous_rc_portal import source_action_inventory
from joined_successor_kernel import cross
from rc_floor_house_loads import _family_wrench
from rc_portal_monolithic import build_monolithic_rc_portals
from vertical_rc_floor import build_vertical_rc_floor, load_vertical_rc_floor_source, reference_vertical_rc_floor_case


D=Path(__file__).resolve().parent


def add(*rows):return [sum(row[i] for row in rows) for i in range(6)]


def scaled(row,factor):return [factor*v for v in row]


def gravity(weight,point):return [0,0,-weight,-weight*point[1]/1000,weight*point[0]/1000,0]


class VerticalRCFloorCurrentTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.proof=json.loads((D/'vertical-rc-floor-proof.json').read_text());cls.source=load_vertical_rc_floor_source(D.parents[2]);cls.base=cls.proof['baseline'];cls.cases={r['caseId'].split('/')[-1]:r for r in cls.proof['cases']};cls.parent_winds={};cls.parent_g=None
        for index in (7,31,35):
            case=copy.deepcopy(cls.proof['authoredNumericalCase']['monolithicCase']);case['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=index
            model=build_monolithic_rc_portals(case,cls.source['parent'])
            cls.parent_winds[index]=add(_family_wrench(model,model['families']['native-floor-reconciled']),_family_wrench(model,model['families']['actual-outer-portal-ground-pressure']))
            if cls.parent_g is None:cls.parent_g=_family_wrench(model,model['families']['physical-G'])
        cls.upper_g=[0.]*6
        for row in source_action_inventory(cls.source['parent']['house']['joined']['portal']):
            if row['receivingKind']=='north-wall' and row['category'] in ('upper core and finish budget','independent ceiling envelope') and row['programme']=='G':
                x,y=row['receivingXYMm'];dx,dy=row['residualOffsetXYMm'];cls.upper_g=add(cls.upper_g,gravity(row['valueKN'],[x+dx,y+dy]))

    def test_source_method_runtime_and_false_acceptance_are_bound(self):
        p=self.proof;self.assertEqual(p['sourceSHA256'],self.source['identities']);self.assertEqual(len(p['sourceSHA256']),35)
        self.assertEqual(p['proofProducerSHA256'],hashlib.sha256((D/'vertical_rc_floor_proof.py').read_bytes()).hexdigest())
        self.assertEqual(p['floorSvgSHA256'],hashlib.sha256((D/'vertical-rc-floor.svg').read_bytes()).hexdigest())
        self.assertEqual(self.base['native']['sourceSHA256'],self.source['identities']);self.assertEqual(self.base['native']['request'],p['authoredNumericalCase'])
        self.assertEqual(self.base['native']['parentMonolithicControlSourceSHA256'],self.source['parent']['identities'])
        self.assertEqual(p['executedCoupledCaseCount'],10);self.assertEqual(len(p['cases']),10);self.assertFalse(p['nativeProgrammeSweepClaimed'])
        for key in ('candidateAccepted','floorGravityAccepted','completeHouseProof','waterControlAccepted','thermalAccepted','installedAcceptance'):self.assertFalse(p[key])
        for patch in ({'sourceSHA256':{}},{'result':{}},{'plateLaw':None},{'bearingLaw':None},{'maxPitchMm':200}):
            case=copy.deepcopy(p['authoredNumericalCase']);case.update(patch)
            with self.assertRaises(ValueError):build_vertical_rc_floor(case,self.source)
        with self.assertRaises(ValueError):build_vertical_rc_floor(reference_vertical_rc_floor_case(self.source),self.source)

    def test_actual_material_union_physical_stair_and_aperture_controls(self):
        mass=self.base['mass'];self.assertAlmostEqual(mass['newPlateAreaM2'],98.75938125,9);self.assertAlmostEqual(mass['newPlatePhysicalSelfGKN'],5*mass['newPlateAreaM2'],9)
        self.assertAlmostEqual(mass['joinedPhysicalGKN'],mass['newPlatePhysicalSelfGKN']+mass['sourceRCAndInfillBeforeSlabKN'],8)
        stair=next(row for row in self.base['openingInventory'] if row['id']=='FLOOR-VOID/stair');self.assertEqual(stair['structuralOpeningEnvelopeXYMm'],[417.5,4432.5,2817.5,8767.5])
        self.assertEqual(self.base['inPlaneStairCreditReservationXYMm'],[402.5,4432.5,417.5,8767.5])
        self.assertAlmostEqual(self.proof['aperturePhysicalSelfGDeltaKN'],-.545,9)
        self.assertGreater(self.cases['aperture-wider']['maximum52HeadComponentDeltaFromBaselineKN_KNm'],1)
        self.assertEqual(self.cases['aperture-wider']['request']['bearingLaw'],self.cases['baseline']['request']['bearingLaw'])
        self.assertEqual(self.cases['mesh700']['mass']['newPlatePhysicalSelfGKN'],mass['newPlatePhysicalSelfGKN'])
        self.assertAlmostEqual(self.base['missingGroundContactAreaMm2'],10506.25,7)
        self.assertEqual(self.base['completeReceivingPaths'],0);self.assertEqual(self.base['unresolvedReceivingPortCount'],28)

    def test_all_52_head_wrenches_balance_source_actions_and_fresh_gravity_once(self):
        positions={row['id']:[*row['xyMm'],-750] for row in self.base['headPositions']}
        for case in self.proof['cases']:
            request=case['request'];boundary=request['monolithicCase']['houseCase']['boundary'];index=request['monolithicCase']['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex'];mass=case['mass'];plate_g=gravity(mass['newPlatePhysicalSelfGKN'],mass['newPlateCentroidXYMm'])
            expected=add(self.parent_winds[index],scaled(add(self.parent_g,plate_g),boundary['physicalGFactor']))
            if boundary['includeExternalGMAXQ']:
                expected=add(expected,scaled(self.upper_g,1.35),scaled(gravity(mass['newPlateAreaM2']*request['freshUniformLiveKPa'],mass['newPlateCentroidXYMm']),1.5))
            heads=case['headWrenches'];self.assertEqual(len(heads),52);self.assertEqual({h['id'] for h in heads},set(positions));balance=list(expected)
            for head in heads:
                wrench=head['reactionKN_KNm'];moment=cross(positions[head['id']],wrench[:3]);balance=add(balance,[*wrench[:3],*[wrench[3+i]+moment[i]/1000 for i in range(3)]])
            self.assertLess(max(abs(v) for v in balance),1e-6,case['caseId'])
            self.assertLess(max(abs(v) for v in case['equilibriumResidualKN_KNm']),1e-6)
            self.assertLess(case['physicalPlateWorkRelativeResidual'],1e-9);self.assertLess(case['nativeCondensedSystemEnergyRelativeResidual'],1e-9)
            self.assertEqual(case['auxiliaryGaugeMaximumReactionKN_KNmm'],0)
        removed=self.base['legacyReplacement']['removedPreviouslyAdmittedFloorCards'];self.assertTrue(removed);self.assertTrue(all(row['category'].startswith('first-floor') for row in removed))
        self.assertFalse(self.base['legacyReplacement']['oldFloorAndFinishBudgetsAdded'])

    def test_public_cli_compiles_the_same_current_source_case_and_drawing(self):
        request={'case':self.proof['authoredNumericalCase'],'name':'VERTICAL-FLOOR/baseline'}
        process=subprocess.run([sys.executable,str(D/'vertical_rc_floor.py')],input=json.dumps(request),capture_output=True,text=True,env={**os.environ,'OPENBLAS_NUM_THREADS':'1','OMP_NUM_THREADS':'1'},check=False)
        self.assertEqual(process.returncode,0,process.stderr);actual=json.loads(process.stdout)
        self.assertEqual(actual['sourceSHA256'],self.source['identities']);self.assertEqual(actual['native']['request'],request['case'])
        expected={r['id']:r['reactionKN_KNm'] for r in self.base['native']['heads']}
        self.assertLess(max(abs(a-b) for row in actual['native']['heads'] for a,b in zip(row['reactionKN_KNm'],expected[row['id']])),1e-7)
        self.assertAlmostEqual(actual['mass']['newPlatePhysicalSelfGKN'],493.79690625,8)
        self.assertTrue(actual['drawings']['vertical-floor.svg'].startswith('<svg'))
        for identifier in expected:self.assertIn(identifier,actual['drawings']['vertical-floor.svg'])
        self.assertFalse(actual['candidateAccepted']);self.assertFalse(actual['floorGravityAccepted'])

    def test_every_normal_fibre_uses_finite_compression_only_law(self):
        field=self.base['normalField'];owners={row['id']:row['materialKind'] for row in self.base['normalCoreGeometry']};law=self.proof['authoredNumericalCase']['bearingLaw']
        for x,y,area,force,pressure,closure,active,owner_index,receiver_index in field['values']:
            self.assertAlmostEqual(force*1000/area,pressure,9)
            if active:
                e=33000 if owners[field['owners'][owner_index]]=='source-RC-column' else law['masonryModulusMPa']
                self.assertAlmostEqual(pressure,closure/(3350/e+law['jointNormalComplianceMmPerMPa']),8)
                self.assertGreaterEqual(pressure,-1e-7)
            else:self.assertEqual(force,0)
        self.assertLess(self.cases['quadrature2']['maximum52HeadComponentDeltaFromBaselineKN_KNm'],.02)
        self.assertGreater(self.cases['masonry5000']['maximum52HeadComponentDeltaFromBaselineKN_KNm'],1)
        self.assertGreater(self.cases['zero-physicalG']['maximumUnqualifiedLTieDemandKN'],self.cases['baseline']['maximumUnqualifiedLTieDemandKN'])


if __name__=='__main__':unittest.main()
