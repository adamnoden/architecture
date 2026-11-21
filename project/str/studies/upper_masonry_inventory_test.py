import copy
import unittest

from upper_masonry_inventory import upper_clear_core_inventory


class UpperMasonryInventoryTest(unittest.TestCase):
    def specimen(self):
        return {'archOpeningRegister':{'FIRST':[]},'upperWalls':[]},dict(A=0.,B=1000.,C=300.,E=700.)

    def test_full_body_seat_and_pad_partition_preserves_volume_and_first_moments(self):
        h,a=self.specimen();seat=dict(id='S',xyMm=[500,0],padWidthMm=100.,settingToleranceMm=10.)
        r=upper_clear_core_inventory(h,a,[],[seat]);self.assertEqual(len(r['seatColumns']),1)
        full=r['fullMasonryBeforePads'];parts=[r[k] for k in ('freeTopMasonry','seatMasonry','removedPadMasonry')]
        self.assertAlmostEqual(full['volumeM3'],sum(p['volumeM3'] for p in parts),12)
        for i in range(3):self.assertAlmostEqual(full['volumeFirstMomentsM3Mm'][i],sum(p['volumeFirstMomentsM3Mm'][i] for p in parts),8)
        self.assertAlmostEqual(r['removedPadMasonry']['volumeM3'],.0001)
        self.assertEqual(r['seatColumns'][0]['boxXYZMm'][5],6530.)
        self.assertTrue(all(row['boxXYZMm'][5]==6540. for row in r['bodyBoxes']))
        self.assertFalse(r['archSpandrelSillAndFinishIncluded'])

    def test_whole_pad_and_setting_not_just_centre_must_fit(self):
        h,a=self.specimen()
        upper_clear_core_inventory(h,a,[],[dict(id='S',xyMm=[500,0],padWidthMm=100.,settingToleranceMm=20.)])
        with self.assertRaisesRegex(ValueError,'Complete pad'):
            upper_clear_core_inventory(h,a,[],[dict(id='S',xyMm=[500,0],padWidthMm=100.,settingToleranceMm=20.01)])

    def test_arch_reservation_and_RC_subtraction_remove_support(self):
        h,a=self.specimen();seat=dict(id='S',xyMm=[500,0],padWidthMm=100.,settingToleranceMm=10.)
        h['archOpeningRegister']['FIRST']=[dict(wall='outer-south',centre=500.,width=80.,radialRingTrial=20.)]
        with self.assertRaises(ValueError):upper_clear_core_inventory(h,a,[],[seat])
        h['archOpeningRegister']['FIRST']=[]
        with self.assertRaises(ValueError):upper_clear_core_inventory(h,a,[[440,-70,560,70]],[seat])

    def test_overlaps_union_before_mass_and_native_longitudinal_clip(self):
        h,a=self.specimen();wall=dict(id='P',a=[500,-1000],b=[500,2000],structuralCore=[430,570],holes=[])
        h['upperWalls']=[wall];one=upper_clear_core_inventory(h,a,[],[])
        h['upperWalls']=[wall,{**wall,'id':'duplicate-author'}];two=upper_clear_core_inventory(h,a,[],[])
        self.assertEqual(one['fullMasonryBeforePads'],two['fullMasonryBeforePads'])
        self.assertTrue(all(-70<=r['boxXYZMm'][1]<=r['boxXYZMm'][4]<=1070 for r in two['bodyBoxes']))

    def test_density_edit_changes_weight_preserves_geometry_and_restores(self):
        h,a=self.specimen();r=upper_clear_core_inventory(h,a,[],[])
        changed=upper_clear_core_inventory(h,a,[],[],density=10.)
        self.assertEqual(r['bodyBoxes'],changed['bodyBoxes'])
        self.assertAlmostEqual(r['masonryPhysicalGKN'],2*changed['masonryPhysicalGKN'])
        self.assertEqual(upper_clear_core_inventory(h,a,[],[]),r)
        h['unrelatedFaceFinish']='control'
        self.assertEqual(upper_clear_core_inventory(h,a,[],[]),r)

    def test_service_cylinder_projection_removes_whole_column_and_rejects_hidden_seat_collision(self):
        h,a=self.specimen();before=upper_clear_core_inventory(h,a,[],[])
        h['exteriorPortGeometry']=[dict(id='supply',wall='outer-south',p=[500,0,6300],r=180)]
        after=upper_clear_core_inventory(h,a,[],[])
        self.assertLess(after['masonryPhysicalGKN'],before['masonryPhysicalGKN'])
        self.assertEqual(after['serviceColumnOmissions'][0]['boxXYZMm'],[320,-70,3370.,680,70,6540.])
        self.assertFalse(after['serviceHeadAndSillGravityIncluded'])
        with self.assertRaises(ValueError):upper_clear_core_inventory(h,a,[],[dict(id='S',xyMm=[500,0],padWidthMm=100.,settingToleranceMm=10.)])
        upper_clear_core_inventory(h,a,[],[dict(id='S',xyMm=[250,0],padWidthMm=100.,settingToleranceMm=10.)])

    def test_nonfinite_or_diagonal_and_overlap_reject(self):
        h,a=self.specimen()
        for density in (True,float('nan'),-1):
            with self.assertRaises(ValueError):upper_clear_core_inventory(h,a,[],[],density=density)
        h['upperWalls']=[dict(id='bad',a=[100,100],b=[800,800],structuralCore=[430,570],holes=[])]
        with self.assertRaises(ValueError):upper_clear_core_inventory(h,a,[],[])
        h['upperWalls']=[];seat=dict(id='S',xyMm=[500,0],padWidthMm=100.,settingToleranceMm=10.)
        with self.assertRaises(ValueError):upper_clear_core_inventory(h,a,[],[seat,{**seat,'id':'T'}])

    def test_actual_upstand_union_is_removed_and_seat_starts_at_its_real_top(self):
        h,a=self.specimen();seat=dict(id='S',xyMm=[500,0],padWidthMm=100.,settingToleranceMm=10.)
        beam=[200,-145,3170,800,145,3920]
        before=upper_clear_core_inventory(h,a,[],[seat])
        after=upper_clear_core_inventory(h,a,[],[seat],rc_boxes=[beam])
        self.assertAlmostEqual(before['fullMasonryBeforePads']['volumeM3']-after['fullMasonryBeforePads']['volumeM3'],600*140*550/1e9,12)
        self.assertEqual(after['seatColumns'][0]['boxXYZMm'][2],3920)
        self.assertAlmostEqual(after['seatMasonry']['volumeM3'],10000*(6530-3920)/1e9)
        full=after['fullMasonryBeforePads'];parts=[after[k] for k in ('freeTopMasonry','seatMasonry','removedPadMasonry')]
        for i in range(3):self.assertAlmostEqual(full['volumeFirstMomentsM3Mm'][i],sum(p['volumeFirstMomentsM3Mm'][i] for p in parts),8)
        with self.assertRaisesRegex(ValueError,'different RC receiving heights'):
            upper_clear_core_inventory(h,a,[],[{**seat,'xyMm':[200,0]}],rc_boxes=[beam])

    def test_joined_roof_rejects_legacy_overlapping_gravity_budget_before_build(self):
        from pathlib import Path
        from upper_roof_bearing import load_source,_admit
        from upper_roof_bearing_proof import worked_case
        source=load_source(Path(__file__).resolve().parents[3]);case=worked_case(source)
        case['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['includeExternalGMAXQ']=True
        with self.assertRaisesRegex(ValueError,'Gross upper GMAX/Q budgets overlap'):_admit(case,source)


if __name__=='__main__':unittest.main()
