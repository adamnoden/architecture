import math


def rectangle_moments(rectangle):
    a,b,c,d = rectangle
    if c <= a or d <= b:
        return [0.,0.,0.]
    area = (c-a)*(d-b)
    return [area,area*(a+c)/2,area*(b+d)/2]


def circle_rectangle_moments(centre, radius, rectangle):
    cx,cy = centre
    a,b,c,d = rectangle
    left,right = max(a,cx-radius),min(c,cx+radius)
    if right <= left or d <= cy-radius or b >= cy+radius:
        return [0.,0.,0.]
    cuts = {left,right}
    for level in (b,d):
        height = level-cy
        if abs(height) < radius:
            reach = math.sqrt(radius*radius-height*height)
            cuts.update(value for value in (cx-reach,cx+reach) if left < value < right)
    def primitive(x):
        t = max(-radius,min(radius,x-cx))
        s = math.sqrt(max(0.,radius*radius-t*t))
        f = (t*s+radius*radius*math.asin(t/radius))/2
        return f,cx*f-s**3/3,t
    result = [0.,0.,0.]
    points = sorted(cuts)
    for low,high in zip(points,points[1:]):
        mid = (low+high)/2
        span = math.sqrt(max(0.,radius*radius-(mid-cx)**2))
        upper = (cy,1) if cy+span < d else (d,0)
        lower = (cy,-1) if cy-span > b else (b,0)
        if upper[0]+upper[1]*span <= lower[0]+lower[1]*span:
            continue
        f0,g0,t0 = primitive(low)
        f1,g1,t1 = primitive(high)
        av,bv = upper[0]-lower[0],upper[1]-lower[1]
        result[0] += av*(high-low)+bv*(f1-f0)
        result[1] += av*(high*high-low*low)/2+bv*(g1-g0)
        square = upper[1]**2-lower[1]**2
        constant = upper[0]**2-lower[0]**2+square*radius*radius
        root = 2*(upper[0]*upper[1]-lower[0]*lower[1])
        result[2] += (constant*(high-low)-square*(t1**3-t0**3)/3+root*(f1-f0))/2
    return result


def net_rectangle_moments(body, rectangular_holes, circular_holes):
    xs = sorted({body[0],body[2],*[value for hole in rectangular_holes for value in (hole[0],hole[2]) if body[0]<value<body[2]]})
    ys = sorted({body[1],body[3],*[value for hole in rectangular_holes for value in (hole[1],hole[3]) if body[1]<value<body[3]]})
    for i,left in enumerate(circular_holes):
        for right in circular_holes[i+1:]:
            if math.dist(left['centreXYMm'],right['centreXYMm']) < (left['diameterMm']+right['diameterMm'])/2-1e-8:
                raise ValueError('Overlapping circular apertures require a joined void boundary; no double subtraction is allowed')
    total = [0.,0.,0.]
    for a,c in zip(xs,xs[1:]):
        for b,d in zip(ys,ys[1:]):
            x,y = (a+c)/2,(b+d)/2
            if any(l<x<r and low<y<high for l,low,r,high in rectangular_holes):
                continue
            rectangle = [a,b,c,d]
            values = rectangle_moments(rectangle)
            for hole in circular_holes:
                cut = circle_rectangle_moments(hole['centreXYMm'],hole['diameterMm']/2,rectangle)
                values = [value-removed for value,removed in zip(values,cut)]
            if values[0] < -1e-5:
                raise ValueError('The explicit aperture partition gives negative material area')
            total = [value+addition for value,addition in zip(total,values)]
    return total


def rectangles_overlap(left, right):
    return min(left[2],right[2])>max(left[0],right[0]) and min(left[3],right[3])>max(left[1],right[1])
