"""Source-bound owner comparison of five actual joined pressure controls."""
import hashlib
import json
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt

from masonry_frame_a import load_masonry_frame_a_source

ROOT=Path(__file__).resolve().parents[3]
D=Path(__file__).resolve().parent


def draw(proof_path,output):
    data=json.loads(proof_path.read_text());source=load_masonry_frame_a_source(ROOT)
    if data['sourceSHA256']!=source['identities'] or len(data['cases'])!=5:raise ValueError('Exact current-source five-control pressure evidence required')
    producer=D/'roof_surface_pressure_proof.py'
    if data['methodSHA256']!=hashlib.sha256(producer.read_bytes()).hexdigest():raise ValueError('Stale pressure proof producer')
    names=['default-null','uniform-suction','half-roof-suction-court-W79','positive-PLAN-pressure','suction-zero-physical-G']
    if [r['controlName'] for r in data['cases']]!=names:raise ValueError('Expected all five actual pressure controls in explicit order')
    proof_hash=hashlib.sha256(proof_path.read_bytes()).hexdigest()
    descriptions=['No roof surface pressure','Uniform suction','Half-origin suction','Downward pressure','Uniform suction']
    labels=[]
    for description,row in zip(descriptions,data['cases']):
        factor=row['executedRequest']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
        labels.append(f'{description} | W{row["roofCoupling"]["windIndex"]} | {factor:g}G')
    tension=[-r['minimumHeadVerticalKN'] for r in data['cases']]
    movement=[r['roofCoupling']['maximumRingTranslationMm'] for r in data['cases']]
    colors=['#718d89','#ac6f56','#8d858c','#6c8ca3','#a2473e']
    plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'svg.fonttype':'none','svg.hashsalt':proof_hash})
    fig,(left,right)=plt.subplots(1,2,figsize=(12.5,6.1),gridspec_kw={'width_ratios':[1.5,1]})
    fig.patch.set_facecolor('#faf8f2')
    for ax,values,limit in ((left,tension,260),(right,movement,35)):
        ax.set_facecolor('#faf8f2');ax.barh(range(5),values,color=colors,height=.57)
        ax.invert_yaxis();ax.set_xlim(0,limit);ax.grid(axis='x',color='#ddd9cf',linewidth=.6);ax.set_axisbelow(True)
        for i,value in enumerate(values):ax.text(value+limit*.015,i,f'{value:.2f}',va='center',color='#263d43',fontsize=10)
        for side in ('top','right','left'):ax.spines[side].set_visible(False)
        ax.spines['bottom'].set_color('#aaa69d');ax.tick_params(axis='y',length=0)
    left.set_yticks(range(5),labels);right.set_yticks(range(5),['']*5)
    left.set_xlabel('Tension at the most uplifted ideal head (kN)')
    right.set_xlabel('Maximum roof-ring translation (mm)')
    fig.suptitle('ROOF PRESSURE / ONE RC200 FRAME / 52 HEADS',x=.04,y=.97,ha='left',fontsize=16,color='#263d43')
    fig.text(.04,.90,'Five separately solved mechanical controls; inherited roof geometry and receiving laws remain unselected.',fontsize=10,color='#263d43')
    fig.text(.04,.16,'Uniform suction: −2.25 kPa × 144.15 m² = −324.3375 kN. Half-origin control: −162.16875 kN.',fontsize=9,color='#263d43')
    fig.text(.04,.12,'Downward control: +1.5 kPa = +216.225 kN. Facade programme and physical-G factor are explicit in each row.',fontsize=9,color='#263d43')
    post=data['cases'][-1]['straightFrameCage']['worstSectionScreen']['linearUniaxialRatio']
    fig.text(.04,.075,f'Unresolved: adverse post screen {post:.3f} > 1; H12 floor moment screen exceeded; ground resistance and roof fixings unqualified.',fontsize=9,color='#a2473e')
    fig.text(.04,.03,f'Actual source inventory: {len(source["identities"])} files. Pressure proof SHA256 {proof_hash[:24]}…',fontsize=8,color='#65736d')
    fig.subplots_adjust(left=.33,right=.95,top=.83,bottom=.27,wspace=.23)
    metadata={'Date':None,'Title':'Actual joined roof pressure comparison',
        'Description':json.dumps({'proofSHA256':proof_hash,'sourceSHA256':source['identities'],
            'viewMethodSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'candidateAccepted':False,'siteWindQualified':False,'siteSnowQualified':False},sort_keys=True)}
    fig.savefig(output,format='svg',metadata=metadata);plt.close(fig)


if __name__=='__main__':draw(D/'roof-surface-pressure-proof.json',D/'roof-surface-pressure.svg')
