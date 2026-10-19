import * as THREE from 'three';
import { V3, PI, D2R, rand, pick, clamp, GRAD, T, noOL, thinOL, M, cyl, sph, box, flat, cvTex, beam, mergeBoxes, mulberry, ghostOf } from './util.js';
import { CLS, RAR, FACBG, CH, CHM, eff, MAXF, MAXB, defLayout, S, STAGES, stats, shNeed, upCost, roomCost, roomHp, BUILD_COST } from './data.js';
import { audio, SFX, vib } from './audio.js';
import { throwItem, makeChar, makeVM, vmPose, throwPose } from './crew.js';

import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { loadSave, startAutosave } from './save.js';
import './style.css';
loadSave();
startAutosave();

const $=s=>document.querySelector(s);
const phone=$('#phone'),canvas=$('#cv');

phone.addEventListener('pointerdown',()=>audio(),{capture:true});

/* ================= THREE CORE ================= */
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const OE=OutlineEffect;
const effect=OE?new OE(renderer,{defaultThickness:.0034,defaultColor:[.09,.06,.05]}):null;
const draw=(sc,cam)=>effect?effect.render(sc,cam):renderer.render(sc,cam);
/* ================= TEXTURES ================= */
const TX={};
const YMIN=-1.15,YMAX=1.35;
const SKINS={
 pirate:{n:'해적선',desc:'검은 깃발을 단 정통 해적선',hull:'#7a4a28',dark:'#4e2d16',band:'#efb84a',bottom:'#a8432a',rail:'#5a341c',cap:'#3d220f',sail:'#f1e4c6',frame:'#4a2a14',trim:'#e3b04b',port:'#b8322a',wood:['#c98b52','#7a4622','#dba06a'],emb:'skull'},
 clipper:{n:'쾌속 범선',desc:'하얀 선체에 청록 띠를 두른 날렵한 범선',hull:'#efe7d4',dark:'#b9ad94',band:'#2f8a8a',bottom:'#3f7a5a',rail:'#f4efe2',cap:'#2f8a8a',sail:'#ffffff',frame:'#6a4a2a',trim:'#2f8a8a',port:'#2f8a8a',wood:['#e3bd88','#9a7246','#efd0a4'],emb:'compass'},
 navy:{n:'해군 프리깃',desc:'하얀 판자와 남색 포문의 정규 군함',hull:'#24365e',dark:'#16233f',band:'#f0ead8',bottom:'#b34a36',rail:'#efe8d6',cap:'#c9a35a',sail:'#faf7ef',frame:'#1c2a4a',trim:'#f2efe6',port:'#2f62c4',wood:['#ece7da','#8d9ab0','#f8f5ee'],emb:'anchor',price:{gold:800}},
 ghost:{n:'유령선',desc:'찢어진 돛과 초록 불빛의 저주받은 배',hull:'#3a3448',dark:'#201c2a',band:'#5affb0',bottom:'#2a2a36',rail:'#4a4458',cap:'#2a2436',sail:'#c8d8c8',frame:'#1a1622',trim:'#5affb0',port:'#3a8a6a',wood:['#5e5870','#2a2634','#6e6880'],emb:'ghost',glow:1,price:{gem:10}},
 royal:{n:'황금 갤리온',desc:'붉은 선체와 황금 장식의 왕실 갤리온',hull:'#8a1f22',dark:'#5a1214',band:'#f0c040',bottom:'#3a2a1a',rail:'#f0c040',cap:'#b8862a',sail:'#fbf3dc',frame:'#3a1a10',trim:'#f0c040',port:'#f0c040',wood:['#b03a30','#5a1214','#c8584a'],emb:'crown',price:{gold:1500}}};
function shade(hex,f){const c=new THREE.Color(hex);c.multiplyScalar(f);return '#'+c.getHexString();}
function hullTex(sk){return TX['h'+sk]||(TX['h'+sk]=cvTex(1024,256,(g,w,h)=>{
  const Y=y=>h*(1-(y-YMIN)/(YMAX-YMIN));const K=SKINS[sk];
  g.fillStyle=K.hull;g.fillRect(0,0,w,h);
  g.strokeStyle=K.dark;g.lineWidth=2.5;for(let y=0;y<h;y+=12){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
  for(let y=0,r=0;y<h;y+=12,r++)for(let x=(r%3)*55;x<w;x+=165){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+12);g.stroke();}
  g.fillStyle=K.band;g.fillRect(0,Y(.47),w,Y(.33)-Y(.47));g.fillStyle=K.dark;g.fillRect(0,Y(.33),w,3);
  if(sk==='royal'){g.fillStyle='#f0c040';for(let x=20;x<w;x+=60){g.beginPath();g.arc(x,Y(.4),5,0,7);g.fill();}}
  for(const u of [.3,.4,.5,.6,.7]){const x=u*w;g.fillStyle=K.band;g.fillRect(x-17,Y(.27),34,Y(.0)-Y(.27));g.fillStyle=K.glow?'#3aff9a':'#120d0a';g.fillRect(x-12,Y(.23),24,Y(.04)-Y(.23));}
  g.fillStyle=K.bottom;g.fillRect(0,Y(-.2),w,h);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,Y(-.2),w,4);
  if(sk==='ghost'){g.fillStyle='rgba(90,255,176,.25)';for(let i=0;i<14;i++){g.beginPath();g.arc(Math.random()*w,Y(rand(-.6,.2)),rand(8,22),0,7);g.fill();}}
}));}
const deckTex=()=>TX.deck||(TX.deck=cvTex(256,256,(g,w,h)=>{g.fillStyle='#d7a467';g.fillRect(0,0,w,h);g.strokeStyle='#a9733e';g.lineWidth=3;for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();for(let x=(y/32%2)*64;x<w;x+=128){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke();}}},true));
function sailTex(sk){return TX['s'+sk]||(TX['s'+sk]=cvTex(256,256,(g,w,h)=>{
  const K=SKINS[sk];g.fillStyle=K.sail;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(140,100,50,.25)';g.lineWidth=2;for(let x=32;x<w;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
  if(K.emb==='skull'||K.emb==='ghost'){const c=K.emb==='ghost'?'rgba(40,160,110,.75)':'#2a2422';g.fillStyle=c;g.lineCap='round';g.strokeStyle=c;g.lineWidth=16;g.beginPath();g.moveTo(78,170);g.lineTo(178,220);g.moveTo(178,170);g.lineTo(78,220);g.stroke();
    g.beginPath();g.arc(128,118,52,0,7);g.fill();g.fillRect(100,150,56,30);g.fillStyle=K.sail;g.beginPath();g.arc(108,118,14,0,7);g.arc(148,118,14,0,7);g.fill();g.beginPath();g.moveTo(128,132);g.lineTo(120,146);g.lineTo(136,146);g.fill();}
  else if(K.emb==='anchor'){g.fillStyle='#2f62c4';g.beginPath();g.arc(128,128,74,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=12;g.lineCap='round';g.beginPath();g.moveTo(128,80);g.lineTo(128,178);g.moveTo(100,98);g.lineTo(156,98);g.stroke();g.beginPath();g.arc(128,140,40,.15*PI,.85*PI);g.stroke();g.beginPath();g.arc(128,70,10,0,7);g.stroke();}
  else if(K.emb==='compass'){g.fillStyle='#2f8a8a';g.fillRect(0,0,w,26);g.fillRect(0,h-26,w,26);g.beginPath();for(let i=0;i<8;i++){const a=i/8*PI*2-PI/2,r=i%2?26:78;g.lineTo(128+Math.cos(a)*r,128+Math.sin(a)*r);}g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(128,128,14,0,7);g.fill();}
  else if(K.emb==='crown'){g.fillStyle='#c8282c';g.fillRect(108,0,40,h);g.fillRect(0,108,w,40);g.fillStyle='#f0c040';g.beginPath();g.moveTo(84,150);g.lineTo(88,98);g.lineTo(108,124);g.lineTo(128,88);g.lineTo(148,124);g.lineTo(168,98);g.lineTo(172,150);g.closePath();g.fill();}
  if(sk==='ghost'){g.globalCompositeOperation='destination-out';g.fillStyle='#000';const R=mulberry(7);for(let i=0;i<9;i++){const x=R()*w,y=R()*h,r=8+R()*22;g.beginPath();for(let k=0;k<9;k++){const a=k/9*PI*2;g.lineTo(x+Math.cos(a)*r*(.5+R()*.6),y+Math.sin(a)*r*(.5+R()*.6));}g.fill();}
    g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=16)g.lineTo(x,h-10-R()*30);g.lineTo(w,h);g.fill();g.globalCompositeOperation='source-over';}
}));}
function flagTex(sk){return TX['f'+sk]||(TX['f'+sk]=cvTex(192,128,(g,w,h)=>{const K=SKINS[sk];
  if(K.emb==='skull'||K.emb==='ghost'){g.fillStyle='#141414';g.fillRect(0,0,w,h);const c=K.emb==='ghost'?'#5affb0':'#fff';g.fillStyle=c;g.strokeStyle=c;g.lineWidth=10;g.lineCap='round';g.beginPath();g.moveTo(66,86);g.lineTo(126,112);g.moveTo(126,86);g.lineTo(66,112);g.stroke();g.beginPath();g.arc(96,56,28,0,7);g.fill();g.fillRect(82,70,28,18);g.fillStyle='#141414';g.beginPath();g.arc(86,56,8,0,7);g.arc(106,56,8,0,7);g.fill();}
  else if(K.emb==='anchor'){g.fillStyle='#2a59b8';g.fillRect(0,0,w,h);g.strokeStyle='#fff';g.lineWidth=22;g.beginPath();g.moveTo(0,0);g.lineTo(w,h);g.moveTo(w,0);g.lineTo(0,h);g.stroke();g.strokeStyle='#d8352a';g.lineWidth=9;g.stroke();g.fillStyle='#fff';g.fillRect(w/2-20,0,40,h);g.fillRect(0,h/2-20,w,40);g.fillStyle='#d8352a';g.fillRect(w/2-11,0,22,h);g.fillRect(0,h/2-11,w,22);}
  else if(K.emb==='compass'){g.fillStyle='#2f8a8a';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.beginPath();for(let i=0;i<8;i++){const a=i/8*PI*2-PI/2,r=i%2?12:40;g.lineTo(96+Math.cos(a)*r,64+Math.sin(a)*r);}g.closePath();g.fill();}
  else{g.fillStyle='#c8282c';g.fillRect(0,0,w,h);g.fillStyle='#f0c040';g.beginPath();g.moveTo(60,92);g.lineTo(64,40);g.lineTo(80,66);g.lineTo(96,34);g.lineTo(112,66);g.lineTo(128,40);g.lineTo(132,92);g.closePath();g.fill();}
}));}
const sternTex=sk=>TX['st'+sk]||(TX['st'+sk]=cvTex(256,160,(g,w,h)=>{const K=SKINS[sk];g.fillStyle=K.dark;g.fillRect(0,0,w,h);g.fillStyle=K.band;g.fillRect(0,0,w,14);g.fillRect(0,h-16,w,16);
  for(const x of [44,104,164,224].map(v=>v-12)){g.fillStyle='#2a1a0c';g.fillRect(x-4,42,40,70);g.fillStyle=K.glow?'#7affc8':'#ffd25a';g.fillRect(x,46,32,62);g.fillStyle=K.glow?'#3aaa7a':'#e8a52a';g.fillRect(x+14,46,4,62);g.fillRect(x,74,32,4);}}));
const SKY=cvTex(4,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2f9de0');gr.addColorStop(.55,'#86d3f4');gr.addColorStop(1,'#d8f3fb');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const WT={};
function wallTex(lv,st,kind,sk){const key=[lv,st,kind,sk].join();if(WT[key])return WT[key];
  return WT[key]=cvTex(128,128,(g,w,h)=>{
    const K=SKINS[sk];const wd=K.wood;
    const P=lv===1?wd:lv===2?wd.map(c=>shade(c,.86)):lv===3?wd.map(c=>shade(c,.72)):lv===4?['#9aa3ad','#55606c','#b9c1cb']:['#4f5a6a','#262c38','#66738a'];
    g.fillStyle=P[0];g.fillRect(0,0,w,h);
    if(lv<=3){for(let i=0;i<5;i++){g.fillStyle=i%2?P[2]:P[0];g.fillRect(0,i*25.6,w,25.6);}g.strokeStyle=P[1];g.lineWidth=3;for(let i=1;i<5;i++){g.beginPath();g.moveTo(0,i*25.6);g.lineTo(w,i*25.6);g.stroke();}
      g.fillStyle=P[1];for(let i=0;i<5;i++){g.fillRect(9,i*25.6+11,4,4);g.fillRect(115,i*25.6+11,4,4);}
      if(lv>=2){g.lineWidth=9;g.strokeStyle=P[1];g.beginPath();g.moveTo(8,120);g.lineTo(120,8);g.stroke();}
      if(lv===3){g.fillStyle='#3a3e48';g.fillRect(0,16,w,10);g.fillRect(0,102,w,10);g.fillStyle='#c9ced8';for(let x=10;x<128;x+=22){g.beginPath();g.arc(x,21,2.5,0,7);g.arc(x,107,2.5,0,7);g.fill();}}}
    else{g.strokeStyle=P[1];g.lineWidth=5;g.strokeRect(3,3,122,122);g.beginPath();g.moveTo(64,4);g.lineTo(64,124);g.moveTo(4,64);g.lineTo(124,64);g.stroke();g.fillStyle=P[2];
      for(let i=12;i<128;i+=20)for(const[x,y]of[[i,10],[i,118],[10,i],[118,i]]){g.beginPath();g.arc(x,y,2.6,0,7);g.fill();}
      if(lv===5){g.strokeStyle='#f0c040';g.lineWidth=4;g.strokeRect(14,14,100,100);}}
    if(kind==='front'){g.fillStyle=K.port;g.fillRect(38,40,52,46);g.fillStyle=K.glow?'#3aff9a':'#1a120c';g.fillRect(44,46,40,34);g.strokeStyle=shade(K.port,.6);g.lineWidth=3;g.beginPath();g.moveTo(44,63);g.lineTo(84,63);g.stroke();g.fillStyle='#c9a35a';g.fillRect(47,49,7,4);g.fillRect(74,49,7,4);}
    else if(kind==='side'){g.fillStyle='#c99a3a';g.beginPath();g.arc(64,60,20,0,7);g.fill();g.fillStyle=K.glow?'#5affb0':'#22414f';g.beginPath();g.arc(64,60,14,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(59,55,5,0,7);g.fill();}
    else{g.fillStyle=shade(P[1],.9);g.fillRect(50,30,28,56);g.fillStyle='#c9a35a';g.beginPath();g.arc(72,60,3,0,7);g.fill();}
    if(st>0){const R=mulberry(lv*31+kind.length*7+st*101+sk.length*13);
      for(let i=0;i<(st===1?2:3);i++){const x=20+R()*88,y=20+R()*88;const gr=g.createRadialGradient(x,y,2,x,y,36);gr.addColorStop(0,'rgba(20,10,5,.8)');gr.addColorStop(1,'rgba(20,10,5,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}
      g.strokeStyle='rgba(30,15,5,.85)';g.lineWidth=2;for(let i=0;i<6;i++){let x=R()*128,y=R()*128;g.beginPath();g.moveTo(x,y);for(let j=0;j<4;j++){x+=(R()-.5)*34;y+=(R()-.5)*34;g.lineTo(x,y);}g.stroke();}
      g.globalCompositeOperation='destination-out';g.fillStyle='#000';
      const hole=(cx,cy,r)=>{g.beginPath();const n=12;for(let i=0;i<n;i++){const a=i/n*PI*2,rr=r*(.5+R()*.65);g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.85);}g.closePath();g.fill();};
      if(st===1){hole(26+R()*30,30+R()*60,17+R()*8);hole(72+R()*28,48+R()*50,13+R()*8);}
      else{for(let i=0;i<5;i++){if(i===2||R()<.65){const y=i*25.6;g.beginPath();g.moveTo(0,y);for(let x=0;x<=128;x+=16)g.lineTo(x,y+R()*7);for(let x=128;x>=0;x-=16)g.lineTo(x,y+25.6-R()*7);g.closePath();g.fill();}}hole(64,64,42);}
      g.globalCompositeOperation='source-over';}
  });}
const WM={};
function wallMat(lv,st,kind,sk){const k=[lv,st,kind,sk].join();return WM[k]||(WM[k]=noOL(new THREE.MeshToonMaterial({map:wallTex(lv,st,kind,sk),gradientMap:GRAD,alphaTest:.5,side:THREE.DoubleSide})));}
/* ================= PORTRAITS ================= */
const PORT={};
function makePortraits(){
  const pr=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});pr.setPixelRatio(1);pr.setSize(220,220);pr.setClearColor(0x000000,0);
  const pe=OE?new OE(pr,{defaultThickness:.006,defaultColor:[.08,.05,.04]}):null;
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#8090b0',.75));const dl=new THREE.DirectionalLight('#fff4e4',.85);dl.position.set(2,3,4);sc.add(dl);
  const cam=new THREE.PerspectiveCamera(26,1,.1,10);
  for(const c of CH){const m=makeChar(c.id);m.rotation.y=.18;sc.add(m);if(['witch','admiral','shako'].includes(c.L.hat)){cam.position.set(.6,1.05,2.15);cam.lookAt(0,.84,0);}else{cam.position.set(.55,.95,1.9);cam.lookAt(0,.76,0);}
    (pe||pr).render(sc,cam);PORT[c.id]=pr.domElement.toDataURL();sc.remove(m);}
  pr.dispose();}

/* ================= SHIP & CABINS ================= */
const SZ=1.05,DECK=.58,ZS=-4.1,ZB=4.5,H2=SZ/2,E=H2-.035;
const cellX=r=>(1-r)*SZ,cellZ=c=>(c-1.5)*SZ,roomY=f=>DECK+SZ/2+f*SZ,topY=f=>DECK+(f+1)*SZ;
const tOf=z=>(z-ZS)/(ZB-ZS);
const hullW=t=>t<.62?1.95*(.8+.2*Math.sin(t/.62*PI/2)):1.95*Math.pow(Math.max(0,Math.cos((t-.62)/.38*PI/2)),.75)+.04;
const hullH=t=>DECK-.03+.35*Math.pow(Math.abs(t-.5)/.5,2.2)+(t>.86?(t-.86)*1.6:0);
const hullK=t=>{let k=-1.05;if(t>.8)k+=(t-.8)/.2*.75;if(t<.08)k+=(.08-t)/.08*.25;return k;};
const KEY=(f,r,c)=>f+','+r+','+c;
const KINDS=['front','back','side','side'];
let HULLG=null,DECKG=null,TRANSG=null;
function hullGeos(){if(HULLG)return;
  const N=44,J=14,pos=[],uv=[],idx=[];
  for(let i=0;i<=N;i++){const t=i/N,z=ZS+(ZB-ZS)*t,w=hullW(t),h=hullH(t),k=hullK(t);
    for(let j=0;j<=J;j++){const a=j/J*PI,c=Math.cos(a),s=Math.sin(a);const x=-w*Math.sign(c)*Math.pow(Math.abs(c),.55),y=h-(h-k)*Math.pow(s,1.3);pos.push(x,y,z);uv.push(t,(y-YMIN)/(YMAX-YMIN));}}
  for(let i=0;i<N;i++)for(let j=0;j<J;j++){const a=i*(J+1)+j,b=a+J+1;idx.push(a,a+1,b,b,a+1,b+1);}
  HULLG=new THREE.BufferGeometry();HULLG.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));HULLG.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));HULLG.setIndex(idx);HULLG.computeVertexNormals();
  const dp=[],du=[],di=[];for(let i=0;i<=N;i++){const t=i/N,z=ZS+(ZB-ZS)*t,w=hullW(t)*.985,h=hullH(t)-.02;dp.push(-w,h,z,w,h,z);du.push(z*.5,(-w+2)*.75,z*.5,(w+2)*.75);}
  for(let i=0;i<N;i++){const a=i*2;di.push(a,a+2,a+1,a+1,a+2,a+3);}
  DECKG=new THREE.BufferGeometry();DECKG.setAttribute('position',new THREE.Float32BufferAttribute(dp,3));DECKG.setAttribute('uv',new THREE.Float32BufferAttribute(du,2));DECKG.setIndex(di);DECKG.computeVertexNormals();
  const tp=[0,(hullH(0)+hullK(0))/2,ZS],ti=[];for(let j=0;j<=J;j++){tp.push(pos[j*3],pos[j*3+1],pos[j*3+2]);if(j)ti.push(0,j,j+1);}
  TRANSG=new THREE.BufferGeometry();TRANSG.setAttribute('position',new THREE.Float32BufferAttribute(tp,3));TRANSG.setIndex(ti);TRANSG.computeVertexNormals();}
