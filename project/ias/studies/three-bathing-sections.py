"""Check the governing three-bathing alternative at upper finish, RC, ceiling and room service levels."""
from pathlib import Path
import json
import runpy
import sys

from rear_shower_side_service import rear_section
from family_bath_permanent_drop import family_drop
from saniform_long_exchange import result as bath_exchange
from three_bathing_figure import draw, draw_shell

HERE=Path(__file__).resolve().parent
PROJECT=HERE.parents[1]


def read(name):
    return json.loads((PROJECT/name).read_text())


def study():
    house=read('had/studies/water-replan.json')['model']
    services=read('mat/studies/whole-house-service-baseline.json')
    retained=read('ias/studies/rear-tray-first.json')
    structural=read('str/studies/current-house-occupied-interfaces.json')
    well=structural['formedShowerOpening']
    assert well['xyz']==[[1812.5,9252.5,2212.5,9652.5],[3170,3370]]
    assert well['oldField'][0]=='NW-W' and well['toWetBeamFace']==590
    seat=well['receiverEndComparison']
    controls={'programme':'Four bedrooms, four WCs, two showers and the 1700 family bath.',
              'rear':'Use the prepared flush 400 well for the three-bathing house unless a stepped rear shower is deliberately adopted.',
              'rearWellXYZ':well['xyz'],'rearField':well['oldField'],'wetBeamFaceClearance':well['toWetBeamFace'],
              'nativeTrayLand':retained['tray']['drainLandLowerY'],'chosenB594TrialInsertion':retained['socket']['engagement'],
              'trayFirst':{k:retained['change'][k] for k in ('maxLift','walkReserve','horizontalObstacleGap','anchorCoupleKN')},
              'wetBeamDemand':seat['wetBeamGlobalM_V'],'wetBeamResistance':seat['wetBeamMR_VR'],
              'wholeBodyIsNotRoutineHairCup':True,'houseSourceAdopted':False}
    seg=runpy.run_path(str(HERE/'principal-shower-entry.py'))['segbox']
    rear=rear_section(house,services,retained,structural,seg)
    family=family_drop(house,services)
    shell=bath_exchange(PROJECT.parent)
    assert shell['native']['model']=='363-1' and shell['pack']==[1790,720,450]
    # Retire the obsolete upper front and the old small en-suite only in this new house composition.
    # The earlier accepted layout remains its own version until a proper house adoption.
    wall={w['id']:w for w in house['upperWalls']}
    assert wall['wet-spine']['finishedFaces']==[9203,9397] and wall['bed3-L-north']['finishedFaces']==[3603,3800]
    assert house['upperFurniture']['bed3']==[9942.5,1518,950,2055]
    assert house['upperFurniture']['family-service-cabinet']==[9397,4675,600,750]
    assert services['plant']['riserGross']==[9400,4700,550,700]
    controls['historicalFront']={'formerServiceFaceX':9500,'oldRewoundFaceY':[2930,3670],
        'formerLiningX':[9862.5,10112.5],'earlierRoomDepth':1075,'newWetSpineX':[9203,9397],
        'bed3NorthReturnY':[3603,3800],'oldLiningToBedOverlap':[10112.5-9942.5,3573-2930],
        'newWallThroughOldFrontY':3670-3603,'currentCabinet':house['upperFurniture']['family-service-cabinet'],
        'actualRiser':services['plant']['riserGross'],'actualSixServiceFloorOpening':services['plant']['formedOpeningProposal']}
    return {'selection':controls,'rearSideOption':rear,'family':family,'originalBathExchange':shell}


if __name__=='__main__':
    model=study()
    for name,contents in [('three-bathing-sections.json',json.dumps(model,indent=2)+'\n'),
                          ('three-bathing-sections.svg',draw(model)),
                          ('original-bath-exchange.svg',draw_shell(model['originalBathExchange']))]:
        p=HERE/name
        if '--check' in sys.argv:
            if not p.exists() or p.read_text()!=contents:
                raise SystemExit('Stale '+p.name)
        else:
            p.write_text(contents)
    print('Three-bathing house: registered flush rear well, raised service alternative, original family-bath outlet, lower access and intact shell exchange.')
