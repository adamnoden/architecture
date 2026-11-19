// Three fixed terminal faces must open at the same time without shifting the
// tank. Screen one manufacturer-built demountable D1 group in the G½ case.
export function dischargeRelease(cylinder, safety) {
  const T=safety.directTopTP, E=safety.expansion, J=safety.manifold;
  const V=safety.tangent, D=safety.tundish, firstDraw=[-65,28,12];
  function dotOnLine(a,b){
    const dir=b.map((v,i)=>v-a[i]),length=Math.hypot(...dir);
    return dir.reduce((sum,v,i)=>sum+v/length*firstDraw[i],0);
  }
  // A P4355 15 x ½ connector spans 42 mm, 24 AF. Reserve a larger R20
  // body over its full 42 mm and R11 on the remaining T&P pipe.
  const span=Math.hypot(...J.map((v,i)=>v-T[i]));
  const endFitting=T.map((v,i)=>v+(J[i]-v)*42/span);
  function bound(a,b,r){
    const length=Math.hypot(...b.map((v,i)=>v-a[i]));
    const slices=96, moves=48;
    let minimum=Infinity;
    for(let i=0;i<=slices;i++)for(let j=0;j<=moves;j++){
      const [x,y,z]=a.map((v,k)=>v+(b[k]-v)*i/slices+firstDraw[k]*j/moves);
      const radial=Math.hypot(x-cylinder.centre[0],y-cylinder.centre[1])-cylinder.body[2]/2;
      minimum=Math.min(minimum,Math.hypot(Math.max(0,radial),Math.max(0,z-cylinder.height))-r);
    }
    // Distance is 1-Lipschitz. Bound all intermediate positions from the
    // nearest grid point on the two independent segment/translation axes.
    return minimum-length/(2*slices)-Math.hypot(...firstDraw)/(2*moves);
  }
  return {firstDraw,faceOpeningMM:[dotOnLine(T,J),dotOnLine(E,J),firstDraw[2]],
    maxEngagementMM:0, // a protruding spigot is outside the diagonal release.
    jacketClearanceLowerMM:{topUnion:bound(T,endFitting,20),topTube:bound(endFitting,J,11),
      expansionLeg:bound(E,J,20),commonLeg:bound(J,V,20),verticalLeg:bound(V,D,20)},
    upperJoinSpanMM:span,comparisonConnectorLengthMM:42,comparisonSpannerAF:24,
    qualification:'Factory-approved common manifold, actual bore and port direction; all captive nuts fully backed clear, no residual pilot, seals retained. Prove both spanners, independently supported lift, qualified removable group and open gravity discharge.'};
}