const FRAMEG=mergeBoxes([[.1,SZ,.1,E,0,E],[.1,SZ,.1,-E,0,E],[.1,SZ,.1,E,0,-E],[.1,SZ,.1,-E,0,-E],
  [.09,.09,SZ,E,H2-.045,0],[.09,.09,SZ,-E,H2-.045,0],[SZ,.09,.09,0,H2-.045,E],[SZ,.09,.09,0,H2-.045,-E],
  [.09,.09,SZ,E,-H2+.045,0],[.09,.09,SZ,-E,-H2+.045,0],[SZ,.09,.09,0,-H2+.045,E],[SZ,.09,.09,0,-H2+.045,-E]]);
const TRIMG=mergeBoxes([[.03,.07,SZ+.02,H2+.012,H2-.12,0],[.03,.07,SZ+.02,-H2-.012,H2-.12,0],[SZ+.02,.07,.03,0,H2-.12,H2+.012],[SZ+.02,.07,.03,0,H2-.12,-H2-.012]]);
const FLOORG=mergeBoxes([[SZ-.06,.06,SZ-.06,0,-H2+.03,0]]);
const INNERG=new THREE.BoxGeometry(SZ-.13,SZ-.1,SZ-.13);
const WALLG=new THREE.PlaneGeometry(SZ-.07,SZ-.07);
const ROOFG=(()=>{const L=[[SZ,.07,SZ,0,H2+.035,0]];for(const s of [-1,1]){for(let i=0;i<4;i++){const u=-E+i*(2*E/3);L.push([.07,.24,.07,s*E,H2+.19,u]);L.push([.07,.24,.07,u,H2+.19,s*E]);}L.push([.06,.06,SZ,s*E,H2+.3,0]);L.push([SZ,.06,.06,0,H2+.3,s*E]);}return mergeBoxes(L);})();
const GHOSTBOX=new THREE.BoxGeometry(SZ,SZ,SZ);

const WALLP=[[E,0,0],[-E,0,0],[0,0,-E],[0,0,E]],WALLN=[[1,0,0],[-1,0,0],[0,0,-1],[0,0,1]];
function makeRoom(ship,f,r,c,lv){
  const sk=ship.skin,K=SKINS[sk],grp=new THREE.Group();grp.position.set(cellX(r),roomY(f),cellZ(c));ship.g.add(grp);
  const frame=M(FRAMEG,T(K.frame),grp);M(TRIMG,T(lv>=5?'#f0c040':K.trim),grp);M(FLOORG,T('#ffffff',{map:deckTex()}),grp);
  const inner=new THREE.Mesh(INNERG,noOL(T('#2e1c10',{side:THREE.BackSide})));grp.add(inner);
  const walls=[];[PI/2,-PI/2,PI,0].forEach((ry,i)=>{const m=new THREE.Mesh(WALLG,wallMat(lv,0,KINDS[i],sk));m.rotation.order='YXZ';m.position.set(...WALLP[i]);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;grp.add(m);walls.push(m);});
  const roof=M(ROOFG,T('#ffffff',{map:deckTex()}),grp);
  const hp=Math.round(roomHp(lv)*(ship.cap==='alex'?1.2:1));
  const rm={grp,f,r,c,lv,skin:sk,frame,hp,max:hp,wd:[0,0,0,0],ws:[0,0,0,0],walls,roof,ty:roomY(f),vy:0,tilt:new V3(),fire:null,burn:null,ghost:false};
  ship.rooms.set(KEY(f,r,c),rm);return rm;}
function colTop(ship,r,c){for(let f=MAXF-1;f>=0;f--)if(ship.rooms.has(KEY(f,r,c)))return f;return -1;}
function standY(ship,r,c){const t=colTop(ship,r,c);return t>=0?topY(t)+.07:DECK;}
function updateRoofs(ship){ship.rooms.forEach(rm=>{rm.roof.visible=colTop(ship,rm.r,rm.c)===rm.f;});}
function setRoomGhost(rm,on,op){rm.ghost=on;rm.grp.traverse(m=>{if(!m.isMesh||m.userData.fx)return;if(!m.userData.orig)m.userData.orig=m.material;m.material=on?ghostOf(m.userData.orig,op||.16):m.userData.orig;m.castShadow=!on;});}
function setWall(rm,i,st){const prev=rm.ws[i];rm.ws[i]=st;const m=rm.walls[i],mat=wallMat(rm.lv,st,KINDS[i],rm.skin);m.userData.orig=mat;m.material=rm.ghost?ghostOf(mat,.16):mat;
  const n=WALLN[i],inw=st===1?.03:.07;m.position.set(WALLP[i][0]-n[0]*inw,rand(-.02,.02),WALLP[i][2]-n[2]*inw);m.rotation.x=st===1?rand(-.07,.07):rand(-.2,.2);m.rotation.z=st===2?rand(-.1,.1):0;
  if(st===2&&prev<2){const pm=wallMat(rm.lv,0,'back',rm.skin);for(let k=0;k<3;k++){const pl=new THREE.Mesh(box(rand(.28,.5),.09,.03),pm);pl.castShadow=true;const off=rand(-.32,.32);
    pl.position.set(WALLP[i][0]+n[0]*.03,rand(-.38,.38),WALLP[i][2]+n[2]*.03);if(i<2)pl.position.z=off;else pl.position.x=off;pl.rotation.y=i<2?PI/2:0;pl.rotation.z=rand(-1,1);pl.rotation.x=rand(-.3,.3);rm.grp.add(pl);}}}
function faceToward(rm,loc){const dx=loc.x-rm.grp.position.x,dz=loc.z-rm.grp.position.z;return Math.abs(dx)>=Math.abs(dz)?(dx>0?0:1):(dz<0?2:3);}
function coverOf(rm,loc){return[.25,.6,1][rm.ws[faceToward(rm,loc)]];}
const coverEff=(rm,loc,cig)=>{const c=coverOf(rm,loc);return c+(1-c)*cig;};

function makeShip(o){
  hullGeos();
  const sk=o.skin||o.fac,SKN=SKINS[sk],pir=o.fac==='pirate',g=new THREE.Group(),rig=[];
  M(HULLG,T('#ffffff',{map:hullTex(sk),side:THREE.DoubleSide}),g);M(TRANSG,T(SKN.dark,{side:THREE.DoubleSide}),g);
  M(DECKG,T('#ffffff',{map:deckTex(),side:THREE.DoubleSide}),g).castShadow=false;
  const railM=T(SKN.rail),capM=T(SKN.cap);
  for(const s of [-1,1]){let prev=null;for(let i=2;i<=40;i+=2){const t=i/42,z=ZS+(ZB-ZS)*t,w=hullW(t)*.97,h=hullH(t);if(t>.06&&t<.2)continue;const p=new V3(s*w,h+.3,z);M(cyl(.035,.035,.3,6),railM,g,s*w,h+.15,z);if(prev&&prev.z>ZS+(ZB-ZS)*.2-.01)beam(g,prev,p,.045,capM);prev=p;}}
  for(const u of [.3,.4,.5,.6,.7])for(const s of [-1,1]){const w=hullW(u);M(cyl(.055,.07,.34,10),T('#24262c'),g,s*(w+.02),.135,ZS+u*(ZB-ZS)).rotation.z=s*PI/2;}
  const ts=.11,hs=hullH(ts),sw=hullW(ts)*1.9,zc=ZS+(ZB-ZS)*ts+.08;const wallC=SKN.hull;
  const sc=new THREE.Mesh(box(sw,1.0,1.55),[T(wallC),T(wallC),T('#ffffff',{map:deckTex()}),T(wallC),T(SKN.dark),T('#ffffff',{map:sternTex(sk)})]);sc.position.set(0,hs+.42,zc);sc.castShadow=sc.receiveShadow=true;g.add(sc);
  M(box(sw+.08,.1,1.63),T(SKN.band),g,0,hs+.93,zc);M(box(.42,.6,.04),T('#3a2010'),g,0,hs+.25,zc+.79);
  for(const s of [-1,1]){M(cyl(.03,.03,.28,6),railM,g,s*sw/2,hs+1.12,zc-.7);M(cyl(.03,.03,.28,6),railM,g,s*sw/2,hs+1.12,zc+.7);beam(g,new V3(s*sw/2,hs+1.26,zc-.72),new V3(s*sw/2,hs+1.26,zc+.72),.04,capM);}
  beam(g,new V3(-sw/2,hs+1.26,zc-.72),new V3(sw/2,hs+1.26,zc-.72),.04,capM);
  M(box(.16,.22,.16),noOL(SKN.glow?T('#7affc8',{emissive:'#2aff8a'}):T('#ffd25a',{emissive:'#ffb000'})),g,0,hs+1.45,ZS+.05);M(cyl(.025,.025,.5,6),T('#2c2f37'),g,0,hs+1.2,ZS+.15);
  function mast(z,base,H,big){const mt=T('#5a3418');rig.push(M(cyl(.075,.11,H,12),mt,g,0,base+H/2,z));
    [base+H*.42,base+H*.74].forEach((y,i)=>{const L=(i?2.3:3.3)*(big?1:.9);const yd=M(cyl(.045,.045,L,8),mt,g,0,y,z);yd.rotation.z=PI/2;rig.push(yd);
      if(o.sails==='full'){const sh=i?1.15:1.55,R=2.4,span=L/2/R;rig.push(M(new THREE.CylinderGeometry(R,R,sh,14,1,true,-span,span*2),T('#ffffff',{map:sailTex(sk),side:THREE.DoubleSide,alphaTest:.5}),g,0,y-sh/2-.04,z-R+.3));}
      else{const f=M(cyl(.11,.11,L*.92,10),T(SKN.sail),g,0,y-.12,z);f.rotation.z=PI/2;rig.push(f);for(const x of [-.6,0,.6])M(cyl(.12,.12,.03,8),T('#8a6a3a'),g,x*L/3,y-.12,z).rotation.z=PI/2;}});
    if(big){rig.push(M(cyl(.3,.24,.2,14,1,true),T('#5a3418',{side:THREE.DoubleSide}),g,0,base+H*.86,z));M(cyl(.3,.3,.03,14),T('#5a3418'),g,0,base+H*.82,z);}
    const lm=new THREE.LineBasicMaterial({color:0x3a2a1a});for(const s of [-1,1]){const tp=new V3(0,base+H*.8,z),w=hullW(tOf(z))*.95,hh=hullH(tOf(z))+.28;for(const dz of [-.35,0,.35])g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([tp,new V3(s*w,hh,z+dz)]),lm));}
    return base+H;}
  const fz=2.95,ftop=mast(fz,hullH(tOf(fz)),4.6,false);const mz=zc-.1,mtop=mast(mz,hs+.93,4.9,true);
  const fg=new THREE.PlaneGeometry(1.1,.72,8,1);fg.rotateY(PI/2);fg.translate(0,0,-.55);
  const flag=M(fg,noOL(T('#ffffff',{map:flagTex(sk),side:THREE.DoubleSide})),g,0,mtop-.4,mz);flag.castShadow=false;
  const bsDir=new V3(0,.36,1).normalize(),bs0=new V3(0,hullH(.99)+.02,ZB-.12),bs1=bs0.clone().addScaledVector(bsDir,2.1);beam(g,bs0,bs1,.06,T('#5a3418'));
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(0,ftop-.3,fz),bs1]),new THREE.LineBasicMaterial({color:0x3a2a1a})));
  if(o.sails==='full'){const jg=new THREE.BufferGeometry();jg.setAttribute('position',new THREE.Float32BufferAttribute([0,ftop-.5,fz+.05,bs1.x,bs1.y-.05,bs1.z-.2,0,hullH(.9)+.6,fz+.4],3));jg.setIndex([0,1,2]);jg.computeVertexNormals();M(jg,T(SKN.sail,{side:THREE.DoubleSide}),g);}
  M(sph(sk==='royal'?.22:.14,10,8),T(SKN.glow?'#5affb0':'#f0c040'),g,0,hullH(.985)-.12,ZB-.02);
  const fm=new THREE.Mesh(new THREE.RingGeometry(1,1.18,48),noOL(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false})));fm.rotation.x=-PI/2;fm.scale.set(2.05,4.7,1);fm.position.set(0,.04,.25);g.add(fm);
  const ship={g,fac:o.fac,skin:sk,rooms:new Map(),crew:[],rig,flag,fbase:fg.attributes.position.array.slice(),foam:fm,cap:o.cap,sinkT:0,sinking:false};
  o.layout.forEach((fl,f)=>fl.forEach((row,r)=>row.forEach((lv,c)=>{if(lv&&f<MAXF)makeRoom(ship,f,r,c,lv);})));
  updateRoofs(ship);
  ship.totalHp=[...ship.rooms.values()].reduce((a,b)=>a+b.max,0);
  (o.crew||[]).forEach(cd=>{const m=makeChar(cd.id);m.rotation.y=PI/2;m.scale.setScalar(.74);g.add(m);const st=stats(cd.id,cd.lv||1);
    const rm=ship.rooms.get(KEY(cd.f,cd.r,cd.c))||null;
    const cr={id:cd.id,def:CHM[cd.id],cls:CHM[cd.id].cls,lv:cd.lv||1,hp:st.hp,max:st.hp,dmg:st.dmg,alive:true,mesh:m,room:rm,r:cd.r,c:cd.c,vy:0,tip:0,ty:0};
    if(rm)m.position.set(rm.grp.position.x,rm.grp.position.y-H2+.06,rm.grp.position.z);else{cr.ty=standY(ship,cr.r,cr.c);m.position.set(cellX(cr.r),cr.ty,cellZ(cr.c));}
    ship.crew.push(cr);});
  return ship;}
