#!/usr/bin/env python3
"""Conditional rectilinear pan following a historical receiver network.

The mesh is an ideal topological surface, not a concrete, metal, DPC or site design.
"""
import hashlib,json,sys,subprocess
from pathlib import Path
R=Path(__file__).resolve().parents[3]; O=Path(__file__).resolve().parent
pins={'project/had/studies/open-north-loggia.json':'25faad2c4d40df2b7da7212f73808843a88d2f52','project/mat/studies/ground-metal-field.json':'3c07f8b20bad17b46d27f1cbb9af27a5a14cdfc0','project/str/studies/open-loggia-support.json':'20dec4384d09a0d02075fdd34a247e775532763b','project/mat/studies/warm-receiving-grid.json':'a5bff9f37b8d78dfb32359427314b4013fe8a45e','project/mat/studies/joined-ground-boundary.json':'2a74ab4e2e88bf80405a5ca36a7eaabcd1e93fc6','project/mat/joined-ground-floor-and-court-boundary.md':'9fbfd76fe0bc6c8b8586c03f65b88c7cf42dc317'}
s={}
for p,w in pins.items():
 raw=(R/p).read_bytes();assert hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()==w and subprocess.check_output(['git','rev-parse','HEAD:'+p],cwd=R,text=True).strip()==w,p;s[p]=raw.decode() if p.endswith('.md') else json.loads(raw)
g=s['project/str/studies/open-loggia-support.json']['lower_grid'];assert (g['top'],g['bottom'],g['width'])==(-180,-630,600)
assert s['project/had/studies/open-north-loggia.json']['sections']['groundFloorRC']=={'top':-180,'bottom':-380}
w=s['project/mat/studies/warm-receiving-grid.json']['recipe'];assert w['mineralDPC']==[-765,-615]
outer=(262.5,262.5,11737.5,11737.5);court=(3987.5,3987.5,8012.5,8012.5);notch=(4447.5,8012.5,7552.5,11737.5);door=(5060,3987.5,6940,4250)
service=s['project/mat/studies/joined-ground-boundary.json'];assert service['outerWidth']==1003 and service['outerUnderside']==-839.5
# One finite E-box segment is a hypothetical wall-crossing witness, not a surveyed route.
assert 'east axis **7125**' in s['project/mat/joined-ground-floor-and-court-boundary.md']
box=(7750,6623.5,8167.5,7626.5)
box_area=(box[2]-box[0])*(box[3]-box[1])/1e6
previous_clip=(box[2]-court[2])*(box[3]-box[1])/1e6
court_e=next(r for r in g['actual_routes'] if r[0]=='court-E')
assert court_e==['court-E',[8050,3950],[8050,8050],600] and box_area==0.4187525
def contains(r,x,y):return r[0]<x<r[2] and r[1]<y<r[3]
def domain(x,y):return contains(outer,x,y) and ((not contains(court,x,y) and not contains(notch,x,y)) or contains(door,x,y) or contains(box,x,y))
rects=[]
for name,a,b,width in g['actual_routes']:
 assert width==600 and (a[0]==b[0] or a[1]==b[1])
 if a[0]==b[0]:rect=(a[0]-width/2,min(a[1],b[1]),a[0]+width/2,max(a[1],b[1]))
 else:rect=(min(a[0],b[0]),a[1]-width/2,max(a[0],b[0]),a[1]+width/2)
 rects.append((rect,-630,'route:'+name))
for n in g['actual_cap_nodes']:
 x,y=n['xy'];dx,dy=n['cap_size'];assert (dx,dy)==(600,600) and n['top']==-180 and n['bottom'] in (-630,-750)
 rects.append(((x-dx/2,y-dy/2,x+dx/2,y+dy/2),n['bottom'],'node:'+n['source']))
