import copy
import math
from types import SimpleNamespace
import unittest

from finite_joint_contact_trace import remap_contacts


def fixture(serial=False):
    corners = [(0., 0.), (200., 0.), (200., 100.), (0., 100.)]
    x, y = 50., 25.
    # Independent bilinear tensor product, not the production shape function.
    weights = [(1-x/200)*(1-y/100), x/200*(1-y/100), x*y/20000, (1-x/200)*y/100]
    names = ['VERTICAL-FLOOR/normal/' + str(i) for i in range(4)]
    nodes = {name: (*p, 3270.) for name, p in zip(names, corners)}
    nodes.update(G=(0., 0., -180.), S=(x, y, 3170.))
    fixed = {('S', i): 0. for i in (0, 1, 3, 4, 5)}
    upper = [(name, [0., 0., w, 0., 0., 0.]) for name, w in zip(names, weights)]
    lower = [('G', [0., 0., -1., -y, x, 0.])]
    springs = []
    if serial:
        nodes['BODY'] = (x, y, 3170.)
        lower = [('BODY', [0., 0., -1., 0., 0., 0.])]
        springs.append({'id': 'body', 'terms': [('BODY', [0., 0., 1., 0., 0., 0.]),
                        ('G', [0., 0., -1., -y, x, 0.])],
                        'stiffness': 12., 'mode': 'bilateral', 'gap': 0.})
    springs.append({'id': 'f', 'terms': upper + lower, 'stiffness': 20., 'mode': 'compression', 'gap': 0.})
    springs.append({'id': 'unaffected', 'terms': [('G', [0., 0., 1., 0., 0., 0.])],
                    'stiffness': 3., 'mode': 'bilateral', 'gap': 0.})
    frame = SimpleNamespace(nodes=nodes, fixed=fixed, loads={'G': [0, 0, -1.5, 0, 0, 0]},
                            members=[('actual-grid', 'G', 'G', [[1., 0.], [0., 1.]])], springs=springs)
    fibre = {'id': 'f', 'xyMm': [x, y], 'areaMm2': 20000., 'stiffnessKNPerMm': 20.}
    old = {'operator': {'assembled': {'elements': [{'rectangleXYMm': [0., 0., 200., 100.]}],
            'pointTerms': {(p, 0): [(i, 1.)] for i, p in enumerate(corners)}}},
           'portTerms': [[(name, [0., 0., 1., 0., 0., 0.])] for name in names]}
    model = {'model': frame, 'verticalFloor': {'fibres': [fibre], 'operator': {'changedExterior': True}},
             'families': {'physical-G': {'BODY' if serial else 'G': [0, 0, -1.5, 0, 0, 0]}},
             'lowerCoreBodies': {'inventory': {'bodyTopZMm': 3170., 'physicalGKN': 3.},
                                 'request': {'masonryUnitWeightKNPerM3': 20.}}}
    return model, old, lower


def value(rows, displacements):
    return math.fsum(math.fsum(a*b for a, b in zip(row, displacements[node])) for node, row in rows)


