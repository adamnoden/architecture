"""Rear tray-first trial, mm, source y is vertical in Bette's STEP. Optional independent CAD audit."""
import argparse
import hashlib
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
TRAY_HASH = '95a083d401c39302805fa7a433e2bc5d2f78898ff63d38ffb0a88cc8133ac252'
PIPE_HASH = '514ab24caec354245c7a703997adc0de8e4e97f062b13c84e06afa515127e788'
PDF_HASH = '982f052af2c76c3b2da163b0d111d2b92b195e5e7a57ac214d94faa49ac48acb'


def read(path):
    return json.loads((HERE / path).read_text())


def clearance(a, b):
    """Unsigned separation of XYWH rectangles; zero includes boundary contact."""
    return math.hypot(*(max(a[i]-b[i]-b[i+2], b[i]-a[i]-a[i+2], 0) for i in (0,1)))


def swept(a, b):
    assert a[0] == b[0] or a[1] == b[1]
    return [min(a[0],b[0]), min(a[1],b[1]), a[2]+abs(a[0]-b[0]), a[3]+abs(a[1]-b[1])]


def build():
    original = read('conventional-first-rest.json')
    h = read('../../had/studies/water-replan.json')['model']
    f = h['upperFurniture']
    v, well = original['values'], original['opening']['box']
    rim, board = v['rim'], original['release']['boardTop']
    # Dimensioned Ø50 calibrates the two printed profile edges of B594V in PDF points.
    scale_x = (402.757-259.305)/50
    scale_z = (663.711-271.800)/137
    shoulder = (663.711-527.840)/scale_z
    bevel = (663.711-658.654)/scale_z
    collar_positive_radius = (408.840-(402.757+259.305)/2)/scale_x
    lip, stop = 551.65, 502.96496  # Manufacturer STEP, cylindrical r=25 axial contact.
    pocket = [lip-544.15, lip-535.45]
    engage = 40
    # g is SIGNED: underside of 90/98 tray land minus B594 lower-body drawing datum.
    # Evaluated at g=0. Subtract measured g from every waste/socket world Z.
    flange = rim-41.1
    tail = flange-v['fullTail']
    mouth = tail+engage
    screw_radius=(1281.6175-1105.6875)/(1.5*scale_z)
    head_radius=(343.876-318.156)/(2*scale_x)
    seal_outer=(496.94-331.031)/scale_x
    socket = {'stopPlain':lip-stop,'pocketBelowMouth':pocket,'maxOuterDiameter':63.5,
              'lipID':50.8, 'axialGross':lip-489.15, 'enlargedBelowMouth':lip-499.15,
              'engagement':engage,'sealBandFromTip':[engage-pocket[1],engage-pocket[0]],
              'straightFromTip':[bevel,shoulder],'positiveCollarRadius':collar_positive_radius,
              'lipToShoulder':shoulder-engage,'stopShortfallBeforeBevel':lip-stop-shoulder,
              'flangeZAtG0':flange,'tailZAtG0':tail,'mouthZAtG0':mouth,
              'grossToBoardAtG0':mouth-(lip-489.15)-board,
              'enlargedToBoardAtG0':mouth-(lip-499.15)-board,
              'drawingDatumStep':(276.11-271.80)/scale_z,
              'headedScrewClearance':45-screw_radius-head_radius,
              'maxRodODAt1p5Clear':2*(45-1.5-screw_radius),
              'screwPitchRadius':screw_radius,'sealFreeRimBand':60-seal_outer}
    socket['centredSlipGapAtG0']=26.5-41.1
    t=f['rear-shower1000']
    north=[t[0],t[1]+360,*t[2:]]; rest=[720,north[1],*t[2:]]
    route=[t,north,rest]; sweeps=[swept(a,b) for a,b in zip(route,route[1:])]
    door=read('selected-family-convergence.json')['rearRenewal']['door']
    hx,hy=door['hinge']; leaf,thick=door['leaf']
    open_leaf=[hx-leaf,hy-thick/2,leaf,thick]
    mast=[1500,10650,300,300]; axis=[1650,10800]
    obstacles=[f[k] for k in ['rear-basin','rear-WC','rear-cabinet','rear-west-low-box','service-emitter-rear-N']]
    liftEnvelope=12
    loadedSweeps=[[x-liftEnvelope,y-liftEnvelope,w+2*liftEnvelope,h+2*liftEnvelope] for x,y,w,h in sweeps]
    horizontal=min(clearance(body,ob) for body in loadedSweeps for ob in [*obstacles,open_leaf,mast])
    restEnvelope=[rest[0]-12,rest[1]-12,rest[2]+24,rest[3]+24]
    # Body needs the loaded first rest, not just the nominal enamel rectangle.
    rest=restEnvelope
    reach=max(math.dist(axis,[r[0]+500,r[1]+500]) for r in route)
    drainReach=math.dist(axis,original['opening']['drain'])
    jointMoment=1.65+.25*drainReach/1000
    stance=[2100,9990]; tool=[2012.5,9760,rim+350]
    # Two unobstructed axis-aligned walking legs after detaching leaf: east threshold to stance.
    walk=[[2500,10800],[2500,9990],stance]
    grill=[well[0]-25,well[1]-25,450,450]
    walk_clearance=min(clearance(swept([*a,0,0],[*b,0,0]),o)-300
                       for a,b in zip(walk,walk[1:]) for o in [grill,rest,mast,*obstacles])
    rack=[3300,11110,900,150]; wardrobe=f['bed4-island-wardrobe']; emitter=f['service-emitter-bed4-N']
    hatch=[1220,9200,550,600]
    return {'sources':{'trayStepSHA256':TRAY_HASH,'pipeStepSHA256':PIPE_HASH,'nativeDrawingSHA256':PDF_HASH},
            'tray':{'mainSolid':[999,999,41.1],'rimY':0,'drainLandUpperY':-38.6,
                    'drainLandLowerY':-41.1,'annulusDiameters':[90,98],
                    'looseTrimSeparate':True,'componentSubtotalKg':v['catalogueTrayKg']+v['catalogueFrameKg']},
            'socket':socket,
            'change':{'well':well,'route':route,'guardedWell':grill,'mastBase':mast,'mastAxis':axis,
                      'maxCGReach':reach,'horizontalObstacleGap':horizontal,'restToWellGuard':clearance(rest,grill),
                      'restToDoorTip':clearance(rest,open_leaf),
                      'doorRack':rack,'rackAisle':rack[1]-(wardrobe[1]+wardrobe[3]),
                      'rackToEmitter':emitter[1]-(rack[1]+rack[3]),
                      'westGapAtPark':rest[0]-(f['rear-west-low-box'][0]+f['rear-west-low-box'][2]),
                      'walk':walk,'walkReserve':walk_clearance,'toolTop':tool,
                      'workerReach':math.dist([*stance,rim+750],tool),
                       'liftProjection':12,'maxLift':155,'packageDepth':120,'restTop':3475,
                      'railPairKg':2*(50*40-44*34)*1000*7.85e-6,
                      'gantryTrialReach':1650,'overturningKNm':1.65,'totalWithSpiderKNm':jointMoment,'anchorCoupleKN':jointMoment/.30,
                      'retainedPanelAtRoutineRepair':True,'noActuationPerformed':True},
            'sideHatch':{'clear':[350,400],'outer':hatch,'areaM2':hatch[2]*hatch[3]/1e6,
                         'westEdgeToTray':t[0]-hatch[0]-hatch[2],
                         'toBasin':hatch[1]-(f['rear-basin'][1]+f['rear-basin'][3]),
                         'clearEdgeToDrain':original['opening']['drain'][0]-1670},
            'physicalAcceptance':False,'selectedHouseChanged':False}


