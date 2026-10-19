import * as THREE from 'three';
import { V3, PI, rand, GRAD, T, noOL, M, cyl, sph, box, cvTex } from './util.js';
import { CHM } from './data.js';

export const faceCache={};
export function faceTex(id,L){if(faceCache[id])return faceCache[id];return faceCache[id]=cvTex(512,256,(g)=>{
  const cx=128,ey=136;g.fillStyle=L.skin;g.fillRect(0,0,512,256);
  const ell=(x,y,rx,ry)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
  g.fillStyle='rgba(255,110,110,.32)';ell(cx-42,164,15,8);ell(cx+42,164,15,8);
  if(L.soot){g.fillStyle='rgba(40,30,30,.45)';ell(cx-46,170,12,7);ell(cx+30,182,10,6);}
  if(L.stubble){g.fillStyle='rgba(40,30,25,.28)';ell(cx,178,40,22);}
  if(L.mask){g.fillStyle='#24242c';g.fillRect(cx-80,150,160,70);}
  for(const s of [-1,1]){const x=cx+s*27;
    if(L.patch&&s===1){g.fillStyle='#141414';ell(x,ey,17,15);continue;}
    g.fillStyle='#fff';ell(x,ey,12.5,16);
    g.fillStyle=L.glow?'#ffcf3a':(L.fem?'#3a6fb8':'#2a1a10');ell(x-s*1,ey+3,8.5,10.5);
    g.fillStyle='#120a06';ell(x-s*1,ey+4,4.5,5.5);g.fillStyle='#fff';ell(x+3,ey-4,3.2,3.6);
    g.strokeStyle=L.bald?'#5a3a1e':(L.hair||'#3a2414');g.lineWidth=6;g.lineCap='round';g.beginPath();
    const tilt=L.brave?6:0;g.moveTo(x+s*13,ey-25);g.lineTo(x-s*11,ey-22+tilt);g.stroke();
    if(L.fem){g.strokeStyle='#1a120c';g.lineWidth=3;g.beginPath();g.moveTo(x+s*11,ey-10);g.lineTo(x+s*17,ey-15);g.stroke();}
    if(L.mono&&s===1){g.strokeStyle='#d9a441';g.lineWidth=4;g.beginPath();g.arc(x,ey+1,18,0,7);g.stroke();g.beginPath();g.moveTo(x+16,ey+8);g.lineTo(x+30,ey+40);g.stroke();}
  }
  if(L.patch){g.strokeStyle='#141414';g.lineWidth=5;g.beginPath();g.moveTo(cx-40,ey-34);g.lineTo(cx+70,ey+6);g.stroke();}
  g.fillStyle='rgba(160,80,50,.35)';ell(cx,156,6,4.5);
  if(!L.mask){
    if(L.must){g.fillStyle=L.must;g.beginPath();g.ellipse(cx-11,166,13,5.5,.25,0,7);g.ellipse(cx+11,166,13,5.5,-.25,0,7);g.fill();}
    g.strokeStyle='#6a2a1a';g.lineWidth=4.5;g.lineCap='round';g.beginPath();
    if(L.brave){g.moveTo(cx-10,176);g.quadraticCurveTo(cx,182,cx+12,173);}else{g.arc(cx,166,12,.2*PI,.8*PI);}g.stroke();
    if(L.fem){g.fillStyle='rgba(210,70,90,.55)';ell(cx,177,6,2.5);}
  }
});}

/* ================= CHARACTER ================= */
export function throwItem(w){const g=new THREE.Group();
  if(w==='bottle'){M(cyl(.06,.07,.16,10),T('#3f8a3a'),g);M(cyl(.025,.03,.08,8),T('#3f8a3a'),g,0,.12,0);M(cyl(.03,.02,.06,6),T('#e8e0c8'),g,0,.18,0);g.userData.spark=M(sph(.035,6,5),noOL(T('#ffb030',{emissive:'#ff7a00'})),g,0,.23,0);}
  else if(w==='dynamite'){for(const x of [-.035,0,.035])M(cyl(.03,.03,.2,8),T('#d8352a'),g,x,0,0);M(cyl(.075,.075,.03,10),T('#3a2414'),g);M(cyl(.008,.008,.08,4),T('#c9a46a'),g,0,.13,0);g.userData.spark=M(sph(.03,6,5),noOL(T('#ffd34a',{emissive:'#ff9a00'})),g,0,.18,0);}
  else if(w==='grenade'){M(sph(.085,12,10),T('#3a3e46'),g);M(cyl(.03,.03,.04,8),T('#c9973a'),g,0,.09,0);g.userData.spark=M(sph(.028,6,5),noOL(T('#ffd34a',{emissive:'#ff9a00'})),g,0,.14,0);}
  else if(w==='potion'){M(sph(.08,12,10),noOL(T('#5cf0b0',{emissive:'#1a8a5a'})),g);M(cyl(.025,.03,.08,8),T('#bfe6ee'),g,0,.09,0);M(cyl(.03,.03,.03,8),T('#8a5a2b'),g,0,.14,0);g.userData.spark=M(sph(.025,6,5),noOL(T('#b0ffe0',{emissive:'#3aff9a'})),g,0,.18,0);}
  else{M(sph(.1,14,10),T('#1e1e22'),g);g.userData.spark=M(sph(.03,6,5),noOL(T('#ffd34a',{emissive:'#ff9a00'})),g,0,.13,0);}
  return g;}