class ContactTraceTests(unittest.TestCase):
    def test_direct_and_serial_lower_laws_gravity_and_source_are_preserved(self):
        for serial in (False, True):
            with self.subTest(serial=serial):
                model, old, lower = fixture(serial)
                before = copy.deepcopy(model)
                source = copy.deepcopy(old)
                audit = remap_contacts(model, [-1., -1., 201., 101.], {'f': 'S'}, old)
                frame = model['model']
                self.assertEqual(audit['count'], 1)
                self.assertLess(audit['maximumUnitWrenchResidualKN_KNm'], 1e-12)
                changed = next(s for s in frame.springs if s['id'] == 'f')
                self.assertEqual(changed['terms'], [('S', [0., 0., 1., 0., 0., 0.]), *lower])
                self.assertEqual({k: v for k, v in changed.items() if k != 'terms'},
                                 {k: v for k, v in next(s for s in before['model'].springs if s['id'] == 'f').items() if k != 'terms'})
                self.assertEqual([s for s in frame.springs if s['id'] != 'f'],
                                 [s for s in before['model'].springs if s['id'] != 'f'])
                for key in ('families', 'lowerCoreBodies', 'verticalFloor'):
                    self.assertEqual(model[key], before[key])
                for key in ('nodes', 'fixed', 'loads', 'members'):
                    self.assertEqual(getattr(frame, key), getattr(before['model'], key))
                self.assertEqual(old, source)
                self.assertEqual(len(audit['oldNormalNodeCandidates']), 4)
                self.assertTrue(audit['callerMustProveUnusedBeforeGaugeFixing'])

    def test_affine_rigid_motion_and_independent_spring_energy_work(self):
        model, old, _ = fixture(True)
        before = copy.deepcopy(model['model'].springs[1]['terms'])
        remap_contacts(model, [-1, -1, 201, 101], {'f': 'S'}, old)
        after = model['model'].springs[1]['terms']
        frame = model['model']
        for ax, ay, c in ((0., 0., 1.), (.002, 0., .3), (0., -.004, .2), (.003, -.001, .7)):
            disp = {n: [0., 0., c+ax*x+ay*y, ay, -ax, 0.] for n, (x, y, _) in frame.nodes.items()}
            self.assertAlmostEqual(value(before, disp), 0., places=12)
            self.assertAlmostEqual(value(after, disp), 0., places=12)
        # A bilinear plate motion and independently moved masonry top produce
        # equal compression and spring energy before/after the work-map change.
        disp = {n: [0., 0., -.2 + .0002*x - .0003*y + .000001*x*y, 0., 0., 0.]
                for n, (x, y, _) in frame.nodes.items()}
        disp['BODY'][2] = .15
        old_delta = value(before, disp)
        new_delta = value(after, disp)
        self.assertLess(old_delta, 0)
        self.assertAlmostEqual(old_delta, new_delta, places=12)
        self.assertAlmostEqual(20*old_delta**2/2, 20*new_delta**2/2, places=12)
        force = 20*new_delta
        virtual = {n: [math.sin(i+j) for j in range(6)] for i, n in enumerate(frame.nodes)}
        virtual['S'][2] = value(before[:-1], virtual)
        old_power = force*value(before, virtual)
        new_power = math.fsum(force*a*b for n, row in after for a, b in zip(row, virtual[n]))
        self.assertAlmostEqual(old_power, new_power, places=12)

    def test_bad_catalogue_or_geometry_is_atomic(self):
        mutations = [lambda m, o, ns: ns.clear(),
                     lambda m, o, ns: ns.update(extra='S'),
                     lambda m, o, ns: m['model'].nodes.update(S=(50.00001, 25., 3170.)),
                     lambda m, o, ns: m['model'].fixed.update({('S', 2): 0.}),
                     lambda m, o, ns: m['model'].fixed.pop(('S', 0)),
                     lambda m, o, ns: ns.update(f='VERTICAL-FLOOR/normal/0')]
        for mutate in mutations:
            model, old, _ = fixture()
            mapping = {'f': 'S'}
            mutate(model, old, mapping)
            before = copy.deepcopy(model)
            with self.assertRaises(ValueError):
                remap_contacts(model, [-1, -1, 201, 101], mapping, old)
            self.assertEqual(model['model'].__dict__, before['model'].__dict__)

    def test_changed_old_map_law_and_missing_material_are_rejected(self):
        mutations = [lambda m, o: m['model'].springs[0]['terms'][0][1].__setitem__(3, .1),
                     lambda m, o: m['model'].springs[0].update(stiffness=21.),
                     lambda m, o: m['model'].springs[0].update(mode='bilateral'),
                     lambda m, o: o['operator']['assembled'].update(elements=[]),
                     lambda m, o: o['operator']['assembled']['pointTerms'].__setitem__(((0., 0.), 0), [(8, 1.)])]
        for mutate in mutations:
            model, old, _ = fixture()
            mutate(model, old)
            before = copy.deepcopy(model['model'].springs)
            with self.assertRaises(ValueError):
                remap_contacts(model, [-1, -1, 201, 101], {'f': 'S'}, old)
            self.assertEqual(model['model'].springs, before)

    def test_patch_change_and_double_application_cannot_reuse_mapping(self):
        model, old, _ = fixture()
        with self.assertRaises(ValueError):
            remap_contacts(model, [50., -1., 201., 101.], {'f': 'S'}, old)
        unchanged = copy.deepcopy(model['model'].springs)
        audit = remap_contacts(model, [50., -1., 201., 101.], {}, old)
        self.assertEqual(audit['count'], 0)
        self.assertEqual(model['model'].springs, unchanged)
        remap_contacts(model, [-1., -1., 201., 101.], {'f': 'S'}, old)
        changed = copy.deepcopy(model['model'].springs)
        with self.assertRaises(ValueError):
            remap_contacts(model, [-1., -1., 201., 101.], {'f': 'S'}, old)
        self.assertEqual(model['model'].springs, changed)


if __name__ == '__main__':
    unittest.main()