function shipRatio(ship){let h=0;ship.rooms.forEach(r=>h+=Math.max(0,r.hp));return ship.totalHp?h/ship.totalHp:0;}
function animShip(ship,t,dt,i,battle){
  const ratio=battle?shipRatio(ship):1;const dir=ship.g.rotation.y?-1:1;
  if(ship.sinking)ship.sinkT=Math.min(3,ship.sinkT+dt*.6);
  ship.g.position.y=.07*Math.sin(t*1.1+i*1.9)-(1-ratio)*.3-ship.sinkT*.9;
  ship.g.rotation.x=.012*Math.sin(t*.9+i)+ship.sinkT*.08;ship.g.rotation.z=dir*(.02*Math.sin(t*1.2+i)+(1-ratio)*.07+ship.sinkT*.12);
  const ws=battle&&B?B.wind.s/16:.4;const p=ship.flag.geometry.attributes.position;for(let k=0;k<p.count;k++){const z=ship.fbase[k*3+2];p.array[k*3]=Math.sin(z*5+t*(4+ws*6))*(.03+.08*ws)*(-z);}p.needsUpdate=true;
  ship.foam.scale.set(2.05+Math.sin(t*2+i)*.03,4.7+Math.sin(t*2+i)*.06,1);ship.foam.material.opacity=.45+.15*Math.sin(t*2.4+i);
  ship.rooms.forEach(rm=>{const q=rm.grp.position;if(q.y>rm.ty+1e-3){rm.vy-=18*dt;q.y=Math.max(rm.ty,q.y+rm.vy*dt);if(q.y===rm.ty){rm.vy=0;if(battle&&B){SFX.wood(.8);B.shake=Math.max(B.shake,.3);const wp=ship.g.localToWorld(q.clone().add(new V3(0,-H2,0)));for(let k=0;k<6;k++)smokePuff(wp.clone().add(new V3(rand(-.6,.6),0,rand(-.6,.6))),rand(.14,.24),'#c8b498',new V3(rand(-.8,.8),rand(.1,.4),rand(-.8,.8)));}}}
    rm.grp.rotation.x+=(rm.tilt.x-rm.grp.rotation.x)*Math.min(1,dt*5);rm.grp.rotation.z+=(rm.tilt.z-rm.grp.rotation.z)*Math.min(1,dt*5);
    if(rm.fire){rm.fire.children.forEach((f,k)=>{f.scale.set(1,.7+Math.abs(Math.sin(t*9+k*1.7))*.7,1);});if(battle&&B&&Math.random()<dt*3)smokePuff(ship.g.localToWorld(rm.grp.position.clone().add(new V3(rand(-.3,.3),H2+.2,rand(-.3,.3)))),.2,rm.fire.userData.green?'#5aa080':'#5a5a60');}});
  ship.crew.forEach(c=>{const q=c.mesh.position;
    if(c.room){const rp=c.room.grp.position;q.set(rp.x,rp.y-H2+.06,rp.z);}
    else if(q.y>c.ty+1e-3){c.vy-=18*dt;q.y=Math.max(c.ty,q.y+c.vy*dt);if(q.y===c.ty)c.vy=0;}
    else if(q.y<c.ty)q.y=c.ty;
    if(!c.alive&&c.tip<1){c.tip=Math.min(1,c.tip+dt*2.2);c.mesh.rotation.z=c.tip*PI/2;}
    const sp=c.mesh.userData.spark;if(sp)sp.scale.setScalar(.7+Math.random()*.8);});
}

/* ================= ENVIRONMENT ================= */
function makeEnv(sc,o={}){
  sc.background=SKY;sc.fog=new THREE.Fog('#c4ecf8',38,120);
  sc.add(new THREE.HemisphereLight('#ffffff','#7fb6d2',.78));
  const sun=new THREE.DirectionalLight('#fff3dc',.9);sun.position.set(9,16,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  const c=sun.shadow.camera;c.left=-13;c.right=13;c.top=13;c.bottom=-13;c.near=1;c.far=60;sun.shadow.bias=-.0006;sc.add(sun);sc.add(sun.target);
  const env={upd:[]};
  if(o.water!==false){
    const wg=new THREE.PlaneGeometry(240,240,72,72);wg.rotateX(-PI/2);const w=new THREE.Mesh(wg,noOL(new THREE.MeshToonMaterial({color:'#25a8d8',gradientMap:GRAD})));w.receiveShadow=true;sc.add(w);const p=wg.attributes.position,base=p.array.slice();
    env.upd.push(t=>{for(let i=0;i<p.count;i++){const x=base[i*3],z=base[i*3+2];p.array[i*3+1]=.16*Math.sin(x*.45+t*1.3)+.12*Math.sin(z*.6+t*1.6)+.05*Math.sin((x+z)*1.3+t*2.2);}p.needsUpdate=true;wg.computeVertexNormals();});
    const sparkle=noOL(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}));const sp=[];for(let i=0;i<40;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.12),sparkle);m.rotation.x=-PI/2;m.position.set(rand(-30,30),.25,rand(-30,20));sc.add(m);sp.push([m,Math.random()*6]);}
    env.upd.push(t=>sp.forEach(([m,ph])=>{m.scale.x=.4+.6*Math.abs(Math.sin(t*.8+ph));}));
    island(sc,-30,-40,1.3);island(sc,36,-48,1.7);island(sc,-4,-74,2.4);island(sc,58,6,1.4);island(sc,-60,0,1.6);}
  const cl=[];for(const [x,y,z,s] of [[-24,17,-50,1.4],[22,20,-60,1.8],[-50,22,-20,1.5],[50,18,-25,1.3],[5,24,-85,2.2]]){const g=new THREE.Group();const m=noOL(T('#ffffff',{emissive:'#c8d6e8'}));
    for(const [a,b,cc,r] of [[0,0,0,2.2],[2.4,-.4,.4,1.7],[-2.3,-.5,0,1.6],[1,.9,.2,1.5],[-1,.7,-.4,1.4]])M(sph(r,12,10),m,g,a,b,cc).castShadow=false;g.position.set(x,y,z);g.scale.setScalar(s);sc.add(g);cl.push(g);}
  env.upd.push(t=>cl.forEach((g,i)=>{g.position.x+=(B&&cur==='battle'?B.wind.x*.003:Math.sin(t*.05+i)*.004);}));
  env.update=t=>env.upd.forEach(f=>f(t));return env;}
function palm(p,x,z,s,y0){const g=new THREE.Group();g.position.set(x,y0,z);g.scale.setScalar(s);p.add(g);const tr=T('#8a5a32'),lf=T('#3e9a3c');
  let px=0,py=0;for(let i=0;i<5;i++){M(cyl(.16-i*.015,.19-i*.015,.75,7),tr,g,px,py+.375,0).rotation.z=-.08*i;px+=.06*i;py+=.72;}
  for(let i=0;i<6;i++){const a=i/6*PI*2;const l=M(new THREE.ConeGeometry(.35,2.2,4),lf,g,px+Math.cos(a)*.9,py-.1,Math.sin(a)*.9);l.rotation.z=Math.cos(a)*1.9;l.rotation.x=-Math.sin(a)*1.9;l.scale.set(1,1,.3);}
  M(sph(.18,8,6),T('#6a4a22'),g,px,py-.15,0);}
function island(sc,x,z,s){const g=new THREE.Group();g.position.set(x,0,z);sc.add(g);
  M(cyl(5.2*s,6.6*s,1.4,12),T('#f3d69c'),g,0,.05,0);M(flat(new THREE.ConeGeometry(3.6*s,5.5*s,7)),T('#5cae48'),g,-.8*s,2.6*s,-.6*s);
  const rk=T('#8f949c');for(let i=0;i<4;i++)M(flat(new THREE.DodecahedronGeometry(rand(.5,1.1)*s)),rk,g,Math.cos(i*1.7)*4*s,.6,Math.sin(i*1.7)*4*s);
  palm(g,2.4*s,1.6*s,s*.9,.7);palm(g,3.2*s,-.4*s,s*.75,.7);palm(g,-3.4*s,2*s,s*.8,.7);}
function windStreaks(sc){const mat=noOL(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}));const geo=new THREE.PlaneGeometry(1.3,.04);const L=[];
  for(let i=0;i<50;i++){const m=new THREE.Mesh(geo,mat);const m2=new THREE.Mesh(geo,mat);m2.rotation.x=PI/2;m.add(m2);m.position.set(rand(-15,15),rand(1.5,8),rand(-10,10));sc.add(m);L.push(m);}
  return dt=>{const w=B.wind,s=w.s;mat.opacity=.12+s/16*.5;const ang=Math.atan2(w.z,w.x);L.forEach(m=>{m.rotation.y=-ang;m.scale.x=.4+s/16*1.8;m.position.x+=w.x*.7*dt;m.position.z+=w.z*.7*dt;
    if(m.position.x>15)m.position.x-=30;if(m.position.x<-15)m.position.x+=30;if(m.position.z>10)m.position.z-=20;if(m.position.z<-10)m.position.z+=20;});};}

/* ================= SCREENS ================= */
let cur='lobby';
const nav=$('#nav');
function setScreen(s){
  cur=s;document.querySelectorAll('.scr').forEach(e=>e.hidden=e.dataset.s!==s);
  nav.hidden=s==='battle';$('#topbar').hidden=s==='battle';$('#prof').hidden=s!=='lobby';
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.go===s||(s==='map'&&b.dataset.go==='lobby')));
  if(s==='lobby')enterLobby();if(s==='build')enterBuild();if(s==='crew')renderCrew();if(s==='shop')enterShop();if(s==='map')renderMap();
  resize();}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b){SFX.click();setScreen(b.dataset.go);}});
function refreshRes(){$('#rGem').textContent=S.gem;$('#rGold').textContent=S.gold;}
let toastT=0;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1400);}
const RBG={
 c:'linear-gradient(160deg,#c3ccd8,#8794aa)',
 r:'repeating-linear-gradient(45deg,rgba(255,255,255,.13) 0 5px,transparent 5px 11px),radial-gradient(circle at 50% 45%,#8fd0ff,#3a7fe0 60%,#1f4aa8)',
 l:'radial-gradient(circle at 22% 20%,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle at 80% 30%,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle at 70% 82%,#fff 0 1.2px,transparent 2px),repeating-conic-gradient(from 0deg at 50% 52%,rgba(255,255,255,.28) 0 7deg,transparent 7deg 18deg),radial-gradient(circle at 50% 50%,#fff2a8,#ffc23a 45%,#e07a10 85%)'};
const cardBg=id=>RBG[CHM[id].rar];
const FICO={pirate:'☠',navy:'⚓',neutral:'🍃'},FNAME={pirate:'해적',navy:'해군',neutral:'중립'},RSTAR={c:'★',r:'★★',l:'★★★'};
const facB=id=>'<span class="fb fb-'+CHM[id].fac+'" title="'+FNAME[CHM[id].fac]+'">'+FICO[CHM[id].fac]+'</span>';
function ensurePlace(){const used=new Set(),has=p=>p&&S.layout[p.f]&&S.layout[p.f][p.r]&&S.layout[p.f][p.r][p.c]>0;
  S.equip.forEach(id=>{const p=S.place[id];const k=p&&KEY(p.f,p.r,p.c);if(!has(p)||used.has(k))S.place[id]=null;else used.add(k);});
  S.equip.forEach(id=>{if(S.place[id])return;for(let f=0;f<MAXF&&!S.place[id];f++)for(let r=0;r<3&&!S.place[id];r++)for(let c=0;c<4&&!S.place[id];c++){const k=KEY(f,r,c);if(S.layout[f][r][c]&&!used.has(k)){S.place[id]={f,r,c};used.add(k);}}});}
const placedCrew=()=>{ensurePlace();return S.equip.map(id=>({id,lv:S.owned[id].lv,...S.place[id]}));};

/* ----- LOBBY ----- */
const LB={};
function buildLobbyScene(){const sc=new THREE.Scene();LB.env=makeEnv(sc);LB.sc=sc;LB.cam=new THREE.PerspectiveCamera(48,1,.1,400);
  const pier=new THREE.Group();pier.position.set(5.9,0,1.2);sc.add(pier);const pd=T('#7a4a24');
  for(let i=0;i<7;i++)M(box(.56,.12,4.6),i%2?T('#a8713e'):T('#b98049'),pier,-1.6+i*.56,.62,0);
  for(const x of [-1.8,1.8])for(const z of [-2.1,2.1])M(cyl(.12,.14,1.6,8),pd,pier,x,.1,z);M(box(.15,.15,4.8),pd,pier,1.95,.6,0);
  LB.pier=pier;LB.ship=null;LB.crew=[];LB.az=.62;LB.drag=null;}
function enterLobby(){if(!LB.sc)buildLobbyScene();
  if(LB.ship)LB.sc.remove(LB.ship.g);LB.ship=makeShip({fac:'pirate',skin:S.skin,layout:S.layout,crew:[],sails:'full'});LB.sc.add(LB.ship.g);
  LB.crew.forEach(m=>LB.pier.remove(m));LB.crew=[];
  S.equip.forEach((id,i)=>{const bar=new THREE.Group();bar.position.set(.8,.68,-1.5+i*1.0);LB.pier.add(bar);M(cyl(.3,.3,.52,14),T('#8a5228'),bar,0,.26,0);for(const y of [.08,.44])M(cyl(.315,.315,.06,14),T('#3a3e48'),bar,0,y,0);
    M(box(.02,.34,.24),T(id===S.cap?'#f0c040':'#c8382d'),bar,.32,.2,0);const m=makeChar(id);m.position.y=.52;m.rotation.y=.95-(i-1.5)*.08;bar.add(m);LB.crew.push(bar);});
  $('#profImg').src=PORT[S.cap];$('#lbNum').lastChild.textContent='1';$('#lbFill').style.width=(S.stage/6*100)+'%';$('#lbTxt').textContent='⚓ '+S.stage+' / 6';$('#lbNext').src=PORT.alex;$('#lbNext').parentElement.style.background=FACBG.navy;
  $('#lbChestN').textContent='보물상자 ×'+S.chests;}
function renderDaily(){const d=$('#daily');d.innerHTML='';S.daily.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','일일 상자 '+(i+1));
  b.innerHTML='<svg class="ico"><use href="#'+(i===2?'i-chest-b':i===4?'i-chest-g':'i-chest-w')+'"/></svg>'+(v===1?'<svg class="ck"><use href="#i-check"/></svg>':'');if(v===2)b.className='ready';
  b.onclick=()=>{if(S.daily[i]!==2)return toast(S.daily[i]===1?'이미 받았어요':'내일 열 수 있어요');S.daily[i]=1;S.gold+=150;refreshRes();renderDaily();SFX.magic();toast('금화 +150 · 목재 +40');};d.appendChild(b);});}
$('#btnGo').onclick=()=>startBattle(Math.min(S.stage,STAGES.length-1));
$('#lbChest').onclick=()=>setScreen('shop');
$('#lbProg').onclick=()=>{SFX.click();mpSel=null;setScreen('map');};
function updLobby(dt,t){if(!LB.drag)LB.az+=Math.sin(t*.25)*.0008;const d=22,tg=new V3(1.8,.9,.6);LB.cam.position.set(tg.x+Math.cos(LB.az)*d,7.8,tg.z+Math.sin(LB.az)*d);LB.cam.lookAt(tg);LB.env.update(t);animShip(LB.ship,t,dt,0,false);}

