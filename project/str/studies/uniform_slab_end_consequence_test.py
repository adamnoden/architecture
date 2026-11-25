"""Actual captured-case consequence checks, without geometry or native solves."""
import copy,json,unittest
from pathlib import Path

from floor_section_model import load_source
from uniform_slab_law_proof import load_captures,read_controls
from uniform_slab_end_consequence import compare_cuts
from wet_beam_rectangular_return import assess
from wet_support_cage_comparison import comparison_settings

ROOT=Path(__file__).resolve().parents[3]

class UniformEndConsequences(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        natives,_=load_captures(load_source(ROOT),read_controls())
        settings=comparison_settings();settings['postTopLevelRaiseMm']=10
        grid=json.loads((ROOT/'project/str/studies/current-house-grid.json').read_bytes())
        cls.cases={}
        for name,native in natives.items():
            before=json.dumps(native,sort_keys=True)
            cls.cases[name]={m:assess(native,grid,settings,m,[1,2.5],with_geometry=False) for m in [80,100]}
            if json.dumps(native,sort_keys=True)!=before:raise AssertionError('consequence method mutated actual native source')

    def test_changed_law_rejects_only_declared_d80_witness_while_d100_remains_next_comparison(self):
        comparisons={}
        for name in self.cases:
            comparisons[name]={}
            for mandrel in [80,100]:
                cuts=self.cases[name][mandrel]['sameCaseCutComparisons']['cuts']
                supported=[c for r in cuts for c in r.get('comparisons',[])]
                self.assertEqual(len([r for r in cuts if r['status']=='unsupported-curved-return-or-ramp']),5)
                self.assertEqual(len(supported),6)
                comparisons[name][mandrel]=supported
                self.assertTrue(all(c['bendPressureAccepted'] is False and c['bondAndAnchorageAccepted'] is False for c in supported))
        self.assertTrue(all(c['necessaryMandrelScreenPasses'] for c in comparisons['control'][80]))
        new=comparisons['uniform200'][80]
        self.assertEqual(sum(not c['necessaryMandrelScreenPasses'] for c in new),3)
        self.assertTrue(all(c['necessaryMandrelScreenPasses'] for c in new if c['cotTheta']==1))
        self.assertTrue(all(c['necessaryMandrelScreenPasses'] for c in comparisons['uniform200'][100]))
        self.assertAlmostEqual(max(c['necessaryMandrelComparisonMm'] for c in new),92.91842036686546)
        self.assertAlmostEqual(max(c['basicPoorBondLengthMm'] for c in new),342.0452250292704)

    def test_geometry_and_nominal_forces_do_not_get_confused_between_law_and_mandrel_edits(self):
        for mandrel in [80,100]:
            a=self.cases['control'][mandrel];b=self.cases['uniform200'][mandrel]
            self.assertEqual(a['candidateCageGeometrySHA256'],b['candidateCageGeometrySHA256'])
            paired=compare_cuts(a['sameCaseCutComparisons'],b['sameCaseCutComparisons'])
            self.assertEqual(paired['samePhysicalCutCount'],8)
            self.assertEqual(len(paired['unsupportedCurvedCuts']),5)
            self.assertTrue(all(r['actualBarForceBoundsAvailable'] is False for r in paired['nominalStraightComparisons']))
        a=self.cases['uniform200'][80];b=self.cases['uniform200'][100]
        self.assertNotEqual(a['candidateCageGeometrySHA256'],b['candidateCageGeometrySHA256'])
        forces=lambda x:[c['declaredNominalForceComparisonKN'] for r in x['sameCaseCutComparisons']['cuts'] for c in r.get('comparisons',[])]
        self.assertEqual(forces(a),forces(b))

    def test_different_physical_cuts_or_invented_curved_force_cannot_be_paired(self):
        a=self.cases['control'][80]['sameCaseCutComparisons'];b=copy.deepcopy(self.cases['uniform200'][80]['sameCaseCutComparisons'])
        b['cuts'][0]['simultaneousSourceCut']['physicalPointMm'][1]+=1
        with self.assertRaisesRegex(ValueError,'physical cut catalogue'):compare_cuts(a,b)
        b=copy.deepcopy(self.cases['uniform200'][80]['sameCaseCutComparisons'])
        row=next(r for r in b['cuts'] if r['status']=='unsupported-curved-return-or-ramp');row['comparisons']=[]
        with self.assertRaisesRegex(ValueError,'curved force'):compare_cuts(a,b)

if __name__=='__main__':unittest.main()
