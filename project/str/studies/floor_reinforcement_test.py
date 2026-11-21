import copy
import json
import math
from pathlib import Path
import unittest

from floor_reinforcement import assess_floor_reinforcement, reference_floor_reinforcement_settings


D = Path(__file__).resolve().parent


def specimen(hole=False):
    rectangles = [[0,0,1000,1000]] if not hole else [[0,0,1000,200],[0,200,200,1000],[800,200,1000,1000]]
    points = sorted({p for a,b,c,d in rectangles for p in ((a,b),(c,b),(c,d),(a,d))})
    return {'native':{'caseId':'ANALYTIC-CONTROL'},
        'request':{'plateLaw':{'elasticModulusMPa':33000,'poissonRatio':.2,'thicknessMm':200,
            'flexuralFactor':.25,'shearFactor':.5,'unitWeightKNPerM3':25}},
        'mass':{'newPlateAreaM2':1.,'newPlatePhysicalSelfGKN':5.},
        'plate':{'cellsXYMm':rectangles,'physicalRecovery':{'points':[
            {'xyMm':list(p),'displacementMmRad':[-1e-6*p[0]**2/2,0,1e-6*p[0]]} for p in points]}}}


class FloorReinforcementComparisonTest(unittest.TestCase):
    def test_actual_two_way_depth_cover_and_full_force_mandrel_are_separate(self):
        r=assess_floor_reinforcement(specimen())
        self.assertEqual(r['section']['minimumMainBarCoverMm'],40.)
        self.assertEqual(r['section']['adverseInnerEffectiveDepthMm'],122.)
        self.assertEqual(r['verticalReturn']['requiredDepthForInnerDirectionMm'],308.)
        self.assertFalse(r['verticalReturn']['existingSectionFits'])
        self.assertTrue(r['verticalReturn']['deeperComparisonFitsAuthoredGeometry'])
        self.assertFalse(r['verticalReturn']['deeperComparisonPassesBothScreens'])
        self.assertGreater(r['verticalReturn']['necessaryFullSourceDesignStressMandrelMm'],160)
        self.assertFalse(r['anchorageAccepted'])

    def test_short_field_run_rejects_without_stopping_at_historical_template(self):
        whole=assess_floor_reinforcement(specimen())
        pierced=assess_floor_reinforcement(specimen(True))
        self.assertEqual(whole['straightDevelopment']['routesWithoutFullForceDevelopment'],0)
        self.assertEqual(whole['straightDevelopment']['routesWithoutFullForceLapRun'],0)
        self.assertGreater(pierced['straightDevelopment']['routesWithoutFullForceDevelopment'],0)
        self.assertEqual(whole['momentInspectionKNmPerM'],pierced['momentInspectionKNmPerM'])
        short=min(pierced['straightDevelopment']['routeInventory'],key=lambda x:x['availableStraightCentrelineMm'])
        self.assertAlmostEqual(short['availableStraightCentrelineMm'],134.)

    def test_author_controls_propagate_and_restore_without_mutating_solve(self):
        case=specimen(); original=copy.deepcopy(case)
        a=assess_floor_reinforcement(case);settings=reference_floor_reinforcement_settings();settings['pitchMm']=125
        b=assess_floor_reinforcement(case,settings)
        self.assertAlmostEqual(b['section']['barAreaPerMetreEachFaceDirectionMm2']/a['section']['barAreaPerMetreEachFaceDirectionMm2'],.8)
        self.assertAlmostEqual(b['section']['inspectionSteelStressMPa']/a['section']['inspectionSteelStressMPa'],1.25)
        self.assertEqual(a['straightDevelopment'],b['straightDevelopment'])
        self.assertEqual(a,assess_floor_reinforcement(case))
        self.assertEqual(case,original)

    def test_deeper_trial_pays_actual_area_and_unit_weight(self):
        a=assess_floor_reinforcement(specimen())
        q=a['uniformThickeningConsequence']
        self.assertAlmostEqual(q['additionalPhysicalRCVolumeM3'],.12)
        self.assertAlmostEqual(q['additionalPhysicalSelfGKN'],3.)
        self.assertFalse(q['changedModelReplayed'])

    def test_adverse_cover_full_force_and_injected_controls(self):
        settings=reference_floor_reinforcement_settings();settings['mainBarNominalCoverMm']=45
        self.assertFalse(assess_floor_reinforcement(specimen(),settings)['section']['coverComparatorPasses'])
        settings=reference_floor_reinforcement_settings();settings['bondMPa']=1.
        r=assess_floor_reinforcement(specimen(),settings)
        self.assertGreater(r['straightDevelopment']['fullSourceDesignStressDevelopmentMm'],1000)
        self.assertGreater(r['straightDevelopment']['routesWithoutFullForceDevelopment'],0)
        for key,value in (('installedAcceptance',True),('sourceSHA256',{}),('barDiameterMm',math.inf)):
            settings=reference_floor_reinforcement_settings();settings[key]=value
            with self.assertRaises(ValueError):assess_floor_reinforcement(specimen(),settings)

    def test_actual_known_domain_control_retains_narrow_cell_and_unresolved_edges(self):
        source=json.loads((D/'vertical-rc-floor-proof.json').read_text())['baseline']
        r=assess_floor_reinforcement(source)
        self.assertAlmostEqual(r['momentInspectionKNmPerM'],29.5783293122226,9)
        self.assertGreater(r['straightDevelopment']['routesWithoutFullForceDevelopment'],0)
        self.assertFalse(r['localStressConvergenceProven'])
        self.assertFalse(r['wholeHouseProof'])


if __name__=='__main__':unittest.main()
