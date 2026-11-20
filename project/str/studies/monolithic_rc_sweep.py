from array import array
from collections import OrderedDict
import copy
import hashlib
import json
from pathlib import Path
import runpy
import sys

from distributed_floor_compatibility import _native_floor_wind
from rc_floor_house_loads import build_rc_floor_house
from rc_floor_house_proof import numerical_case as house_case
from rc_portal_monolithic import build_monolithic_rc_portals, draw_monolithic_barrier, draw_monolithic_rc_floor, load_monolithic_rc_source, reference_monolithic_rc_case, solve_monolithic_rc_portals


D=Path(__file__).resolve().parent
COLUMNS=('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')


def numerical_case(source,index=31):
    case=reference_monolithic_rc_case(source);case['houseCase']=house_case(source['house'],index)
    return case


def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()


class NativeFactorMemo:
    def __init__(self,capacity=4):
        self.capacity=capacity;self.cache=OrderedDict();self.hits=0;self.misses=0
        self.path=D/'structural-linear.py';self.original_run_path=runpy.run_path
        self.native_factor=self.original_run_path(str(self.path))['factor']
    def factor(self,matrix):
        h=hashlib.sha256();h.update(str(len(matrix)).encode())
        for row in matrix:h.update(array('d',row).tobytes())
        key=h.hexdigest()
        if key in self.cache:
            self.hits+=1;self.cache.move_to_end(key);return self.cache[key]
        self.misses+=1;result=self.native_factor(matrix);self.cache[key]=result
        if len(self.cache)>self.capacity:self.cache.popitem(last=False)
        return result
    def __enter__(self):
        def native_modules(path,*args,**kwargs):
            result=self.original_run_path(path,*args,**kwargs)
            if Path(path).resolve()==self.path.resolve():result={**result,'factor':self.factor}
            return result
        runpy.run_path=native_modules
        return self
    def __exit__(self,kind,value,traceback):runpy.run_path=self.original_run_path


def prepare_pressure_basis(source,base):
    basis={};reference=None;checks=[]
    for axis in (0,1):
        for code in range(1,7):
            index=7*code-1 if axis==0 else code-1
            case=copy.deepcopy(base['houseCase']);case['joinedCase']['floor']['boundaryCase']['windIndex']=index
            model=build_rc_floor_house(case,source['house']);floor=model['joinedFloor']['floor']
            if reference is None:reference=floor['condensedStiffnessKNPerMm']
            if floor['condensedStiffnessKNPerMm']!=reference:raise ValueError('Load-only programme changed the actual flooroperator; no basis reuse')
            basis[axis,code]={'families':{key:copy.deepcopy(model['families'][key]) for key in ('native-floor-reconciled','actual-outer-portal-ground-pressure')},
                'condensedForceKN':list(floor['condensedForceKN']),'pressure':copy.deepcopy(model['housePressure']),
                'recovery':{key:{family:copy.deepcopy(model.get(key,{}).get(family,{})) for family in ('native-floor-reconciled','actual-outer-portal-ground-pressure')} for key in ('memberEquivalentLoads','memberPointLoads','memberDistributedLoads')}}
            checks.append({'axis':axis,'code':code,'nativeWindIndex':index,'nativeProgramme':model['housePressure']['nativeWind']['programme'],
                'floorForceDigest':digest(floor['condensedForceKN']),'actualPortalOriginDigest':digest(model['housePressure']['actualPortalWindOrigins'])})
    return basis,reference,checks


