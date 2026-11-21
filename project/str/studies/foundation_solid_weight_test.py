import copy
import itertools
import math
from pathlib import Path
import unittest

from foundation_solid_weight import (disjoint_solid_union, foundation_solid_inventory,
    load_foundation_solid_weight_source, reference_foundation_solid_weight_case, subtract_box)

ROOT = Path(__file__).resolve().parents[3]


def independent_union(solids):
    """Independent X/Y sweep of merged Z intervals; no solid subtraction."""
    boxes = [row['boxXYZMm'] for row in solids]
    xs = sorted({p[i] for p in boxes for i in (0,3)}); totals=[];moments=[[],[],[]]
    for x0,x1 in zip(xs,xs[1:]):
        active=[p for p in boxes if p[0]<(x0+x1)/2<p[3]]
        ys=sorted({p[i] for p in active for i in (1,4)})
        for y0,y1 in zip(ys,ys[1:]):
            intervals=sorted((p[2],p[5]) for p in active if p[1]<(y0+y1)/2<p[4]); merged=[]
            for lo,hi in intervals:
                if merged and lo<=merged[-1][1]:merged[-1][1]=max(hi,merged[-1][1])
                else:merged.append([lo,hi])
            for lo,hi in merged:
                volume=(x1-x0)*(y1-y0)*(hi-lo)/1e9;totals.append(volume)
                for axis,coordinate in enumerate(((x0+x1)/2,(y0+y1)/2,(lo+hi)/2)):moments[axis].append(volume*coordinate)
    return math.fsum(totals),[math.fsum(values) for values in moments]


class FoundationSolidWeightTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_foundation_solid_weight_source(ROOT)
        cls.case=reference_foundation_solid_weight_case(cls.source)

    def test_actual_union_independent_volume_and_three_first_moments(self):
        result=foundation_solid_inventory(self.case,self.source);volume,first=independent_union(result['solids'])
        self.assertAlmostEqual(volume,35.3932059375,places=11)
        self.assertAlmostEqual(result['RCVolumeM3'],volume,places=11)
        for actual,expected in zip(result['firstVolumeMomentsM3Mm'],first):self.assertAlmostEqual(actual,expected,places=8)
        self.assertAlmostEqual(result['removedOverlapVolumeM3'],13.4000240625,places=10)

    def test_union_cells_are_disjoint_and_keep_owner_provenance(self):
        result=foundation_solid_inventory(self.case,self.source)
        for a,b in itertools.combinations(result['fragments'],2):
            p,q=a['boxXYZMm'],b['boxXYZMm']
            self.assertFalse(all(min(p[i+3],q[i+3])-max(p[i],q[i])>1e-8 for i in range(3)))
        self.assertTrue(all(row['ownerId'].startswith('CAP/') if row['ownerKind']=='cap' else row['ownerId'].startswith('GRID/') for row in result['fragments']))

    def test_partial_nested_touching_and_reversed_ownership(self):
        boxes=[{'id':str(i),'kind':'test','boxXYZMm':p} for i,p in enumerate(([0,0,0,10,10,10],[5,5,5,15,15,15],[2,2,2,4,4,4],[15,5,5,20,15,15]))]
        for order in (boxes,list(reversed(boxes))):
            rows=disjoint_solid_union(order);volume=math.fsum(math.prod(p['boxXYZMm'][i+3]-p['boxXYZMm'][i] for i in range(3))/1e9 for p in rows)
            self.assertAlmostEqual(volume,(1000+1000-125+500)/1e9,places=14)
        self.assertEqual(subtract_box([0,0,0,1,1,1],[0,0,0,1,1,1]),[])

    def test_density_perturbation_changes_weight_not_geometry_or_centroid(self):
        baseline=foundation_solid_inventory(self.case,self.source);changed=foundation_solid_inventory({**self.case,'unitWeightKNPerM3':20},self.source)
        self.assertEqual(changed['fragments'],baseline['fragments']);self.assertEqual(changed['centroidXYZMm'],baseline['centroidXYZMm'])
        self.assertAlmostEqual(changed['physicalGKN'],.8*baseline['physicalGKN'],places=10)

    def test_zero_factor_keeps_inventory_without_inventing_cut_credit(self):
        result=foundation_solid_inventory({**self.case,'gravityFactor':0},self.source)
        self.assertEqual(result['physicalGKN'],0);self.assertGreater(result['RCVolumeM3'],0)
        self.assertEqual(result['aboveSourceDPCCompressionCreditKN'],0);self.assertEqual(result['verticalExtentZMm'],[-750,-180])
        self.assertFalse(result['candidateAccepted']);self.assertFalse(result['capGridResistanceAccepted'])

    def test_stale_missing_injected_and_out_of_domain_inputs_reject(self):
        for field,value in [('unitWeightKNPerM3',float('nan')),('gravityFactor',-1),('unitWeightKNPerM3',31),('sourceSHA256',{}),('candidateAccepted',True)]:
            candidate=copy.deepcopy(self.case);candidate[field]=value
            with self.assertRaises(ValueError):foundation_solid_inventory(candidate,self.source)
        candidate=copy.deepcopy(self.case);del candidate['gravityFactor']
        with self.assertRaises(ValueError):foundation_solid_inventory(candidate,self.source)

    def test_actual_dpc_origin_rejects_material_at_or_above_cut(self):
        candidate=copy.deepcopy(self.source);candidate['dpcIntervalZMm']=[-700,-680]
        with self.assertRaises(ValueError):foundation_solid_inventory(self.case,candidate)

    def test_grid_requires_real_named_heads_and_axis_geometry(self):
        candidate=copy.deepcopy(self.source);candidate['grid']['heads'].pop()
        with self.assertRaises(ValueError):foundation_solid_inventory(self.case,candidate)
        candidate=copy.deepcopy(self.source);candidate['grid']['crossBeams']['rear-E']['b'][1]+=1
        with self.assertRaises(ValueError):foundation_solid_inventory(self.case,candidate)


if __name__=='__main__':unittest.main()