export const CANNON_METAL={cannon:'#2c2f37',cannonGold:'#e8b632',cannonSkull:'#2b2228',cannonBrass:'#c9973a'};
export function weapon3P(g,aL,aR,w){
  const iron=T('#2c2f37'),gold=T('#f0c040');
  if(w.startsWith('cannon')){const c=new THREE.Group();c.position.set(.06,0,.4);c.scale.setScalar(w==='cannon'?1:1.12);g.add(c);
    M(box(.26,.1,.46),T(w==='cannonGold'?'#5a2a18':'#7a4a24'),c,0,.13,0);
    for(const s of [-1,1])for(const z of [-.15,.15])M(cyl(.085,.085,.05,12),T('#5a3418'),c,s*.15,.085,z).rotation.z=PI/2;
    const br=M(cyl(.065,.1,.6,14),T(CANNON_METAL[w]),c,0,.27,.06);br.rotation.x=PI/2-.28;
    M(cyl(.088,.088,.05,14),w==='cannon'?T('#555a66'):gold,c,0,.335,.33).rotation.x=PI/2-.28;
    if(w==='cannonSkull'){M(sph(.075,12,10),T('#f2efe6'),c,0,.33,-.2);for(const s of [-1,1])M(sph(.02,6,5),T('#111'),c,s*.025,.34,-.13);}
    if(w==='cannonGold')M(new THREE.TorusGeometry(.06,.015,6,14),gold,c,.105,.24,0).rotation.y=PI/2;
    aL.rotation.x=-.5;aR.rotation.x=-.5;return;}
  if(['musket','rifle','darkRifle','harpoon'].includes(w)){const mu=new THREE.Group();mu.position.set(.07,.46,.17);mu.rotation.x=-.18;g.add(mu);
    M(box(.05,.07,.36),T(w==='darkRifle'?'#24242c':w==='rifle'?'#f2efe6':'#6a3c1c'),mu,0,-.02,-.08);
    const L2=w==='harpoon'?.6:.78,r=w==='harpoon'?.032:.018;const b=M(cyl(r,r,L2,8),T(w==='rifle'?'#2d5aa8':'#2c2f37'),mu,0,.02,.33-(.78-L2)/2);b.rotation.x=PI/2;
    if(w==='rifle'||w==='darkRifle'){M(cyl(.025,.025,.22,8),T('#1a1a1a'),mu,0,.075,.12).rotation.x=PI/2;M(cyl(.03,.03,.02,8),noOL(T(w==='rifle'?'#7ac8ff':'#c07aff',{emissive:w==='rifle'?'#2a5a8a':'#5a2a8a'})),mu,0,.075,.235).rotation.x=PI/2;}
    if(w==='harpoon'){M(new THREE.ConeGeometry(.045,.16,6),T('#c9ced8'),mu,0,.02,.66).rotation.x=PI/2;for(const s of [-1,1])M(box(.012,.012,.09),T('#c9ced8'),mu,s*.04,.02,.58).rotation.y=s*.6;M(new THREE.TorusGeometry(.06,.015,6,14),T('#c9a46a'),mu,.08,-.04,-.05).rotation.y=PI/2;}
    aR.rotation.x=-1.25;aR.rotation.z=.05;aL.rotation.x=-1.45;aL.rotation.z=-.5;return;}
  if(['bottle','dynamite','grenade','potion'].includes(w)){aR.rotation.x=1.9;aR.rotation.z=.25;const it=throwItem(w);it.position.set(0,-.34,0);aR.add(it);g.userData.spark=it.userData.spark;
    for(let i=0;i<3;i++){const s=throwItem(w);s.scale.setScalar(.6);s.position.set(-.12+i*.11,.3,.2);g.add(s);}return;}
  if(w==='crossbow'){aL.rotation.x=-1.45;aR.rotation.x=-1.3;const cb=new THREE.Group();cb.position.set(0,.44,.32);g.add(cb);M(box(.06,.06,.42),T('#6a3c1c'),cb);M(new THREE.TorusGeometry(.22,.018,6,16,PI),T('#4a4f5a'),cb,0,.02,.14).rotation.x=PI/2;M(box(.44,.006,.006),T('#eeeeee'),cb,0,.02,.14);M(cyl(.014,.014,.3,6),T('#8a5a2b'),cb,0,.05,.12).rotation.x=PI/2;
    M(box(.2,.22,.08),T('#5a3418'),g,0,.42,-.21);for(let i=0;i<4;i++)M(cyl(.01,.01,.2,5),T('#d8d8d8'),g,-.04+i*.03,.58,-.22);return;}
  if(w==='bow'||w==='longbow'){const big=w==='longbow';aL.rotation.x=-1.5;aL.rotation.z=-.15;aR.rotation.x=-1.2;aR.rotation.z=.35;
    const bw=new THREE.Group();bw.position.set(-.12,.47,.36);g.add(bw);const ti=new THREE.Group();ti.rotation.y=-PI/2;bw.add(ti);const R=big?.42:.32;M(new THREE.TorusGeometry(R,.02,6,22,PI),T(big?'#c9a46a':'#7a4a22'),ti).rotation.z=-PI/2;
    M(box(.006,R*1.95,.006),T('#f4f0e6'),bw);M(cyl(.012,.012,.6,6),T('#8a5a2b'),bw,.06,0,.12).rotation.x=PI/2;M(new THREE.ConeGeometry(.03,.07,6),iron,bw,.06,0,.43).rotation.x=PI/2;
    const q=M(cyl(.07,.06,.34,10),T('#7a4a24'),g,.1,.44,-.2);q.rotation.x=.35;for(let i=0;i<3;i++)M(new THREE.ConeGeometry(.025,.08,4),T(big?'#5fd84a':'#e8402f'),g,.07+i*.03,.65,-.27);return;}
  if(w==='blunder'){aL.rotation.x=-1.4;aL.rotation.z=-.4;aR.rotation.x=-1.2;const bl=new THREE.Group();bl.position.set(.06,.42,.2);g.add(bl);M(box(.06,.08,.3),T('#6a3c1c'),bl,0,-.02,-.05);M(cyl(.03,.028,.4,10),T('#b88a3a'),bl,0,.02,.28).rotation.x=PI/2;M(new THREE.CylinderGeometry(.075,.03,.1,12,1,true),T('#b88a3a',{side:THREE.DoubleSide}),bl,0,.02,.5).rotation.x=PI/2;return;}
  const goldP=w==='goldPistols';
  for(const [a,s] of [[aL,-1],[aR,1]]){a.rotation.x=-1.45;a.rotation.z=s*.12;M(box(.05,.09,.07),T(goldP?'#f2efe6':'#5a3418'),a,0,-.27,-.03);M(cyl(.024,.028,.22,8),goldP?gold:iron,a,0,-.37,.02);M(cyl(.034,.034,.04,8),goldP?T('#d6334a'):gold,a,0,-.47,.02);}
}
export function accessory(g,id,L,aL,aR){const gold=T('#f0c040');
  switch(id){
    case 'fin':{M(new THREE.TorusGeometry(.03,.008,6,12),gold,g,.25,.68,.03).rotation.y=PI/2;M(cyl(.09,.075,.12,12),T('#9aa3ad'),g,-.22,.06,-.14);break;}
    case 'tom':{M(cyl(.04,.045,.13,10),T('#3f8a3a'),g,-.17,.3,.12);M(cyl(.015,.018,.06,8),T('#3f8a3a'),g,-.17,.39,.12);M(box(.05,.04,.01),T('#f2efe6'),g,-.17,.3,.165);break;}
    case 'lu':{aL.userData.hand.visible=false;M(new THREE.TorusGeometry(.05,.012,6,12,PI*1.4),T('#c9ced8'),aL,0,-.3,0).rotation.y=PI/2;M(cyl(.03,.03,.06,8),T('#c9ced8'),aL,0,-.24,0);break;}
    case 'ray':{for(let i=0;i<3;i++)M(sph(.06-i*.012,8,6),T(L.hair),g,0,.7-i*.08,-.3-i*.02);M(box(.05,.46,.03),T('#2a1a10'),g,0,.38,.19).rotation.z=-.55;for(let i=0;i<4;i++)M(cyl(.012,.012,.04,6),gold,g,-.09+i*.06,.27+i*.07,.215);break;}
    case 'mago':{for(const s of [-1,1]){M(cyl(.065,.065,.06,12),T('#8a6a3a'),g,s*.085,.92,.19).rotation.x=PI/2-.4;M(cyl(.048,.048,.065,12),noOL(T('#7fd0ff',{emissive:'#2a6a8a'})),g,s*.085,.92,.19).rotation.x=PI/2-.4;}M(box(.22,.03,.02),T('#3a2414'),g,0,.92,.2);break;}
    case 'kid':{M(new THREE.TorusGeometry(.17,.045,8,16),T('#d23b30'),g,0,.53,0).rotation.x=PI/2;M(box(.06,.18,.04),T('#d23b30'),g,.08,.42,.17);break;}
    case 'bargo':{const p=new THREE.Group();p.position.set(.27,.6,.02);p.scale.setScalar(1.35);g.add(p);M(sph(.07,10,8),T('#e8302a'),p,0,.06,0).scale.set(1,1.3,1);M(sph(.055,10,8),T('#e8302a'),p,0,.17,.02);
      M(new THREE.ConeGeometry(.025,.06,6),T('#f2d24a'),p,0,.16,.08).rotation.x=PI/2+.4;M(box(.03,.1,.08),T('#2f6fd6'),p,.055,.05,-.01).rotation.z=-.2;M(box(.03,.07,.06),T('#f2d24a'),p,.06,0,-.01);
      M(new THREE.ConeGeometry(.025,.16,6),T('#2f6fd6'),p,0,-.07,-.05).rotation.x=PI-.4;for(const s of [-1,1])M(sph(.012,6,5),T('#ffffff'),p,s*.035,.19,.05);
      for(let i=0;i<2;i++)M(sph(.05-i*.01,8,6),T(L.beard),g,0,.42-i*.07,.17);M(new THREE.TorusGeometry(.13,.012,6,16),gold,g,0,.5,.07).rotation.x=PI/2-.3;break;}
    case 'isabel':{M(new THREE.CylinderGeometry(.22,.34,.5,16,1,true,PI*.62,PI*.76),T('#b8223a',{side:THREE.DoubleSide}),g,0,.3,0);break;}
    case 'hans':{M(box(.32,.16,.03),T('#2d5aa8'),g,0,.5,-.17).rotation.x=.25;M(box(.32,.02,.031),T('#ffffff'),g,0,.45,-.18).rotation.x=.25;M(new THREE.ConeGeometry(.05,.1,4),T('#d8352a'),g,0,.46,.19).rotation.x=PI;break;}
    case 'emma':{M(cyl(.03,.035,.2,10),T('#c9973a'),g,-.2,.3,.08).rotation.z=.3;M(cyl(.038,.038,.03,10),T('#3a2414'),g,-.17,.39,.08);break;}
    case 'gray':{for(const s of [-1,1])M(sph(.06,8,6),T(L.hair),g,s*.22,.66,.08).scale.set(.7,1.3,.8);break;}
    case 'bruno':{for(let i=0;i<4;i++)M(sph(.04,8,6),T('#3a3e46'),g,-.12+i*.08,.27,.21);break;}
    case 'rian':{M(box(.025,.42,.05),T('#c9ced8'),g,-.22,.2,0).rotation.z=.35;M(box(.08,.03,.06),gold,g,-.15,.4,0);break;}
    case 'alex':{M(new THREE.CylinderGeometry(.24,.36,.55,16,1,true,PI*.6,PI*.8),T('#13254d',{side:THREE.FrontSide}),g,0,.3,0);M(new THREE.CylinderGeometry(.235,.355,.55,16,1,true,PI*.6,PI*.8),T('#b8223a',{side:THREE.BackSide}),g,0,.3,0);
      ['#f0c040','#d6334a','#c9ced8'].forEach((c,i)=>M(cyl(.025,.025,.012,10),T(c),g,-.1+i*.05,.45,.185).rotation.x=PI/2);break;}
    case 'eliza':{for(let i=0;i<4;i++)M(sph(.055-i*.008,8,6),T(L.hair),g,0,.6-i*.08,-.24);M(cyl(.025,.025,.012,10),gold,g,-.08,.45,.185).rotation.x=PI/2;break;}
    case 'kasim':{M(box(.04,.55,.02),T('#d8dde4'),g,.05,.45,-.22).rotation.z=.6;M(box(.12,.04,.04),gold,g,-.08,.65,-.22).rotation.z=.6;M(new THREE.TorusGeometry(.03,.008,6,12),gold,g,-.25,.68,.03).rotation.y=PI/2;break;}
    case 'mira':{const f=M(new THREE.ConeGeometry(.04,.3,4),T('#e8402f'),g,.18,1.02,-.12);f.rotation.z=-.5;f.scale.set(1,1,.3);break;}
    case 'shadow':{M(new THREE.CylinderGeometry(.24,.36,.55,16,1,true,PI*.6,PI*.8),T('#1a1a22',{side:THREE.DoubleSide}),g,0,.3,0);break;}
    case 'sera':{for(let i=0;i<6;i++){const a=i/6*PI*2;M(new THREE.ConeGeometry(.03,.24,5),T('#3fae6a'),g,Math.cos(a)*.32,.84,Math.sin(a)*.32).rotation.x=PI;}for(let i=0;i<5;i++)M(sph(.025,6,5),T(['#ffb0c8','#fff0d0','#b0e0ff'][i%3]),g,-.1+i*.05,.5-Math.abs(i-2)*.015,.17);break;}
  }}