def audit_cad(directory):
    """Uses optional cadquery/OCP and PyMuPDF only for reading the three supplier originals."""
    import cadquery as cq
    import fitz
    from OCP.IntCurvesFace import IntCurvesFace_ShapeIntersector
    from OCP.gp import gp_Dir, gp_Lin, gp_Pnt
    items=[('BE3C_Ultra_5940_Part.stp',TRAY_HASH),('390.204.14.1_P.stp',PIPE_HASH),('B594V.pdf',PDF_HASH)]
    for n,digest in items:
        assert hashlib.sha256((directory/n).read_bytes()).hexdigest()==digest, n
    tray=cq.importers.importStep(str(directory/items[0][0])).val().Solids()
    assert len(tray)==2
    lands=[]
    for face in max(tray,key=lambda s:s.Volume()).Faces():
        if face.geomType()=='PLANE' and len(face.Edges())==2 and all(e.geomType()=='CIRCLE' for e in face.Edges()):
            if sorted(round(e.radius(),3) for e in face.Edges())==[45,49]:
                lands.append(round(face.Center().y,3))
    assert sorted(lands)==[-41.1,-38.6]
    pipe=cq.importers.importStep(str(directory/items[1][0])).val().Solids()
    bell=min(pipe,key=lambda s:s.Volume())
    inter=IntCurvesFace_ShapeIntersector(); inter.Load(bell.wrapped,1e-8)
    inter.Perform(gp_Lin(gp_Pnt(25,0,560),gp_Dir(0,0,-1)),0,80)
    assert abs(max(inter.Pnt(i).Z() for i in range(1,inter.NbPnt()+1))-502.96496)<.001
    rings={(round(c.Location().Z(),3),round(c.Radius(),3)) for edge in bell.Edges() if edge.geomType()=='CIRCLE'
           for c in [edge._geomAdaptor().Circle()] if abs(c.Location().X())+abs(c.Location().Y())<.001}
    assert {(551.65,25.4),(544.15,29.75),(535.45,29.75),(533.45,31.75),(489.15,25.075)}<=rings
    drawing=fitz.open(directory/items[2][0])
    vertical={(round(min(a.y,b.y),3),round(max(a.y,b.y),3),round(a.x,3)) for d in drawing[0].get_drawings()
              for op,*pts in d['items'] if op=='l' for a,b in [pts] if abs(a.x-b.x)<.001}
    assert {(527.840,658.654,259.305),(527.840,658.654,402.757)}<=vertical
    print('Two tray solids; 90/98 bearing annuli; socket stop and sealing pocket; native OD50 profile verified.')


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true')
    parser.add_argument('--inspect-cad',type=Path); args=parser.parse_args()
    if args.inspect_cad: audit_cad(args.inspect_cad)
    d=build();s=d['socket'];c=d['change']
    assert 1.1<s['stopShortfallBeforeBevel']<1.3 and s['positiveCollarRadius']>s['lipID']/2
    assert s['straightFromTip'][0]<s['sealBandFromTip'][0]<s['sealBandFromTip'][1]<s['straightFromTip'][1]
    assert abs(s['grossToBoardAtG0']-19.4)<.01 and abs(s['enlargedToBoardAtG0']-29.4)<.01
    assert c['horizontalObstacleGap']>=38 and c['maxCGReach']+100<c['gantryTrialReach']
    assert s['headedScrewClearance']<0 and 4.9<s['maxRodODAt1p5Clear']<5.4
    assert c['restToDoorTip']<600 and c['westGapAtPark']<600
    assert 1.99<c['totalWithSpiderKNm']<2.01 and c['anchorCoupleKN']>6.66
    assert c['rackAisle']==650 and c['rackToEmitter']>110
    assert c['walkReserve']>10 and c['workerReach']<600
    out=HERE/'rear-tray-first.json'; rendered=json.dumps(d,indent=2)+'\n'
    if args.check:
        assert out.read_text()==rendered, 'stale rear-tray-first.json'
    else: out.write_text(rendered)
    print(f"Rear tray-first: full-stop deficit {s['stopShortfallBeforeBevel']:.2f} mm; first-rest path {c['horizontalObstacleGap']:.1f} mm.")