/* ----- BUILD ----- */
const BD={row:0,sel:null};
function buildBuildScene(){const sc=new THREE.Scene();sc.background=new THREE.Color('#2c66cc');BD.sc=sc;
  sc.add(new THREE.HemisphereLight('#ffffff','#5a7fc0',.82));const sun=new THREE.DirectionalLight('#ffffff',.8);sun.position.set(10,14,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);const c=sun.shadow.camera;c.left=-8;c.right=8;c.top=8;c.bottom=-8;sc.add(sun);
  sc.add(new THREE.GridHelper(80,80,0x6b9ef0,0x4f86e2));const gr2=new THREE.GridHelper(80,16,0x8ab4f6,0x8ab4f6);gr2.position.y=.01;sc.add(gr2);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(80,80),noOL(new THREE.MeshToonMaterial({color:'#2c66cc',gradientMap:GRAD})));fl.rotation.x=-PI/2;fl.position.y=-.01;fl.receiveShadow=true;sc.add(fl);
  BD.cam=new THREE.PerspectiveCamera(40,1,.1,200);}
function enterBuild(){if(!BD.sc)buildBuildScene();ensurePlace();rebuildBuild();}
function rebuildBuild(){
  if(BD.ship)BD.sc.remove(BD.ship.g);
  BD.ship=makeShip({fac:'pirate',skin:S.skin,layout:S.layout,crew:placedCrew(),sails:'furled'});BD.ship.g.position.y=1.12;BD.ship.g.remove(BD.ship.foam);BD.sc.add(BD.ship.g);
  const r=BD.row;
  BD.ship.rooms.forEach(rm=>{rm.grp.visible=rm.r===r;if(rm.r===r){rm.walls[0].userData.orig=rm.walls[0].material;rm.walls[0].material=ghostOf(rm.walls[0].material,.2);}});
  BD.ship.crew.forEach(c=>c.mesh.visible=!!c.room&&c.room.r===r);
  const gm=noOL(new THREE.MeshBasicMaterial({color:0x7fe8ff,transparent:true,opacity:.28,depthWrite:false}));BD.cells=[];const full=layoutCount()>=MAXB;
  for(let c=0;c<4;c++){const top=colTop(BD.ship,r,c);for(let f=0;f<=top;f++)BD.cells.push({type:'b',f,c,rm:BD.ship.rooms.get(KEY(f,r,c))});
    if(top<MAXF-1&&!full){const f=top+1;const gh=new THREE.Mesh(GHOSTBOX,gm);gh.position.set(cellX(r),roomY(f),cellZ(c));gh.add(new THREE.LineSegments(new THREE.EdgesGeometry(GHOSTBOX),new THREE.LineBasicMaterial({color:0xffffff})));BD.ship.g.add(gh);BD.cells.push({type:'g',f,c});}}
  $('#bdCount').textContent=BD.ship.rooms.size+'/'+MAXB;
  document.querySelectorAll('#bdTabs button').forEach(b=>{const rr=+b.dataset.r;b.classList.toggle('on',rr===r);const n=countUp(rr);b.innerHTML=['앞줄','중간줄','뒷줄'][rr]+(n?'<span class="bdg">'+n+'</span>':'');});
  updNavBadge();BD.labelsDirty=true;renderBdPanel();}
function countUp(r){let n=0;S.layout.forEach(fl=>fl[r].forEach(lv=>{if(lv&&lv<5){const k=roomCost(lv);if(S.gold>=k.gold)n++;}}));return Math.min(n,9);}
function updNavBadge(){const n=Math.min(9,countUp(0)+countUp(1)+countUp(2));$('#navBadge').hidden=!n;$('#navBadge').textContent=n;}
document.querySelectorAll('#bdTabs button').forEach(b=>b.onclick=()=>{SFX.click();BD.row=+b.dataset.r;BD.sel=null;rebuildBuild();});
const SKP={};
function makeSkinPreviews(){const pr=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});pr.setPixelRatio(1);pr.setSize(300,210);pr.setClearColor(0,0);const pe=OE?new OE(pr,{defaultThickness:.004,defaultColor:[.08,.05,.04]}):null;
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#7fb6d2',.8));const dl=new THREE.DirectionalLight('#fff3dc',.9);dl.position.set(6,10,8);sc.add(dl);const cam=new THREE.PerspectiveCamera(32,300/210,.1,100);cam.position.set(13,5.5,9);cam.lookAt(0,1.8,0);
  for(const k in SKINS){const s=makeShip({fac:'pirate',skin:k,layout:defLayout(),crew:[],sails:'full'});s.g.remove(s.foam);sc.add(s.g);(pe||pr).render(sc,cam);SKP[k]=pr.domElement.toDataURL();sc.remove(s.g);}pr.dispose();}
function openSkins(){const M2=$('#bdSkinM');let h='<div class="skm"><h3 class="tx">배 스킨</h3><div class="skl">';
  for(const k in SKINS){const K=SKINS[k],own=S.skins[k],on=S.skin===k;const pr=K.price?(K.price.gold?'<svg class="ico"><use href="#i-coin"/></svg>'+K.price.gold:'<svg class="ico"><use href="#i-gem"/></svg>'+K.price.gem):'';
    h+='<button type="button" class="sk'+(on?' on':'')+'" data-k="'+k+'"><img src="'+SKP[k]+'" alt=""><span class="nm tx">'+K.n+'</span><span class="ds">'+K.desc+'</span><span class="st tx">'+(on?'장착 중':own?'선택':pr)+'</span></button>';}
  h+='</div><button type="button" class="btn btn-y" id="skClose" style="height:11cqw;padding:0 10cqw;font-size:5cqw"><span class="tx">닫기</span></button></div>';M2.innerHTML=h;
  M2.querySelectorAll('.sk').forEach(b=>b.onclick=()=>{const k=b.dataset.k,K=SKINS[k];if(!S.skins[k]){const p=K.price;if(p.gold){if(S.gold<p.gold)return toast('금화가 부족해요');S.gold-=p.gold;}else{if(S.gem<p.gem)return toast('보석이 부족해요');S.gem-=p.gem;}S.skins[k]=1;refreshRes();SFX.magic();toast(K.n+' 획득!');}
    S.skin=k;SFX.click();rebuildBuild();openSkins();});
  $('#skClose').onclick=()=>{M2.innerHTML='';};}
$('#bdSkin').onclick=()=>{SFX.click();openSkins();};
$('#bdRebuild').onclick=()=>{S.layout=defLayout();BD.sel=null;ensurePlace();rebuildBuild();SFX.wood(1);toast('기본 구조로 다시 지었어요');};
function layoutCount(){let n=0;S.layout.forEach(fl=>fl.forEach(row=>row.forEach(v=>{if(v)n++;})));return n;}
function placeLabels(){
  const Lb=$('#bdLabels');Lb.innerHTML='';const W=phone.clientWidth,H=phone.clientHeight,r=BD.row;BD.sc.updateMatrixWorld(true);
  BD.cells.forEach(cell=>{const p=BD.ship.g.localToWorld(new V3(cellX(r)+H2+.02,roomY(cell.f),cellZ(cell.c))).project(BD.cam);
    const el=document.createElement('div');el.style.left=((p.x+1)/2*W)+'px';el.style.top=((1-p.y)/2*H)+'px';el.style.position='absolute';
    if(cell.type==='g'){el.className='bl-g';el.innerHTML='<span class="cost tx"><svg class="ico"><use href="#i-coin"/></svg>'+BUILD_COST+'</span><span class="plus">+</span>';
      el.onclick=()=>{if(layoutCount()>=MAXB)return toast('선실은 최대 '+MAXB+'칸까지예요');if(S.gold<BUILD_COST)return toast('금화가 부족해요');S.gold-=BUILD_COST;S.layout[cell.f][r][cell.c]=1;refreshRes();SFX.wood(1);rebuildBuild();toast('선실을 지었어요');};}
    else{const lv=cell.rm.lv,k=roomCost(lv),can=lv<5&&S.gold>=k.gold;const crewHere=S.equip.find(id=>{const p=S.place[id];return p&&p.f===cell.f&&p.r===r&&p.c===cell.c;});
      el.className='bl-b'+(BD.sel&&BD.sel.f===cell.f&&BD.sel.c===cell.c?' sel':'');el.dataset.c=cell.c;el.dataset.f=cell.f;
      el.innerHTML='<div class="cost tx">'+(lv<5?'<span><svg class="ico"><use href="#i-coin"/></svg>'+k.gold+'</span>':'<span>최대</span>')+'<span class="lv">Lv.'+lv+'</span></div>'+(can?'<svg class="up"><use href="#i-arrow"/></svg>':'')+(crewHere?'<img class="pt" style="--c:'+cardBg(crewHere)+'" src="'+PORT[crewHere]+'" alt="">':'');
      el.onclick=()=>{SFX.click();BD.sel={f:cell.f,c:cell.c};placeLabels();renderBdPanel();};}
    Lb.appendChild(el);});
  BD.labelsDirty=false;}
function renderBdPanel(){const P=$('#bdPanel');
  if(BD.sel){const lv=S.layout[BD.sel.f][BD.row][BD.sel.c];if(!lv){BD.sel=null;return renderBdPanel();}const k=roomCost(lv);
    P.innerHTML='<div class="bd-up"><button class="close" type="button" aria-label="닫기">✕</button><span class="k tx">선실 업그레이드</span><span></span><div class="vbox tx">Lv.'+lv+' <span style="color:var(--gg)">➜</span> '+(lv<5?'Lv.'+(lv+1):'최대')+'</div>'+
      '<button class="btn btn-y" type="button" '+(lv>=5?'disabled':'')+'><span class="tx">업그레이드</span></button><div class="vbox tx"><svg class="ico"><use href="#i-coin"/></svg>'+k.gold+'</div>'+
      '<span class="bd-hint" style="grid-column:1/-1">체력 '+roomHp(lv)+(lv<5?' → '+roomHp(lv+1):'')+' · 벽이 '+(lv+1>=4?'철판으로':'튼튼한 나무로')+' 바뀌어 안의 동료를 더 오래 지킵니다</span></div>';
    P.querySelector('.close').onclick=()=>{BD.sel=null;placeLabels();renderBdPanel();};
    P.querySelector('.btn').onclick=()=>{if(lv>=5)return;if(S.gold<k.gold)return toast('금화가 부족해요');S.gold-=k.gold;S.layout[BD.sel.f][BD.row][BD.sel.c]=lv+1;refreshRes();SFX.magic();rebuildBuild();toast('Lv.'+(lv+1)+' 선실이 되었어요');};return;}
  P.innerHTML='<div class="bd-heroes"><div class="bd-tray">'+S.equip.map(id=>'<div class="card rr-'+CHM[id].rar+(S.place[id]&&S.place[id].r===BD.row?' placed':'')+'" data-id="'+id+'" style="--c:'+cardBg(id)+'"><img src="'+PORT[id]+'" alt="'+CHM[id].n+'">'+facB(id)+'<span class="lvb tx">Lv.'+S.owned[id].lv+'</span></div>').join('')+'</div><span class="bd-hint">동료를 끌어다 선실에 놓으면 그 안에 숨습니다</span></div>';
  P.querySelectorAll('.card').forEach(el=>el.addEventListener('pointerdown',ev=>startDrag(ev,el.dataset.id)));}
function startDrag(ev,id){ev.preventDefault();const pr=phone.getBoundingClientRect();const gh=document.createElement('div');gh.className='dragghost';gh.style.setProperty('--c',cardBg(id));gh.innerHTML='<img src="'+PORT[id]+'" alt="">';$('#ui').appendChild(gh);
  const mv=e=>{gh.style.left=(e.clientX-pr.left)+'px';gh.style.top=(e.clientY-pr.top)+'px';};mv(ev);
  const up=e=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);gh.remove();
    let tgt=null,best=phone.clientWidth*.16;document.querySelectorAll('#bdLabels .bl-b').forEach(x=>{const rc=x.getBoundingClientRect();const d=Math.hypot(rc.left+rc.width/2-e.clientX,rc.top+rc.height/2-e.clientY);if(d<best){best=d;tgt=x;}});
    if(!tgt)return toast('선실 위에 놓아 주세요');const np={f:+tgt.dataset.f,r:BD.row,c:+tgt.dataset.c};const other=S.equip.find(o=>o!==id&&S.place[o]&&S.place[o].f===np.f&&S.place[o].r===np.r&&S.place[o].c===np.c);
    if(other)S.place[other]=S.place[id]?{...S.place[id]}:null;S.place[id]=np;SFX.click();rebuildBuild();toast(CHM[id].s+'(이)가 선실에 숨었어요');};
  window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);}
function updBuild(dt,t){const cy=1.12+DECK+1.3;BD.cam.position.set(12.5,cy+3.4,2.6);BD.cam.lookAt(0,cy,0);animShip(BD.ship,t,dt,0,false);BD.ship.g.position.y+=1.12;if(BD.labelsDirty)placeLabels();}

/* ----- CREW ----- */
let crSel='bargo',crSwap=null;
function renderCrew(){
  const el=$('#cr');const id=crSel,c=CHM[id],own=S.owned[id],lv=own?own.lv:1,st=stats(id,lv),nx=stats(id,lv+1),k=CLS[c.cls];const need=shNeed(lv),eq=S.equip.includes(id);
  let h='';if(crSwap)h+='<div class="cr-swap">'+CHM[crSwap].s+'와(과) 바꿀 장착 동료를 누르세요</div>';
  h+='<div class="cr-top"><div class="cr-name tx">'+c.n+'</div><div class="chips"><span class="chip c-'+c.rar+' tx">'+RSTAR[c.rar]+' '+RAR[c.rar].n+'</span><span class="chip f-'+c.fac+' tx">'+FICO[c.fac]+' '+FNAME[c.fac]+'</span><span class="chip k tx">'+k.ic+' '+k.n+'</span></div><div class="cr-main">'+
   '<div class="cr-card rr-'+c.rar+'" style="--c:'+cardBg(id)+'"><img src="'+PORT[id]+'" alt="">'+facB(id)+'<span class="lvb tx">Lv.'+lv+'</span>'+(own?'<div class="shard"><b style="width:'+Math.min(100,own.sh/need*100)+'%"></b><span class="tx">'+own.sh+'/'+need+'</span></div>':'')+'</div>'+
   '<div class="cr-role"><span><b>⚡</b> '+c.tr.t+'</span><span><b>👍</b> '+k.pros+'</span><span><b>👎</b> '+k.cons+'</span>'+(c.cap?'<span><b>👑</b> 선장: '+c.cap+'</span>':'')+'</div></div>'+
   '<div class="stats">'+[['❤️','체력',st.hp,nx.hp-st.hp],['⚔️','피해',st.dmg,nx.dmg-st.dmg],['🔸','발수',st.proj,0],['🎯','정확도',st.acc+'%',.4],['💥','반경',st.rad,.02],[k.ic,'클래스',k.n,0]].map(([i,n,v,d])=>'<div class="stat"><span class="si">'+i+'</span><b class="tx">'+v+(own&&d?'<i>+'+d+'</i>':'')+'</b><small>'+n+'</small></div>').join('')+'</div>'+
   '<div class="cr-acts">'+(own?'<button class="btn btn-'+(own.sh>=need&&S.gold>=upCost(lv)?'g':'b')+'" type="button" data-a="up"><span class="tx">업그레이드</span><small class="tx"><svg class="ico"><use href="#i-coin"/></svg>'+upCost(lv)+'</small></button>'+
     (eq?(S.cap===id?'<button class="btn btn-y" type="button" disabled><span>👑 현재 선장</span></button>':'<button class="btn btn-y" type="button" data-a="cap"><span>선장 임명</span></button>'):'<button class="btn btn-o" type="button" data-a="eq"><span class="tx">장착</span></button>'):'<button class="btn btn-b" type="button" disabled><span class="tx">상자에서 획득</span></button>')+'</div></div>';
  const card=(i,cls)=>{const o=S.owned[i];return '<div class="card rr-'+CHM[i].rar+' '+cls+(i===crSel?' on':'')+'" data-id="'+i+'" style="--c:'+cardBg(i)+'"><img src="'+PORT[i]+'" alt="'+CHM[i].n+'">'+facB(i)+(o?'<span class="lvb tx">Lv.'+o.lv+'</span><div class="shard"><b style="width:'+Math.min(100,o.sh/shNeed(o.lv)*100)+'%"></b><span class="tx">'+o.sh+'/'+shNeed(o.lv)+'</span></div>':'')+(S.cap===i?'<span class="capm">👑</span>':'')+'</div>';};
  h+='<div class="cr-h tx">장착됨</div><div class="cr-grid">'+S.equip.map(i=>card(i,'')).join('')+'</div>';
  const col=Object.keys(S.owned).filter(i=>!S.equip.includes(i));
  h+='<div class="cr-h tx">컬렉션</div><div class="cr-grid">'+(col.length?col.map(i=>card(i,'')).join(''):'<span class="bd-hint">상자에서 동료를 더 모아보세요</span>')+'</div>';
  h+='<div class="cr-h tx">잠김</div><div class="cr-grid">'+CH.filter(x=>!S.owned[x.id]).map(x=>card(x.id,'locked')).join('')+'</div>';
  el.innerHTML=h;
  el.querySelectorAll('.cr-grid .card').forEach(x=>x.onclick=()=>{const i=x.dataset.id;SFX.click();
    if(crSwap&&S.equip.includes(i)){const k2=S.equip.indexOf(i);S.equip[k2]=crSwap;S.place[crSwap]=S.place[i]?{...S.place[i]}:null;delete S.place[i];if(S.cap===i)S.cap=S.equip.find(e=>CHM[e].rar==='l')||S.equip[0];crSel=crSwap;crSwap=null;toast('장착을 바꿨어요');return renderCrew();}
    crSwap=null;crSel=i;renderCrew();});
  el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;
    if(a==='up'){if(own.sh<need)return toast('조각이 '+(need-own.sh)+'개 더 필요해요');if(S.gold<upCost(lv))return toast('금화가 부족해요');S.gold-=upCost(lv);own.sh-=need;own.lv++;refreshRes();SFX.magic();toast(c.s+' Lv.'+own.lv+'!');}
    if(a==='cap'){S.cap=id;SFX.magic();toast(c.s+'을(를) 선장으로 임명했어요');}
    if(a==='eq')crSwap=id;
    renderCrew();});}

