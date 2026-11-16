import { readFileSync, writeFileSync } from 'node:fs';
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js';
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js';
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js';

const check = process.argv.includes('--check');
const location = file => new URL(file, import.meta.url);
const { study } = JSON.parse(readFileSync(location('workable-study-floor.json')));
const compiler = prepareCurrentDesignCompile(readGeorgianDesignSnapshot());
const common = { schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300 };
const [oak, stone] = await Promise.all([
  compiler.studyRoomKit({ ...common, wearingFace: 'oak' }),
  compiler.studyRoomKit({ ...common, wearingFace: 'stone-steel' }),
]);
if (JSON.stringify(oak.kit.bands) !== JSON.stringify(study.bands)
    || JSON.stringify(oak.kit.occupied) !== JSON.stringify(study.occupied)) {
  throw new Error('Furnished Study comparison disagrees with its admitted room source');
}

const [x0, y0, x1] = study.bands[0];
const ceiling = 3100;
const line = (a, b, colour, width = 1) => `<path d="M${a.join(',')} L${b.join(',')}" stroke="${colour}" stroke-width="${width}" fill="none"/>`;
const label = (x, y, value, name = 'note') => `<text x="${x}" y="${y}" class="${name}">${value}</text>`;
const shape = (points, fill, stroke = '#554838', width = 1) => `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const toString = value => Number(value.toFixed(2));

function view(mode) {
  const solid = mode === 'fixed';
  const ceramic = mode === 'ceramic';
  const p = (x, y, z = 0) => [
    toString(178 + (x - x0) * .116 - (y - y0) * .045),
    toString(514 + (x - x0) * .033 + (y - y0) * .066 - z * .13),
  ];
  const floor = ([xl, yl, xr, yr], fill, stroke = '#766045') => shape([p(xl, yl), p(xr, yl), p(xr, yr), p(xl, yr)], fill, stroke, .72);
  const face = (axis, a, b, low, high, fill, stroke) => {
    const f = axis === 'south' ? (s, z) => p(s, y0, z) : (s, z) => p(x0, s, z);
    return shape([f(a, low), f(b, low), f(b, high), f(a, high)], fill, stroke);
  };
  const panel = ceramic ? '#afa58c' : '#a57a56';
  const inset = ceramic ? '#d7c9a5' : '#b78a60';
  const cream = '#e9dfcc';
  const floorTint = ceramic ? ['#a8a49a', '#d3c7ae'] : ['#a17c53', '#b79363', '#aa8558', '#c29f71'];
  const { parts } = (ceramic ? stone : oak).kit.floor;
  const solidFloor = study.bands.flatMap(([a,b,c,d]) => {
    if (!solid) return [floor([a,b,c,d],floorTint[0])];
    return Array.from({length: Math.ceil((c - a) / 104)}, (_, i) => {
      const left = a + i*104;
      return floor([left,b,Math.min(c,left+104),d],floorTint[i%floorTint.length]);
    });
  }).join('');
  const trayFloor = solid ? '' : parts.map(({ face, band }, index) =>
    floor(face, floorTint[(index + band) % floorTint.length])
  ).join('');
  const faceData = (axis, start, end) => {
    const windows = study.windows.filter(item => item.wall === 'outer-' + axis);
    const edges = windows.flatMap(({ centre, width }) => [centre - width / 2, centre + width / 2]);
    return { axis, end, windows, origins: [start, 1120, ...edges, end] };
  };
  const surfaces = [faceData('south', x0, x1), faceData('west', y0, study.bands.at(-1)[3])];
  const wall = surfaces.map(({axis,end,windows,origins})=>{
    const start = axis === 'south' ? x0 : y0;
    const f = axis === 'south' ? (s,z)=>p(s,y0,z) : (s,z)=>p(x0,s,z);
    const piece = (a,b,l,h,fill,stroke) => face(axis,a,b,l,h,fill,stroke);
    const panelFrames = origins.slice(0,-1).flatMap((a,i)=>{
      const b=origins[i+1], span=b-a;
      if (span < 180) return [];
      const zones = solid ? [[195,886]] : [[195,886],[925,2730]];
      return zones.map(([z1,z2])=>piece(a+35,b-35,z1,z2,inset,'#75563e')+piece(a+48,b-48,z1+16,z2-16,inset,ceramic?'#7c7867':'#9b6e49')).join('');
    }).join('');
    const arches = windows.map(({centre,width,sill,spring,head})=>{
      const a = centre-width/2, b=centre+width/2, rise=head-spring;
      const radius=width**2/(8*rise)+rise/2;
      const arc=Array.from({length:21},(_,i)=>{
        const x=a+width*i/20;
        return f(x,spring+Math.sqrt(radius**2-(x-centre)**2)-(radius-rise));
      });
      const jambs=shape([f(a,sill), ...arc, f(b,sill)], '#b9c6bf', '#f3e5c8', 5);
      const verticalBars = [a + width / 3, a + 2 * width / 3].map(x => {
        const stop = spring + Math.sqrt(radius ** 2 - (x - centre) ** 2) - (radius - rise) - 10;
        return line(f(x, sill), f(x, stop), '#637470', 1.6);
      });
      const bars = [...verticalBars, ...[1350, 1950].map(z => line(f(a, z), f(b, z), '#637470', 1.4))].join('');
      return jambs+bars+line(f(a-28,sill-14),f(b+28,sill-14),'#6c563d',2.4);
    }).join('');
    return piece(start,end,0,ceiling,solid?cream:panel,'#594a3a')+(solid?piece(start,end,150,910,panel,'#75563e'):'')
      +panelFrames+piece(start,end,0,145,'#775737','#553b29')
      +piece(start,end,895,922,'#997044','#6e5235')+piece(start,end,2970,3100,cream,'#947650')
      +line(f(start,2992),f(end,2992),'#997853',2)+line(f(start,3039),f(end,3039),'#c0aa86',1)+arches;
  }).join('');
  const [dx1,dy1,dx2,dy2] = study.occupied.find(([id])=>id==='study-desk')[1];
  const [cx1,cy1,cx2,cy2] = study.occupied.find(([id])=>id==='study-chair')[1];
  const [ex1,ey1,ex2,ey2] = study.occupied.find(([id])=>id==='service-emitter-study-W')[1];
  const furniture = [
    shape([p(ex2,ey1,115),p(ex2,ey2,115),p(ex2,ey2,710),p(ex2,ey1,710)], '#938d72', '#4f4a3f'),
    ...Array.from({length:12},(_,i)=>line(p(ex2,ey1+70+i*90,148),p(ex2,ey1+70+i*90,677),'#69634f',1.6)),
    ...[[dx1+80,dy1+68],[dx2-70,dy1+68],[dx1+80,dy2-70],[dx2-70,dy2-70]].map(([x,y])=>line(p(x,y,10),p(x,y,730),'#553e2b',7)),
    shape([p(dx1,dy1,730),p(dx2,dy1,730),p(dx2,dy2,730),p(dx1,dy2,730)], '#77553c','#4f3829',2),
    shape([p(dx1,dy2,685),p(dx2,dy2,685),p(dx2,dy2,730),p(dx1,dy2,730)], '#654932','#4f3829',1),
    ...[[cx1+185,cy1+110],[cx2-185,cy1+110],[cx1+185,cy2-155],[cx2-185,cy2-155]].map(([x,y])=>line(p(x,y,10),p(x,y,454),'#593f30',5)),
    shape([p(cx1+185,cy1+110,454),p(cx2-185,cy1+110,454),p(cx2-185,cy2-155,454),p(cx1+185,cy2-155,454)], '#737b5a','#544b37',2),
    shape([p(cx1+185,cy2-155,500),p(cx2-185,cy2-155,500),p(cx2-185,cy2-155,887),p(cx1+185,cy2-155,887)], '#6e7654','#444734',1.4),
  ].join('');
  return solidFloor+trayFloor+wall+furniture;
}

const svg = (width, height, title, description, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">${description}</desc><style>.heading{font:34px Georgia;fill:#352b23}.name{font:22px Georgia;fill:#352b23}.note{font:15px Arial;fill:#514b3f}</style><rect width="${width}" height="${height}" fill="#f1ecdf"/>${content}</svg>\n`;