def apply_programme(model,source,base,basis,index,physical_g=.9,external=False):
    floor_source=source['house']['joined']['floor'];wind=_native_floor_wind(floor_source,index,floor_source['retained']['policy']['axes'])
    chosen=[basis[axis,code] for axis,code in enumerate(wind['programme']) if code]
    families={key:{} for key in ('native-floor-reconciled','actual-outer-portal-ground-pressure')}
    for item in chosen:
        for family,loads in item['families'].items():
            for node,wrench in loads.items():
                target=families[family].setdefault(node,[0.]*6)
                for i,value in enumerate(wrench):target[i]+=value
    for key,value in families.items():model['families'][key]=value
    for key in ('memberEquivalentLoads','memberPointLoads','memberDistributedLoads'):
        for family in families:
            combined={}
            for item in chosen:
                for name,loads in item['recovery'][key][family].items():
                    if key=='memberEquivalentLoads':
                        target=combined.setdefault(name,[0.]*12)
                        for i,value in enumerate(loads):target[i]+=value
                    else:combined.setdefault(name,[]).extend(copy.deepcopy(loads))
            model.setdefault(key,{})[family]=combined
    floor=model['joinedFloor']['floor'];floor['condensedForceKN']=[sum(item['condensedForceKN'][i] for item in chosen) for i in range(len(floor['condensedForceKN']))]
    pressure=copy.deepcopy(chosen[0]['pressure']);pressure['nativeWind']=wind
    for key in ('reconciledFloorRows','removedGrossLowerPortalShares','actualPortalWindOrigins','projectionCouples','analyticActualPortalChecks'):
        pressure[key]=[row for item in chosen for row in item['pressure'][key]]
    model['housePressure']=pressure
    case=copy.deepcopy(base);case['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=index
    case['houseCase']['boundary'].update(physicalGFactor=physical_g,includeExternalGMAXQ=external)
    model['houseLoadCase']=case['houseCase'];model['monolithic']['request']=case
    return case


def action_vectors(result,key):return [[row[column] for column in COLUMNS] for row in result[key]]


def compact_case(result,index):
    return {'caseId':result['caseId'],'windIndex':index,'programme':result['pressureBoundary']['nativeWind']['programme'],
        'externalWrenchKN_KNm':result['externalWrenchKN_KNm'],'equilibriumResidualKN_KNm':result['equilibriumResidualKN_KNm'],
        'nativeFloorLoadWorkResidualKN_KNm':result['nativeFloorLoadWorkResidualKN_KNm'],'floorInterfaceWrenchResidualKN_KNm':result['floorInterfaceWrenchResidualKN_KNm'],
        'energyRelativeResidual':result['energyRelativeResidual'],'condensedSystemStrainEnergyKNmm':result['condensedSystemStrainEnergyKNmm'],
        'maximumFrameTranslationMm':result['maximumFrameTranslationMm'],
        'fourLInterfaces':[{'id':row['id'],'activeCompressionSamples':row['activeCompressionSamples'],'unqualifiedTieTensionKN':row['unqualifiedTieTensionKN'],'forceOnUpperKN_KNm':row['forceOnUpperKN_KNm']} for row in result['fourLComparisonInterfaces']],
        'memberCutVectors':action_vectors(result,'memberCuts'),'capCutVectors':action_vectors(result,'capCuts'),
        'interiorMemberCuts':result['interiorMemberCuts'],'adjacentGridCutVectors':action_vectors(result,'adjacentGridMemberCuts'),'memberLoadEquilibrium':result['memberLoadEquilibrium'],
        'headVectorsKN_KNm':[row['reactionKN_KNm'] for row in result['heads']],
        'portMovementsMmMrad':result['portMovementsMmMrad']}


def _update_envelope(envelope,result):
    for family,key,identity,columns in (('members','memberCuts',lambda row:row['memberId']+'/'+str(row['end']),COLUMNS),
        ('caps','capCuts',lambda row:row['memberId']+'/'+str(row['end']),COLUMNS),
        ('interiorMembers','interiorMemberCuts',lambda row:row['memberId'],COLUMNS),
        ('adjacentGrid','adjacentGridMemberCuts',lambda row:row['memberId']+'/'+str(row['end']),COLUMNS)):
        for row in result[key]:
            target=envelope.setdefault(family,{}).setdefault(identity(row),{})
            for column in columns:
                current=target.setdefault(column,{'minimum':{'value':row[column],'caseId':result['caseId'],'simultaneousCut':row},'maximum':{'value':row[column],'caseId':result['caseId'],'simultaneousCut':row}})
                if row[column]<current['minimum']['value']:current['minimum']={'value':row[column],'caseId':result['caseId'],'simultaneousCut':row}
                if row[column]>current['maximum']['value']:current['maximum']={'value':row[column],'caseId':result['caseId'],'simultaneousCut':row}
    for row in result['heads']:
        target=envelope.setdefault('heads',{}).setdefault(row['id'],{})
        for axis,value in enumerate(row['reactionKN_KNm']):
            current=target.setdefault(str(axis),{'minimum':{'value':value,'caseId':result['caseId'],'simultaneousWrenchKN_KNm':row['reactionKN_KNm']},'maximum':{'value':value,'caseId':result['caseId'],'simultaneousWrenchKN_KNm':row['reactionKN_KNm']}})
            if value<current['minimum']['value']:current['minimum']={'value':value,'caseId':result['caseId'],'simultaneousWrenchKN_KNm':row['reactionKN_KNm']}
            if value>current['maximum']['value']:current['maximum']={'value':value,'caseId':result['caseId'],'simultaneousWrenchKN_KNm':row['reactionKN_KNm']}


def run_sweep(source):
    base=numerical_case(source);basis,k,checks=prepare_pressure_basis(source,base)
    model=build_monolithic_rc_portals(base,source)
    if model['joinedFloor']['floor']['condensedStiffnessKNPerMm']!=k:raise ValueError('Monolithicgeometry changed actual flooroperator')
    direct_checks=[]
    for index in (31,0,32,33):
        case=apply_programme(model,source,base,basis,index);direct=build_monolithic_rc_portals(case,source)
        error=max(abs(a-b) for family in ('native-floor-reconciled','actual-outer-portal-ground-pressure') for node in model['families'][family].keys()|direct['families'][family].keys() for a,b in zip(model['families'][family].get(node,[0.]*6),direct['families'][family].get(node,[0.]*6)))
        equivalent_error=0.
        for family in ('native-floor-reconciled','actual-outer-portal-ground-pressure'):
            a=model.get('memberEquivalentLoads',{}).get(family,{});b=direct.get('memberEquivalentLoads',{}).get(family,{})
            equivalent_error=max(equivalent_error,max((abs(x-y) for name in a.keys()|b.keys() for x,y in zip(a.get(name,[0.]*12),b.get(name,[0.]*12))),default=0.))
            for key in ('memberPointLoads','memberDistributedLoads'):
                if model.get(key,{}).get(family,{})!=direct.get(key,{}).get(family,{}):raise ValueError('Programme basis changed actual appliedmember loadgeometry: '+str((index,key,family)))
        if max(error,equivalent_error)>1e-7:raise ValueError('Actualsource programme disagrees with fresh directnodal/memberload builder')
        direct_checks.append({'windIndex':index,'nodalLoadResidualKN_KNmm':error,'memberEquivalentLoadResidualKN_KNmm':equivalent_error,'pointAndDistributedLoadGeometryExactlyEqual':True})
    basis_error=max(row['nodalLoadResidualKN_KNmm'] for row in direct_checks)
    cases=[];envelope={};geometries=None;head_ids=None;worst_arch=(-1.,None);worst_post=(-1.,None);view_result=None
    with NativeFactorMemo() as memo:
        order=[31,*[index for index in range(48) if index!=31]]
        for index in order:
            apply_programme(model,source,base,basis,index)
            result=solve_monolithic_rc_portals(model,source,'MONOLITHIC-G0.9-W'+str(index))
            if geometries is None:
                geometries={key:[{name:value for name,value in row.items() if name not in COLUMNS and name!='globalPhysicalEndWrenchKN_KNm'} for row in result[key]] for key in ('memberCuts','capCuts','adjacentGridMemberCuts')};head_ids=[row['id'] for row in result['heads']]
            record=compact_case(result,index);cases.append(record);_update_envelope(envelope,result)
            if index==31:view_result=copy.deepcopy(result)
            for row in result['memberCuts']+result['interiorMemberCuts']:
                proxy=abs(row['axialCompressionKN'])/4+(abs(row['bendingYKNm'])+abs(row['bendingZKNm']))*1000/100
                if row['kind']=='curved-ring' and proxy>worst_arch[0]:worst_arch=(proxy,index)
                if row['kind']=='post' and proxy>worst_post[0]:worst_post=(proxy,index)
            print('unique',len(cases),'/48','wind',index,'u',result['maximumFrameTranslationMm'],'wrench',max(abs(v) for v in result['equilibriumResidualKN_KNm']),'LU',memo.hits,memo.misses,flush=True)
            checkpoint={'schema':'str-monolithic-sweep-checkpoint/1','sourceSHA256':source['identities'],'complete':False,'executedUniqueCases':len(cases),'caseSummaries':[{k:v for k,v in row.items() if k not in ('memberCutVectors','capCutVectors','headVectorsKN_KNm','interiorMemberCuts','adjacentGridCutVectors')} for row in cases]}
            (D/'monolithic-rc-sweep-checkpoint.json').write_text(json.dumps(checkpoint,indent=2,allow_nan=False)+'\n')
        strength=[]
        for index in sorted({7,31,worst_arch[1],worst_post[1]}):
            apply_programme(model,source,base,basis,index,physical_g=1.35,external=True)
            result=solve_monolithic_rc_portals(model,source,'MONOLITHIC-GMAXQ-W'+str(index));strength.append(compact_case(result,index));_update_envelope(envelope,result)
            print('GMAXQ',index,'u',result['maximumFrameTranslationMm'],flush=True)
        memo_info={'capacity':memo.capacity,'hits':memo.hits,'misses':memo.misses,'key':'SHA256ofEVERYfloatintheactualreducedscaledmatrix;nativeLUunchanged','scope':'Proofprocessonly, restoredrunpyaftercontext; no cachedresultor alteredmaterial/active-set logic.'}
    apply_programme(model,source,base,basis,31)
    replay=solve_monolithic_rc_portals(model,source,'MONOLITHIC-G0.9-W31-UNCACHED-REPLAY')
    original=next(row for row in cases if row['windIndex']==31)
    replay_error=max(abs(a-b) for old,new in zip(original['memberCutVectors'],action_vectors(replay,'memberCuts')) for a,b in zip(old,new))
    if replay_error>1e-7:raise ValueError('Uncached source replay disagrees with memoized native solver')
    floor_source=source['house']['joined']['floor'];axes=floor_source['retained']['policy']['axes'];pairs=[]
    for index in range(48):
        a=_native_floor_wind(floor_source,index,axes);b=_native_floor_wind(floor_source,index+48,axes)
        if a['rows']!=b['rows'] or a['programme']!=b['programme']:raise ValueError('Courtprojection pairing changes realfloor actions; no doubledIDclaim')
        pairs.append({'windIndex':index+48,'reuseExecutedWindIndex':index,'programme':b['programme'],'reason':'Exactsamefloor+actualouterportalpressure recipe; courtProjectionchangesomittedroofonly. No additionalphysicalsolveclaimed.'})
    summary={'schema':'str-monolithic-rc-native96-sweep/1','sourceSHA256':source['identities'],
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'authoredBaseCase':base,
        'programmeIdCount':96,'uniquePhysicalWindSolveCount':48,'additionalGMAXQCaseCount':len(strength),'uncachedReplayCount':1,
        'pressureBasis':checks,'freshDirectProgrammeChecks':direct_checks,'maximumFreshDirectLoadBasisResidualKN_KNmm':basis_error,'nativeFactorMemo':memo_info,
        'actionColumns':COLUMNS,'cutGeometry':geometries,'headIds':head_ids,'cases':sorted(cases,key=lambda row:row['windIndex']),
        'pairedProgrammeIds':pairs,'GMAXQCases':strength,'GMAXQSelectionScope':'SelectedactualGMAX/Qcontrolsfromwind7/31andlargestwind-onlyarch/postactionproxies; notexhaustive48programmeGMAX/Qcapacityenvelope.','governingActionEnvelopes':envelope,
        'uncachedReplayMemberActionDeltaKN_KNm':replay_error,'viewCaseId':view_result['caseId'],
        'maximumWrenchResidualKN_KNm':max(abs(value) for row in cases+strength for value in row['equilibriumResidualKN_KNm']),
        'maximumEnergyRelativeResidual':max(row['energyRelativeResidual'] for row in cases+strength),
        'actualLowerExposureZMm':view_result['pressureBoundary']['actualGardenWalkingZMm'],
        'sourceBaseAndBelowWalkingAccounting':view_result['pressureBoundary']['removedGrossLowerPortalShares'],
        'independentArchBoundaryChecks':view_result['pressureBoundary']['analyticActualPortalChecks'],
        'scope':'Actualsource96programmeidentities:48uniquefloor+openouterportalphysicalwindsolves, no roof/P0/unjoinedgravity. Explicit0.9physicalG; optionalspecifiedupperGMAX/Qstrengthfamiliesonly. Notcompletehouse/installed/capcage/waterstop/thermalacceptance.',
        'completeReceivingPaths':0,'unresolvedReceivingPortCount':28,'candidateAccepted':False,'waterControlAccepted':False,'thermalAccepted':False,'completeHouseProof':False,'roofAdoption':False,'installedAcceptance':False}
    drawings={'floor.svg':draw_monolithic_rc_floor(model,view_result),'barrier.svg':draw_monolithic_barrier(model)}
    summary['drawingsSHA256']={key:hashlib.sha256(value.encode()).hexdigest() for key,value in drawings.items()}
    return summary,drawings


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write for actual48unique/96source programme sweep')
    source=load_monolithic_rc_source(D.parents[2]);summary,drawings=run_sweep(source)
    if source['identities']!=load_monolithic_rc_source(D.parents[2])['identities']:raise SystemExit('Sourceschangedwhileexecuting; no stalesweepwritten')
    (D/'monolithic-rc-native96-proof.json').write_text(json.dumps(summary,indent=2,allow_nan=False)+'\n')
    for name,svg in drawings.items():(D/('monolithic-rc-native96-'+name)).write_text(svg)
    (D/'monolithic-rc-sweep-checkpoint.json').unlink(missing_ok=True)
    print('96sourceIDs/48physicalwindsolves, selectedGMAXQcontrols anduncachedreplaycomplete',flush=True)