/* ----- SHOP ----- */
const SH={};
function buildShopScene(){const sc=new THREE.Scene();SH.env=makeEnv(sc);SH.sc=sc;SH.cam=new THREE.PerspectiveCamera(42,1,.1,300);
  const isl=new THREE.Group();sc.add(isl);M(cyl(2.6,3.2,.8,14),T('#f3d69c'),isl,0,.1,0);palm(isl,-1.6,-1.2,.7,.5);palm(isl,1.9,-1.4,.55,.5);
  for(let i=0;i<7;i++)M(cyl(.12,.12,.04,12),T('#ffcc2e'),isl,rand(-1.2,1.2),.52,rand(.4,1.4)).rotation.x=rand(-.3,.3);SH.isl=isl;SH.chest=null;}
function makeChest(k){const g=new THREE.Group();const gold=k==='gold';const wood=T(gold?'#e3a02a':'#9a5a2c'),band=T(gold?'#fff1b0':'#f0c040');
  M(box(1.2,.6,.8),wood,g,0,.3,0);for(const x of [-.38,.38])M(box(.12,.62,.83),band,g,x,.3,0);M(box(1.24,.08,.84),T('#3a1d08'),g,0,.04,0);
  const lid=new THREE.Group();lid.position.set(0,.6,-.4);g.add(lid);M(new THREE.CylinderGeometry(.4,.4,1.2,18,1,false,0,PI),wood,lid,0,0,.4).rotation.z=PI/2;
  for(const x of [-.38,.38])M(new THREE.CylinderGeometry(.415,.415,.12,18,1,false,0,PI),band,lid,x,0,.4).rotation.z=PI/2;
  M(box(.16,.2,.06),T(gold?'#e04a8a':'#ffd95a'),g,0,.55,.42);
  const gl=new THREE.Mesh(sph(.6,16,12),noOL(new THREE.MeshBasicMaterial({color:0xfff2a0,transparent:true,opacity:0,depthWrite:false})));gl.position.y=.7;g.add(gl);return{g,lid,glow:gl};}
function enterShop(){if(!SH.sc)buildShopScene();setChest('wood');$('#shPity').textContent='전설 확정까지 '+S.pity+'회';$('#shReveal').innerHTML='';SH.anim=null;}
function setChest(k){if(SH.chest)SH.isl.remove(SH.chest.g);SH.chest=makeChest(k);SH.chest.g.position.y=.5;SH.isl.add(SH.chest.g);SH.kind=k;}
document.querySelectorAll('.sh-opt').forEach(b=>b.onclick=()=>{if(SH.anim)return;const k=b.dataset.k;
  if(k==='wood'){if(S.chests>0)S.chests--;else if(S.gold>=300)S.gold-=300;else return toast('금화가 부족해요');}else{if(S.gem<10)return toast('보석이 부족해요');S.gem-=10;}
  refreshRes();setChest(k);SH.anim={t:0,res:roll(k)};});
function roll(k){S.pity--;let r;const x=Math.random()*100;if(S.pity<=0){r='l';S.pity=50;}else if(k==='gold')r=x<15?'l':'r';else r=x<2?'l':x<20?'r':'c';
  const c=pick(CH.filter(c=>c.rar===r));const isNew=!S.owned[c.id];if(isNew)S.owned[c.id]={lv:1,sh:0};else S.owned[c.id].sh+=r==='l'?3:r==='r'?2:1;
  $('#shPity').textContent='전설 확정까지 '+S.pity+'회';return{id:c.id,isNew};}
function updShop(dt,t){SH.env.update(t);SH.cam.position.set(0,2.4,5.6);SH.cam.lookAt(0,1.0,0);const ch=SH.chest;if(!ch)return;ch.g.rotation.y=Math.sin(t*.6)*.25;
  if(SH.anim){const a=SH.anim;a.t+=dt;
    if(a.t<1){ch.g.rotation.z=Math.sin(a.t*40)*.08*a.t;ch.g.position.y=.5+Math.abs(Math.sin(a.t*12))*.08;if(!a.s1){a.s1=1;SFX.creak(.3);}}
    else{if(!a.s2){a.s2=1;SFX.magic();}ch.g.rotation.z=0;const o=Math.min(1,(a.t-1)/.35);ch.lid.rotation.x=-1.9*o;ch.glow.material.opacity=Math.max(0,.9-(a.t-1)*.6);ch.glow.scale.setScalar(1+o*3);}
    if(a.t>1.5&&!a.shown){a.shown=1;showReveal(a.res);}}}
function showReveal(res){const c=CHM[res.id],o=S.owned[res.id];const R=$('#shReveal');
  R.innerHTML='<div class="reveal"><span class="rr tx" style="--rc:'+RAR[c.rar].col+'">'+RAR[c.rar].n+'</span><div class="rc" style="--rc:'+RAR[c.rar].col+';--c:'+cardBg(res.id)+'">'+facB(res.id)+(res.isNew?'<span class="new tx">신규!</span>':'')+'<img src="'+PORT[res.id]+'" alt=""></div><span class="rn tx">'+c.n+'</span><span class="rs">'+c.sig+'</span><span class="rs">'+(res.isNew?'새 동료를 얻었어요':'조각 '+o.sh+'/'+shNeed(o.lv))+'</span><button class="btn btn-y" type="button" style="height:12cqw;padding:0 10cqw;font-size:5.4cqw"><span class="tx">확인</span></button></div>';
  R.querySelector('button').onclick=()=>{R.innerHTML='';SH.anim=null;setChest(SH.kind);};}

/* ----- MAP ----- */
let mpSel=null;
function renderMap(){const el=$('#mp');const pts=[[30,150],[64,128],[34,104],[70,84],[38,62],[62,38]];const pth=pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
  let s='<svg viewBox="0 0 100 190" preserveAspectRatio="xMidYMid slice"><defs><pattern id="wv" width="16" height="10" patternUnits="userSpaceOnUse"><path d="M0 6q4-4 8 0t8 0" fill="none" stroke="rgba(255,255,255,.25)" stroke-width=".8"/></pattern></defs><rect width="100" height="190" fill="#3fb3df"/><rect width="100" height="190" fill="url(#wv)"/>';
  for(const [x,y,r] of [[12,40,9],[88,70,11],[10,120,8],[90,150,9],[86,20,7]])s+='<ellipse cx="'+x+'" cy="'+y+'" rx="'+r+'" ry="'+r*.7+'" fill="#f3d69c" stroke="#c9a464" stroke-width=".8"/><ellipse cx="'+(x-1)+'" cy="'+(y-1.5)+'" rx="'+r*.55+'" ry="'+r*.38+'" fill="#5cae48"/>';
  s+='<path d="'+pth+'" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2.5 2.5" stroke-linecap="round" opacity=".9"/>';
  pts.forEach((p,i)=>{const done=i<S.stage,curN=i===S.stage,lock=i>S.stage,boss=STAGES[i].boss;
    s+='<g class="node" data-i="'+i+'" transform="translate('+p[0]+' '+p[1]+')"><ellipse rx="9" ry="6.5" fill="#f3d69c" stroke="#13203a" stroke-width="1"/><ellipse cx="-1" cy="-1.3" rx="5.4" ry="3.6" fill="'+(lock?'#8aa08a':'#5cae48')+'"/>'+
     '<circle cy="-7" r="'+(boss?5.4:4.4)+'" fill="'+(boss?'#2b2f3c':done?'#58cf4b':curN?'#ffd23a':'#8a96a8')+'" stroke="#13203a" stroke-width="1"/><text y="'+(boss?-5:-5.4)+'" text-anchor="middle" font-size="'+(boss?5:4.6)+'" font-family="Black Han Sans,sans-serif" fill="'+(curN?'#2a1a00':'#fff')+'">'+(boss?'☠':(i+1))+'</text>'+
     (done?'<text y="6" text-anchor="middle" font-size="3.6" fill="#ffd23a" stroke="#13203a" stroke-width=".3">★★★</text>':'')+(curN?'<g transform="translate(9 -4)"><use href="#i-ship" width="9" height="9"/></g>':'')+'</g>';});
  s+='</svg><button class="btn btn-b mp-back" type="button" id="mpBack"><span class="tx">← 돌아가기</span></button><div class="tx" style="position:absolute;top:19cqw;left:0;right:0;text-align:center;font-size:7cqw">카리브 해</div>';
  const i=mpSel==null?Math.min(S.stage,5):mpSel,st=STAGES[i],lock=i>S.stage;
  s+='<div class="mp-card"><div class="row"><h3>'+(i+1)+'. '+st.name+'</h3><span class="rw"><svg class="ico"><use href="#i-coin"/></svg>'+(210+i*80)+'</span></div><p>상대: '+st.ship+' · 동료 '+st.crew.length+'명'+(st.boss?' · 보스':'')+'</p><div class="row"><span style="display:flex;gap:1cqw">'+st.crew.map(c=>'<img src="'+PORT[c]+'" style="width:10cqw;height:10cqw;border-radius:1.4cqw;border:.5cqw solid #13203a;background:'+cardBg(c)+'" alt="">').join('')+'</span><button class="btn btn-y" type="button" '+(lock?'disabled':'')+'><span class="tx">'+(lock?'잠김':'출항!')+'</span></button></div></div>';
  el.innerHTML=s;el.querySelectorAll('.node').forEach(n=>n.onclick=()=>{mpSel=+n.dataset.i;SFX.click();renderMap();});
  el.querySelector('.mp-card .btn').onclick=()=>{if(!lock)startBattle(i);};$('#mpBack').onclick=()=>{SFX.click();setScreen('lobby');};}

/* ================= BATTLE ================= */
let B=null;
const WK=.09;
function autoPlace(layout,crew){const cells=[];layout.forEach((fl,f)=>fl.forEach((row,r)=>row.forEach((lv,c)=>{if(lv&&f<MAXF)cells.push({f,r,c,k:Math.random()});})));cells.sort((a,b)=>a.k-b.k);return crew.map((cr,i)=>({...cr,...cells[i%cells.length]}));}
function newWind(){const a=rand(0,PI*2),s=Math.round(rand(2,16)*10)/10;B.wind={x:Math.cos(a)*s,z:Math.sin(a)*s,s};}
function startBattle(si){
  const st=STAGES[si];if(B)disposeBattle();
  const sc=new THREE.Scene();const env=makeEnv(sc);const capE=st.crew.find(c=>CHM[c].rar==='l');
  const A=makeShip({fac:'pirate',skin:S.skin,layout:S.layout,crew:placedCrew(),sails:'furled',cap:S.cap});
  const E=makeShip({fac:st.fac,layout:st.layout,crew:autoPlace(st.layout,st.crew.map(id=>({id,lv:1+Math.floor(si/2)}))),sails:'furled',cap:capE});
  A.g.position.x=-6.6;E.g.position.x=6.6;E.g.rotation.y=PI;A.side=0;E.side=1;A.baseX=-6.6;E.baseX=6.6;sc.add(A.g,E.g);
  const cam=new THREE.PerspectiveCamera(55,1,.03,400);sc.add(cam);
  B={si,st,sc,env,cam,ships:[A,E],phase:'intro',pt:0,turn:1,sel:0,yaw:0,baseYaw:0,ang:{},power:0,projs:[],fx:[],timer:30,eIdx:0,shake:0,slow:0,rc:0,cp:new V3(),cl:new V3(),snap:true,vm:null,pull:null,dmg:[],known:[new Set(),new Set()],prepped:false,pred:null,done:0,ePow:0,wind:{x:0,z:0,s:0}};
  newWind();B.streaks=windStreaks(sc);
  B.sel=Math.max(0,A.crew.findIndex(c=>c.id===S.cap));
  $('#bName1').textContent=st.ship;$('#bResult').innerHTML='';$('#bDmg').innerHTML='';$('#bSling').innerHTML='';['#bIntro','#bBanMe','#bBanEn'].forEach(id=>banner(id,false));
  buildBattleHud();setScreen('battle');resize();}
function disposeBattle(){B=null;}
function buildBattleHud(){
  [0,1].forEach(si=>{$('#bCl'+si).innerHTML=B.ships[si].crew.map(c=>'<div class="m" style="--c:'+cardBg(c.id)+'"><img src="'+PORT[c.id]+'" alt=""><i><b style="width:100%"></b></i></div>').join('');});
  const pk=$('#bPick');pk.innerHTML='';B.ships[0].crew.slice().reverse().forEach(c=>{const i=B.ships[0].crew.indexOf(c);const b=document.createElement('button');b.type='button';b.style.setProperty('--c',cardBg(c.id));b.className='rr-'+c.def.rar;b.setAttribute('aria-label',c.def.n);
    b.innerHTML='<img src="'+PORT[c.id]+'" alt="">'+facB(c.id)+'<span class="lvb tx">Lv.'+c.lv+'</span><span class="cls">'+CLS[c.cls].ic+'</span>';
    b.onclick=()=>{if(!c.alive||(B.phase!=='aim'&&B.phase!=='myBan'))return;B.sel=i;B.pull=null;hideSling();prepAim();SFX.click();};pk.appendChild(b);c.btn=b;});}
