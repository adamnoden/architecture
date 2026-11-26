import copy
import math
import unittest
from rear_bearing_signed_demands import ACTIONS,cut_record,seat_records,case_demands,envelope

class SimultaneousDemandsControls(unittest.TestCase):
    def geometry(self):
        return {'axisXMm':100.,'lintelTopZMm':3370.,'lintelBottomZMm':3070.,
            'lintelRectangleXYMm':[0.,0.,200.,2250.],
            'bearingRectanglesXYMm':[[30.,0.,170.,200.],[30.,2050.,170.,2250.]]}
    def choices(self):return {'lintelWidthMm':200.,'lintelDepthMm':300.,'bearingQuadratureOrder':1}
    def cut(self,end=0,y=0.):
        return dict(memberId='REAR-LINTEL/member/0',kind='seated-wet-beam',end=end,
            physicalPointMm=[100.,y,3220.],breadthMm=200.,depthMm=300.,
            **dict(zip(ACTIONS,[10.,2.,3.,4.,5.,6.])))
    def seats(self):
        rectangles=[*self.geometry()['bearingRectanglesXYMm'],[0.,0.,30.,20.],[170.,0.,200.,20.]]
        return rectangles,[dict(id=f'REAR-BEARING/{i}/0',xyMm=[(r[0]+r[2])/2,(r[1]+r[3])/2],
            areaMm2=(r[2]-r[0])*(r[3]-r[1]),topActive=True,topCompressionKN=2.,
            baseCompressionKN=3.1,bodyOwnFactoredGKN=1.,beddingOwnFactoredGKN=.2) for i,r in enumerate(rectangles)]
    def capture(self):
        rectangles,rows=self.seats()
        return {'windIndex':7,'catalogueRow':{'programme':['a'],'courtProjection':'b'},
            'result':{'choices':self.choices(),'actualReplacement':{'geometry':self.geometry(),
                'lintelMemberCuts':[self.cut(),self.cut(1,2250.)],'lintelInteriorMemberCuts':[
                    {**self.cut(None,1125.),'fraction':.5,'cutSide':'left'},
                    {**self.cut(None,1125.),'fraction':.5,'cutSide':'right'}],
                'bearingBodies':rows,'retainedCrossWallSeatRectanglesXYMm':rectangles[2:]}}}
    def test_end1_outward_wrench_normalizes_to_same_left_resultant_without_refipping_N(self):
        a=self.cut();b=self.cut(1,2250.)
        for k in ACTIONS[1:]:b[k]=-a[k]
        self.assertEqual(cut_record(a,7,self.geometry(),self.choices())['leftResultantKN_KNm'],
                         cut_record(b,7,self.geometry(),self.choices())['leftResultantKN_KNm'])
    def test_review_extrema_retain_complete_actual_vector_and_case_instead_of_synthetic_combination(self):
        a={'windIndex':1,'v':[10.,1.]};b={'windIndex':2,'v':[1.,20.]}
        review=envelope([a,b],'v',['N','M'])
        self.assertEqual(review['N/maximum']['fullSimultaneousRecord'],a)
        self.assertEqual(review['M/maximum']['fullSimultaneousRecord'],b)
        self.assertNotIn([10.,20.],[v['fullSimultaneousRecord']['v'] for v in review.values()])
    def test_both_sides_of_real_point_jump_are_retained(self):
        value=case_demands(self.capture(),7)
        self.assertEqual(len(value['cuts']),4);self.assertEqual(len(value['seats']),4)
        self.assertEqual({r['cutSide'] for r in value['cuts'] if r['end'] is None},{'left','right'})
    def test_omission_duplicate_nonfinite_and_changed_physical_geometry_reject(self):
        for mutation in ('drop-end','duplicate-cut','nan','outside','different-width'):
            c=self.capture();a=c['result']['actualReplacement']
            if mutation=='drop-end':a['lintelMemberCuts'].pop()
            elif mutation=='duplicate-cut':a['lintelInteriorMemberCuts'].append(copy.deepcopy(a['lintelInteriorMemberCuts'][0]))
            elif mutation=='nan':a['lintelInteriorMemberCuts'][0]['torsionKNm']=math.nan
            elif mutation=='outside':a['lintelMemberCuts'][0]['physicalPointMm'][0]+=1
            else:a['lintelMemberCuts'][0]['breadthMm']+=1
            with self.subTest(mutation=mutation),self.assertRaises(ValueError):case_demands(c,7)
    def test_independent_seat_area_pressure_centroid_and_body_closure(self):
        rectangles,rows=self.seats()
        result=seat_records(rows,7,self.geometry(),self.choices(),rectangles[2:])
        self.assertAlmostEqual(result[0]['top']['maximumFibrePressureMPa'],2000/28000)
        self.assertEqual(result[0]['top']['compressionCentroidXYMm'],[100.,100.])
        self.assertEqual(result[0]['top']['momentAboutPatchCentreKNm'],[0.,0.,0.])
        rows[0]['topCompressionKN']=0.;rows[0]['baseCompressionKN']=1.1;rows[0]['topActive']=False
        result=seat_records(rows,7,self.geometry(),self.choices(),rectangles[2:])
        self.assertIsNone(result[0]['top']['compressionCentroidXYMm'])
    def test_missing_shifted_negative_or_unbalanced_physical_fibre_reject(self):
        for mutation in ('drop','duplicate','move','area','tension','body'):
            rectangles,rows=self.seats()
            if mutation=='drop':rows.pop()
            elif mutation=='duplicate':rows[-1]=copy.deepcopy(rows[0])
            elif mutation=='move':rows[0]['xyMm'][0]=999
            elif mutation=='area':rows[0]['areaMm2']*=2
            elif mutation=='tension':rows[0]['topCompressionKN']=-1.;rows[0]['baseCompressionKN']=.1
            else:rows[0]['bodyOwnFactoredGKN']*=2
            with self.subTest(mutation=mutation),self.assertRaises(ValueError):seat_records(rows,7,self.geometry(),self.choices(),rectangles[2:])

if __name__=='__main__':unittest.main()
