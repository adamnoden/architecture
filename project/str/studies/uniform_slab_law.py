"""Same-system RC200 constitutive comparison methods; no physical law selection."""
import json,subprocess

def require(condition,message):
    if not condition:raise ValueError(message)

def differences(a,b,path=''):
    if isinstance(a,dict) and isinstance(b,dict):
        require(a.keys()==b.keys(),'comparison object domains differ')
        return [r for k in a for r in differences(a[k],b[k],path+'/'+k)]
    if isinstance(a,list) and isinstance(b,list):
        require(len(a)==len(b),'comparison list extents differ')
        return [r for k,(x,y) in enumerate(zip(a,b)) for r in differences(x,y,path+'/'+str(k))]
    return [] if a==b else [{'path':path,'control':a,'changed':b}]
def law(request):
    v=request['bearingCase']['masonryCase']['verticalCase'];p=v['plateLaw']
    m=v['monolithicCase']['houseCase']['joinedCase']['floor']['membraneLaw'];h=request['thicknessMm']
    a=m['elasticModulusMPa']*h/(1-m['poissonRatio']**2)
    d=p['elasticModulusMPa']*p['flexuralFactor']*h**3/(12*(1-p['poissonRatio']**2))
    g=p['elasticModulusMPa']/(2*(1+p['poissonRatio']))
    s=g*p['shearFactor']*h
    return {'A11_N_per_mm':a,'A12_N_per_mm':a*m['poissonRatio'],'A66_N_per_mm':m['shearModulusMPa']*h,
        'D11_N_mm':d,'D12_N_mm':d*p['poissonRatio'],'D66_N_mm':d*(1-p['poissonRatio'])/2,
        'transverseS_N_per_mm':s,'D11_to_A11_mm2':d/a,'positiveCommonModulusNecessaryRatio':d/a/(h*h/4),
        'membraneIsotropicShearMPa':m['elasticModulusMPa']/(2*(1+m['poissonRatio'])),
        'authoredMembraneShearMPa':m['shearModulusMPa']}
def metrics(x):
    n=x['nativeVertical']['native'];p=x['nativeVertical']['plate']['physicalRecovery']
    frame_error=abs(n['recoveredInternalStrainEnergyKNmm']-n['strainEnergyKNmm'])/max(1.,abs(n['strainEnergyKNmm']))
    require(n['strainEnergyKNmm']>=0 and p['physicalPlateStrainEnergyKNmm']>=0,'negative captured strain energy')
    require(frame_error<=1e-7 and abs(frame_error-n['energyRelativeResidual'])<=1e-14,'captured frame work/strain-energy inconsistency')
    require(p['workRelativeResidual']<=1e-7,'captured plate work/strain-energy inconsistency')
    require(n['maximumFreeResidualKNOrKNmm']<=.01,'captured native free-node residual exceeds unchanged native criterion')
    return {'mass':x['mass'],'frameStrainEnergyKNmm':n['strainEnergyKNmm'],
      'frameRecoveredInternalStrainEnergyKNmm':n['recoveredInternalStrainEnergyKNmm'],
      'frameEnergyRelativeResidual':n['energyRelativeResidual'],
      'nativeMaximumFreeResidualKNOrKNmm':n['maximumFreeResidualKNOrKNmm'],
      'nativeWrenchResidualKN_KNm':n['equilibriumResidualKN_KNm'],
      'plateStrainEnergyKNmm':p['physicalPlateStrainEnergyKNmm'],'plateExternalLoadWorkKNmm':p['externalLoadWorkKNmm'],
      'plateWorkRelativeResidual':p['workRelativeResidual'],'maximumPlateDeflectionMm':p['maximumDeflectionMm'],
      'maximumFrameTranslationMm':n['maximumFrameTranslationMm'],
      'rawPointMomentInspectionKNmPerM':x['plateBending']['maximumAbsoluteBendingPlusTwistingKNmPerM'],
      'necessaryZeroAxialStrip':x['floorReinforcement']['necessaryStrainCompatibleSection'],
      'floorSectionSourceResiduals':{k:v for k,v in x['floorSection'].items() if 'Residual' in k},
      'externalWrenchKN_KNm':n['externalWrenchKN_KNm'],
      'contactNormalCompressionKN':sum(p['normalCompressionKN'] for p in x['seatedWetSupport']['contactFibres']),
      'activeContactFibreCount':sum(p['active'] for p in x['seatedWetSupport']['contactFibres'])}
def row_deltas(a,b,keys,idkeys):
    require(len(a)==len(b),'physical cut comparison extent differs')
    peaks={k:{'absoluteDifference':0} for k in keys}
    for old,new in zip(a,b):
        require(all(old.get(k)==new.get(k) for k in idkeys),'different physical cuts cannot be paired')
        for k in keys:
            av,bv=old[k],new[k]
            av=av if isinstance(av,list) else [av];bv=bv if isinstance(bv,list) else [bv]
            for j,(v,w) in enumerate(zip(av,bv)):
                if abs(w-v)>peaks[k]['absoluteDifference']:
                    peaks[k]={'absoluteDifference':abs(w-v),'control':v,'changed':w,'component':j,
                        'identity':{q:old.get(q) for q in idkeys}}
    return peaks

