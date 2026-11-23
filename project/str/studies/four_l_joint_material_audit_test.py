import copy
import unittest

from four_l_joint_material_audit import audit


def specimen():
    result={'sourceSHA256':{'native':'source'},'request':{'actual':'request'},
        'floorSection':{'midplaneZMm':3270},'nativeVertical':{'request':{'plateLaw':{'thicknessMm':200,'unitWeightKNPerM3':25}},
            'native':{'caseId':'actual','multipliers':{'physical-G':1.35}},'plate':{'cellsXYMm':[]}},'roofCoupling':{'upperL':[]}}
    observation={'sourceSHA256':result['sourceSHA256'],'request':result['request'],'caseId':'actual','joints':[]}
    for i,identity in enumerate(('SW','SE','NW','NE')):
        r=[i*100,0,i*100+10,20];result['nativeVertical']['plate']['cellsXYMm'].append(r)
        result['roofCoupling']['upperL'].append({'cornerId':identity,'physicalRCUnionVolumeM3':200*3170/1e9,
            'physicalStartXYZMm':[i*100+5,10,3370],'physicalEndXYZMm':[i*100+5,10,6540]})
        observation['joints'].append({'id':identity,'jointFootprintRectanglesXYMm':[r]})
    return result,observation


class MaterialAttribution(unittest.TestCase):
    def test_rigid_material_is_already_charged_once_by_actual_cell_g(self):
        result,observation=specimen();report=audit(result,observation)
        self.assertAlmostEqual(report['totalJointVolumeM3'],.00016)
        self.assertAlmostEqual(report['totalJointPhysicalGAlreadyInPlateKN'],.004)
        self.assertFalse(report['newJointBodyGRequired']);self.assertEqual(report['loadInsertedKN'],0)
        self.assertAlmostEqual(report['joints'][0]['appliedGKN'],.00135)

    def test_density_edit_changes_g_not_geometry_and_reversal_restores(self):
        result,observation=specimen();original=audit(result,observation)
        result['nativeVertical']['request']['plateLaw']['unitWeightKNPerM3']=27
        changed=audit(result,observation)
        self.assertAlmostEqual(changed['totalJointPhysicalGAlreadyInPlateKN']/original['totalJointPhysicalGAlreadyInPlateKN'],27/25)
        self.assertEqual(changed['totalJointVolumeM3'],original['totalJointVolumeM3'])
        result['nativeVertical']['request']['plateLaw']['unitWeightKNPerM3']=25
        self.assertEqual(audit(result,observation),original)

    def test_missing_or_duplicate_cell_and_wrong_body_area_are_rejected(self):
        for mutation in ('missing','duplicated','wrong-area'):
            result,observation=specimen()
            if mutation=='missing':result['nativeVertical']['plate']['cellsXYMm'].pop()
            elif mutation=='duplicated':result['nativeVertical']['plate']['cellsXYMm'].append(result['nativeVertical']['plate']['cellsXYMm'][0])
            else:result['roofCoupling']['upperL'][0]['physicalRCUnionVolumeM3']*=2
            with self.subTest(mutation=mutation),self.assertRaises(ValueError):audit(result,observation)

    def test_other_source_or_request_cannot_supply_footprints(self):
        for key in ('sourceSHA256','request','caseId'):
            result,observation=specimen();observation=copy.deepcopy(observation);observation[key]='stale'
            with self.subTest(key=key),self.assertRaises(ValueError):audit(result,observation)


if __name__=='__main__':unittest.main()
