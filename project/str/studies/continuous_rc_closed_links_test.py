import copy
import unittest

from continuous_rc_closed_links import closed_wire, derive_bounded_geometry, reference_closed_link_case, wire_self_clearance
from continuous_rc_closed_links_proof import proof, reproduction_diagnostics, canonical_receipt


class ClosedLinkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.result=proof()

    def test_exact_reproduction_diagnostics_find_numeric_and_discrete_changes(self):
        import json
        a={'a':[1.,2.,True],'b':'source','c':{'kept':3,'lost':4}}
        b={'a':[1.+1e-12,2.,False],'b':'changed','c':{'kept':3},'extra':0}
        result=reproduction_diagnostics(json.dumps(a),json.dumps(b))
        self.assertEqual(result['numericDifferenceCount'],1)
        self.assertEqual(result['nonNumericDifferenceCount'],4)
        self.assertEqual(result['maximumAbsoluteNumericDifferencePath'],'/a/0')
        self.assertAlmostEqual(result['maximumAbsoluteNumericDifference'],1e-12,delta=1e-15)
        self.assertEqual(result['differences'][1]['path'],'/a/0')
        self.assertEqual(reproduction_diagnostics('<svg>a</svg>','<svg>b</svg>')['firstCharacterDifference'],5)

    def test_reproduction_diagnostics_separate_shape_type_and_nonfinite(self):
        import json
        a={'rows':[1,2],'type':False,'value':1.}
        b={'rows':[1],'type':0,'value':float('nan')}
        result=reproduction_diagnostics(json.dumps(a),json.dumps(b))
        self.assertEqual(result['numericDifferenceCount'],0)
        self.assertEqual(result['nonFiniteDifferenceCount'],1)
        self.assertEqual([r['kind'] for r in result['differences']],['length','type','non-finite'])
        json.dumps(result,allow_nan=False)

    def test_receipt_precision_does_not_change_authored_inputs_or_physics(self):
        import json
        raw=copy.deepcopy(self.result)
        encoded=json.dumps(canonical_receipt(raw),allow_nan=False)
        other=copy.deepcopy(raw)
        for index in (0,8,10,12):
            other['postArchJointTrials'][index]['clearance']['adverseSurfaceLowerBoundMm']=1.4057334485940203
        self.assertEqual(encoded,json.dumps(canonical_receipt(other),allow_nan=False))
        self.assertEqual(raw,self.result)
        self.assertEqual(canonical_receipt(raw)['case'],raw['case'])
        self.assertEqual(canonical_receipt(raw)['sourceSHA256'],raw['sourceSHA256'])
        for path,value in ((('postArchJointTrials',0,'clearance','adverseSurfaceLowerBoundMm'),1e-8),
                (('completeCageFabricationGeometryRejected',),False),(('sourceSHA256',next(iter(raw['sourceSHA256']))),'changed')):
            edited=copy.deepcopy(raw);target=edited
            for key in path[:-1]:target=target[key]
            target[path[-1]]=target[path[-1]]+value if isinstance(value,float) else value
            self.assertNotEqual(encoded,json.dumps(canonical_receipt(edited),allow_nan=False))
        edited=copy.deepcopy(raw);edited['case']['archTailNormalOffsetMm']+=1e-12
        self.assertNotEqual(encoded,json.dumps(canonical_receipt(edited),allow_nan=False))
        edited=copy.deepcopy(raw);edited['maximumTrialAsBuiltGapMm']=float('nan')
        with self.assertRaises(ValueError):canonical_receipt(edited)

    def test_whole_assembly_is_rejected(self):
        self.assertTrue(self.result['completeCageFabricationGeometryRejected'])
        self.assertFalse(self.result['completeJointLinkGeometryProvided'])
        self.assertFalse(self.result['jointPanelStrengthAccepted'])
        self.assertFalse(self.result['capGridForceTransferAccepted'])

    def test_old_lap_is_rejected_and_new_lap_radius_bound_is_earned(self):
        self.assertTrue(self.result['oldLapGeometryRejected'])
        self.assertAlmostEqual(next(r['minimumRadiusLowerBoundMm'] for r in self.result['rejectedOldLapAudit'] if r['layer']=='bottom' and r['side']=='west' and r['normalSign']==1),169/24)
        self.assertTrue(self.result['lapGeometryPasses'])
        self.assertGreater(min(r['minimumRadiusLowerBoundMm'] for r in self.result['lapBendAudit']),800)

    def test_explicit_joint_intersections_and_station_failure(self):
        for kind in ('fixed-post','maximum-cover-bounded-horizontal-union'):
            rows=[r for r in self.result['postArchJointTrials'] if r['type']==kind]
            self.assertLess(min(r['clearance']['adverseSurfaceLowerBoundMm'] for r in rows),-10)
        self.assertGreater(self.result['maximumTrialAsBuiltGapMm'],100)

    def test_isolated_components_do_not_earn_bend_anchorage(self):
        self.assertTrue(self.result['allLocalClosedLinkComponentsPass'])
        for row in self.result['closedLinkComponents']:
            self.assertFalse(row['bendBearingAndAnchorageStrengthAccepted'])
            self.assertGreaterEqual(row['minimumSelfClearanceMm'],1)

    def test_barrier_is_a_different_uncoordinated_detail(self):
        self.assertEqual(len(self.result['proposedBarrierAxes']),16)
        self.assertFalse(self.result['source69FaceBarrierCompatible'])
        self.assertTrue(all(not r['metalJointOrSealAccepted'] for r in self.result['proposedBarrierAxes']))

    def test_adverse_hook_plane_split_fails(self):
        case=reference_closed_link_case();case['hookPlaneSeparationMm']=9
        wire=closed_wire(56.75,95.5,case)
        self.assertFalse(wire_self_clearance(wire,case)['selfClearancePasses'])

    def test_no_source_or_approval_injection(self):
        from continuous_rc_closed_links_proof import ROOT
        import json
        portal=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']['insulatedPortal']
        for mutate in ('extra','numeric'):
            case=reference_closed_link_case()
            if mutate=='extra':case['approved']=True
            else:case['mainRibEnvelopeMm']=12
            with self.assertRaises(ValueError):derive_bounded_geometry(case,portal)

    def test_unchanged_source_reproduces_control(self):
        self.assertEqual(self.result['case'],reference_closed_link_case())
        self.assertEqual(self.result['contactLapPackMinimumSurfaceClearMm'],0)
        self.assertFalse(self.result['installedOrSelectedStructure'])


if __name__=='__main__':unittest.main()
