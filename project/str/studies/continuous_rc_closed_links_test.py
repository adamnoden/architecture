import copy
import unittest

from continuous_rc_closed_links import closed_wire, derive_bounded_geometry, reference_closed_link_case, wire_self_clearance
from continuous_rc_closed_links_proof import proof


class ClosedLinkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.result=proof()

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