const angOf=cr=>B.ang[cr.id]!=null?B.ang[cr.id]:CLS[cr.cls].ang;
$('#bMute').onclick=()=>{const m=toggleMute();$('#bMute').textContent=m?'🔇':'🔊';};
$('#bExit').onclick=()=>{setScreen('lobby');};
function updBattleHud(){
  [0,1].forEach(si=>{const sh=B.ships[si];const p=Math.round(shipRatio(sh)*100);$('#bHp'+si).textContent=p+'%';$('#bBar'+si).style.width=p+'%';
    const ms=$('#bCl'+si).children;sh.crew.forEach((c,i)=>{ms[i].classList.toggle('dead',!c.alive);ms[i].querySelector('b').style.width=(c.hp/c.max*100)+'%';});});
  const myTurn=B.phase==='aim'||B.phase==='myBan';
  B.ships[0].crew.forEach((c,i)=>{c.btn.classList.toggle('on',i===B.sel&&myTurn);c.btn.classList.toggle('dead',!c.alive);});
  $('#bTurn').textContent='턴 '+B.turn;$('#bTimer').textContent=Math.max(0,Math.ceil(B.timer));
  const w=B.wind;$('#bWind').textContent=w.s.toFixed(1);$('#bWindG').setAttribute('transform','rotate('+(Math.atan2(-w.x,w.z)*180/PI).toFixed(1)+')');
  const enemyAim=B.phase==='enemyAim'||B.phase==='enemyBan';
    
  $('#bHint').hidden=!(B.phase==='aim'&&B.turn<=2&&!B.pull);$('#bLeft').style.opacity=(myTurn||enemyAim)?1:0;
  $('#bVig').classList.toggle('show',B.phase==='enemyBan'||B.phase==='enemyAim'||B.phase==='enemyFly');
  if(enemyAim)$('#bCap').textContent='상대의 턴…';else if(B.phase==='aim'&&$('#bHint').hidden){const c=B.ships[0].crew[B.sel];$('#bCap').innerHTML='<span style="font-size:3.6cqw">'+c.def.s+' · '+CLS[c.cls].n+' — '+c.def.tr.t+'</span>';}else $('#bCap').textContent='';
  $('#bPick').style.opacity=myTurn?1:.35;
  // crosshair
  const cross=$('#bCross'),pl=$('#bPred');
  if(B.pred&&(B.phase==='aim'||B.phase==='enemyAim')){const v=B.pred.p.clone().project(B.cam);const W=phone.clientWidth,H=phone.clientHeight;const x=clamp((v.x+1)/2*W,W*.12,W*.88),y=clamp((1-v.y)/2*H,H*.12,H*.88);
    cross.style.left=x+'px';cross.style.top=y+'px';cross.classList.add('show');const pw=B.phase==='aim'?B.power:B.ePow;const col=B.pred.hit?(B.pred.hit.type==='room'||B.pred.hit.type==='crew'?'#ffd23a':'#ffa02a'):'#ff5a4a';
    $('#bRing').setAttribute('stroke-dasharray',(264*pw).toFixed(0)+' 264');$('#bRing').setAttribute('stroke',B.phase==='aim'?col:'#ff5a4a');
    pl.style.left=x+'px';pl.style.top=(y+phone.clientWidth*.13)+'px';pl.textContent=Math.round((B.phase==='aim'?B.power:B.ePow)*100)+'% · '+(B.pred.hit?(B.pred.hit.type==='hull'?'선체':'명중 예상'):'바다에 빠짐');pl.hidden=false;}
  else{cross.classList.remove('show');pl.hidden=true;}}
const dirOf=(y,p)=>new V3(Math.cos(p)*Math.cos(y),Math.sin(p),Math.cos(p)*Math.sin(y));
function eyeOf(ship,cr){ship.g.updateMatrixWorld();const loc=cr.room?cr.room.grp.position.clone().add(new V3(H2+.14,.08,0)):cr.mesh.position.clone().add(new V3(.3,.7,0));return ship.g.localToWorld(loc);}
const shipCenter=ship=>{ship.g.updateMatrixWorld();return ship.g.localToWorld(new V3(0,1.9,0));};
function probe(ship,p,inv){const loc=p.clone().applyMatrix4(inv);
  for(const c of ship.crew){if(!c.alive||c.room)continue;const cp=c.mesh.position;if(Math.hypot(loc.x-cp.x,loc.z-cp.z)<.28&&loc.y>cp.y&&loc.y<cp.y+.85)return{type:'crew',c,loc};}
  const r=Math.round(1-loc.x/SZ),c=Math.round(loc.z/SZ+1.5),f=Math.floor((loc.y-DECK)/SZ);
  if(r>=0&&r<3&&c>=0&&c<4&&f>=0&&f<MAXF){const rm=ship.rooms.get(KEY(f,r,c));if(rm&&Math.abs(loc.x-cellX(r))<H2&&Math.abs(loc.z-cellZ(c))<H2)return{type:'room',room:rm,loc};}
  const t=tOf(loc.z);if(t>0&&t<1&&Math.abs(loc.x)<hullW(t)&&loc.y<hullH(t)&&loc.y>-.4)return{type:'hull',loc};return null;}
function predict(o,v,tgt,k){const inv=tgt.g.matrixWorld.clone().invert();const p=o.clone(),vel=v.clone();for(let i=0;i<400;i++){const h=.02;vel.y-=k.g*h;p.addScaledVector(vel,h);const hit=probe(tgt,p,inv);if(hit)return{p,hit};if(p.y<0)return{p:new V3(p.x,0,p.z),hit:null};}return{p,hit:null};}
function solveV(o,p,ang,g){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),dy=p.y-o.y;const den=2*Math.cos(ang)**2*(d*Math.tan(ang)-dy);if(den<=0)return null;return{v:Math.sqrt(g*d*d/den),yaw:Math.atan2(dz,dx),d};}
function aiTargetPoint(ship){const exp=ship.crew.filter(c=>c.alive&&!c.room);if(exp.length&&Math.random()<.65){const c=pick(exp);return ship.g.localToWorld(c.mesh.position.clone().add(new V3(0,.4,0)));}
  const known=[...B.known[ship.side]].filter(rm=>ship.crew.some(c=>c.alive&&c.room===rm));if(known.length&&Math.random()<.6)return ship.g.localToWorld(pick(known).grp.position.clone());
  const rs=[...ship.rooms.values()];if(!rs.length)return shipCenter(ship);const pool=[];rs.forEach(r=>{pool.push(r);if(r.r===0)pool.push(r);});return ship.g.localToWorld(pick(pool).grp.position.clone().add(new V3(0,rand(-.2,.2),rand(-.3,.3))));}
function aiShot(src,ci,tgt){const cr=src.crew[ci],k=CLS[cr.cls];const o=eyeOf(src,cr);const tp=aiTargetPoint(tgt);let ang=(k.ang+rand(-3,4))*D2R,aim=tp.clone(),s=null,guard=0;
  for(let it=0;it<3&&guard<20;it++,guard++){s=solveV(o,aim,ang,k.g);if(!s||s.v>k.v){ang+=6*D2R;it--;if(ang>1.3){s=null;break;}continue;}const tf=s.d/(s.v*Math.cos(ang));aim=tp.clone().sub(new V3(B.wind.x,0,B.wind.z).multiplyScalar(.5*WK*tf*tf*.7*eff(cr).wind));}
  if(!s)s={v:k.v*.9,yaw:Math.atan2(tp.z-o.z,tp.x-o.x)};const err=(100-k.acc)/100;
  return{yaw:s.yaw+rand(-err,err)*.12,pitch:ang,power:clamp((s.v/k.v-.35)/.65*(1+rand(-err,err)*.3),.05,1)};}
function setVM(d){if(B.vm)B.cam.remove(B.vm);B.vm=makeVM(d);B.cam.add(B.vm);}
function clearVM(){if(B.vm){B.cam.remove(B.vm);B.vm=null;}}
function ghostFront(side,cr){const sh=B.ships[side];sh.rooms.forEach(rm=>{let on=false;if(cr){const myF=cr.room?cr.room.f:colTop(sh,cr.r,cr.c)+1,myR=cr.room?cr.room.r:cr.r,myC=cr.room?cr.room.c:cr.c;on=rm.r<myR&&Math.abs(rm.c-myC)<=1&&rm.f>=myF-1;}rm.ghost=on;rm.grp.visible=!on;});
  sh.crew.forEach(c=>{c.mesh.visible=!(cr&&(c===cr||(c.room&&c.room.ghost)));});}
function prepAim(){const A=B.ships[0];if(!A.crew[B.sel].alive)B.sel=A.crew.findIndex(c=>c.alive);const cr=A.crew[B.sel];const eye=eyeOf(A,cr),ctr=shipCenter(B.ships[1]);
  B.baseYaw=Math.atan2(ctr.z-eye.z,ctr.x-eye.x);B.yaw=B.baseYaw;B.power=0;B.pred=null;setVM(cr.def);ghostFront(0,cr);ghostFront(1,null);}
/* input */
function phonePt(e){const r=phone.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{
  if(cur==='lobby'){LB.drag={x:e.clientX,az:LB.az};try{canvas.setPointerCapture(e.pointerId);}catch(_){}return;}
  if(cur!=='battle'||!B||B.phase!=='aim')return;try{canvas.setPointerCapture(e.pointerId);}catch(_){}
  const p=phonePt(e);B.pull={x0:p.x,y0:p.y,x:p.x,y:p.y,armed:false,cancel:true,step:0};drawSling();});
canvas.addEventListener('pointermove',e=>{
  if(cur==='lobby'&&LB.drag){LB.az=clamp(LB.drag.az+(e.clientX-LB.drag.x)*.006,-.9,2.0);return;}
  if(!B||!B.pull)return;const p=phonePt(e),W=phone.clientWidth;const P=B.pull;P.x=p.x;P.y=p.y;const dx=p.x-P.x0,dy=p.y-P.y0;
  B.power=clamp(dy/(W*.45),0,1);B.yaw=B.baseYaw-dx/W*.7;P.cancel=Math.hypot(dx,dy)<W*.1;P.armed=B.power>.06&&!P.cancel;
  const st=Math.floor(B.power*6);if(st!==P.step){P.step=st;SFX.creak(B.power);if(st>=6)vib(10);}drawSling();});
const endPtr=()=>{if(cur==='lobby'){LB.drag=null;return;}if(!B||!B.pull)return;const P=B.pull;B.pull=null;hideSling();
  if(!P.armed||B.phase!=='aim'){if(Math.hypot(P.x-P.x0,P.y-P.y0)>phone.clientWidth*.05){toast('발사 취소');SFX.click();}B.power=0;B.yaw=B.baseYaw;B.pred=null;return;}
  fire(0,B.sel,B.yaw,angOf(B.ships[0].crew[B.sel])*D2R,B.power);};
canvas.addEventListener('pointerup',endPtr);canvas.addEventListener('pointercancel',()=>{if(B&&B.pull){B.pull=null;hideSling();B.power=0;}LB.drag=null;});
function drawSling(){const P=B.pull;if(!P)return hideSling();const W=phone.clientWidth,r=W*.09;
  $('#bSling').innerHTML='<circle cx="'+P.x0+'" cy="'+P.y0+'" r="'+r+'" fill="'+(P.cancel?'rgba(255,80,60,.45)':'rgba(10,20,40,.22)')+'" stroke="'+(P.cancel?'#ff5a4a':'rgba(255,255,255,.5)')+'" stroke-width="3" stroke-dasharray="6 5"/><text x="'+P.x0+'" y="'+(P.y0+r*.35)+'" text-anchor="middle" font-size="'+r*.9+'" fill="'+(P.cancel?'#fff':'rgba(255,255,255,.65)')+'" font-family="Black Han Sans,sans-serif">✕</text>'+
   (P.cancel&&Math.hypot(P.x-P.x0,P.y-P.y0)>W*.02?'<text x="'+P.x0+'" y="'+(P.y0+r*1.8)+'" text-anchor="middle" font-size="'+(W*.04)+'" fill="#fff" stroke="#13203a" stroke-width="3" paint-order="stroke" font-family="Black Han Sans,sans-serif">놓으면 취소</text>':'');}
function hideSling(){$('#bSling').innerHTML='';}
/* projectiles & fx */
function projMesh(p){const g=new THREE.Group();let spin=false;
  switch(p){
    case 'ball':M(sph(.16,14,10),T('#1e1e22'),g);break;
    case 'skull':M(sph(.17,14,10),T('#2b2228'),g);M(sph(.09,10,8),T('#f2efe6'),g,0,.06,.1);M(sph(.12,8,6),noOL(T('#ff8a2a',{emissive:'#ff5a00'})),g,0,0,-.16).scale.set(1,1,1.7);break;
    case 'goldball':M(sph(.16,14,10),T('#f0c040',{emissive:'#7a5a00'}),g);break;
    case 'bullet':M(cyl(.03,.03,.14,6),T('#c9ced8'),g).rotation.x=PI/2;break;
    case 'tracerBlue':case 'tracerPurple':{const c=p==='tracerBlue'?'#7ac8ff':'#c07aff';M(cyl(.045,.045,.55,6),noOL(T(c,{emissive:c})),g).rotation.x=PI/2;break;}
    case 'harpoon':{M(cyl(.03,.03,.9,8),T('#8a8f99'),g).rotation.x=PI/2;M(new THREE.ConeGeometry(.06,.2,8),T('#c9ced8'),g,0,0,.52).rotation.x=PI/2;for(const s of [-1,1])M(box(.015,.015,.12),T('#c9ced8'),g,s*.05,0,.4).rotation.y=-s*.5;break;}
    case 'arrow':case 'featherArrow':case 'bolt':{const L=p==='bolt'?.42:.65;M(cyl(.014,.014,L,6),T('#8a5a2b'),g).rotation.x=PI/2;M(new THREE.ConeGeometry(.035,.09,6),T('#2b2e36'),g,0,0,L/2+.04).rotation.x=PI/2;const fc=T(p==='featherArrow'?'#5fd84a':p==='bolt'?'#d8d8d8':'#e8402f');M(box(.005,.07,.12),fc,g,0,0,-L/2+.06);M(box(.07,.005,.12),fc,g,0,0,-L/2+.06);break;}
    case 'pellet':M(sph(.055,8,6),T('#3a3a40'),g);break;
    case 'goldPellet':M(sph(.06,8,6),noOL(T('#ff9ac0',{emissive:'#a03060'})),g);break;
    default:{const it=throwItem(p);it.scale.setScalar(1.6);g.add(it);spin=true;}}
  g.userData.spin=spin;return g;}
function fire(side,ci,yaw,pitch,power){
  const sh=B.ships[side],cr=sh.crew[ci],k=CLS[cr.cls],d=cr.def,E=eff(cr);const o=eyeOf(sh,cr);o.addScaledVector(dirOf(yaw,pitch),.3);const v0=k.v*(.35+.65*power);
  B.projs=[];for(let j=0;j<E.proj;j++){const sy=E.spread?rand(-E.spread,E.spread):0,sp=E.spread?rand(-E.spread,E.spread)*.6:0;
    const v=dirOf(yaw+sy,pitch+sp).multiplyScalar(v0*(E.spread?rand(.97,1.03):1));const m=projMesh(d.p);m.visible=false;m.position.copy(o);B.sc.add(m);
    const arr=new Float32Array(400*3);const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(arr,3));lg.setDrawRange(0,0);const ln=new THREE.Line(lg,new THREE.LineBasicMaterial({color:new THREE.Color(d.tc),transparent:true,opacity:.9}));B.sc.add(ln);
    B.projs.push({p:o.clone(),v,t:-j*E.delay,k,e:E,wm:E.wind,cls:cr.cls,def:d,side,ci,m,ln,arr,n:0,alive:true,pierce:E.pierce,hit:new Set(),age:0,launched:false});}
  B.phase=side?'enemyFly':'fly';B.pt=0;B.lead=B.projs[0];B.impactAt=null;B.closeCam=false;B.rc=1;B.done=0;B.pred=null;
  if(cr.room)B.known[side].add(cr.room);
  muzzle(o,d,cr,sh);
  ({gun:SFX.cannon,sniper:SFX.crack,bomb:SFX.throw,shot:SFX.bang,bow:()=>{}})[cr.cls]();vib(cr.cls==='gun'?40:20);
  hideSling();}
function muzzle(o,d,cr,sh){const big=cr.cls==='gun'?1:cr.cls==='bomb'?.2:.5;
  if(big>.3){const f=new THREE.Mesh(sph(1,12,8),noOL(new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,depthWrite:false})));f.position.copy(o);B.sc.add(f);B.fx.push({m:f,t:0,life:.18,type:'flash',s:.5*big+.15});}
  if(cr.cls!=='bomb'){const mo=o.clone().add(B.ships[sh.side===0?1:0].g.position.clone().sub(o).setY(0).normalize().multiplyScalar(.7));for(let i=0;i<(cr.cls==='gun'?7:4);i++)smokePuff(mo.clone().add(new V3(rand(-.2,.2),rand(-.1,.2),rand(-.2,.2))),.16*big+.08,'#d8d8dc',new V3(rand(-.3,.3),rand(.2,.6),rand(-.3,.3)));}
  if(cr.room&&sh.side===1){const mk=new THREE.Group();mk.position.set(H2+.3,.5,0);cr.room.grp.add(mk);const mat=thinOL(new THREE.MeshToonMaterial({color:'#8a8a92',gradientMap:GRAD,transparent:true,opacity:.85}));
    for(let i=0;i<3;i++){const m=new THREE.Mesh(sph(.16,10,8),mat);m.userData.fx=true;m.position.set(rand(0,.15),i*.18,rand(-.15,.15));mk.add(m);}mk.userData.fx=true;B.fx.push({m:mk,t:0,life:sh.side?18:10,type:'mark',mat});}}
