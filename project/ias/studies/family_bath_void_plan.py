"""The 1200 mm TDWA5A2 position, upright fixed-index 480 x 730 bath carrier.
Coordinates in mm. The uncertainty allowances are site witness limits, not maker tolerances.
"""
import math

def dist(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1]
    t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)))
    return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)

def clear(path,boxes):
    def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    c=math.inf
    for x,y,X,Y in boxes:
        v=[(x,y),(X,y),(X,Y),(x,Y)]
        if any(x <= px <= X and y <= py <= Y for px,py in path):
            return 0.
        for a,b in zip(path,path[1:]):
            for u,w in zip(v,v[1:]+v[:1]):
                if cross(a,b,u)*cross(a,b,w)<0 and cross(u,w,a)*cross(u,w,b)<0:return 0
                c=min(c,dist(a,u,w),dist(b,u,w),dist(u,a,b),dist(w,a,b))
    return c

def source_paths(house,barrier):
    # Include 18 mm prospective face trim on solid wall regions and stop at the upper arrival.
    def solids(level):
        walls=[]
        for w in house[level+'Walls']:
            (x,y),(X,Y)=w['a'],w['b']; vert=x==X; c=x if vert else y
            left,right=w.get('finishedFaces',[c-w['t']/2,c+w['t']/2])
            low,high=sorted((y,Y) if vert else (x,X)); prev=low
            for a,b in sorted(w.get('holes',[]))+[(high,high)]:
                if a>prev:
                    walls.append((w['id'],[left-18,prev-18,right+18,a+18] if vert else [prev-18,left-18,a+18,right+18]))
                prev=max(prev,b)
        furniture=[(n,[x,y,x+dx,y+dy]) for n,(x,y,dx,dy) in house[level+'Furniture'].items()]
        return walls+furniture+[('court finished face',[3802.5,3802.5,8197.5,8197.5])]
    gate=house['stairGuard']['firstFloorGuards']
    upper=solids('upper')+[(n,[x,y,x+w,y+h])for n,(x,y,w,h) in gate]
    upper += [(n,[x,y,x+w,y+h]) for n,(x,y,w,h) in house['fixedObstacles']['FIRST']]
    upper+=[('complete proposed loading box',[5100,2735,6450,3750])]
    ground=solids('ground')+[('temporary containment',b) for b in barrier]
    ground += [(n,[x,y,x+w,y+h]) for n,(x,y,w,h) in house['fixedObstacles']['GROUND']]
    for v in house['protectedRoute']['doors']:
        if v['id'].startswith('FD-'):
            x,y,w,h=v['closed'];ground.append((v['id']+' closed',[x,y,x+w,y+h]))
    source=[(3200,3485),(3600,3300),(6640,3300),(6640,3250)]
    retreat=[(4450,3300),(4050,3460),(3280,3460),(3220,3700),(2400,3700),(2250,3890),(2250,4432.5)]
    controls=lambda seq,items: min((round(clear(seq,[rect]),6),name)for name,rect in items)
    return {'lowerStairSource':source,'lowerSourceClearance':controls(source,ground),
      'westOperatorEscape':retreat,'westOperatorClearance':controls(retreat,upper),
      'mastToTrimmedBed2Face':2920-2765,'full322PlanDiskIntrusion':322-(2920-2765),
      'crankCondition':'Only a measured handle axle, orientation, axial projection and safe operator posture can replace the rejected 322 mm plan disk. Keep the west route outside the measured control assembly throughout.'}

