"""Independent PL/4 witness: work maps alone do not recover physical cuts."""
import unittest
from joined_successor_kernel import FrameModel,rectangle_section
from rc_floor_house_loads import (consistent_member_point_load,recovered_member_actions,
    _member_cuts,_interior_member_cuts,_consistent_point)
from rc_member_load_test import LAW


def specimen(split=False):
    f=FrameModel();f.node('a',[0.,0.,0.]);f.node('b',[1000.,0.,0.]);members={}
    if split:f.node('mid',[500.,0.,0.])
    for name,a,b in [('left','a','mid'),('right','mid','b')] if split else [('beam','a','b')]:
        f.member(name,a,b,rectangle_section(200,140),LAW,y_axis=[0,1,0])
        members[name]={'a':a,'b':b,'physicalStartMm':f.nodes[a],'physicalEndMm':f.nodes[b],
            'depthMm':200.,'breadthMm':140.,'kind':'upstand'}
    for n in ('a','b'):
        for d in range(5):f.fixed[n,d]=0.
    return {'model':f,'members':members,'request':{'frameLaw':LAW}}


class ReceiverActionRecoveryTest(unittest.TestCase):
    def test_mapped_response_requires_physical_interior_origin_or_actual_attachment_node(self):
        m=specimen();f=m['model'];v=consistent_member_point_load(m,m['members']['beam'],[500.,0.,0.],[0.,1.,0.])
        for i,n in enumerate(('a','b')):f.load(n,v[6*i:6*i+6])
        raw=f.solve();uncorrected=_member_cuts(m,recovered_member_actions(m,raw,{}))
        self.assertAlmostEqual(abs(uncorrected[0]['bendingZKNm']),.125,12)
        _consistent_point(m,{},'interface','beam',m['members']['beam'],[500.,0.,0.],[0.,1.,0.],apply=False)
        recovered=recovered_member_actions(m,raw,{'interface':1.})
        self.assertLess(max(abs(r['bendingZKNm']) for r in _member_cuts(m,recovered)),1e-12)
        self.assertAlmostEqual(max(abs(r['bendingZKNm']) for r in _interior_member_cuts(m,recovered,{'interface':1.})),.25,12)
        nodal=specimen(split=True);nodal['model'].load('mid',[0.,1.,0.,0.,0.,0.]);actual=nodal['model'].solve()
        cuts=_member_cuts(nodal,recovered_member_actions(nodal,actual,{}))
        self.assertAlmostEqual(max(abs(r['bendingZKNm']) for r in cuts),.25,12)
        self.assertLess(max(abs(r['bendingZKNm']) for r in cuts if r['physicalPointMm'][0] in (0.,1000.)),1e-12)



if __name__=='__main__':unittest.main()