function smokePuff(p,s,col,v){const m=new THREE.Mesh(sph(1,10,8),thinOL(new THREE.MeshToonMaterial({color:col,gradientMap:GRAD,transparent:true})));m.position.copy(p);m.scale.setScalar(.01);B.sc.add(m);B.fx.push({m,t:0,life:1.4,type:'smoke',s,v:v||new V3(rand(-.2,.2),rand(.5,1),rand(-.2,.2))});}
function stepProjs(dt){let any=false;
  for(const pr of B.projs){if(!pr.alive)continue;any=true;
    if(pr.t<0){pr.t+=dt;if(pr.t>=0){if(pr.cls==='bow')SFX.twang(0);if(pr.cls==='bomb')SFX.throw();}continue;}
    if(!pr.launched){pr.launched=true;pr.m.visible=true;if(pr.cls==='bow'&&pr===B.projs[0])SFX.twang(0);}
    const tgt=B.ships[1-pr.side];const inv=tgt.g.matrixWorld.clone().invert();const sub=4,h=dt/sub;
    for(let s=0;s<sub&&pr.alive;s++){pr.v.y-=pr.k.g*h;pr.v.x+=B.wind.x*WK*h*pr.wm;pr.v.z+=B.wind.z*WK*h*pr.wm;pr.p.addScaledVector(pr.v,h);pr.age+=h;collide(pr,tgt,inv);}
    if(!pr.alive)continue;pr.m.position.copy(pr.p);pr.m.visible=pr.age>.09;if(pr.m.userData.spin){pr.m.rotation.x+=dt*11;pr.m.rotation.z+=dt*7;}else pr.m.lookAt(pr.p.clone().add(pr.v));
    if(pr.n<400){pr.arr.set([pr.p.x,pr.p.y,pr.p.z],pr.n*3);pr.n++;pr.ln.geometry.setDrawRange(0,pr.n);pr.ln.geometry.attributes.position.needsUpdate=true;}
    if(pr.def.p==='skull'&&Math.random()<.7)smokePuff(pr.p.clone(),.18,'#ff8a2a',new V3(0,.3,0));
    if(pr.def.p==='potion'&&Math.random()<.5)smokePuff(pr.p.clone(),.12,'#7affc8',new V3(0,.2,0));}
  return any;}
function collide(pr,tgt,inv){const hit=probe(tgt,pr.p,inv);
  if(hit){if(hit.type==='room'&&pr.pierce>0){if(pr.hit.has(hit.room))return;pr.hit.add(hit.room);pr.pierce--;pierceHit(pr,tgt,hit);if(pr.pierce<=0){stick(pr,hit);endProj(pr);}return;}
    if(hit.type==='crew'&&pr.pierce>0){hurt(tgt,hit.c,Math.round(pr.k.dmg*dmgMul(pr)*(B.ships[pr.side].cap==='shadow'?1.3:1)));stick(pr,hit);endProj(pr);B.impactAt=pr.p.clone();return;}
    impact(pr,tgt,hit);return;}
  if(pr.p.y<.05){splash(pr.p);endProj(pr);return;}
  if(pr.age>7||Math.abs(pr.p.x)>45)endProj(pr);}
function dmgMul(pr){const sh=B.ships[pr.side];const cr=sh.crew[pr.ci];let m=cr.dmg/CLS[cr.cls].dmg*pr.e.dmg;if(sh.cap==='bargo'&&pr.cls==='gun')m*=1.3;return m;}
function endProj(pr){pr.alive=false;if(!pr.stuck)B.sc.remove(pr.m);B.fx.push({m:pr.ln,t:0,life:1.4,type:'trail'});}
function stick(pr,hit){if(!['arrow','featherArrow','bolt','harpoon'].includes(pr.def.p))return;pr.stuck=true;pr.m.visible=true;pr.m.position.copy(pr.p);const par=hit.room?hit.room.grp:B.ships[1-pr.side].g;par.attach(pr.m);}
function pierceHit(pr,ship,hit){const mul=dmgMul(pr),E=pr.e;const dm=Math.round(pr.k.dmg*mul*E.roomMul*1.2);damageRoom(ship,hit.room,dm,hit.loc,E.wall);
  const shd=B.ships[pr.side].cap==='shadow'?1.3:1;ship.crew.forEach(c=>{if(c.alive&&c.room===hit.room)hurt(ship,c,Math.round(pr.k.dmg*mul*Math.min(1,.4+E.cig*.6)*shd));});
  popDmg(dm,pr.p.clone().add(new V3(0,.4,0)),'');splinters(pr.p,hit.room,5,false,ship);sparks(pr.p,pr.def.bc,6);SFX.wood(.6);B.impactAt=pr.p.clone();
  if(hit.room.hp<=0)destroyRoom(ship,hit.room,hit.loc);}
function impact(pr,ship,hit){const p=pr.p.clone(),k=pr.k,d=pr.def,E=pr.e,src=B.ships[pr.side];const loc=hit.loc;const R=E.rad;
  const mul=dmgMul(pr);const crit=Math.random()<(.08+E.crit+(src.cap==='isabel'&&src.fac==='pirate'?.15:0));const cm=crit?1.5:1;let direct=0;const dead=[];
  ship.rooms.forEach(rm=>{const rc=rm.grp.position;const dd=Math.hypot(rc.x-loc.x,rc.y-loc.y,rc.z-loc.z);let f=0;if(hit.room===rm)f=1;else if(dd<R+.6)f=Math.max(.25,1-dd/(R+.6))*.75;
    if(f>0){const dm=Math.round(k.dmg*mul*cm*f*E.roomMul);if(f===1||!hit.room)direct=Math.max(direct,dm);damageRoom(ship,rm,dm,loc,E.wall);if(rm.hp<=0)dead.push(rm);}});
  const base=k.dmg*mul*cm*(src.cap==='shadow'?1.3:1);
  ship.crew.forEach(c=>{if(!c.alive)return;let dm=0;
    if(c.room){const rc=c.room.grp.position;const dd=Math.hypot(rc.x-loc.x,rc.y-loc.y,rc.z-loc.z);if(dd<R+.55){const f=c.room===hit.room?1:Math.max(.3,1-dd/(R+.55));dm=base*f*coverEff(c.room,loc,E.cig)*.7;}}
    else{const cp=c.mesh.position;const dd=Math.hypot(cp.x-loc.x,cp.y+.4-loc.y,cp.z-loc.z);if(hit.c===c||dd<R+.45){const f=hit.c===c?1:Math.max(.35,1-dd/(R+.45));dm=base*f*.85*E.expMul;}}
    if(dm>0)hurt(ship,c,Math.round(dm));});
  dead.sort((a,b)=>b.f-a.f).forEach(rm=>destroyRoom(ship,rm,loc));
  if(direct)popDmg(direct,p.clone().add(new V3(0,.7,0)),'');if(crit)popDmg('치명타!',p.clone().add(new V3(0,1.4,0)),'k');
  const hr=hit.room&&hit.room.hp>0?hit.room:null,tr=d.tr||{};
  if(hr&&tr.fire){addFire(hr,false,3);popDmg('🔥 화재 3턴',p.clone().add(new V3(0,1.9,0)),'k');}
  else if(hr&&tr.fireP&&Math.random()<tr.fireP){addFire(hr,false,2);popDmg('🔥 화재',p.clone().add(new V3(0,1.9,0)),'k');}
  else if(hr&&src.cap==='sera'&&Math.random()<.25){addFire(hr,false,2);popDmg('🔥 화재',p.clone().add(new V3(0,1.9,0)),'k');}
  if(tr.poison){let n=0;ship.rooms.forEach(rm=>{const rc=rm.grp.position;if(Math.hypot(rc.x-loc.x,rc.y-loc.y,rc.z-loc.z)<R+.2&&rm.hp>0){addFire(rm,true,3);n++;}});if(n)popDmg('☠ 독구름',p.clone().add(new V3(0,1.9,0)),'k');}
  explosion(p,R,d);SFX.boom(R);if(direct)SFX.wood(1);if(d.p==='bottle'||d.p==='potion')SFX.glass();if(d.p==='bottle')SFX.fire();if(d.p==='potion')SFX.magic();
  vib(R>1?60:25);if(R>=1){B.slow=.18;flash(.6);}B.shake=Math.min(1.3,.35+R*.4);B.impactAt=p.clone();stick(pr,hit);endProj(pr);}
function hurt(ship,c,dm){if(!c.alive)return;c.hp=Math.max(0,c.hp-dm);const wp=ship.g.localToWorld(c.mesh.position.clone().add(new V3(0,1.0,0)));popDmg(dm,wp,'c');if(c.hp<=0){c.alive=false;popDmg('쓰러짐!',wp.clone().add(new V3(0,.5,0)),'k');}}
function damageRoom(ship,rm,dm,loc,wm){wm=wm||1;rm.hp-=dm;const fc=faceToward(rm,loc);rm.wd[fc]+=dm*wm;for(let i=0;i<4;i++)if(i!==fc)rm.wd[i]+=dm*.2*wm;const r=rm.hp/rm.max;
  for(let i=0;i<4;i++){let st=rm.wd[i]>rm.max*.6?2:rm.wd[i]>rm.max*.25?1:0;if(r<.4)st=Math.max(st,1);if(r<.15&&i===fc)st=2;if(st>rm.ws[i])setWall(rm,i,st);}
  if(r<.3&&!rm.charred){rm.charred=true;rm.frame.material=T('#2a1a10');}
  if(r<.35&&r>0&&!rm.fire)addFire(rm,false,0);splinters(ship.g.localToWorld(loc.clone()),rm,Math.min(8,2+Math.round(dm*wm/60)),false,ship);
  rm.grp.position.x+=(Math.random()-.5)*.1;rm.grp.position.z+=(Math.random()-.5)*.1;setTimeout(()=>{rm.grp.position.x=cellX(rm.r);rm.grp.position.z=cellZ(rm.c);},90);}
function addFire(rm,green,turns){if(turns)rm.burn={n:Math.max(turns,rm.burn?rm.burn.n:0),g:green};
  if(rm.fire&&rm.fire.userData.green===!!green)return;if(rm.fire)rm.grp.remove(rm.fire);
  const g=new THREE.Group();g.position.y=H2+.05;rm.grp.add(g);g.userData.fx=true;g.userData.green=!!green;
  for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(.11,.4,6),noOL(new THREE.MeshBasicMaterial({color:green?(i%2?0x9affc0:0x2acf7a):(i%2?0xffd04a:0xff6a1a),transparent:true,opacity:.9})));f.userData.fx=true;f.position.set(rand(-.3,.3),.15,rand(-.3,.3));g.add(f);}rm.fire=g;}
function burnTick(){B.ships.forEach(sh=>{[...sh.rooms.values()].forEach(rm=>{if(!rm.burn)return;const wp=sh.g.localToWorld(rm.grp.position.clone().add(new V3(0,.7,0)));const dm=rm.burn.g?30:36;
  rm.hp-=dm;popDmg((rm.burn.g?'☠ -':'🔥 -')+dm,wp,'k');sh.crew.forEach(c=>{if(c.alive&&c.room===rm)hurt(sh,c,rm.burn.g?22:12);});
  if(--rm.burn.n<=0){rm.burn=null;if(rm.fire&&rm.hp/rm.max>=.35){rm.grp.remove(rm.fire);rm.fire=null;}}if(rm.hp<=0)destroyRoom(sh,rm,null);});});}
function debris(m,ship,v,w,life){m.castShadow=true;B.sc.add(m);B.fx.push({m,t:0,life:life||3.8,type:'deb',ship,v,w});}
function destroyRoom(ship,rm,loc){const key=KEY(rm.f,rm.r,rm.c);if(ship.rooms.get(key)!==rm)return;
  ship.g.updateMatrixWorld(true);const wp=ship.g.localToWorld(rm.grp.position.clone());
  const push=loc?rm.grp.position.clone().sub(loc).setY(0).normalize():new V3();const pw=push.clone().transformDirection(ship.g.matrixWorld);
  rm.walls.forEach((w,i)=>{if(rm.ws[i]===2&&Math.random()<.5)return;const m=new THREE.Mesh(WALLG,w.userData.orig||w.material);w.getWorldPosition(m.position);w.getWorldQuaternion(m.quaternion);
    const n=new V3(...WALLN[i]).transformDirection(ship.g.matrixWorld);debris(m,ship,n.multiplyScalar(rand(1.2,2.6)).addScaledVector(pw,rand(1,2.2)).add(new V3(0,rand(1.8,3.6),0)),new V3(rand(-4,4),rand(-3,3),rand(-4,4)));});
  if(rm.roof.visible){const m=new THREE.Mesh(ROOFG,rm.roof.material);rm.roof.getWorldPosition(m.position);rm.roof.getWorldQuaternion(m.quaternion);debris(m,ship,new V3(rand(-1,1),rand(2.4,4),rand(-1,1)).addScaledVector(pw,1.5),new V3(rand(-3,3),rand(-2,2),rand(-3,3)));}
  for(const [x,z] of [[E,E],[-E,E],[E,-E],[-E,-E]]){const m=new THREE.Mesh(box(.1,SZ,.1),rm.frame.material);m.position.copy(ship.g.localToWorld(rm.grp.position.clone().add(new V3(x,0,z))));m.quaternion.copy(ship.g.quaternion);
    const out=new V3(x,0,z).transformDirection(ship.g.matrixWorld);debris(m,ship,out.multiplyScalar(rand(1.5,3)).add(new V3(0,rand(.5,2),0)),new V3(rand(-6,6),rand(-2,2),rand(-6,6)));}
  splinters(wp,rm,14,true,ship);for(let i=0;i<10;i++)smokePuff(wp.clone().add(new V3(rand(-.5,.5),rand(-.4,.4),rand(-.5,.5))),rand(.16,.32),'#b8a48a',new V3(rand(-.7,.7),rand(.2,1),rand(-.7,.7)));SFX.wood(2);SFX.boom(.6);B.shake=Math.max(B.shake,.6);
  ship.g.remove(rm.grp);ship.rooms.delete(key);B.known.forEach(s=>s.delete(rm));popDmg('선실 붕괴!',wp.clone().add(new V3(0,.9,0)),'k');
  ship.crew.forEach(c=>{if(c.room===rm){c.room=null;c.ty=0;if(c.alive){popDmg('노출!',ship.g.localToWorld(c.mesh.position.clone().add(new V3(0,1.6,0))),'k');hurt(ship,c,Math.round(c.max*.3));}}});
  for(let f=rm.f+1;f<MAXF;f++){const u=ship.rooms.get(KEY(f,rm.r,rm.c));if(!u)continue;ship.rooms.delete(KEY(f,rm.r,rm.c));u.f=f-1;u.ty=roomY(f-1);u.vy=-.5;u.tilt.set(rand(-.12,.12),0,rand(-.12,.12));damageRoom(ship,u,Math.round(u.max*.15),u.grp.position.clone().add(new V3(0,-H2,0)));ship.rooms.set(KEY(u.f,u.r,u.c),u);}
  updateRoofs(ship);ship.crew.forEach(c=>{if(!c.room)c.ty=standY(ship,c.r,c.c);});}
function splinters(wp,rm,n,big,ship){const mat=rm?wallMat(rm.lv,0,'back',rm.skin):T('#9a6a3a');for(let i=0;i<n;i++){const m=new THREE.Mesh(box(big?rand(.25,.55):rand(.12,.3),rand(.05,.09),rand(.03,.06)),mat);m.position.copy(wp).add(new V3(rand(-.3,.3),rand(-.3,.3),rand(-.3,.3)));
  debris(m,ship,new V3(rand(-3.5,3.5),rand(2,6),rand(-3.5,3.5)).multiplyScalar(big?1.1:.8),new V3(rand(-12,12),rand(-12,12),rand(-12,12)),2.8);}}
function sparks(p,col,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(box(.05,.05,.2),noOL(new THREE.MeshBasicMaterial({color:new THREE.Color(col)})));m.position.copy(p);B.sc.add(m);B.fx.push({m,t:0,life:.5,type:'spark',v:new V3(rand(-1,1),rand(.2,1.4),rand(-1,1)).normalize().multiplyScalar(rand(4,8))});}}
function explosion(p,R,d){const s=.6+R*.75;const green=d.p==='potion';
  const f=new THREE.Mesh(sph(1,14,10),noOL(new THREE.MeshBasicMaterial({color:green?0xd0fff0:0xfff6c8,transparent:true,depthWrite:false})));f.position.copy(p);B.sc.add(f);B.fx.push({m:f,t:0,life:.35,type:'flash',s:s*1.3});
  const fi=new THREE.Mesh(sph(1,14,10),noOL(new THREE.MeshBasicMaterial({color:new THREE.Color(d.bc),transparent:true,depthWrite:false})));fi.position.copy(p);B.sc.add(fi);B.fx.push({m:fi,t:0,life:.6,type:'fire',s,green});
  for(let i=0;i<7;i++)smokePuff(p.clone().add(new V3(rand(-.4,.4),rand(0,.3),rand(-.4,.4)).multiplyScalar(s)),s*rand(.16,.28),green?'#7affc8':'#8f8f98',new V3(rand(-.4,.4),rand(.6,1.4),rand(-.4,.4)));
  sparks(p,d.bc,d.p==='dynamite'?18:10);
  if(d.p==='bottle')for(let i=0;i<6;i++)smokePuff(p.clone().add(new V3(rand(-.5,.5),rand(-.2,.3),rand(-.5,.5))),rand(.2,.35),'#ff7a1a',new V3(0,rand(.3,.8),0));}
