import copy,json,tempfile,unittest,os
from pathlib import Path
from current_finite_joint_signed_proof import current_document_identity,require_document_bundle_identity,require_document_snapshot,digest,digest_bytes

DOCUMENT=Path(os.environ.get('STR_CURRENT_FINITE_DOCUMENT','project/ccr/studies/working-house-comparison.json'))

class SavedDocumentProvenance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.document=json.loads(DOCUMENT.read_text());cls.identity=current_document_identity(DOCUMENT)
    def test_unchanged_document_matches_the_actual_shared_admission(self):
        self.assertEqual(require_document_bundle_identity(DOCUMENT,{'documentIdentity':self.identity}),self.identity)
        self.assertEqual(len(self.identity['digest']),64)
    def test_old_bundle_cannot_acquire_changed_width_or_live_load_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'changed.json'
            for edit in ('width','live-load'):
                changed=copy.deepcopy(self.document)
                if edit=='width':changed['stages']['distributedFloor']['cornerWidthsMm']['SW']+=20
                else:changed['stages']['masonryFrame']['freshUniformLiveKPa']+=1
                path.write_text(json.dumps(changed))
                with self.assertRaisesRegex(ValueError,'supplied saved document'):
                    require_document_bundle_identity(path,{'documentIdentity':self.identity})
    def test_current_snapshot_is_checked_after_preparation(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'source.json';path.write_text(json.dumps(self.document))
            packet={'documentPath':str(path),'documentSnapshotSHA256':digest_bytes(path.read_bytes()),
                    'controllingChoicesSHA256':digest({'design':self.document['design'],'stages':self.document['stages']})}
            require_document_snapshot(packet)
            changed=copy.deepcopy(self.document);changed['stages']['distributedFloor']['cornerWidthsMm']['SW']+=20
            path.write_text(json.dumps(changed))
            with self.assertRaisesRegex(ValueError,'prepared snapshot'):require_document_snapshot(packet)


class OptionalRearStageAdmission(unittest.TestCase):
    def setUp(self):
        from types import SimpleNamespace
        from unittest.mock import patch
        self.patch=patch.dict('sys.modules',{'rear_bearing_plan':SimpleNamespace(admit_choices=lambda choices:copy.deepcopy(choices))})
        self.patch.start();self.addCleanup(self.patch.stop)
        self.case={'wetSupport':{'old':True}}
        self.settings={'enabled':True,'youngMPa':8250.,'solidPitchMm':250.}
        self.choices={'execution':'compute'}
        self.result={'authoredNativeCase':self.case,'choices':self.choices,'finiteSettings':self.settings,
                     'candidateAccepted':False,'wholeHouseAccepted':False,'strengthAccepted':False,'ownerAccepted':False}
        self.floor={'finiteJointComparison':{'status':'analysis-pending'},
                    'rearBearingComparison':{'status':'computed-unselected-comparison',
                    'request':{'nativeCase':self.case,'choices':self.choices,'finiteSettings':self.settings},'result':self.result}}
    def test_actual_rear_stage_supplies_parent_when_old_finite_stage_is_deferred(self):
        from current_finite_joint_signed_proof import admitted_parent
        case,settings,result,choices=admitted_parent(self.floor)
        self.assertEqual((case,settings,result,choices),(self.case,self.settings,self.result,self.choices))
        self.assertIsNotNone(case['wetSupport'])
    def test_default_original_finite_parent_remains_the_same(self):
        from current_finite_joint_signed_proof import admitted_parent
        result={'authoredNativeCase':self.case,'settings':self.settings}
        floor={'finiteJointComparison':{'status':'computed-unselected-comparison','request':{'nativeCase':self.case,'settings':self.settings},'result':result}}
        self.assertEqual(admitted_parent(floor),(self.case,self.settings,result,None))
    def test_present_rear_stage_never_falls_back_to_old_house(self):
        from current_finite_joint_signed_proof import admitted_parent
        self.floor['rearBearingComparison']['status']='analysis-pending'
        with self.assertRaisesRegex(ValueError,'actually computed'):admitted_parent(self.floor)
    def test_changed_choices_case_settings_or_acceptance_are_rejected(self):
        from current_finite_joint_signed_proof import admitted_parent
        for key,value in (('choices',{'execution':'deferred'}),('authoredNativeCase',{'wetSupport':None}),('finiteSettings',{}),('ownerAccepted',True)):
            floor=copy.deepcopy(self.floor);floor['rearBearingComparison']['result'][key]=value
            with self.subTest(key=key),self.assertRaises(ValueError):admitted_parent(floor)

class RearResultSourceAdmission(unittest.TestCase):
    def fixture(self):
        from types import SimpleNamespace
        case={'wetSupport':{'old':True},'bearingCase':{'masonryCase':{'verticalCase':{'monolithicCase':{'houseCase':{'joinedCase':{'floor':{'boundaryCase':{'windIndex':31}}}}}}}}}
        packet={'nativeCase':case,'rearChoices':{'execution':'compute'},'settings':{'enabled':True},
                'sourceSHA256':{'native':'current'},'rearMethodSHA256':{'producer':'current'}}
        result={'schema':'str-rear-direct-bearing-comparison/1','authoredNativeCase':copy.deepcopy(case),
                'choices':packet['rearChoices'],'finiteSettings':packet['settings'],'sourceSHA256':packet['sourceSHA256'],
                'methodSHA256':packet['rearMethodSHA256'],'finiteHouseResult':{}}
        replay=SimpleNamespace(replay=lambda *args:{'actualBearingContactCount':64})
        return packet,result,replay
    def test_inner_finite_validator_receives_only_derived_no_wet_support_case(self):
        from unittest.mock import patch
        from current_finite_joint_signed_proof import check_rear_result
        packet,result,replay=self.fixture();before=copy.deepcopy(packet)
        with patch.dict('sys.modules',{'rear_direct_bearing_replay':replay}),patch('current_finite_joint_signed_proof.check_finite_result',return_value={}) as finite,patch('current_finite_joint_signed_proof.check_all_rear_bodies',return_value={}):
            check_rear_result(packet,31,result,{})
        derived=finite.call_args.args[0]
        self.assertIsNone(derived['nativeCase']['wetSupport']);self.assertNotIn('rearChoices',derived)
        self.assertEqual(packet,before)
    def test_changed_source_method_case_settings_and_missing_checkpoint_reject(self):
        from unittest.mock import patch
        from current_finite_joint_signed_proof import check_rear_result
        packet,result,replay=self.fixture()
        for key,value in (('sourceSHA256',{}),('methodSHA256',{}),('authoredNativeCase',{}),('finiteSettings',{}),('choices',{})):
            changed=copy.deepcopy(result);changed[key]=value
            with self.subTest(key=key),patch.dict('sys.modules',{'rear_direct_bearing_replay':replay}),self.assertRaises(ValueError):
                check_rear_result(packet,31,changed,{})
        with patch.dict('sys.modules',{'rear_direct_bearing_replay':replay}),self.assertRaisesRegex(ValueError,'checkpoint'):check_rear_result(packet,31,result,None)

class AllRearBodyPhysicalReplay(unittest.TestCase):
    def fixture(self,engaged=True):
        from current_finite_joint_signed_proof import rear_body_catalogue
        factor=1.35;own=.02*factor;joint=.002*factor;top=.1 if engaged else 0.;bearing=.2 if engaged else 0.
        row={'fibreId':'normal','bodyTopNodeId':'body','xyMm':[1.,2.],'areaMm2':1000.,'ownerId':'tail',
             'bodyPhysicalGKN':.02,'bodyAxialStiffnessKNPerMm':1.}
        fibre={'id':'normal','xyMm':[1.,2.],'areaMm2':1000.,'ownerId':'tail','heightMm':1000.}
        seat={'id':'seat','bodyTopNodeId':'seat-body','xyMm':[3.,4.],'areaMm2':1000.,
              'serialLaw':{'bodyPhysicalGKN':.02,'bodyAxialStiffnessKNPerMm':2.,'topContactStiffnessKNPerMm':3.},'beddingPhysicalGKN':.002}
        displacements={}
        def state(identifier,node,force,stiffness,mode,active):
            relative=force/stiffness if active else .01
            displacements[node]=[0.,0.,relative,0.,0.,0.]
            return {'id':identifier,'terms':[[node,[0.,0.,1.,0.,0.,0.]]],'forceKN':force,'stiffness':stiffness,
                    'relativeMm':relative,'mode':mode,'gap':0.,'active':active}
        springs=[state('normal','top',-top,2.,'compression',engaged),
                 state('LOWER-CORE/axial/0','body',-top-own/2,1.,'bilateral',True),
                 state('seat/top','seat-top',-bearing,3.,'compression',engaged),
                 state('seat/body','seat-body',-bearing-own/2-joint/2,2.,'bilateral',True)]
        model={'frame':{'loads':{'body':[0.,0.,-own/2,0.,0.,0.],'seat-body':[0.,0.,-(own+joint)/2,0.,0.,0.]}},
               'lowerCoreBodies':{'inventory':{'sourceOrdinaryCoreIds':['tail'],'bodyHeightMm':1000.},'contactBodyCount':1,'contactBodies':[row]},
               'verticalFloor':{'fibres':[fibre]},'rearDirectBearing':{'bearingBodies':[seat]}}
        checkpoint={'postprocessingModel':model,'rawResponse':{'springs':springs,'displacements':displacements}}
        capture={'authoredNativeCase':{'bearingCase':{'masonryCase':{'lowerCoreBodies':{'masonryUnitWeightKNPerM3':20.},
                 'verticalCase':{'monolithicCase':{'houseCase':{'boundary':{'physicalGFactor':factor}}}}}}}}
        return {'rearBodyCatalogue':copy.deepcopy(rear_body_catalogue(checkpoint))},capture,checkpoint
    def test_all_contacts_may_really_open_without_invented_activation(self):
        from current_finite_joint_signed_proof import check_all_rear_bodies
        for engaged in (True,False):
            packet,capture,checkpoint=self.fixture(engaged)
            result=check_all_rear_bodies(packet,capture,checkpoint)
            self.assertEqual(result['actualOrdinaryAndTailBodyCount'],1);self.assertEqual(result['actualBearingContactCount'],1)
            self.assertEqual(result['activeBearingContactCount'],int(engaged))
            self.assertLess(result['maximumIndependentBodyResidualKN'],1e-12)
    def test_dropped_changed_duplicate_nonfinite_and_inactive_force_are_rejected(self):
        from current_finite_joint_signed_proof import check_all_rear_bodies
        for label in ('drop','geometry','ownG','duplicate','nan','bearing-nan','inactive-force','constitutive','origin-load'):
            packet,capture,checkpoint=self.fixture()
            model=checkpoint['postprocessingModel'];states=checkpoint['rawResponse']['springs']
            if label=='drop':model['lowerCoreBodies']['contactBodies'].pop()
            elif label=='geometry':model['verticalFloor']['fibres'][0]['areaMm2']+=1
            elif label=='ownG':model['lowerCoreBodies']['contactBodies'][0]['bodyPhysicalGKN']+=1
            elif label=='duplicate':states.append(copy.deepcopy(states[0]))
            elif label=='nan':states[1]['forceKN']=float('nan')
            elif label=='bearing-nan':states[3]['relativeMm']=float('nan')
            elif label=='inactive-force':states[2]['active']=False
            elif label=='constitutive':states[3]['relativeMm']+=1
            else:model['frame']['loads']['body'][2]+=1
            with self.subTest(label=label),self.assertRaises(ValueError):check_all_rear_bodies(packet,capture,checkpoint)

class OriginalReferenceAdmission(unittest.TestCase):
    def fixture(self):
        keys=('sourceSHA256','methodSHA256','runtime','observerSHA256','replaySHA256')
        packet={key:{'current':key} for key in keys}
        proof={**copy.deepcopy(packet),'schema':'str-current-finite-signed-proof/1','status':'all96-current-source-programmes-replayed',
               'caseCount':96,'captureIdentities':{str(i):{} for i in range(96)},
               'candidateAccepted':False,'completeHouseProof':False,'resistanceAccepted':False,'ownerAccepted':False}
        return packet,proof
    def test_original_reference_retains_its_historical_proof_method_identity(self):
        from current_finite_joint_signed_proof import admit_reference_proof
        packet,proof=self.fixture();proof['proofSHA256']='retained-historical-driver'
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'proof.json';path.write_text(json.dumps(proof))
            self.assertEqual(admit_reference_proof(packet,path),proof)
    def test_changed_native_methods_incomplete96_or_injected_acceptance_rejected(self):
        from current_finite_joint_signed_proof import admit_reference_proof
        packet,proof=self.fixture()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'proof.json'
            for label in ('method','coverage','acceptance','rear'):
                changed=copy.deepcopy(proof)
                if label=='method':changed['sourceSHA256']={}
                elif label=='coverage':changed['captureIdentities'].pop('3')
                elif label=='acceptance':changed['ownerAccepted']=True
                else:changed['rearChoices']={}
                path.write_text(json.dumps(changed))
                with self.subTest(label=label),self.assertRaises(ValueError):admit_reference_proof(packet,path)

if __name__=='__main__':unittest.main()
