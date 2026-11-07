"""Inspect actual H16/H6 cells rather than a fictitious gross-concrete loop."""
from pathlib import Path
import runpy,sys
D=Path(__file__).resolve().parent
cage=runpy.run_path(str(D/'arch-width-geometry.py'))['cage']
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">',
'<rect width="1200" height="720" fill="#faf9f4"/>',
'<style>text{font-family:Arial,sans-serif;fill:#25343d}.title{font-size:26px;font-weight:bold}.label{font-size:18px}.small{font-size:15px}.hold{fill:#a3442b}</style>',
'<text x="35" y="42" class="title">OUTWARD RC ARCH: ACTUAL CLOSED-LINK CELLS</text>',
'<text x="35" y="71" class="label hold">160 / 180 width-only controls fail joined bending. Proposed geometry; no section selected.</text>']
for x,width,kind,z,title in [(55,160,'arch',6000,'160 ordinary arch'),(430,180,'arch',6000,'180 ordinary arch'),(805,180,'jamb',3500,'225 fixed jamb foot')]:
    c=cage(width,kind,z);a=cage(width,kind,z,True);scale=1.5;y=155
    b,h=c['b'],c['h'];xs,ys=c['xs'],c['ys']
    parts += [f'<text x="{x}" y="116" class="label">{title}</text>',
              f'<rect x="{x}" y="{y}" width="{b*scale}" height="{h*scale}" fill="#dfe2df" stroke="#69797b" stroke-width="2"/>',
              f'<rect x="{x+(ys[0]-11)*scale}" y="{y+(xs[0]-11)*scale}" width="{c["cellNormal"]*scale}" height="{c["cellRadial"]*scale}" fill="none" stroke="#b26929" stroke-width="{6*scale}"/>']
    for bx in ys:
        for by in xs:
            parts.append(f'<circle cx="{x+bx*scale}" cy="{y+by*scale}" r="{8*scale}" fill="#294f65"/>')
    parts += [f'<text x="{x}" y="510" class="label">H6 cell: {c["cellNormal"]:.2f} × {c["cellRadial"]:.2f} mm</text>',
              f'<text x="{x}" y="540" class="small">Adverse: {a["cellNormal"]:.2f} × {a["cellRadial"]:.2f} mm</text>',
              f'<text x="{x}" y="566" class="small">Gross RC: {b:.0f} × {h:.0f} mm; four H16</text>']
parts += ['<text x="35" y="620" class="label hold">Foot 149 mm gross-cell assumption REJECTED: actual enclosed normal width is 74 mm.</text>',
'<text x="35" y="650" class="small">Adverse comparison: formed width/depth −10, both opposing steel layers 5 inward; not measured tolerances.</text>',
'<text x="35" y="678" class="small">Schematic link corners. Actual bends, cage/sleeve placement, anchorage, insulation and complete force path remain unadmitted.</text>','</svg>']
text='\n'.join(parts)+'\n';path=Path(__file__).with_suffix('.svg')
if '--check' in sys.argv:assert path.read_text()==text
else:path.write_text(text)