function splash(p){const m=new THREE.Mesh(cyl(.25,.45,1,14,1,true),noOL(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,side:THREE.DoubleSide,depthWrite:false})));m.position.set(p.x,0,p.z);B.sc.add(m);B.fx.push({m,t:0,life:.9,type:'splash'});
  const r=new THREE.Mesh(new THREE.RingGeometry(.4,.6,24),noOL(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false})));r.rotation.x=-PI/2;r.position.set(p.x,.2,p.z);B.sc.add(r);B.fx.push({m:r,t:0,life:1,type:'ring'});popDmg('빗나감',p.clone().add(new V3(0,1,0)),'k');SFX.splash();B.impactAt=B.impactAt||p.clone();}
function flash(a){const f=$('#bFlash');f.style.transition='none';f.style.opacity=a;requestAnimationFrame(()=>{f.style.transition='opacity .35s';f.style.opacity=0;});}
function stepFx(dt){B.fx=B.fx.filter(f=>{f.t+=dt;if(f.t<0)return true;const u=f.t/f.life;const m=f.m;
  if(u>=1){if(m.parent)m.parent.remove(m);return false;}
  if(f.type==='flash'){m.scale.setScalar((f.s||1)*(.4+u));m.material.opacity=1-u;}
  else if(f.type==='fire'){m.scale.setScalar(f.s*(.5+.8*(1-Math.pow(1-u,3))));m.material.opacity=1-u;if(!f.green)m.material.color.setHSL(.08-.06*u,1,.55-.2*u);}
  else if(f.type==='smoke'){m.position.addScaledVector(f.v,dt);m.scale.setScalar(f.s*(.4+u*1.1));m.material.opacity=Math.min(1,(1-u)*1.6);}
  else if(f.type==='spark'){f.v.y-=12*dt;m.position.addScaledVector(f.v,dt);m.lookAt(m.position.clone().add(f.v));m.scale.setScalar(1-u);}
  else if(f.type==='deb'){f.v.y-=14*dt;m.position.addScaledVector(f.v,dt);m.rotation.x+=f.w.x*dt;m.rotation.y+=f.w.y*dt;m.rotation.z+=f.w.z*dt;
    let floor=-.2;const sh=f.ship;if(sh&&Math.abs(m.position.x-sh.g.position.x)<1.8&&Math.abs(m.position.z)<3.6)floor=sh.g.position.y+DECK+.05;
    if(m.position.y<floor){if(floor>0){m.position.y=floor;if(f.v.y<-1.5){f.v.y*=-.32;f.v.x*=.55;f.v.z*=.55;f.w.multiplyScalar(.45);if(!f.thud){f.thud=1;if(Math.random()<.35)SFX.wood(.25);}}else{f.v.set(f.v.x*.85,0,f.v.z*.85);f.w.multiplyScalar(.8);}}
      else{if(!f.wet){f.wet=1;const r=new THREE.Mesh(new THREE.RingGeometry(.15,.28,16),noOL(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false})));r.rotation.x=-PI/2;r.position.set(m.position.x,.15,m.position.z);B.sc.add(r);B.fx.push({m:r,t:0,life:.7,type:'ring'});}f.v.multiplyScalar(.9);f.w.multiplyScalar(.92);m.position.y=Math.max(m.position.y,-.7);}}
    if(u>.85)m.scale.setScalar(Math.max(.01,(1-u)/.15));}
  else if(f.type==='trail'){m.material.opacity=.9*(1-u);}
  else if(f.type==='splash'){m.scale.set(1+u,Math.sin(u*PI)*2.6,1+u);m.position.y=Math.sin(u*PI)*1.3;m.material.opacity=1-u*.8;}
  else if(f.type==='ring'){m.scale.setScalar(1+u*4);m.material.opacity=1-u;}
  else if(f.type==='mark'){m.children.forEach((c,i)=>{c.position.y=(i*.18+f.t*.25)%0.6;c.scale.setScalar(.8+.4*Math.sin(f.t*3+i));});f.mat.opacity=.85*Math.min(1,(1-u)*3);}
  return true;});}
function popDmg(v,wp,cls){const el=document.createElement('div');el.className='dmg tx '+cls;el.textContent=typeof v==='number'?'-'+v:v;$('#bDmg').appendChild(el);B.dmg.push({el,p:wp.clone(),t:0});}
function stepDmg(dt){const W=phone.clientWidth,H=phone.clientHeight;B.dmg=B.dmg.filter(d=>{d.t+=dt;if(d.t>1.4){d.el.remove();return false;}const v=d.p.clone().add(new V3(0,d.t*.8,0)).project(B.cam);
  d.el.style.left=((v.x+1)/2*W)+'px';d.el.style.top=((1-v.y)/2*H)+'px';d.el.style.opacity=v.z<1?Math.min(1,(1.4-d.t)*3):0;d.el.style.transform='translate(-50%,-50%) scale('+(d.t<.15?.6+d.t/.15*.6:1.2-Math.min(.2,d.t-.15))+')';return true;});}
const aliveShip=ship=>ship.crew.some(c=>c.alive)&&ship.rooms.size>0;
const banner=(id,on)=>$(id).classList.toggle('show',on);
function impactPose(ship,focus){const s=ship.baseX>0?-1:1;return[new V3(focus.x+s*5.4,focus.y+2.3,focus.z+6.2),focus.clone().lerp(shipCenter(ship),.35)];}
function updBattle(rdt,t){
  let dt=rdt;if(B.slow>0){B.slow-=rdt;dt=rdt*.15;}
  B.pt+=dt;B.env.update(t);B.ships.forEach((s,i)=>animShip(s,t,dt,i,true));B.streaks(dt);B.rc=Math.max(0,B.rc-dt*5);
  const A=B.ships[0],E=B.ships[1];let cp=B.cp.clone(),cl=B.cl.clone(),k=5,fov=55;
  switch(B.phase){
    case 'intro':{const a=.6+B.pt*.12;cp=new V3(-6.6+Math.cos(a)*12,5.6,Math.sin(a)*12);cl=new V3(-6.6,1.6,0);k=20;banner('#bIntro',B.pt>.3&&B.pt<2.2);if(B.pt>2.5){B.phase='myBan';B.pt=0;B.prepped=false;}break;}
    case 'myBan':{if(!B.prepped){B.prepped=true;if(B.turn>1)burnTick();if(!aliveShip(E))return endBattle(true);if(!aliveShip(A))return endBattle(false);prepAim();}const cr=A.crew[B.sel];cp=eyeOf(A,cr);cl=shipCenter(E);k=B.pt<.9?4:14;banner('#bBanMe',B.pt>.1&&B.pt<1.1);
      if(B.vm)vmPose(B.vm,0,0,t);if(B.pt>1.3){banner('#bBanMe',false);B.phase='aim';B.pt=0;B.timer=30;}break;}
    case 'aim':{const cr=A.crew[B.sel];const eye=eyeOf(A,cr);cp=eye;k=12;B.timer-=dt;const ctr=shipCenter(E);
      if(B.pull&&B.pull.armed){const kk=CLS[cr.cls];const v=dirOf(B.yaw,angOf(cr)*D2R).multiplyScalar(kk.v*(.35+.65*B.power));B.pred=predict(eye.clone().addScaledVector(v.clone().normalize(),.3),v,E,kk);cl=ctr.clone().lerp(B.pred.p,.55);}
      else{B.pred=null;cl=ctr.clone().add(new V3(0,0,Math.sin(B.yaw-B.baseYaw)*6));}
      fov=55-(B.pull?B.power*(cr.cls==='sniper'?20:8):0);if(B.vm)vmPose(B.vm,B.pull?B.power:0,B.rc,t);
      if(B.timer<=0){B.pull=null;hideSling();const s=aiShot(A,B.sel,E);fire(0,B.sel,s.yaw,s.pitch,s.power);}break;}
    case 'fly':case 'enemyFly':{const mine=B.phase==='fly';const any=stepProjs(dt);const tgt=mine?E:A,sh=mine?A:E;const lead=B.lead;
      const fpT=lead&&lead.cls==='bomb'?.34:.22;
      if(B.pt<fpT){const cr=sh.crew[mine?B.sel:B.eci];cp=eyeOf(sh,cr);k=20;if(B.vm){vmPose(B.vm,0,lead&&lead.cls==='bomb'?0:B.rc,t);if(lead&&lead.cls==='bomb')throwPose(B.vm,B.pt/fpT);}}
      else if(lead&&lead.alive&&lead.launched&&!B.impactAt&&!B.closeCam){clearVM();ghostFront(0,null);ghostFront(1,null);const tc=shipCenter(tgt);
        if(lead.cls==='bomb'||lead.p.y>4){const mid=(sh.g.position.x+tgt.g.position.x)/2;cp=new V3(lead.p.x*.45+mid*.55,4.4,12.5);cl=new V3(lead.p.x*.6+tgt.g.position.x*.4,Math.min(lead.p.y,4.5)*.55+1.1,0);k=5;fov=55;}
        else{const vn=lead.v.clone().normalize();cp=lead.p.clone().addScaledVector(vn,-3.4).add(new V3(-vn.z,0,vn.x).multiplyScalar(1.4));cp.y=Math.min(lead.p.y+1.0,4.2);cl=lead.p.clone().lerp(tc,.45);k=10;fov=60;}
        if(lead.p.distanceTo(tc)<6.5)B.closeCam=true;}
      else{clearVM();ghostFront(0,null);ghostFront(1,null);const focus=B.impactAt||(lead&&lead.alive?lead.p.clone().lerp(shipCenter(tgt),.5):shipCenter(tgt));[cp,cl]=impactPose(tgt,focus);k=B.impactAt?3.5:6;fov=50;}
      if(!any){B.done+=dt;if(B.done>1.5){B.done=0;B.projs.forEach(p=>{if(p.m.parent&&!p.stuck)B.sc.remove(p.m);});
        if(!aliveShip(E))return endBattle(true);if(!aliveShip(A))return endBattle(false);
        B.prepped=false;if(mine){B.phase='enemyBan';B.pt=0;newWind();}else{B.turn++;newWind();B.phase='myBan';B.pt=0;}}}
      break;}
    case 'enemyBan':{if(!B.prepped){B.prepped=true;const al=E.crew.map((c,i)=>c.alive?i:-1).filter(i=>i>=0);B.eci=al[B.eIdx++%al.length];const c=E.crew[B.eci];
        const s=aiShot(E,B.eci,A);const eye=eyeOf(E,c),ctr=shipCenter(A);B.eyaw0=Math.atan2(ctr.z-eye.z,ctr.x-eye.x);let gy=s.yaw;while(gy-B.eyaw0>PI)gy-=2*PI;while(gy-B.eyaw0<-PI)gy+=2*PI;s.yaw=gy;B.egoal=s;B.ePow=0;
        setVM(c.def);ghostFront(1,c);ghostFront(0,null);}
      const c=E.crew[B.eci];cp=eyeOf(E,c);cl=shipCenter(A);k=B.pt<.9?4:14;if(B.vm)vmPose(B.vm,0,0,t);banner('#bBanEn',B.pt>.1&&B.pt<1.1);if(B.pt>1.3){banner('#bBanEn',false);B.phase='enemyAim';B.pt=0;}break;}
    case 'enemyAim':{const c=E.crew[B.eci],kk=CLS[c.cls];const u=clamp(B.pt/1.5,0,1),e=u*u*(3-2*u);const yaw=B.eyaw0+(B.egoal.yaw-B.eyaw0)*e;B.ePow=B.egoal.power*e;
      cp=eyeOf(E,c);const v=dirOf(yaw,B.egoal.pitch).multiplyScalar(kk.v*(.35+.65*Math.max(.05,B.ePow)));B.pred=predict(cp.clone().addScaledVector(v.clone().normalize(),.3),v,A,kk);cl=shipCenter(A).lerp(B.pred.p,.55*e);k=10;
      if(B.vm)vmPose(B.vm,B.ePow,0,t);if(Math.floor(B.ePow*6)!==B.eStep){B.eStep=Math.floor(B.ePow*6);SFX.creak(B.ePow);}
      if(B.pt>2.0)fire(1,B.eci,B.egoal.yaw,B.egoal.pitch,B.egoal.power);break;}
    case 'end':{const loser=B.won?E:A;[cp,cl]=impactPose(loser,shipCenter(loser));k=2;stepProjs(dt);break;}
  }
  stepFx(dt);
  if(B.snap){B.cp.copy(cp);B.cl.copy(cl);B.snap=false;}
  const a=1-Math.exp(-rdt*k);B.cp.lerp(cp,a);B.cl.lerp(cl,a);B.cam.position.copy(B.cp);
  if(B.shake>0){B.shake=Math.max(0,B.shake-rdt*1.8);B.cam.position.add(new V3(rand(-1,1),rand(-1,1),rand(-1,1)).multiplyScalar(B.shake*.13));}
  B.cam.lookAt(B.cl);if(Math.abs(B.cam.fov-fov)>.05){B.cam.fov+=(fov-B.cam.fov)*Math.min(1,rdt*8);B.cam.updateProjectionMatrix();}
  stepDmg(rdt);updBattleHud();}
function endBattle(win){B.phase='end';B.won=win;B.pt=0;ghostFront(0,null);ghostFront(1,null);clearVM();(win?B.ships[1]:B.ships[0]).sinking=true;
  const pc=shipRatio(B.ships[0]);const stars=win?1+(pc>.5?1:0)+(B.turn<=5?1:0):0;
  const gold=win?210+B.si*80:50;S.gold+=gold;if(win){S.chests++;if(B.si===S.stage&&S.stage<STAGES.length-1)S.stage++;}refreshRes();
  const R=$('#bResult');setTimeout(()=>{if(!B||B.phase!=='end')return;(win?SFX.win:SFX.lose)();R.innerHTML='<div class="result"><div class="rib tx'+(win?'':' lose')+'">'+(win?'승리!':'패배')+'</div>'+(win?'<div class="stars">'+'★'.repeat(stars)+'<s>'+'★'.repeat(3-stars)+'</s></div>':'<div class="tx" style="font-size:5cqw">선실을 더 튼튼하게 지어 보세요</div>')+
    '<div class="rws"><div class="rw"><svg class="ico"><use href="#i-coin"/></svg><span class="tx">+'+gold+'</span></div>'+(win?'<div class="rw"><svg class="ico"><use href="#i-chest-w"/></svg><span class="tx">+1</span></div>':'')+'</div>'+
    '<button class="btn btn-y" type="button"><span class="tx">'+(win?'확인':'돌아가기')+'</span></button></div>';
    R.querySelector('button').onclick=()=>{R.innerHTML='';setScreen('lobby');};},2200);}

/* ================= LOOP ================= */
function resize(){const r=phone.getBoundingClientRect();if(!r.width)return;renderer.setSize(r.width,r.height,false);const asp=r.width/r.height;
  for(const c of [LB.cam,BD.cam,SH.cam,B&&B.cam])if(c){c.aspect=asp;c.updateProjectionMatrix();}BD.labelsDirty=true;}
new ResizeObserver(resize).observe(phone);
let visible=true;new IntersectionObserver(es=>{visible=es[0].isIntersecting;}).observe(phone);
let last=performance.now(),TT=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(visible){TT+=dt;
    if(cur==='lobby'&&LB.sc){updLobby(dt,TT);draw(LB.sc,LB.cam);}
    else if(cur==='build'&&BD.sc){updBuild(dt,TT);draw(BD.sc,BD.cam);}
    else if(cur==='shop'&&SH.sc){updShop(dt,TT);draw(SH.sc,SH.cam);}
    else if(cur==='battle'&&B){updBattle(dt,TT);if(B)draw(B.sc,B.cam);}}
  requestAnimationFrame(loop);}
function boot(){try{makePortraits();makeSkinPreviews();}catch(e){console.error(e);}
  refreshRes();buildLobbyScene();setScreen('lobby');$('#loading').remove();updNavBadge();requestAnimationFrame(loop);}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>setTimeout(boot,30));else setTimeout(boot,30);
