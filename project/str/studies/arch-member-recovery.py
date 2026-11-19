"""Signed section responses, reused by linear superposition for every guard location."""
from itertools import pairwise


class MemberRecovery:
    def __init__(self, model, normal):
        self.model = model
        self.normal = normal
        self.rows = []
        for element in normal.elements:
            kind, left, right, *_ = element
            if kind == 'knee':
                continue
            middle = (left[1]+right[1])/2
            if kind == 'arch':
                index = model['arch'].index(left)
                height = 215
                fraction = 0
            else:
                index = len(model['arch'])-1+next(i for i,(l,r) in enumerate(pairwise(model['right'])) if l[1]<=middle<=r[1])
                height = 205
                fraction = max(0., min(1., (4550-middle)/550))
            width = 140+85*fraction
            ys = (49-2*fraction,91+8*fraction)
            xs = (49,166) if kind == 'arch' else (53,152)
            self.rows.append((element, index, (kind, middle, height, width, xs, ys)))

    def signed(self, strong_ends, weak_ends, ceiling, normal_load):
        model = self.model
        strong = model['subframe'](strong_ends,self.normal.cr,ceiling,[0,0],signed=True)[2]
        u = self.normal.response(weak_ends,normal_load)[0]
        rows = []
        for element, index, geometry in self.rows:
            kind, left, right, dofs, twist, matrix, stiffness = element
            motion = [sum(u[i]*f for i,f in d) for d in dofs]
            normal = model['mul'](matrix,motion)
            torque = sum(u[i]*f for i,f in twist)*stiffness/1e6
            strong_ends = strong[2*index:2*index+2]
            assert all(end[0]==kind for end in strong_ends)
            rows.append((*strong_ends[0][1:], *strong_ends[1][1:], normal[1]/1e6,normal[3]/1e6,normal[0]/1000,normal[2]/1000,torque))
        return rows
