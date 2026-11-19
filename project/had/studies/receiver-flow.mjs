import {capacity} from '../../rwt/studies/short-inlet-review.mjs';
const g=9.81;
const approach=200, west=5700, end=7350, knee=6850;
const yr=[6625+5,end-5], duty=3.60375, quiet=-35;
const grade=(y,split)=>y<split?-30-.05*(y-5750):-96+(7400-y)*(66-.05*(split-5750))/(7400-split);
function cross(z,a,b,split,floorAt,f){
  const cuts=[a,...(split>a&&split<b?[split]:[]),b];
  let A=0,T=0,P=Math.max(0,z-floorAt(b))+Math.max(0,z-floorAt(a));
  for(let i=1;i<cuts.length;i++){
    const width=(cuts[i]-cuts[i-1])/1000,low=floorAt(cuts[i]),s=(floorAt(cuts[i-1])-low)/width;
    const w=Math.max(0,Math.min(width,(z-low)/s));
    T+=f*w;A+=f*w*(z-low-s*w/2);P+=Math.hypot(f*w,s*w);
  }
  return {A,T,P};
}
function cases(split,counted=216,N=128){
  const floorAt=y=>(split===6625?(y<6625?-30-(y-5750)*42.75/875:-96+.03*(7400-y)):grade(y,split))/1000;
  const xRows=Math.floor(counted/12),yRows=Math.floor(((yr[1]-yr[0])*.75-2*20)/12);
  const area=xRows*yRows*Math.PI*.0045**2*.75;
  const extraHead=q=>(q/(.60*area))**2/(2*g);
  const opts={floorAt,extraHead,sectionAt:(z,a,b,f)=>cross(z,a,b,split,floorAt,f)};
  const q=(z,L)=>capacity([yr],z,0,'deepestTotalQuarter',L,N,opts);
  const length=approach+counted;
  return {split,floor:floorAt(split)*1000,yr,length,counted,xRows,yRows,area,atDutyGrateLoss:extraHead(duty/1000)*1000,
    adverse:q(quiet-5,length),next1:q(quiet-6,length),next2:q(quiet-7,length)};
}
export function entry(){
  return {active:[west,6625,0,end-6625],width:216,oldGrade:cases(6625),selected:cases(knee),narrow:cases(knee,120),converged:cases(knee,216,256)};
}

// Elevations and dimensions are mm. Each retained site is assigned the entire flow.
const vh=v=>1000*v*v/(2*g);
const crestHead=(q,w)=>2000*((q/w)**2/g)**(1/3);
export function responses(h,low,high,site){
  const roundID=150,closedGross=200,lineLengths={N:12,E:3};
  const openArea=.75*Math.PI*(roundID/2000)**2,roughDh=.75*roundID/1000;
  // Split the 20 mm setout reserve equally between the old opening top and downstream water.
  const top=h.basket.top, raisedTail=site, metal=1.5, clearHeight=32;
  const toe=(top-metal-clearHeight+raisedTail)/2;
  return {low,high,openArea,roundID,closedGross,lineLengths,terminal:{location:[7580,6975,toe],clear:[350,clearHeight],oldUpper:top,raisedEast:raisedTail,
      pairedUpper:top-toe-clearHeight-metal-10,pairedAir:toe-raisedTail-10,sideAfterSetout:Math.min(6975-350/2-6600,7200-6975-350/2)-10},
    rows:[h.incoming.duty,h.incoming.longBackup].map(q=>{
      const v=q/1000/openArea,H=vh(v);
      const screenArea=Math.floor(190/12)*Math.floor(110/12)*Math.PI*.0045**2;
      const quiet=4*vh(q/1000/(screenArea*.75)),halfScreen=4*vh(q/1000/(screenArea*.50));
      const neckV=q*1000/((250-10)*(85-10)*.75),neckK3=3*vh(neckV);
      const Nline=(14+.06*lineLengths.N/roughDh)*H,Nquiet=-650+Nline+10+neckK3,Nlevel=Nquiet+quiet;
      const Elevel=high+5+crestHead(q,(270-10)*.75);
      const terminalV=q*1000/((350-10)*(32-10)*.75);
      const Eline=(8+.06*lineLengths.E/roughDh)*H,Ejet=4*vh(terminalV);
      // Gross available head to the nozzle crown, high inclusion of a further two level errors.
      const remaining=high-(toe+clearHeight)-10-Eline-Ejet-neckK3;
      return {q,Nline,Nquiet,quiet,screenHoleCount:135,screenArea,halfScreen,impactWhenNClosed:Elevel+quiet,impactWithHalfScreen:Elevel+halfScreen,NfaultTailLevel:Nlevel,NnormalTailLevel:Nlevel-150,EcrestDryWithN:high-5-Nlevel,
        highELevel:Elevel,quietCourtFree:-35-Elevel,Eline,terminalV,Ejet,neckK3,remaining};
    })};
}