def compare(control,changed,provenance,root):
    require(control['sourceSHA256']==changed['sourceSHA256'],'native comparison source identities differ')
    changes=differences(control['request'],changed['request'])
    require(len(changes)==6,'unsupported extra constitutive comparison edits')
    a=control['nativeVertical']['native'];b=changed['nativeVertical']['native']
    delta={'heads':row_deltas(a['heads'],b['heads'],['reactionKN_KNm'],['id']),
           'ports':row_deltas(a['floorInterfacePorts'],b['floorInterfacePorts'],['displacementMmMrad','forceOnFloorKN_KNm'],['id'])}
    fields=['axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm']
    for name in ['memberCuts','capCuts','adjacentGridMemberCuts']:
        delta[name]=row_deltas(a[name],b[name],fields,['memberId','end','fraction','cutSide','physicalPointMm'])
    def cut_key(row):return json.dumps([row.get(k) for k in ['memberId','end','fraction','cutSide','physicalPointMm']],sort_keys=True)
    old_cuts={cut_key(r):r for r in a['interiorMemberCuts']};new_cuts={cut_key(r):r for r in b['interiorMemberCuts']}
    common=sorted(old_cuts.keys()&new_cuts.keys())
    delta['interiorMemberCuts']={'samePhysicalCutCount':len(common),'controlCutCount':len(old_cuts),'changedCutCount':len(new_cuts),
        'commonPhysicalCuts':row_deltas([old_cuts[k] for k in common],[new_cuts[k] for k in common],fields,['memberId','end','fraction','cutSide','physicalPointMm']),
        'absoluteComponentGovernors':{label:{f:max(rows,key=lambda r:abs(r[f])) for f in fields}
            for label,rows in [('control',a['interiorMemberCuts']),('uniform8250',b['interiorMemberCuts'])]},
        'scope':'Exact common physical cuts compared directly. Response-derived moment-stationary cuts can move or appear/disappear under a constitutive edit; distinct stations are retained rather than falsely paired by list index.'}
    mass_differences=differences(control['mass'],changed['mass'])
    require(all(isinstance(r['control'],(int,float)) and abs(r['changed']-r['control'])<1e-8 for r in mass_differences),'constitutive-only edit changed physical mass')
    external_wrench_difference=[new-old for old,new in zip(a['externalWrenchKN_KNm'],b['externalWrenchKN_KNm'])]
    require(max(map(abs,external_wrench_difference))<1e-8,'constitutive-only edit changed external source wrench')
    require(control['floorSection']['thicknessMm']==changed['floorSection']['thicknessMm']==200,'constitutive-only edit changed slab depth')
    cl,ul=law(control['request']),law(changed['request'])
    for key in ['D11_N_mm','D12_N_mm','D66_N_mm']:require(cl[key]==ul[key],'uniform comparison changed retained bending stiffness')
    require(abs(ul['D11_to_A11_mm2']-200**2/12)<1e-10,'uniform membrane/bending relation fails')
    require(abs(ul['authoredMembraneShearMPa']/ul['membraneIsotropicShearMPa']-1)<1e-14,'uniform in-plane shear relation fails')
    require(abs(ul['transverseS_N_per_mm']/(3437.5*200)-5/6)<1e-14,'uniform corrected transverse shear relation fails')
    checks_script="import{inspectSlabSolidCompatibility as f}from'./compiler/reference-house/current-design/structural-slab-constitutive.ts';import{readFileSync as r}from'node:fs';const p=JSON.parse(r(0,'utf8'));console.log(JSON.stringify(p.map(f)));"
    diagnostics=json.loads(subprocess.check_output(['node','--import','tsx','--input-type=module','-e',checks_script],
        cwd=root,input=json.dumps([control['request'],changed['request']]).encode()))
    result={'schema':'str-isolated-uniform200-native-comparison/1','sourceSHA256':changed['sourceSHA256'],
     'provenance':provenance,'exactAuthoredChanges':changes,
     'constitutive':{'control':cl,'uniform8250':ul,'sharedCompilerDiagnostics':diagnostics,
        'uniformIsotropicSlabOperatorsMatch':True,'transverseShearRatioChangedToControl':ul['transverseS_N_per_mm']/cl['transverseS_N_per_mm'],
        'scope':'Uniform E8250 MPa, nu0.2, G3437.5 MPa gives exact common membrane/bending and corrected Mindlin transverse shear5/6. Other frame laws remain independently authored, so a whole patch scalar solid E is not a common frame/slab material identification.'},
     'control':metrics(control),'uniform8250':metrics(changed),'actualNativeResponseDifferences':delta,
     'unchangedControls':{'fullMassLedgerWithin1eMinus8KN':True,'massRoundoffDifferences':mass_differences,
        'externalOriginWrenchWithin1eMinus8KN_KNm':True,'externalWrenchRoundoffDifferencesKN_KNm':external_wrench_difference,'slab200AndDatums':True,
        'geometrySupportsLoadsAndOtherFrameMaterials':True},
     'nativeSolveExecuted':True,'changedLawQuadratureConverged':False,'localStressConverged':False,
     'materialQualified':False,'stiffnessSelected':False,'floorSelected':False,'candidateAccepted':False,
     'limits':['This actual same-q32 control/change is an alternative constitutive comparison, not calibration of cracked RC.',
      'Changing the membrane from1200/.15/440 to8250/.2/3437.5 raises in-plane stiffness; retained steel-only rationale does not prove this new law.',
      'Standard5/6 corrected transverse shear is41.6667% of old; it cannot preserve the old shear under this uniform isotropic law.',
      'The current finite-contour solid uses one E for slab and adjoining L walls; changing that whole patch to8250 would also change retained L axial/other laws. Body-specific material/port ownership and full work accounting remain required.',
      'Changed actual native evidence invalidates retained finite joint/contour station-response receipts; no stale insertion or global solid substitution is performed.',
      'Positive operators and exact common-law algebra do not establish reinforcement, cracked stiffness, local stress, anchorage, node resistance, full signed envelope or foundation capacity.']}
    return result
