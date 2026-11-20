from html import escape
import math


def render_distributed_floor(result):
    if result.get('schema')!='str-distributed-floor-result/1' or result.get('installedAcceptance') is not False:
        raise ValueError('Expected the explicit computed, unaccepted diaphragm result')
    floor = result['floor']
    receiving_count = len(result['unmodelledIntermediateReceivingPorts'])
    location_count = len({tuple(port['xyMm']) for port in result['unmodelledIntermediateReceivingPorts']})
    band_width,band_depth = [floor['bands'][0][key] for key in ('width','depth')]
    triangles = floor['meshTrianglesXYMm']
    all_points = [point for triangle in triangles for point in triangle]+[head['xyzMm'][:2] for head in result['heads']]
    xmin,ymin = [min(point[axis] for point in all_points) for axis in (0,1)]
    xmax,ymax = [max(point[axis] for point in all_points) for axis in (0,1)]
    width,height = xmax-xmin,ymax-ymin
    margin = width*.055
    title_height = width*.12
    legend_width = width*.32
    total_width = width+3*margin+legend_width
    total_height = height+2*margin+title_height
    def p(point):
        return [point[0]-xmin+margin,ymax-point[1]+margin+title_height]
    def points(values):
        return ' '.join(','.join(f'{value:.3f}' for value in p(point)) for point in values)
    def text(x,y,value,size=155,weight='normal',fill='#222'):
        return f'<text x="{x:.3f}" y="{y:.3f}" font-size="{size}" font-weight="{weight}" fill="{fill}">{escape(str(value))}</text>'
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="{1500*total_height/total_width:.0f}" viewBox="0 0 {total_width:.3f} {total_height:.3f}" role="img" aria-label="Conditional perforated diaphragm, four finite wall paths and unmodelled receivers">',
             '<rect width="100%" height="100%" fill="white"/>','<g font-family="sans-serif">',
             text(margin,margin*.7,'FOUR-WALL / PERFORATED-FLOOR COMPATIBILITY',240,'bold'),
             text(margin,margin*1.2,'Computed comparison. No structural selection or complete-house acceptance.',170)]
    for triangle in triangles:
        parts.append(f'<polygon points="{points(triangle)}" fill="#e7e7e7" stroke="#b8b8b8" stroke-width="5"/>')
    for band in floor['bands']:
        axis,datum,low,high = [band[key] for key in ('axis','datum','lo','hi')]
        half = band['width']/2
        rectangle = [[low,datum-half],[high,datum-half],[high,datum+half],[low,datum+half]] if axis==0 else [[datum-half,low],[datum+half,low],[datum+half,high],[datum-half,high]]
        parts.append(f'<polygon points="{points(rectangle)}" fill="#707070" fill-opacity=".65" stroke="#444" stroke-width="10"/>')
    for port in result['unmodelledIntermediateReceivingPorts']:
        x,y = p(port['xyMm'])
        parts.append(f'<circle cx="{x:.3f}" cy="{y:.3f}" r="68" fill="white" stroke="#777" stroke-width="16" stroke-dasharray="25 15"/>')
    for port in floor['ports']:
        for a,b,c,d in port['rectangles']:
            parts.append(f'<polygon points="{points([[a,b],[c,b],[c,d],[a,d]])}" fill="#222" fill-opacity=".75"/>')
        x,y = p(port['originXYMm'])
        parts.append(text(x+120,y-145,port['id'],180,'bold'))
    reaction_scale = max(abs(head['reactionKN_KNm'][2]) for head in result['heads']) or 1.
    for head in result['heads']:
        x,y = p(head['xyzMm'])
        reaction = head['reactionKN_KNm'][2]
        radius = 42+70*math.sqrt(abs(reaction)/reaction_scale)
        fill = 'white' if reaction<0 else '#111'
        parts.append(f'<circle cx="{x:.3f}" cy="{y:.3f}" r="{radius:.3f}" fill="{fill}" stroke="#111" stroke-width="13"><title>{escape(head["id"])}: support Fz {reaction:+.4f}kN; Fx {head["reactionKN_KNm"][0]:+.4f}kN; Fy {head["reactionKN_KNm"][1]:+.4f}kN</title></circle>')
        parts.append(text(x+105,y+65,head['id'],125))
    lx = width+margin*2.1
    ly = title_height+margin
    lines = [
        ('BOUNDARY',190,'bold'),
        ('Native first-floor wind band only',145,'normal'),
        ('Wind '+str(result['windBoundary']['windIndex'])+' / '+str(result['windBoundary']['programme']),145,'normal'),
        ('No roof or gravity reactions imported',145,'normal'),
        ('',145,'normal'),
        ('ACTUAL COMPUTED MODEL',190,'bold'),
        (str(floor['triangleCount'])+' CST triangles / '+f'{floor["membraneAreaM2"]:.3f}'+'m² field',145,'normal'),
        ('4 finite L-wall / DPC paths',145,'normal'),
        ('52 ideal pinned head locations',145,'normal'),
        (f'{receiving_count} named ports / {location_count} locations: law absent',145,'normal'),
        ('Open dashed circles = missing ports',145,'normal'),
        ('Filled heads = upward support Fz',145,'normal'),
        ('Open heads = downward support Fz',145,'normal'),
        ('Radius scales with |Fz|; hover for values',145,'normal'),
        ('',145,'normal'),
        ('GEOMETRY / LAW LIMITS',190,'bold'),
        (f'Explicit{band_width:g}×{band_depth:g}mm slab-level bands',145,'normal'),
        ('Known circles omitted as squares',145,'normal'),
        ('Unknown principal wet field withheld',145,'normal'),
        ('No vertical plate / full upstand proof',145,'normal'),
        ('Unqualified membrane and joint laws',145,'normal'),
        ('No geotechnical / local resistance pass',145,'normal'),
        ('',145,'normal'),
        ('SIX-COMPONENT EQUILIBRIUM',190,'bold'),
        (f'max residual {max(abs(v) for v in result["equilibriumResidualKN_KNm"]):.2e}kN / kNm',145,'normal'),
        (f'{result["windBoundary"]["planeProjection"]["offsetMm"]:g}mm source force offset conserved',145,'normal'),
        ('',145,'normal'),
        ('COMPLETE-HOUSE USE REJECTS',180,'bold'),
        ('Roof / intermediate supports / dry floor',145,'normal'),
        ('remain actual engineering obligations',145,'normal'),
    ]
    for value,size,weight in lines:
        parts.append(text(lx,ly,value,size,weight))
        ly += 245
    parts.append('</g></svg>')
    return '\n'.join(parts)+'\n'