export function makeChar(id){
  const d=CHM[id],L=d.L,g=new THREE.Group();
  const skin=T(L.skin),coat=T(L.coat),trim=T(L.trim||'#d9a441'),hair=T(L.hair||'#3a2414'),hatM=T(L.hatC||'#222222');
  const pants=T(d.fac==='navy'?'#f0ece2':'#3b2d24'),boot=T('#2a1c12'),gold=T('#f0c040');
  for(const s of [-1,1])M(cyl(.07,.08,.15,10),boot,g,s*.085,.075,.015);
  M(cyl(.16,.155,.12,14),pants,g,0,.18,0);
  M(cyl(.165,L.belly?.235:.2,.3,16),coat,g,0,.37,0);
  if(L.stripes)for(const y of [.3,.38,.46])M(cyl(.19,.19,.025,16),T('#2a4a8a'),g,0,y,0);
  if(L.long)M(new THREE.CylinderGeometry(.205,.26,.2,16,1,true,PI*.12,PI*1.76),T(L.coat,{side:THREE.DoubleSide}),g,0,.2,0);
  M(cyl(.21,.21,.045,16),T('#3a2414'),g,0,.26,0);M(box(.07,.06,.03),gold,g,0,.26,.205);
  if(L.cross)M(box(.05,.44,.02),T('#f7f3ea'),g,0,.38,.185).rotation.z=.55;
  if(d.fac==='navy'){M(sph(.017,6,5),gold,g,0,.42,.18);M(sph(.017,6,5),gold,g,0,.35,.195);}else M(box(.1,.16,.02),trim,g,0,.42,.168);
  if(L.epa)for(const s of [-1,1])M(cyl(.075,.075,.035,12),gold,g,s*.19,.515,0);
  const arms=[];
  for(const s of [-1,1]){const p=new THREE.Group();p.position.set(s*.205,.49,0);g.add(p);M(cyl(.06,.052,.22,10),coat,p,0,-.1,0);M(cyl(.064,.064,.04,10),trim,p,0,-.2,0);p.userData.hand=M(sph(.058,10,8),skin,p,0,-.245,0);p.rotation.z=s*.28;arms.push(p);}
  const [aL,aR]=arms;
  const head=M(sph(.25,26,20),new THREE.MeshToonMaterial({map:faceTex(id,L),gradientMap:GRAD}),g,0,.76,0);
  M(sph(.045,10,8),L.nose?T('#e0504a'):skin,g,0,.725,.245).scale.setScalar(L.nose?1.5:1);
  for(const s of [-1,1])M(sph(.055,8,8),skin,g,s*.245,.75,0).scale.set(.55,1,.8);
  if(!L.bald){M(new THREE.SphereGeometry(.262,20,14,PI*.95,PI*1.1,0,PI*.62),hair,g,0,.76,0);
    if(L.hat==='none'||L.hat==='cap'||L.fem)M(new THREE.SphereGeometry(.262,20,10,0,PI*2,0,PI*.3),hair,g,0,.76,0);}
  else M(new THREE.SphereGeometry(.256,20,10,PI*.95,PI*1.1,PI*.45,PI*.18),hair,g,0,.76,0);
  if(L.fem&&L.hat!=='hood')M(sph(.22,14,12),hair,g,0,.6,-.13).scale.set(1.1,1.55,.55);
  if(L.beard){const b=M(sph(.21,16,12),T(L.beard),g,0,L.big?.58:.6,.09);b.scale.set(L.big?1.08:.92,L.big?1:.72,.75);}
  const hy=.76;
  switch(L.hat){
    case 'tricorn':case 'captain':{const k=L.hat==='captain'?1.18:1;const hg=new THREE.Group();hg.position.y=hy+.19;hg.scale.setScalar(k);g.add(hg);
      M(cyl(.36,.36,.07,3),hatM,hg);M(cyl(.365,.365,.022,3),gold,hg,0,-.04,0);M(cyl(.18,.23,.18,16),hatM,hg,0,.1,0);M(cyl(.235,.235,.04,16),trim,hg,0,.02,0);
      if(L.hat==='captain'){M(sph(.045,8,6),T('#ffffff'),hg,0,.12,.2);const f=M(new THREE.ConeGeometry(.05,.5,6),T(L.rose?'#26232e':'#e8402f'),hg,-.18,.25,-.02);f.rotation.z=.9;f.rotation.x=-.2;if(L.rose)M(sph(.06,8,6),T('#d6334a'),hg,.2,.12,.08);}
      break;}
    case 'bandana':{M(new THREE.SphereGeometry(.268,20,12,0,PI*2,0,PI*.46),hatM,g,0,hy,0);for(const s of [-1,1])M(box(.06,.18,.03),hatM,g,s*.05,hy-.06,-.26).rotation.z=s*.5;
      for(let i=0;i<5;i++)M(sph(.022,6,5),T('#ffffff'),g,Math.sin(i*1.25)*.24,hy+.12,Math.cos(i*1.25)*.24);break;}
    case 'beanie':{M(new THREE.SphereGeometry(.27,20,12,0,PI*2,0,PI*.45),hatM,g,0,hy,0);M(cyl(.272,.272,.08,20),T('#f2efe6'),g,0,hy+.03,0);M(sph(.07,10,8),T('#f2efe6'),g,0,hy+.3,0);break;}
    case 'bicorne':case 'admiral':{const big=L.hat==='admiral';const sh=new THREE.Shape();for(let i=0;i<=18;i++){const a=PI-i/18*PI;const x=Math.cos(a)*(big?.46:.38),y=Math.sin(a)*(big?.3:.22);i?sh.lineTo(x,y):sh.moveTo(x,y);}
      const geo=new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false});geo.translate(0,0,-.06);M(geo,hatM,g,0,hy+.12,0);
      const tr=new THREE.Shape(),ho=new THREE.Path();const R1=big?.475:.395,R2=big?.31:.232;for(let i=0;i<=18;i++){const a=PI-i/18*PI;const x=Math.cos(a)*R1,y=Math.sin(a)*R2;i?tr.lineTo(x,y):tr.moveTo(x,y);}
      for(let i=0;i<=18;i++){const a=i/18*PI;const x=Math.cos(a)*R1*.86,y=.035+Math.sin(a)*R2*.8;i?ho.lineTo(x,y):ho.moveTo(x,y);}tr.holes.push(ho);
      const tg=new THREE.ExtrudeGeometry(tr,{depth:.14,bevelEnabled:false});tg.translate(0,0,-.07);M(tg,gold,g,0,hy+.115,0);
      M(sph(.05,10,8),T(big?'#f0c040':'#d6334a'),g,0,hy+.2,.07);if(big)M(sph(.09,10,8),T('#ffffff'),g,0,hy+.42,0).scale.set(.7,1.3,.7);break;}
    case 'shako':{M(cyl(.19,.21,.3,18),hatM,g,0,hy+.24,0);M(box(.32,.025,.12),T('#111111'),g,0,hy+.11,.2);M(cyl(.215,.215,.04,18),gold,g,0,hy+.13,0);M(box(.12,.1,.02),gold,g,0,hy+.25,.2);M(sph(.07,10,8),T('#ffffff'),g,0,hy+.45,.04).scale.set(.8,1.5,.8);break;}
    case 'cap':{M(cyl(.27,.27,.07,20),hatM,g,0,hy+.17,0);M(cyl(.255,.255,.04,20),T('#2d5aa8'),g,0,hy+.12,0);M(sph(.04,8,6),T('#d8352a'),g,0,hy+.215,0);break;}
    case 'hood':{M(new THREE.SphereGeometry(.3,20,14,PI*.5+.75,PI*2-1.5,0,PI*.68),T(L.hatC,{side:THREE.DoubleSide}),g,0,hy,0);M(new THREE.CylinderGeometry(.22,.32,.5,16,1,true,PI*.6,PI*.8),T(L.hatC,{side:THREE.DoubleSide}),g,0,.33,0);break;}
    case 'witch':{M(cyl(.44,.44,.03,22),hatM,g,0,hy+.18,0);const c=M(new THREE.ConeGeometry(.21,.55,16),hatM,g,0,hy+.45,-.02);c.rotation.x=-.25;c.rotation.z=.15;M(cyl(.215,.22,.06,16),T('#7fe0c8'),g,0,hy+.22,0);M(sph(.035,8,6),T('#ffd34a',{emissive:'#a07800'}),g,0,hy+.22,.21);break;}
    case 'turban':{M(new THREE.TorusGeometry(.2,.09,10,20),hatM,g,0,hy+.13,0).rotation.x=PI/2;M(sph(.22,16,10),hatM,g,0,hy+.17,0).scale.set(1,.62,1);M(sph(.045,8,6),T('#d6334a'),g,0,hy+.14,.28);break;}
  }
  weapon3P(g,aL,aR,d.w);accessory(g,id,L,aL,aR);
  g.userData.head=head;g.userData.id=id;g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return g;}

