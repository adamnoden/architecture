"""Export the unselected inner candidate's explicit pressure comparison.

The main panel and main-frame resultants exactly match the local source's
pressure domain. Extra small-frame stock is a separate deliberately enlarged
projection addition; it is not silently claimed already present in that local
frame. No real-site wind or selected global-load conclusion follows.
"""
from pathlib import Path
import importlib.util, hashlib, json, math

SOURCE=Path(__file__).with_name('roof_water_inner_candidate.py')
spec=importlib.util.spec_from_file_location('inner_candidate',SOURCE)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=[]

def add(name,circuit,face,root,area,point,direction,group,scope='matches local main-frame pressure',**extra):
    if area<=0:return
    p,q,z=point
    world=[(p,q,z),(12000-q,p,z),(12000-p,12000-q,z),(q,12000-p,z)][face]
    dp,dq,dz=direction
    vector=[(dp,dq,dz),(-dq,dp,dz),(-dp,-dq,dz),(dq,-dp,dz)][face]
    rows.append(dict(name=name,circuit=circuit,physicalFace=face,rootP=root,projectedAreaMM2=area,
        centroidPqZMM=list(point),worldCentroidXYZMM=list(world),positiveWorldDirection=list(vector),
        positiveForceN=[v*.00225*area for v in vector],signGroup=f'face{face}:{group}',
        signDomain=[-1,1],scope=scope,**extra))

for circuit,c in m.families.items():
    for face in range(4):
        for i,p in enumerate(c['stations']):
            root=c['roots'][min(range(3),key=lambda j:abs(c['roots'][j]-p))]
            for label,q,top,group in [('rear',c['inner'],c['rear'],'body_rear_q'),('front',c['outer'],c['front'],'body_front_q')]:
                lo,hi=m.module_span(c,i,q);height=top-c['bed']
                add(label+' wall',circuit,face,root,(hi-lo)*height,((lo+hi)/2,q,(top+c['bed'])/2),(0,1,0),group,
                    geometry=dict(alongP=[lo,hi],heightMM=height,q=q),
                    qualification='Lowest-bed rectangle; the actual graded-bed skin must remain inside its declared envelope.')
            add('body floor vertical pressure',circuit,face,root,c['width']*c['tributaries'][i],
                (c['waterP'][i],c['waterQ'][i],c['bed']),(0,0,-1),'vertical_down',
                qualification='Whole floor pressure comparison; must reconcile with existing native roof/cap projection to avoid duplicate global loading.')
            lo,hi=m.module_span(c,i,c['apronQ']);height=c['apronHigh']-c['apronLow']
            add('fixed/sliding apron normal projection bound',circuit,face,root,(hi-lo)*height,
                ((lo+hi)/2,c['apronQ'],(c['apronHigh']+c['apronLow'])/2),(0,1,0),'apron_q',
                geometry=dict(alongP=[lo,hi],q=c['apronQ'],z=[c['apronLow'],c['apronHigh']]),
                qualification='Bounds the joined wet turn and downleg projection; detailed sloped pieces and laps are listed in the stock source. It is not an assertion of a flat physical sheet.')
            if i in (0,len(c['stations'])-1):
                h=c['rear']-c['bed']
                add('exposed body end/return bounding face',circuit,face,root,c['width']*h,
                    (p,(c['inner']+c['outer'])/2,c['bed']+h/2),(1,0,0),'body_p',
                    qualification='Deliberately full bounding end face; a physical open or mitred end can have less area.')
                add('apron end/return bounding face',circuit,face,root,300*height,
                    ((lo+hi)/2,c['apronQ'],(c['apronHigh']+c['apronLow'])/2),(1,0,0),'apron_p',
                    qualification='300radial end envelope, not a fabricated solid end wall.')
        for j,root in enumerate(c['roots']):
            frame,_,_,_=m.make_frame(circuit,c,j)
            for e in frame.members:
                a,b=frame.nodes[e['i']],frame.nodes[e['j']]
                centre=tuple((x+y)/2 for x,y in zip(a,b))
                for axis,group in [(0,'body_p'),(1,'body_rear_q')]:
                    transverse=math.sqrt(max(0,1-float(e['T'][0,axis])**2))
                    area=e['L']*max(e['s']['B'],e['s']['H'])*transverse
                    direction=(1,0,0) if axis==0 else(0,1,0)
                    add(e['name']+' stock projection',circuit,face,root,area,centre,direction,group,
                        geometry=dict(endpoints=[a,b],sectionMM=[e['s']['B'],e['s']['H'],e['s']['t']]),
                        qualification='Full projected main-frame stock, no shadow credit. Matches the consistent UDL comparison.')
        # Explicit extra projection for the separately inventoried apron ribs/standoffs.
        # These members have not yet been integrated into the local frame's force return.
        stock=m.nonframe_stock(circuit,c)
        ribs=next(x for x in stock if x['item'].startswith('independent RHS'))
        counts=ribs['geometry']['cassetteCounts'];length=ribs['geometry']['lengthM']*1000
        stand=next(x for x in stock if x['item'].startswith('apron radial standoffs'))
        stand_length=stand['geometry']['lengthM']*1000
        partitions=[4590,5437.5,6562.5,7410] if circuit=='primary' else[4346,5325,6675,7654]
        for j,(a,b) in enumerate(zip(partitions,partitions[1:])):
            area=counts[j]*20*(length+stand_length)
            point=((a+b)/2,c['apronQ'],(c['apronLow']+c['apronHigh'])/2)
            for direction,group in [((1,0,0),'apron_p'),((0,1,0),'apron_q')]:
                add('EXTRA apron rib/standoff projection bound',circuit,face,c['roots'][j],area,point,direction,group,
                    scope='Extra gross projection addition; NOT included in main local-frame response',
                    centroidQRange=[c['railQ'],4593 if circuit=='primary' else 4565],
                    centroidZRange=[c['apronLow'],7340.903509 if circuit=='primary' else c['apronHigh']],
                    qualification='Pressure can be screened at both centroid-range endpoints. Actual member contacts, shadow, location and force return still require a joined detail.')

result=dict(status='UNSELECTED PRESSURE COMPARISON; no selected global or local wind pass',
    sourceSHA256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),exportSourceSHA256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    pressureKPa=2.25,axes='p increases clockwise along each court face; q increases from exterior wall towards court; Z up',
    signRule='Each named group may vary independently in[-1,+1]. All members bearing the same group share its sign. This is a conservative component comparison, not a site wind-pressure map.',
    groups=sorted({x['signGroup'] for x in rows}),resultants=rows,
    qualifications=['The original roof/cap vertical wind area must be replaced or reconciled before global addition; do not simply double-count it.',
        'Four faces use the same lowest-bed geometric comparison. Exact graded skins and their pressure centroids remain to be joined.',
        'Small-frame gross projection is exported separately and is absent from the current main local frame. Clip/lock wind is covered only if actual hardware lies inside the stated panel/member projection envelopes.',
        'Whole-corner support allocation, end closure and remaining-stock centroid groups remain unqualified.'])
path=Path(__file__).with_suffix('.json');path.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(path=str(path),resultants=len(rows),groups=len(result['groups']),source=result['sourceSHA256']),indent=2))
