"""Six-degree beam sections for an outward-widened inner arch and jamb.

The member centre follows the actual normal centroid through the lower taper.
Support degrees remain on the house's old wall-axis reference, with the complete
rigid offset transform. This permits axial / two bending / torsion coupling.
"""
from itertools import pairwise
import math


def cross(a, b):
    return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])


def unit(a):
    length = math.sqrt(sum(v*v for v in a))
    return tuple(v/length for v in a)


def rectangular_torsion(width, depth):
    small, large = sorted((width, depth))
    return large*small**3*(1/3-.21*small/large*(1-small**4/(12*large**4)))


class SpaceArch:
    def __init__(self, model, normal_width, cracked_ei, centreline_offsets=True, release_near_rotation=False):
        self.model = model
        self.width = normal_width
        self.crack = cracked_ei
        self.offsets = centreline_offsets
        self.arc = model['arch']
        self.jamb = [(model['xJ'], z) for z in sorted({
            *(point[1] for point in model['right']), 4700, 5430, 5570, 5800
        })]
        self.nodes = sorted(set(self.arc+self.jamb))
        self.index = {point:6*i for i, point in enumerate(self.nodes)}
        self.size = 6*len(self.nodes)
        self.matrix = [[0.]*self.size for _ in range(self.size)]
        self.elements = []
        for left, right in pairwise(self.arc):
            self.member(left, right, normal_width, 215, 'arch')
        for left, right in pairwise(self.jamb):
            middle = (left[1]+right[1])/2
            self.member(left, right, self.jamb_width(middle), 205, 'jamb')
        self.member(self.arc[-1], self.jamb[-1], normal_width, 215, 'knee')
        self.supports = (self.arc[0], self.jamb[0])
        self.fixed = [self.index[point]+i for point in self.supports for i in range(6)]
        if release_near_rotation:
            # Local Y is the wall normal. Allow only the near end to rotate
            # about it; keep all three translations and both other rotations.
            self.fixed.remove(self.index[self.arc[0]]+4)
        self.free = [i for i in range(self.size) if i not in self.fixed]
        self.solve = model['p']['fac']([[self.matrix[i][j] for j in self.free] for i in self.free])
        self.columns = []
        empty = [0.]*self.size
        for column in range(12):
            boundary = [float(i == column) for i in range(12)]
            self.columns.append(self.response(boundary, empty)[1])
        assert max(abs(self.columns[i][j]-self.columns[j][i]) for i in range(12) for j in range(12)) < .001

    def jamb_width(self, height):
        fraction = max(0., min(1., (4550-height)/550))
        return self.width+(225-self.width)*fraction

    def offset(self, point):
        if not self.offsets:
            return 0.
        width = self.jamb_width(point[1]) if point in self.jamb else self.width
        return -(width-140)/2

    def position(self, point):
        return point[0], self.offset(point), point[1]

    def member(self, left, right, width, depth, kind):
        start, end = self.position(left), self.position(right)
        length = math.dist(start, end)
        axis = unit(tuple(b-a for a, b in zip(start, end)))
        normal = unit(tuple(value-axis[1]*component for value, component in zip((0.,1.,0.), axis)))
        radial = cross(axis, normal)
        bases = [self.index[left], self.index[right]]
        def direction(vector, end, rotation=False):
            offset = bases[end]+(3 if rotation else 0)
            return [(offset+i, value) for i, value in enumerate(vector) if value]
        axial = [(i,-v) for i,v in direction(axis,0)]+direction(axis,1)
        self.model['p']['add'](self.matrix, axial, 33000*width*depth/length)
        torsion = [(i,-v) for i,v in direction(axis,0,True)]+direction(axis,1,True)
        torsion_rigidity = self.crack*33000/2.4*rectangular_torsion(width,depth)/length
        self.model['p']['add'](self.matrix,torsion,torsion_rigidity)
        beam = [[12,6*length,-12,6*length],
                [6*length,4*length**2,-6*length,2*length**2],
                [-12,-6*length,12,-6*length],
                [6*length,2*length**2,-6*length,4*length**2]]
        bending = []
        for name, displacement, rotation, inertia in [
            ('weak',normal,radial,depth*width**3/12),
            ('strong',radial,tuple(-v for v in normal),width*depth**3/12)
        ]:
            dofs = [direction(displacement,0),direction(rotation,0,True),
                    direction(displacement,1),direction(rotation,1,True)]
            stiffness = [[entry*self.crack*33000*inertia/length**3 for entry in row] for row in beam]
            self.model['p']['insert'](self.matrix,dofs,stiffness)
            bending.append((name,dofs,stiffness))
        self.elements.append({
            'kind':kind,'left':left,'right':right,'length':length,'width':width,'depth':depth,
            'axes':(axis,normal,radial),'axial':axial,'ea':33000*width*depth/length,
            'torsion':torsion,'gj':torsion_rigidity,'bending':bending
        })

    def end_transform(self, end):
        # Ordered old terminals are strong near/far (ux,uz,rotation about -y),
        # then normal near/far (uy,rx,rz). Rotations use mrad in the house.
        strong = 3*end
        normal = 6+3*end
        eccentricity = self.offset(self.supports[end])
        return [
            [(strong,1.),(normal+2,-eccentricity/1000)],
            [(normal,1.)],
            [(strong+1,1.),(normal+1,eccentricity/1000)],
            [(normal+1,.001)],
            [(strong+2,-.001)],
            [(normal+2,.001)]
        ]

    def response(self, ends, load):
        displacement = [0.]*self.size
        for end, point in enumerate(self.supports):
            for dof, terms in enumerate(self.end_transform(end)):
                displacement[self.index[point]+dof] = sum(ends[i]*value for i,value in terms)
        rhs = [load[i]-sum(self.matrix[i][j]*displacement[j] for j in self.fixed) for i in self.free]
        for i,value in zip(self.free,self.solve(rhs)):
            displacement[i] = value
        reactions = [0.]*12
        for end,point in enumerate(self.supports):
            for dof,terms in enumerate(self.end_transform(end)):
                index = self.index[point]+dof
                force = sum(v*d for v,d in zip(self.matrix[index],displacement))-load[index]
                for i,value in terms:
                    reactions[i] += force*value
        return displacement,reactions

    def point(self, rhs, node, force, physical_position=None):
        actual = self.position(node)
        offset = tuple(a-b for a,b in zip(physical_position or actual,actual))
        moment = cross(offset,force)
        for dof,value in enumerate((*force,*moment)):
            rhs[self.index[node]+dof] += value

    def local_actions(self, displacement, element_loads=None):
        result = []
        for index,element in enumerate(self.elements):
            def project(terms):
                return sum(displacement[i]*v for i,v in terms)
            row = {'kind':element['kind'],'left':element['left'],'right':element['right'],
                   'axial':element['ea']*project(element['axial'])/1000,
                   'torsion':element['gj']*project(element['torsion'])/1e6}
            for name,dofs,stiffness in element['bending']:
                values = self.model['mul'](stiffness,[project(terms) for terms in dofs])
                row[name] = [values[0]/1000,values[1]/1e6,values[2]/1000,values[3]/1e6]
            if element_loads:
                loading=element_loads[index]
                row['endAxial']=[row['axial']+loading['axialHalf'],row['axial']-loading['axialHalf']]
                for name in ('weak','strong'):
                    row[name]=[a-b for a,b in zip(row[name],loading[name])]
            else:
                row['endAxial']=[row['axial'],row['axial']]
            result.append(row)
        return result

    def gravity(self, ceiling):
        """Consistent self-weight loads and ceiling points at the old wall line."""
        rhs = [0.]*self.size
        element_loads = []
        for element in self.elements:
            left, right = element['left'], element['right']
            length, width, depth = element['length'], element['width'], element['depth']
            force_per_length = -1.35*width*depth*25/1e9*math.dist(left,right)/length
            ceiling_total = 0.
            if element['kind'] == 'arch':
                middle = (left[0]+right[0])/2
                top = self.model['cz']+math.sqrt(self.model['ro']**2-(middle-1800)**2)
                horizontal = right[0]-left[0]
                force_per_length -= 1.35*width*max(0,6540-top)*25/1e9*horizontal/length
                ceiling_total = ceiling(middle)*horizontal/1000
            # Force is in N/mm. Section dimensions and the axis length are mm.
            force_per_length *= 1000
            distributed = (0.,0.,force_per_length)
            axis, normal, radial = element['axes']
            for node in (left,right):
                self.point(rhs,node,tuple(value*length/2 for value in distributed))
                if ceiling_total:
                    self.point(rhs,node,(0.,0.,-ceiling_total*1000/2),(node[0],0.,node[1]))
            end_moment = cross(axis,distributed)
            for side,node in enumerate((left,right)):
                for dof,moment in enumerate(end_moment):
                    rhs[self.index[node]+3+dof] += (1 if side == 0 else -1)*moment*length**2/12
            axial_half = sum(a*b for a,b in zip(distributed,axis))*length/2/1000
            loads = {'axialHalf':axial_half}
            for name,direction in [('weak',normal),('strong',radial)]:
                force = sum(a*b for a,b in zip(distributed,direction))
                loads[name] = [force*length/2/1000,force*length**2/12/1e6,
                               force*length/2/1000,-force*length**2/12/1e6]
            element_loads.append(loads)
        return rhs,element_loads

    def global_totals(self, rhs):
        totals = [0.]*6
        for node in self.nodes:
            i = self.index[node]
            force = rhs[i:i+3]
            moment = cross(self.position(node),force)
            for axis in range(3):
                totals[axis] += force[axis]/1000
                totals[3+axis] += (moment[axis]+rhs[i+3+axis])/1e6
        return totals


    def applied_reaction_totals(self, reactions):
        totals=[0.]*6
        for end,point in enumerate(self.supports):
            strong=3*end;normal=6+3*end
            force=[reactions[strong],reactions[normal],reactions[strong+1]]
            moment=[reactions[normal+1]*1000,-reactions[strong+2]*1000,reactions[normal+2]*1000]
            reference=(point[0],0.,point[1])
            lever=cross(reference,force)
            for axis in range(3):
                totals[axis]+=force[axis]/1000
                totals[3+axis]+=(moment[axis]+lever[axis])/1e6
        return totals