export function throwKind(w){return['bottle','dynamite','grenade','potion'].includes(w);}
export function makeVM(d){const w=d.w,L=d.L,id=d.id,g=new THREE.Group(),P={};
  const sleeve=T(L.coat),cuff=T(id==='kid'?'#d23b30':id==='isabel'?'#f4f0f4':L.trim||'#d9a441'),hand=T(['emma','gray','alex','eliza','rian','bruno'].includes(id)?'#f4f4f4':id==='mago'?'#6a4a2a':L.skin),iron=T('#2b2e36'),gold=T('#f0c040'),wood=T('#6a3c1c');
  const arm=(p,x,y,z,rx,ry)=>{const a=new THREE.Group();a.position.set(x,y,z);a.rotation.set(rx||0,ry||0,0);p.add(a);M(box(.13,.13,.44),sleeve,a);M(box(.15,.15,.07),cuff,a,0,0,-.2);M(sph(.068,10,8),hand,a,0,0,-.27);return a;};
  const glow=(c,e)=>noOL(T(c,{emissive:e||c}));
  if(w.startsWith('cannon')){const metal={fin:'#2c2f37',hans:'#2c2f37',bargo:'#2b2228',gray:'#c9973a',alex:'#e8b632'}[id]||CANNON_METAL[w];
    const c=new THREE.Group();c.position.set(-.27,-.4,-1.15);c.scale.setScalar(.82);g.add(c);P.slide=c;M(cyl(.15,.2,.9,18),T(metal),c).rotation.x=PI/2-.06;
    M(cyl(.19,.19,.08,18),id==='fin'||id==='hans'?T('#555a66'):gold,c,0,.03,-.44).rotation.x=PI/2;M(cyl(.21,.21,.07,18),gold,c,0,-.02,.3).rotation.x=PI/2;
    M(box(.5,.14,.6),id==='hans'||id==='alex'?T('#2d5aa8'):wood,c,0,-.26,.1);
    if(id==='fin')M(new THREE.TorusGeometry(.2,.035,6,16),T('#c9a46a'),c,0,.0,-.05);
    if(id==='hans'){M(box(.03,.16,.02),T('#ffffff'),c,0,.19,-.1);M(box(.12,.03,.02),T('#ffffff'),c,0,.24,-.1);}
    if(id==='bargo'){M(cyl(.205,.205,.06,18),T('#c63c31'),c,0,0,-.1).rotation.x=PI/2;M(sph(.12,8,6),glow('#ff7a1a','#ff5a00'),c,0,.04,-.55);
      const pr=new THREE.Group();pr.position.set(.13,-.28,-.62);g.add(pr);M(sph(.09,10,8),T('#e8302a'),pr).scale.set(1,1.2,1);M(new THREE.ConeGeometry(.035,.09,6),T('#f2d24a'),pr,-.02,.02,-.1).rotation.x=-PI/2;M(sph(.016,6,5),T('#ffffff'),pr,-.05,.05,-.06);M(box(.04,.12,.1),T('#2f6fd6'),pr,.07,-.02,.02);}
    if(id==='gray'){M(box(.02,.12,.02),T('#3a2414'),c,0,.24,-.3);M(new THREE.TorusGeometry(.04,.01,6,12),T('#3a2414'),c,0,.32,-.3);}
    if(id==='alex'){M(cyl(.08,.08,.04,12),gold,c,0,.2,.05);for(let i=0;i<3;i++)M(new THREE.ConeGeometry(.025,.07,5),gold,c,-.05+i*.05,.25,.05);}
    if(id!=='bargo'){const a=arm(g,.15,-.42,-.62,.2,-.2);const ls=M(cyl(.012,.012,.4,6),wood,a,0,.12,-.42);ls.rotation.x=-.6;M(sph(.03,6,5),glow('#ff9a2a'),a,0,.27,-.58);}
  }
  else if(['musket','rifle','darkRifle','harpoon'].includes(w)){const m=new THREE.Group();m.position.set(.09,-.24,-.5);g.add(m);P.slide=m;
    M(box(.08,.12,.5),T(w==='darkRifle'?'#24242c':w==='rifle'?'#f2efe6':'#6a3c1c'),m,0,-.04,.05);const L2=w==='harpoon'?.8:1.0;M(cyl(w==='harpoon'?.045:.024,w==='harpoon'?.05:.024,L2,10),T(w==='rifle'?'#2d5aa8':'#2b2e36'),m,-.03,.03,-L2/2-.15).rotation.x=PI/2;
    if(w==='musket'){for(const z of [-.4,-.7,-.95])M(new THREE.TorusGeometry(.03,.008,6,12),gold,m,-.03,.03,z);M(cyl(.025,.03,.26,8),T('#c9973a'),m,-.03,-.04,-.5).rotation.x=PI/2;}
    if(w==='rifle'||w==='darkRifle'){M(cyl(.035,.035,.32,10),T('#1a1a1a'),m,-.03,.11,-.25).rotation.x=PI/2;M(cyl(.042,.042,.02,10),glow(w==='rifle'?'#7ac8ff':'#c07aff'),m,-.03,.11,-.42).rotation.x=PI/2;}
    if(w==='rifle')M(box(.02,.04,.08),gold,m,-.03,-.1,.0);
    if(w==='darkRifle')for(const z of [-.05,.12])M(box(.085,.02,.12),glow('#c07aff','#7a2aff'),m,0,.02,z);
    if(w==='harpoon'){M(new THREE.ConeGeometry(.07,.24,8),T('#c9ced8'),m,-.03,.03,-1.12).rotation.x=-PI/2;for(const s of [-1,1])M(box(.02,.02,.14),T('#c9ced8'),m,-.03+s*.06,.03,-.98).rotation.y=s*.5;M(new THREE.TorusGeometry(.08,.02,6,14),T('#c9a46a'),m,.08,-.08,0).rotation.y=PI/2;}
    arm(g,.14,-.36,-.3,.05,-.1);}
  else if(throwKind(w)){const h=new THREE.Group();h.position.set(.04,-.3,-.95);h.scale.setScalar(.75);g.add(h);P.hand=h;const a=arm(h,.04,-.06,.27,.35,0);const it=throwItem(w);it.scale.setScalar(.95);it.position.set(-.02,.07,-.04);h.add(it);P.item=it;P.spark=it.userData.spark;
    if(w==='bottle')M(new THREE.ConeGeometry(.05,.16,6),glow('#ffb030','#ff7a00'),it,0,.27,0);
    if(w==='potion'){for(let i=0;i<5;i++)M(sph(.012,5,4),glow('#b0ffe0','#3aff9a'),it,rand(-.08,.08),rand(-.05,.12),rand(-.08,.08));}
    if(w==='dynamite')M(cyl(.006,.006,.14,4),T('#c9a46a'),it,0,.16,0);}
  else if(w==='crossbow'){const cb=new THREE.Group();cb.position.set(0,-.27,-.62);g.add(cb);M(box(.1,.09,.7),wood,cb,0,0,.05);M(new THREE.TorusGeometry(.36,.025,6,20,PI),T('#4a4f5a'),cb,0,.03,-.2).rotation.x=-PI/2;
    for(const s of [-1,1])M(box(.04,.05,.06),T('#c9973a'),cb,s*.35,.03,-.2);for(let i=0;i<3;i++)M(cyl(.012,.012,.3,6),T('#d8d8d8'),cb,.08,-.04+i*.025,.05).rotation.x=PI/2;
    const st=new THREE.Group();st.position.set(0,.03,-.2);cb.add(st);P.string=st;M(box(.72,.008,.008),T('#eeeeee'),st);M(cyl(.016,.016,.36,6),T('#8a5a2b'),st,0,.03,-.18).rotation.x=PI/2;M(new THREE.ConeGeometry(.03,.07,6),iron,st,0,.03,-.38).rotation.x=-PI/2;
    arm(g,.14,-.4,-.35);arm(g,-.14,-.4,-.35);}
  else if(w==='bow'||w==='longbow'){const R=w==='longbow'?.3:.24;const bw=new THREE.Group();bw.position.set(-.1,-.2,-.85);g.add(bw);const ti=new THREE.Group();ti.rotation.y=PI/2;bw.add(ti);M(new THREE.TorusGeometry(R,.024,6,24,PI),T(w==='longbow'?'#e3d0a0':'#7a4a22'),ti).rotation.z=-PI/2;
    const st=new THREE.Group();bw.add(st);P.string=st;M(box(.006,R*1.95,.006),T('#f4f0e6'),st);M(cyl(.013,.013,.8,6),T('#8a5a2b'),st,0,0,-.3).rotation.x=PI/2;M(new THREE.ConeGeometry(.035,.09,6),iron,st,0,0,-.72).rotation.x=-PI/2;
    const fc=T(w==='longbow'?'#5fd84a':'#e8402f');M(box(.004,.05,.08),fc,st,0,0,.06);M(box(.05,.004,.08),fc,st,0,0,.06);
    if(w==='longbow'){M(new THREE.ConeGeometry(.03,.14,4),T('#e8402f'),bw,0,-R-.02,0).rotation.x=PI;}
    const a=new THREE.Group();a.position.set(-.16,-.42,-.6);g.add(a);M(box(.12,.12,.4),sleeve,a);M(box(.14,.14,.06),cuff,a,0,0,-.18);
    if(id==='lu'){M(new THREE.TorusGeometry(.06,.016,6,12,PI*1.4),T('#c9ced8'),bw,0,0,.02).rotation.y=PI/2;}else M(sph(.065,10,8),hand,bw,0,0,.0);}
  else if(w==='blunder'){const m=new THREE.Group();m.position.set(.06,-.25,-.55);g.add(m);P.slide=m;M(box(.1,.12,.5),wood,m,0,-.03,.1);M(cyl(.045,.04,.6,12),T('#b88a3a'),m,0,.03,-.4).rotation.x=PI/2;M(new THREE.CylinderGeometry(.11,.045,.16,14,1,true),T('#b88a3a',{side:THREE.DoubleSide}),m,0,.03,-.76).rotation.x=-PI/2;
    if(id==='kasim'){for(const z of [-.2,-.45,-.62])M(new THREE.TorusGeometry(.05,.012,6,12),gold,m,0,.03,z);M(sph(.03,6,5),T('#d6334a'),m,0,.08,-.1);}
    else M(box(.12,.02,.02),T('#c9ced8'),m,-.12,-.06,.05);
    arm(g,.14,-.38,-.3);arm(g,-.12,-.42,-.45,.1,.3);}
  else{const goldP=w==='goldPistols';for(const s of [-1,1]){const m=new THREE.Group();m.position.set(s*.1,-.24,-.58);g.add(m);P[s>0?'slide':'slide2']=m;arm(m,s*.03,-.14,.27,.3,0);M(box(.06,.12,.08),T(goldP?'#f2efe6':'#5a3418'),m,0,-.02,-.02);M(cyl(.028,.032,.34,8),goldP?gold:iron,m,0,.04,-.18).rotation.x=PI/2;M(cyl(.04,.04,.04,8),goldP?T('#d6334a'):gold,m,0,.04,-.35).rotation.x=PI/2;
    if(goldP&&s<0)M(sph(.04,8,6),T('#d6334a'),m,0,.06,0);if(!goldP)M(box(.015,.04,.03),iron,m,0,.09,-.02);}}
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});for(const k in P)if(P[k]&&P[k].position)P[k].userData.b=P[k].position.clone();
  g.userData=Object.assign({base:g.position.clone()},P);return g;}
