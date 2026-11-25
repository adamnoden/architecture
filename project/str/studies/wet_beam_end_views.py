"""Exact clipped Y/Z development drawing from one current alternative result."""
from html import escape
from wet_support_cage_comparison import beam_loop


def drawing(result):
    g=result['nativeRequest']['wetSupport'];s=result['authoredCageSettings']
    current=next(p for p in result['mainBars'] if p['id']=='STR/WET-CAGE/beam/loop/0')
    reference=beam_loop(g,s,0)
    y0=g['beamSouthEndYMm']-30;y1=g['beamSouthEndYMm']+490
    z0=g['beamTopZMm']-g['beamDepthMm']-100;z1=g['beamTopZMm']+35
    scale=1.25
    X=lambda y:65+(y-y0)*scale
    Z=lambda z:100+(z1-z)*scale
    def rect(a,b,c,d,color,stroke):
        return f'<rect x="{X(a):.3f}" y="{Z(d):.3f}" width="{(b-a)*scale:.3f}" height="{(d-c)*scale:.3f}" fill="{color}" stroke="{stroke}"/>'
    def path(p,color,width):
        points=[point for part in p['parts'] for point in part['points']]
        text=' '.join(f'{X(point[1]):.3f},{Z(point[2]):.3f}' for point in points)
        return f'<polyline points="{text}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>'
    source=g['receiverRectanglesXYMm'][0]
    pad=(source[1]+source[3])/2+g['padCentreOffsetsYMm'][0]
    bottom=g['beamTopZMm']-g['beamDepthMm'];posttop=bottom-g['padThicknessMm']
    supported=[(row,comparison) for row in result['sameCaseCutComparisons']['cuts'] for comparison in row.get('comparisons',[])]
    governor=max(supported,key=lambda item:item[1]['necessaryMandrelComparisonMm']) if supported else None
    old_tangent=reference['endReturnRegionsYMm'][0][1]
    new_tangent=current['southLowerStraightTangentYMm']
    rows=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" width="1200" height="850">',
          '<rect width="1200" height="850" fill="#f4f1e9"/>',
          '<g font-family="Arial,sans-serif" fill="#252a2c">',
          '<text x="45" y="40" font-size="25">Seated wet beam · rectangular end-return study</text>',
          f'<text x="45" y="70" font-size="15">Unselected alternative / actual source case {escape(result["nativeCaseId"])}</text>',
          f'<defs><clipPath id="beam-end-crop"><rect x="{X(y0)}" y="{Z(z1)}" width="{(y1-y0)*scale}" height="{(z1-z0)*scale}"/></clipPath></defs>',
          '<g clip-path="url(#beam-end-crop)">',
          rect(source[1],source[3],z0,posttop,'#d1d3ca','#778171'),
          rect(g['beamSouthEndYMm'],g['beamNorthEndYMm'],bottom,g['beamTopZMm'],'#dedfd8','#64776d'),
          rect(pad-g['padLengthMm']/2,pad+g['padLengthMm']/2,posttop,bottom,'#91aaa4','#325f58'),
          path(reference,'#ae7654',2.4),path(current,'#233e50',3.2),'</g>',
          f'<line x1="{X(pad):.3f}" y1="{Z(bottom)+20:.3f}" x2="{X(pad):.3f}" y2="{Z(bottom)-65:.3f}" stroke="#325f58" stroke-dasharray="6 4"/>',
          f'<text x="65" y="765" font-size="14">Y/Z projection of one of two loops; the concrete and source datums are unchanged.</text>',
          '<text x="65" y="790" font-size="14">The drawing is cropped. Complete laps, cold-bend ramp, hooks and post cage remain in the model.</text>',
          '<text x="755" y="145" font-size="19">Actual geometry</text>',
          f'<text x="755" y="180" font-size="15">End mandrel: {current["endReturnMandrelMm"]:g}mm (hypothesis)</text>',
          f'<text x="755" y="210" font-size="15">Reference lower tangent: Y{old_tangent:g}</text>',
          f'<text x="755" y="240" font-size="15">Candidate lower tangent: Y{new_tangent:g}</text>',
          f'<text x="755" y="270" font-size="15">Actual pad centre: Y{pad:g}</text>',
          f'<text x="755" y="300" font-size="15">Top/bottom bar rows: Z{current["sourceTopAndBottomRowsZMm"][0]:g} / Z{current["sourceTopAndBottomRowsZMm"][1]:g}</text>',
          '<text x="755" y="350" font-size="19">Evidence boundary</text>',
          '<text x="755" y="385" font-size="15">Straight-cut nominal witnesses only.</text>',
          '<text x="755" y="415" font-size="15">Curved-return force is unavailable.</text>',
          '<text x="755" y="445" font-size="15">Finite node, anchorage and torsion</text>',
          '<text x="755" y="470" font-size="15">force transfer remain unqualified.</text>',
          '<text x="755" y="520" font-size="15">Orange: retained stadium reference</text>',
          '<text x="755" y="550" font-size="15">Blue: rectangular end alternative</text>']
    if governor:
        rows.extend([f'<text x="755" y="610" font-size="15">Supported nominal mandrel screen:</text>',
                     f'<text x="755" y="640" font-size="18">{governor[1]["necessaryMandrelComparisonMm"]:.3f}mm at Y{governor[0]["physicalPointMm"][1]:g}</text>',
                     '<text x="755" y="670" font-size="14">This does not establish bend pressure resistance.</text>'])
    rows.extend(['</g></svg>'])
    return '\n'.join(rows)+'\n'