rects.append((box,-839.5,'conditional-east-box'))
xs=sorted({v for r in [outer,court,notch,door,box]+[r for r,z,n in rects] for v in (r[0],r[2]) if outer[0]<=v<=outer[2]})
ys=sorted({v for r in [outer,court,notch,door,box]+[r for r,z,n in rects] for v in (r[1],r[3]) if outer[1]<=v<=outer[3]})
heights={};areas={-380:0.,-630:0.,-750:0.,-839.5:0.}
for i in range(len(xs)-1):
 for j in range(len(ys)-1):
  x=(xs[i]+xs[i+1])/2;y=(ys[j]+ys[j+1])/2
  if not domain(x,y):continue
  z=min([-380]+[z for r,z,n in rects if contains(r,x,y)])
  heights[(i,j)]=z;areas[z]+=(xs[i+1]-xs[i])*(ys[j+1]-ys[j])
assert abs(sum(areas.values())/1e6-104.6656625)<1e-8
# Every adjacent cell pair of different height receives one full vertical
# face. Boundary edges remain open: external turns and service cuts unknown.
vertical={};boundary={-380:0.,-630:0.,-750:0.,-839.5:0.};faces=[]
for (i,j),z in heights.items():
 for di,dj,side,L in [(1,0,'x',ys[j+1]-ys[j]),(0,1,'y',xs[i+1]-xs[i])]:
  z2=heights.get((i+di,j+dj))
  if z2 is not None and z!=z2:
   key=f'{min(z,z2)}..{max(z,z2)}';vertical[key]=vertical.get(key,0.)+L
   faces.append({'orientation':side,'fixed_mm':xs[i+1] if side=='x' else ys[j+1], 'range_mm':[ys[j],ys[j+1]] if side=='x' else [xs[i],xs[i+1]],'z_mm':[min(z,z2),max(z,z2)]})
 for di,dj,L in [(-1,0,ys[j+1]-ys[j]),(1,0,ys[j+1]-ys[j]),(0,-1,xs[i+1]-xs[i]),(0,1,xs[i+1]-xs[i])]:
  if (i+di,j+dj) not in heights:boundary[z]+=L
# Compress cells into horizontal runs for a compact exact plan representation.
runs=[]
for j in range(len(ys)-1):
 start=None;previous=None
 for i in range(len(xs)-1):
  z=heights.get((i,j))
  if z!=previous:
   if previous is not None:runs.append({'xy_mm':[xs[start],ys[j],xs[i],ys[j+1]],'z_mm':previous})
   start=i if z is not None else None;previous=z
 if previous is not None:runs.append({'xy_mm':[xs[start],ys[j],xs[-1],ys[j+1]],'z_mm':previous})
# Connectivity of the plan domain, not material connectivity or a leak test.
seen=set();stack=[next(iter(heights))]
while stack:
 c=stack.pop()
 if c in seen:continue
 seen.add(c);i,j=c
 stack.extend(n for n in [(i-1,j),(i+1,j),(i,j-1),(i,j+1)] if n in heights and n not in seen)