const comparison = svg(1440, 895, 'Three furnished Study finish proposals', 'Matched Study cutaway views. The datum, opening dimensions and furniture footprints are from the current occupied Study.',
  label(36,51,'The Study · fixed joinery and removable finishes','heading')+
  label(36,80,'Matched geometry and furniture · finish and colour trials')+
  label(35,116,'Fixed joinery and strip floor','name')+
  label(745,116,'Hung timber and seated oak','name')+
  `<g transform="translate(6,50) scale(.95)">${view('fixed')}</g>`+
  `<g transform="translate(722,50) scale(.95)">${view('timber')}</g>`+
  label(35,853,'Keep the framed opening, deep skirt and cornice in both versions.')+
  label(745,853,'300 mm floor modules with seams set into the finish pattern.')
);
const tile = svg(790, 903, 'Study tile-faced comparison','Ceramic finish trial on the geometry used in the fixed and timber studies.',
  label(35,48,'The Study · framed tile fields','heading')+
  label(35,78,'Matched view · alternating warm-grey and limestone floor tones')+
  `<g transform="translate(25,15)">${view('ceramic')}</g>`+
  label(35,861,'Grout stays within each tray. Keep a dry joint at every release edge.')
);
const junctions = `<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-labelledby="title desc">
<title id="title">Crafted Study trial junctions at 1:5 and 1:2</title>
<desc id="desc">Dimensioned trial sections for two individually seated floor modules, a cornice pocket and a removable wall panel above skirting, plus a separate dry to wet transition. All dimensions are millimetres.</desc>
<style>
.title{font:8px Georgia;fill:#302a24}.head{font:5.3px Georgia;fill:#302a24}.note{font:3.35px Arial;fill:#40382e}.dim{font:3.75px Arial;fill:#40382e}.rule{stroke:#6e6253;stroke-width:.35;fill:none}.wood{fill:#b08962;stroke:#5d4935;stroke-width:.45}.mineral{fill:#ded9cc;stroke:#756d5b;stroke-width:.4}.steel{fill:#6f8286;stroke:#38464a;stroke-width:.36}.brass{fill:#b79a60;stroke:#695733;stroke-width:.36}.water{fill:none;stroke:#3d777f;stroke-width:.7;stroke-dasharray:3 1.5}
</style>
<rect width="420" height="297" fill="#f8f4eb"/>
<text x="13" y="17" class="title">Crafted Study · gravity and release</text>
<text x="13" y="26" class="note">Trial components in millimetres. Print at actual A3 size for the stated scales.</text>
<path class="rule" d="M13 33H407 M208 37V264 M13 151H407 M13 269H407"/>

<text x="13" y="46" class="head">Seated floor over a continuous deck · 1:5</text>
<path class="rule" d="M33 72V82 M93 72V82 M153 72V82 M33 76H153 M32 77l2 -2 M92 77l2 -2 M152 77l2 -2"/>
<text x="58" y="73" class="dim">300</text><text x="118" y="73" class="dim">300</text>
<rect x="33.3" y="91" width="59.4" height="3.6" class="wood"/>
<rect x="93.3" y="91" width="59.4" height="3.6" class="wood"/>
<rect x="33" y="95" width="120" height="14" class="mineral"/>
<path class="rule" d="M93 90V83H120 M32 91H25 M32 95H25 M27 91V95"/>
<text x="124" y="84" class="dim">3 dry joint</text>
<text x="17" y="99" class="dim">20</text><text x="45" y="116" class="note">Permanent deck. Retain the independent support below.</text>
<text x="13" y="126" class="note">18 timber + 2 bedding territory. Keep support under each free edge.</text>
<text x="13" y="135" class="note">Mark intentional key points in brass only where needed.</text>

<text x="220" y="46" class="head">Local top release · 1:2</text>
<rect x="233" y="62" width="15" height="72" class="mineral"/>
<rect x="248" y="73" width="13" height="7" class="wood"/>
<rect x="251.5" y="95" width="9" height="33" class="wood"/>
<path d="M248 111h3.5v-7h3.5v12h-7Z" class="steel"/>
<path d="M251.5 96h9v2.6h-9Z" class="brass"/>
<path class="rule" d="M263 80H279 M263 95H279 M277 80V95 M276 81l2 -2 M276 96l2 -2 M267 102V86 m-1.5 2 1.5 -2 1.5 2 M261 75H282"/>
<text x="280" y="89" class="dim">30 pocket nominal</text>
<text x="284" y="76" class="note">Individual removable cornice fillet</text>
<text x="275" y="103" class="note">Remove the accessible anti-lift stop,</text>
<text x="275" y="110" class="note">lift clear of the rail and draw towards the room.</text>
<text x="275" y="122" class="note">18 timber face with 7 hook and 2 fit reservation.</text>
<text x="275" y="130" class="note">Keep the permanent protective backing in service.</text>

<text x="13" y="164" class="head">Skirting and independent service · 1:5</text>
<rect class="mineral" x="40" y="174" width="16" height="45"/>
<rect class="wood" x="57.8" y="174" width="3.6" height="15"/>
<rect class="wood" x="68" y="190" width="3.6" height="30"/>
<rect class="mineral" x="40" y="220" width="126" height="16"/>
<rect class="wood" x="72" y="216.4" width="94" height="3.6"/>
<circle cx="63.2" cy="206" r="2.9" class="steel"/>
<path class="rule" d="M56 206H60.3 M71.6 196H94 M62 211H94 M75 215V203 m-2 2 2 -2 2 2"/>
<text x="97" y="197" class="note">150 high removable skirt</text>
<text x="97" y="212" class="note">Supported service stays on its own carrier.</text>
<text x="13" y="248" class="note">Route and release capacity require case-specific clearances.</text>
<text x="13" y="257" class="note">Keep the native face in the narrow east maintenance neck.</text>

<text x="220" y="164" class="head">Dry tile tray beside fixed wet edge · 1:2</text>
<rect class="mineral" x="230" y="224" width="153" height="18"/>
<rect class="steel" x="230" y="222.5" width="64" height="1.5"/>
<rect class="wood" x="230" y="216.5" width="64" height="6"/>
<rect class="brass" x="294" y="217" width="2" height="7"/>
<path class="steel" d="M296 213h6v11h-6Z"/>
<path class="mineral" d="M302 217.5L383 219.5V224H302Z"/>
<path class="water" d="M302 216V222L383 224"/>
<path class="rule" d="M296 211V197H312 M347 217L360 202H389 M236 217V201H261"/>
<text x="233" y="196" class="note">12 face + 3 tray</text>
<text x="314" y="199" class="note">Independent threshold</text>
<text x="364" y="199" class="note">Fall to wet side</text>
<text x="220" y="250" class="note">Grout stays within each dry tray. The wet floor and water boundary stay in place.</text>
<text x="220" y="258" class="note">Qualify the actual bedding, movement and cleanability before adoption.</text>

<text x="13" y="281" class="note">Detail references: current occupied Study floor and wall reservation. Hardware profiles and threshold are comparative proposals.</text>
</svg>
`;

const drawings = [
  ['crafted-study-comparison.svg', comparison],
  ['crafted-study-tile.svg', tile],
  ['crafted-study-junctions.svg', junctions],
  ['crafted-study-plan.svg', renderDrawingSceneV2Svg(oak.plan)],
  ['crafted-study-south-stock.svg', renderDrawingSceneV2Svg(oak.wallElevation)],
  ['crafted-study-kit-schedule.json', JSON.stringify({
    oak: oak.kit,
    stone: {
      source: stone.kit.source,
      request: stone.kit.request,
      caseDigest: stone.kit.caseDigest,
      floorDepth: [stone.kit.floor.wearingFaceMm, stone.kit.floor.beddingMm, stone.kit.floor.depthUnassignedWithinFinishMm],
      wearFaceKgById: Object.fromEntries(stone.kit.floor.parts.map(part => [part.id, part.wearFaceKg])),
    },
  }, null, 2) + '\n'],
];
for (const [name, content] of drawings) {
  const dest = location(name);
  if (check) {
    if (readFileSync(dest,'utf8') !== content) throw new Error('Stale drawing ' + name);
  } else {
    writeFileSync(dest,content);
  }
}
