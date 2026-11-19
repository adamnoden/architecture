"""Nominal exposed SW head arm, including its finite vertical riser.
N, mm, Nmm. The selected 316L frame comparison uses E180GPa and165MPa
proof at100C with a1.1 resistance divisor, as supplied by the owning gate.
"""
from pathlib import Path
import json
import math
import sys

B,H,L,h,E,density=60.,100.,582.5,260.,180000.,8000.
G=E/(2*(1+.3))
pipe_dry=math.pi/4*(.154**2-.150**2)*8.4*8940
pipe_water=math.pi/4*.150**2*8.4*1000
P=(1.35*(75+pipe_dry)+1.5*(40+pipe_water))*9.81
sections=[]
for t in (6.,8.):
    A=B*H-(B-2*t)*(H-2*t)
    I=(B*H**3-(B-2*t)*(H-2*t)**3)/12
    minor=(H*B**3-(H-2*t)*(B-2*t)**3)/12
    J=4*((B-t)*(H-t))**2/(2*(B-t+H-t)/t)
    W,Wminor=I/(H/2),minor/(B/2)
    cases=[]
    for label,wind in [('top1.5m',2.25*.25*1.5*1000),('full8.4m adverse comparison',2.25*.25*8.4*1000)]:
        # Both signs of wind on both axes are bounded by the adverse signs.
        normal_arm=P*L/W+wind*L/Wminor+wind/A
        shear_arm=P/(2*t*(H-2*t))+wind/(2*t*(B-2*t))
        normal_root=P/A+(P*L+wind*h)/W+wind*h/Wminor
        shear_root=wind*L/(2*(B-t)*(H-t)*t)+wind/(2*t*(H-2*t))+wind/(2*t*(B-2*t))
        # Castigliano derivatives of the two-member bending, twist and axial energies.
        vertical=P*L**3/(3*E*I)+P*L**2*h/(E*I)+wind*L*h*h/(2*E*I)+P*h/(E*A)
        normal=wind*L/(E*A)+P*L*h*h/(2*E*I)+wind*h**3/(3*E*I)
        along=wind*L**3/(3*E*minor)+wind*h**3/(3*E*minor)+wind*L*L*h/(G*J)
        cases.append({'case':label,'horizontalForceEachAxisKN':wind/1000,'rootAddedWindMomentKNm':wind*h/1e6,
                      'armCombinedMPa':math.hypot(normal_arm,math.sqrt(3)*shear_arm),
                      'riserCombinedMPa':math.hypot(normal_root,math.sqrt(3)*shear_root),
                      'verticalTipMM':vertical,'normalTipMM':normal,'alongTipMM':along})
    sections.append({'sectionMM':[B,H,t],'grossTwoMemberKg':A*(L+h)*density/1e9,'Amm2':A,
                     'IstrongMM4':I,'IminorMM4':minor,'Jmm4':J,'cases':cases})
output={'armLengthMM':L,'riserHeightMM':h,'factoredHeadPipeDownKN':P/1000,'E_MPa':E,'G_MPa':G,
        'densityKgPerM3':density,'proofStressAt100C_MPa':165,'comparisonResistanceMPa':165/1.1,
        'sections':sections,'selectedWallMM':8,
        'scope':'Linear centroidal nominal-section comparison. Positive root and elbow moment joints, full-depth load introduction, finite pipe restraints, fabrication and actual material/temperature receipt remain required.'}
assert max(row['riserCombinedMPa'] for row in sections[0]['cases'])>150
assert max(max(row['riserCombinedMPa'],row['armCombinedMPa']) for row in sections[1]['cases'])<150
if __name__ == '__main__':
    target = Path(__file__).with_suffix('.json')
    contents = json.dumps(output,indent=2)+'\n'
    if '--check' in sys.argv:
        assert target.read_text() == contents, 'Rebuild the inner head arm comparison'
    else:
        target.write_text(contents)
    print(contents)
