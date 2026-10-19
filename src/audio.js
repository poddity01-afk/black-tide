import * as THREE from 'three';

/* ================= AUDIO ================= */
export let AC=null,MG=null,NB=null,muted=false;
export function audio(){if(AC){if(AC.state==='suspended')AC.resume();return AC;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{AC=new C();}catch(e){return null;}
  MG=AC.createGain();MG.gain.value=.5;MG.connect(AC.destination);NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return AC;}
export function nz(dur,type,f0,f1,g0,q,delay){const a=AC;if(!a||muted)return;const t=a.currentTime+(delay||0);const s=a.createBufferSource();s.buffer=NB;s.loop=true;const f=a.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);if(q)f.Q.value=q;
  const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(g0,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(MG);s.start(t);s.stop(t+dur+.05);}
export function tn(dur,type,f0,f1,g0,delay){const a=AC;if(!a||muted)return;const t=a.currentTime+(delay||0);const o=a.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(g0,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(MG);o.start(t);o.stop(t+dur+.05);}
export const SFX={
  cannon:()=>{nz(.8,'lowpass',2600,110,1);tn(.5,'sine',110,32,.9);},
  crack:()=>{nz(.16,'highpass',4200,1800,.9);tn(.09,'square',1500,500,.18);},
  bang:()=>{nz(.32,'bandpass',2200,500,1,.7);tn(.14,'sine',170,60,.5);},
  twang:d=>{tn(.2,'triangle',300,190,.45,d);nz(.08,'highpass',5000,3000,.15,0,d);},
  throw:()=>nz(.38,'bandpass',500,1600,.45,1.2),
  boom:s=>{nz(.6+.5*s,'lowpass',1800,60,1);tn(.5+.3*s,'sine',90,28,1);},
  wood:s=>{nz(.16*s+.1,'bandpass',1100,320,.9,2);nz(.12,'highpass',3000,1500,.4);},
  splash:()=>nz(.75,'lowpass',2600,300,.6),
  click:()=>tn(.05,'square',900,700,.12),
  creak:p=>tn(.07,'sawtooth',180+p*320,140+p*320,.07),
  glass:()=>{tn(.25,'triangle',2000,1500,.25);nz(.2,'highpass',7000,4000,.3);},
  fire:()=>nz(.9,'bandpass',800,380,.35,.6),
  magic:()=>{tn(.5,'sine',600,1400,.25);tn(.5,'sine',900,1800,.15,.05);},
  win:()=>[523,659,784,1046].forEach((f,i)=>tn(.32,'square',f,f,.12,i*.12)),
  lose:()=>[392,330,262].forEach((f,i)=>tn(.38,'triangle',f,f*.97,.2,i*.18))
};
export const vib=ms=>{try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}};

export function toggleMute(){muted=!muted;return muted;}
