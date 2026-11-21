import math


def sparse_schur(assembled):
    import numpy as np
    from scipy import sparse
    from scipy.sparse.linalg import splu
    count=assembled['dofCount'];retained=assembled['portCount'];rows=[];columns=[];values=[]
    for i,row in assembled['matrix'].items():
        for j,value in row.items():rows.append(i);columns.append(j);values.append(value)
    matrix=sparse.csc_matrix((values,(rows,columns)),shape=(count,count));scales=np.ones(count)
    for (point,axis),index in assembled['freePointDofs'].items():
        if axis:scales[index]=.001
    interior=scales[retained:];kii=(sparse.diags(interior)@matrix[retained:,retained:]@sparse.diags(interior)).tocsc();factor=splu(kii,permc_spec='MMD_AT_PLUS_A')
    if min(abs(value) for value in factor.U.diagonal())<=1e-9:raise ValueError('Singular/unconnected physical verticalplate interior; no artificial restraint')
    kir=(sparse.diags(interior)@matrix[retained:,:retained]).toarray();force=np.array([assembled['force'].get(i,0.) for i in range(count)]);fi=interior*force[retained:]
    response=factor.solve(kir);particular=factor.solve(fi);condensed=matrix[:retained,:retained].toarray()-kir.T@response;condensed=(condensed+condensed.T)/2;load=force[:retained]-kir.T@particular
    return condensed.tolist(),load.tolist(),{'factor':factor,'interiorScale':interior,'interiorCoupling':kir,'referenceInteriorLoad':fi,'loadOnlyEnergy':float(fi@particular/2)}


def spectral_energy_modes(matrix):
    import numpy as np
    a=np.array(matrix);a=(a+a.T)/2;original=float(np.max(np.abs(a)));values,vectors=np.linalg.eigh(a)
    if float(np.min(values))< -original*1e-8:raise ValueError('Verticalplate condensed stiffness has negative strainenergy')
    selected=values>original*1e-10;modes=(vectors[:,selected]*np.sqrt(values[selected])).T;reconstructed=modes.T@modes;error=float(np.max(np.abs(reconstructed-a))/max(1.,original))
    if error>1e-8:raise ValueError('Verticalplate spectralenergymodes fail exact physicaloperator reconstruction')
    return modes.tolist(),error


