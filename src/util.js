import * as THREE from 'three';

export const V3=THREE.Vector3,PI=Math.PI,D2R=PI/180;
export const rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const GRAD=(()=>{const d=new Uint8Array([150,150,150,255,215,215,215,255,255,255,255,255]);const t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;})();
export const MC={};
export function T(c,o){let k=String(c);if(o)for(const x in o)k+='|'+x+':'+(o[x]&&o[x].uuid?o[x].uuid:o[x]);if(!MC[k])MC[k]=new THREE.MeshToonMaterial(Object.assign({color:new THREE.Color(c),gradientMap:GRAD},o||{}));return MC[k];}
export const NOOL={visible:false};
export const noOL=m=>{m.userData.outlineParameters=NOOL;return m;};
export const thinOL=m=>{m.userData.outlineParameters={thickness:.0018};return m;};
export function M(geo,mat,p,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;if(p)p.add(m);return m;}
export const cyl=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||14);
export const sph=(r,w,h)=>new THREE.SphereGeometry(r,w||16,h||12);
export const box=(a,b,c)=>new THREE.BoxGeometry(a,b,c);
export const flat=geo=>{const g=geo.index?geo.toNonIndexed():geo;g.computeVertexNormals();return g;};
export function cvTex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
export function beam(p,a,b,r,mat){const d=new V3().subVectors(b,a),l=d.length();const m=M(cyl(r,r,l,6),mat,p);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize());return m;}
export function mergeBoxes(list){const pos=[],nor=[],uv=[];for(const [w,h,d,x,y,z] of list){const g=new THREE.BoxGeometry(w,h,d).toNonIndexed();g.translate(x,y,z);
  for(const v of g.attributes.position.array)pos.push(v);for(const v of g.attributes.normal.array)nor.push(v);for(const v of g.attributes.uv.array)uv.push(v);g.dispose();}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return G;}
export function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const GH={};
export function ghostOf(mat,op){const k=mat.uuid+'|'+op;if(!GH[k]){const g=mat.clone();g.transparent=true;g.opacity=op;g.depthWrite=false;g.userData={outlineParameters:NOOL};GH[k]=g;}return GH[k];}