export function vmPose(vm,p,rc,t){const u=vm.userData;vm.position.copy(u.base);vm.position.z+=rc*.32;vm.position.y-=rc*.04;vm.rotation.x=rc*.28;
  const tr=p>.9?(Math.random()-.5)*.014:0;vm.position.x+=tr;vm.position.y+=tr+Math.sin(t*2)*.005;
  for(const k of ['slide','slide2'])if(u[k]){u[k].position.copy(u[k].userData.b);u[k].position.z+=.12*p;u[k].position.y-=.03*p;}
  if(u.string){u.string.position.copy(u.string.userData.b);u.string.position.z+=.16*p;}
  if(u.hand){u.hand.position.copy(u.hand.userData.b).add(new V3(.02*p,-.05*p,.12*p));u.hand.rotation.x=.55*p;if(u.item)u.item.visible=true;}
  if(u.spark)u.spark.scale.setScalar(.6+Math.random()*.9);}
export function throwPose(vm,u){const h=vm.userData.hand;if(!h)return;const e=1-Math.pow(1-Math.min(1,u),3);h.position.copy(h.userData.b).add(new V3(-.04*e,.16*e-.04,-.38*e));h.rotation.x=.5-1.3*e;if(vm.userData.item)vm.userData.item.visible=u<.3;}