def solve_vertical_frame(frame,vertical):
    import numpy as np
    from scipy import sparse
    from scipy.sparse.linalg import splu
    names=list(frame.nodes);indices={name:6*i for i,name in enumerate(names)};count=6*len(names);fixed={indices[name]+axis:value for (name,axis),value in frame.fixed.items()}
    if any(value!=0 for value in fixed.values()):raise ValueError('Verticalfloor sparse route supports only sourcezero fixedtranslations/gauges')
    free=[i for i in range(count) if i not in fixed];lookup={i:j for j,i in enumerate(free)}
    internal_scales=getattr(frame,'internalScalarCoordinateScales',{})
    if not isinstance(internal_scales,dict):raise ValueError('Explicit internal scalar coordinate scales must be a named map')
    for name,value in internal_scales.items():
        if name not in indices or not name.startswith('LOWER-CORE/body-top/') or type(value) not in (int,float) or not math.isfinite(value) or value<=0 or (name,2) in frame.fixed or any((name,axis) not in frame.fixed for axis in (0,1,3,4,5)):
            raise ValueError('Only positive reversible lower-body scalar normalisation is supported; no physical restraint or other DOF change')
    scale=np.array([internal_scales.get(names[i//6],1.) if i%6==2 else .001 if i%6>=3 else 1. for i in free]);external=np.zeros(count)
    for node,wrench in frame.loads.items():external[indices[node]:indices[node]+6]+=wrench
    rows=[];cols=[];values=[]
    for name,a,b,matrix in frame.members:
        dofs=list(range(indices[a],indices[a]+6))+list(range(indices[b],indices[b]+6))
        for i,row in enumerate(matrix):
            if dofs[i] not in lookup:continue
            for j,value in enumerate(row):
                if value and dofs[j] in lookup:rows.append(lookup[dofs[i]]);cols.append(lookup[dofs[j]]);values.append(value)
    base=sparse.csc_matrix((values,(rows,cols)),shape=(len(free),len(free)));spring_rows=[];spring_cols=[];spring_values=[]
    for i,spring in enumerate(frame.springs):
        for node,row in spring['terms']:
            for axis,value in enumerate(row):
                if value:spring_rows.append(i);spring_cols.append(indices[node]+axis);spring_values.append(value)
    all_c=sparse.csr_matrix((spring_values,(spring_rows,spring_cols)),shape=(len(frame.springs),count));c=all_c[:,free]
    physical=np.array([not spring['id'].startswith('VERTICAL-FLOOR/energy/') for spring in frame.springs]);stiffness=np.array([spring['stiffness'] for spring in frame.springs]);active=np.ones(len(frame.springs),dtype=bool)
    rows=[];cols=[];values=[]
    for i,terms in enumerate(vertical['portTerms']):
        for node,row in terms:
            for axis,value in enumerate(row):
                index=indices[node]+axis
                if value and index in lookup:rows.append(i);cols.append(lookup[index]);values.append(value)
    t=sparse.csr_matrix((values,(rows,cols)),shape=(len(vertical['ports']),len(free)));plate=sparse.csr_matrix(vertical['operator']['condensedStiffness']);base=base+t.T@plate@t;seen=set()
    for iteration in range(40):
        state=tuple(np.flatnonzero(active))
        if state in seen:raise ValueError('Unilateral verticalfloor contact active set cycles; no compatible result')
        seen.add(state);enabled=active&physical;matrix=base+c.T@sparse.diags(stiffness*enabled)@c;scaled=(sparse.diags(scale)@matrix@sparse.diags(scale)).tocsc();factor=splu(scaled,permc_spec='COLAMD')
        if min(abs(value) for value in factor.U.diagonal())<1e-8:raise ValueError('Singular/unrestrained coupled verticalfloor; no added spring/restraint')
        solved=factor.solve(external[free]*scale)*scale;u=np.zeros(count);u[free]=solved;relative=np.asarray(c@solved).ravel();next_active=[]
        for spring,value in zip(frame.springs,relative):
            if spring['gap']!=0:raise ValueError('Sourceverticalcontact supports zero gap only; installed gap/free-travel laws remain unqualified')
            next_active.append(spring['mode']=='bilateral' or value<=1e-10 if spring['mode']!='tension' else value>1e-10)
        changed=not np.array_equal(active,next_active);active=np.array(next_active,dtype=bool)
        if changed:continue
        forces=stiffness*relative*active;residual=np.zeros(count);member_wrenches={}
        for name,a,b,k in frame.members:
            dofs=list(range(indices[a],indices[a]+6))+list(range(indices[b],indices[b]+6));vector=u[dofs];actions=np.array(k)@vector;member_wrenches[name]=actions.tolist()
            for index,value in zip(dofs,actions):residual[index]+=value
        residual+=np.asarray(all_c.T@(forces*physical)).ravel();port_u=np.asarray(t@solved).ravel();extra=np.asarray(t.T@(plate@port_u)).ravel();residual[free]+=extra;residual-=external
        maximum=float(np.max(np.abs(residual[free])))
        if maximum>.01:raise ValueError('Actual verticalfloor solution fails unchanged native free-node force/moment residual criterion')
        springs=[{**spring,'relativeMm':float(value),'active':bool(active[i]),'forceKN':float(forces[i])} for i,(spring,value) in enumerate(zip(frame.springs,relative))]
        return {'displacements':{name:u[indices[name]:indices[name]+6].tolist() for name in names},'memberEndWrenchesKN_KNmm':member_wrenches,
            'supportWrenches':{name:[float(residual[indices[name]+axis]) if indices[name]+axis in fixed else 0. for axis in range(6)] for name in names if any((name,axis) in frame.fixed for axis in range(6))},
            'springs':springs,'iterations':iteration+1,'maximumFreeResidualKNOrKNmm':maximum,'numericalBackend':'scipy-sparse-block-assembly/splu; unchanged physicalframe matrices and zero-gap unilateral laws'}
    raise ValueError('Verticalfloor sourceunilateral law failed to converge in40iterations')


def runtime_versions():
    import platform
    import numpy
    import scipy
    return {'python':platform.python_version(),'numpy':numpy.__version__,'scipy':scipy.__version__,'dependencyLock':'project/str/studies/vertical-floor-requirements.txt'}