def result(house=None):
    mx,my=4635,2920;r=1200;startY,endY=3250,2000
    def x(y):return mx+math.sqrt(r*r-(y-my)**2)
    start,end=(x(startY),startY),(x(endY),endY)
    yaw=math.radians(1)
    hx=240*math.cos(yaw)+365*math.sin(yaw)
    hy=365*math.cos(yaw)+240*math.sin(yaw)
    error=5+3+10  # radius + each coordinate of mast + maximum lateral guidance deviation
    X=lambda cy:x(max(endY,min(startY,cy)))
    bands=[(1550,1800,5950),(1800,2000,6050),(2000,2250,6150),(2250,2785,6180)]
    barrier=[[5060,a,E,b] for a,b,E in bands]
    maxE=[X(min(my,b+hy+error))+hx+error for a,b,E in bands]
    # The smallest X at either end of the section able to reach the 50 mm deep north guard.
    gateReach=[2735-hy-error,2785+hy+error]
    gateShadow=[min(X(y) for y in gateReach)-hx-error, X(my)+hx+error]
    lower=[(6640,3250),(6640,1650),(6480,1490),(6410,1360),(6390,1210),(6390,800)]
    eastDoor=[(6390,800),(6425,620),(6425,0),(6200,-675),(6000,-1050),(6000,-1450)]
    westDoor=[(6390,800),(6160,895),(5800,930),(5575,875),(5575,0),(5800,-675),(6000,-1050),(6000,-1450)]
    frontWalls=[[0,0,5100,429.5],[6900,0,12000,429.5],[7101.5,429.5,7298.5,2650]]
    # Configuration measurements, not a selected doorset: inward-open blades and known closed-leaf section Y270..314.
    openEast=[6850,270,6900,1214]; westClosed=[5100,270,6000,314]
    openWest=[5100,270,5150,1214]; eastClosed=[6000,270,6900,314]
    stage=[5090,1560,5740,2440]
    roomWest,roomEast=4897,7101.5
    tag=[]
    for y in [3250,2920,2000]:
        cx=x(y)
        # Horizontal control during slew; opposed yaw moments from the two western guides.
        for sign,guide in [(-1,(5000,2875)),(1,(5000,3350))]:
            lug=(cx,y+sign*365); dx,dy=guide[0]-lug[0],guide[1]-lug[1]
            tag.append({'hookY':y,'lugSign':sign,'guide':guide,'horizontalLever':-sign*365*dx/math.hypot(dx,dy)})
    eye=(4450,3300,5050);target=(end[0],end[1],150);tf=(eye[2]-3450)/(eye[2]-target[2])
    wall=roomEast-6180
    rec={'r':r,'mast':[mx,my],'start':start,'end':end,'indexedEndRadiusCases':[
                [R, mx+(end[0]-mx)*R/r,my+(end[1]-my)*R/r] for R in [1180,1195,1200,1205,1220]],
       'horizontalHalfEnvelope':[hx,hy],'budget':{'radius':5,'mastEach':3,'sway':10,'yawDeg':1,'eachTranslation':error},
       'eastOfOverheadByBand':maxE,'outsideBarriers':barrier,'barrierThickness':60,'barrierSetout':5,
       'innerGapByBand':[b[2]-60-5-e for b,e in zip(bands,maxE)],
       'lowerAisle':wall,'lowerAisleAfterTwo5':wall-10,
       'receiverOuter':stage,'settledPackAdverseGaps':[end[0]-hx-error-stage[0],stage[2]-end[0]-hx-error,
          end[1]-hy-error-stage[1],stage[3]-end[1]-hy-error],
       'toWestCheek':stage[0]-roomWest,'oldCloakDoorAccessibleWithFrame':False,
       'northGuardY':[2735,2785],'gateClear':[5400,6400],'gateShadowX':gateShadow,
       'pairedGateMargins':[gateShadow[0]-5400-5,6400-gateShadow[1]-5],
       'upperBridgeNorth':3802.5,'startNorthRemainingWithoutLock':3802.5-(startY+hy+error),
       'lowerPathToOperatingZone':lower,'lowerBeforeDoorClearance':clear(lower,barrier+frontWalls+[openEast]),
       'lowerWestHeldOpenClearance':clear(lower,barrier+frontWalls+[openWest,eastClosed]),
       'eastDoorApproachPath':eastDoor,'eastDoorApproachClearance':clear(eastDoor,barrier+frontWalls+[openEast,westClosed]),
       'westDoorApproachPath':westDoor,'westDoorApproachClearance':clear(westDoor,barrier+frontWalls+[openWest,eastClosed]),
       'doorMeasurement':'Two independently measured configurations. East clear interval must contain 6000..6850 for the 850 witness, west must contain 5150..6000. At 775 measure centre and repeat; a 900 approach does not imply passage of an R450 circle through an 850 opening.',
       'westSpotter':[4450,3300],'rayToGroundAtUpperFloor':[eye[i]+tf*(target[i]-eye[i]) for i in (0,1)],
       'tagHorizontalExamples':tag,
       'scope':'Upper preparations interrupt the only demonstrated east-to-stair route. Planned vacancy only; west operators need a preserved escape. These example tag guides control an upright package horizontally, not a physical arrest rating or proof of clear lines during lowering.'}

    if house is not None:rec['housePaths']=source_paths(house,barrier)
    return rec