assert len(seen)==len(heights)
result={'source_git_blobs':pins,'status':'Conditional historic geometry only. No source adoption, product qualification, field seal or receiver design.', 'domain':{'outer':outer,'excluded_court':court,'excluded_loggia':notch,'threshold_extension':door,'conditional_E_box_witness':box},'E_box_plan_overlap':{'historic_court_E_route_mm':[7750,3950,8350,8050],'entire_witness_within_route_m2':box_area,'in_previous_clipped_field_m2':previous_clip,'outside_previous_clipped_field_m2':box_area-previous_clip,'scope':'Plan overlap only. Actual box top and compatibility of both unadopted concrete constructions remain unknown.'},'historical_route_count':len(g['actual_routes']),'historical_node_count':len(g['actual_cap_nodes']),'horizontal_area_by_top_elevation_m2':{str(k):v/1e6 for k,v in areas.items()},'vertical_internal_transition_length_m':{k:v/1000 for k,v in vertical.items()},'vertical_internal_area_m2':sum((float(k.split('..')[1])-float(k.split('..')[0]))*v/1e6 for k,v in vertical.items()),'unclosed_boundary_length_by_top_elevation_m':{str(k):v/1000 for k,v in boundary.items()},'horizontal_top_surfaces':runs,'vertical_internal_faces':faces,'scope':'One connected ideal rectilinear top surface, with vertical internal risers and open perimeter. All bends, sheet thickness, joints, penetrations, support, DPC, load, floor edge, movement and closure remain undesigned.'}
colors={-380:'#e5edf8',-630:'#e4b95c',-750:'#c4655d',-839.5:'#6f4a93'}
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="900" viewBox="0 0 1000 900"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif"><text x="25" y="30" font-size="20">Conditional receiver-following pan — plan topology</text><text x="25" y="53" font-size="13">Historic grid and one E-box witness; no selected receiver or perimeter, service or door closure</text>']
scale=.063;ox=70;oy=850
for r in runs:
 a,b,c,d=r['xy_mm'];svg.append(f'<rect x="{ox+a*scale:.3f}" y="{oy-d*scale:.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="{colors[r["z_mm"]]}"/>')
svg.append('<text x="830" y="180" font-size="14">Top z, mm</text>')
for i,(z,color) in enumerate(colors.items()):svg.append(f'<rect x="830" y="{200+i*32}" width="18" height="18" fill="{color}"/><text x="856" y="{215+i*32}" font-size="14">{z}</text>')
svg.append('<text x="25" y="885" font-size="13" fill="#a01818">Ideal continuous stepped surface only; material, bearing, joints, movement and access are unresolved.</text></g></svg>\n')
# Actual mesh section at y=8200 through the west field: -380, -630, -750.
section_y=8200
sec=[r for r in runs if r['xy_mm'][1]<section_y<r['xy_mm'][3] and r['xy_mm'][0]>=3242.5 and r['xy_mm'][2]<=4447.5]
assert [(r['xy_mm'][0],r['xy_mm'][2],r['z_mm']) for r in sec]==[(3242.5,3650.0,-380),(3650.0,4200.0,-630),(4200.0,4447.5,-750)]
section_svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="480" viewBox="0 0 900 480"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif"><text x="25" y="32" font-size="20">Conditional pan section at y8200, looking along +y</text><text x="25" y="55" font-size="13">Schematic; numeric source coordinates govern. Historic receiver and MAT DPC are not reconciled.</text><path d="M70 130 H730 V365 H560 V310 H270 V220 H70 Z" fill="#dedede"/><rect x="70" y="300" width="660" height="72" fill="#f4c8a3" fill-opacity=".65"/><path d="M70 220 H270 V310 H560 V365 H730" fill="none" stroke="#164c7b" stroke-width="6"/><text x="80" y="205" font-size="14">−380</text><text x="285" y="300" font-size="14">−630</text><text x="570" y="355" font-size="14">−750</text><text x="50" y="410" font-size="14">x3242.5</text><text x="225" y="410" font-size="14">3650</text><text x="530" y="410" font-size="14">4200</text><text x="705" y="410" font-size="14">4447.5</text><text x="750" y="245" font-size="13">RC geometry</text><text x="750" y="320" font-size="13">DPC comparator</text><text x="25" y="455" font-size="14" fill="#a01818">Overlapping source materials and all bearing, weld, support and outer-edge closure remain unresolved.</text></g></svg>\n'
outputs={O/'conditional-receiver-pan.json':json.dumps(result,indent=2)+'\n',O/'conditional-receiver-pan.svg':''.join(svg),O/'conditional-receiver-pan-section.svg':section_svg}
if '--check' in sys.argv:
 for p,v in outputs.items():assert p.read_text()==v,p
 print('Conditional receiver pan: outputs reproduce')
else:
 for p,v in outputs.items():p.write_text(v)
 print('Wrote conditional receiver pan mesh and plan')
