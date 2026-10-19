import * as THREE from 'three';

/* ================= DATA ================= */
export const CLS={
  gun:{n:'포수',ic:'💣',desc:'폭발하는 무거운 포탄을 한 발 쏩니다',hp:240,dmg:210,proj:1,acc:85,rad:1.2,v:22,g:9.8,ang:12,roomMul:1.35,wallMul:1.2,expMul:1,cig:0,pros:'선실을 가장 크게 부숩니다',cons:'한 발뿐이라 빗나가면 끝'},
  sniper:{n:'저격수',ic:'🎯',desc:'거의 일직선으로 날아가 선실 3칸까지 꿰뚫습니다',hp:170,dmg:140,proj:1,acc:97,rad:.3,v:42,g:3,ang:2,pierce:3,roomMul:.55,wallMul:.6,expMul:1.6,cig:.45,pros:'벽을 꿰뚫어 숨은 동료를 직접 노립니다',cons:'선실은 잘 부수지 못합니다'},
  bomb:{n:'폭탄병',ic:'🧨',desc:'포물선으로 던진 폭탄이 넓은 범위를 날려버립니다',hp:200,dmg:160,proj:1,acc:80,rad:2.0,v:16,g:9.8,ang:38,roomMul:1,wallMul:1,expMul:1.1,cig:.3,pros:'벽 너머 윗층과 지붕을 넓게 터뜨립니다',cons:'오래 날아서 바람을 많이 탑니다'},
  bow:{n:'궁수',ic:'🏹',desc:'화살 4발을 빠르게 연달아 쏩니다',hp:180,dmg:62,proj:4,acc:88,rad:.55,v:25,g:9.8,ang:10,spread:.02,delay:.13,roomMul:.5,wallMul:.5,expMul:2,cig:0,pros:'밖으로 드러난 동료에게 치명적입니다',cons:'벽과 선실에는 약합니다'},
  shot:{n:'산탄수',ic:'🔫',desc:'탄환 8발이 산탄처럼 퍼집니다',hp:190,dmg:38,proj:8,acc:70,rad:.45,v:26,g:9.8,ang:8,spread:.05,roomMul:.8,wallMul:2.2,expMul:1.3,cig:0,pros:'벽을 순식간에 너덜너덜하게 뜯어냅니다',cons:'멀리 쏘면 탄이 퍼져 약해집니다'}
};
export const RAR={c:{n:'일반',col:'#9aa6b8',mul:1,bd:'#8a96a8'},r:{n:'희귀',col:'#4a9bff',mul:1.15,bd:'#3d8bff'},l:{n:'전설',col:'#ffbf2e',mul:1.35,bd:'#ffb52e'}};
export const FACBG={pirate:'linear-gradient(160deg,#ff8a5a,#c8382d)',navy:'linear-gradient(160deg,#6aa8ff,#2f62c4)',neutral:'linear-gradient(160deg,#7fe08a,#2f8a52)'};
export const SK='#f2b88a',SK2='#e39a6c',SK3='#b9784c',SK4='#bfe6ee';
export const CH=[
 {id:'fin',n:'갑판원 핀',s:'핀',fac:'pirate',rar:'c',cls:'gun',w:'cannon',p:'ball',tc:'#ffffff',bc:'#ff8a2a',sig:'작은 갑판 대포를 성실하게 쏩니다',L:{skin:SK,coat:'#eae2cf',trim:'#c63c31',hat:'bandana',hatC:'#d23b30',hair:'#7a4a24',stripes:1}},
 {id:'tom',n:'술고래 톰',s:'톰',fac:'pirate',rar:'c',cls:'bomb',w:'bottle',p:'bottle',tc:'#ffb060',bc:'#ff6a1a',sig:'불붙인 럼주병을 던져 불바다를 만듭니다',L:{skin:SK2,coat:'#7a4b2a',trim:'#d9a441',hat:'none',hair:'#5a3a1e',beard:'#5a3a1e',bald:1,belly:1,nose:1}},
 {id:'lu',n:'외눈 루',s:'루',fac:'pirate',rar:'c',cls:'bow',w:'bow',p:'arrow',tc:'#ffffff',bc:'#ffcf6a',sig:'갈고리 손으로도 화살을 놓치지 않습니다',L:{skin:SK,coat:'#4d6b3a',trim:'#c9a46a',hat:'bandana',hatC:'#262626',hair:'#1e1e1e',patch:1,stubble:1}},
 {id:'ray',n:'쌍권총 레이',s:'레이',fac:'pirate',rar:'r',cls:'shot',w:'pistols',p:'pellet',tc:'#ffe6a0',bc:'#ffcf6a',sig:'양손 권총으로 탄환을 흩뿌립니다',L:{skin:SK,coat:'#8e2b2b',trim:'#e0b14a',hat:'tricorn',hatC:'#1d1d1d',hair:'#1e1e1e',must:'#1e1e1e',long:1}},
 {id:'mago',n:'화약쟁이 마고',s:'마고',fac:'pirate',rar:'r',cls:'bomb',w:'dynamite',p:'dynamite',tc:'#ffd06a',bc:'#ff5a1a',sig:'다이너마이트 다발로 크게 터뜨립니다',L:{skin:SK,coat:'#5a3d6b',trim:'#e8892b',hat:'bandana',hatC:'#e8892b',hair:'#c2421f',fem:1,soot:1}},
 {id:'kid',n:'작살눈 키드',s:'키드',fac:'pirate',rar:'r',cls:'sniper',w:'harpoon',p:'harpoon',tc:'#d8f0ff',bc:'#bfe6ff',sig:'작살총으로 벽을 꿰뚫고 박아 넣습니다',L:{skin:SK,coat:'#2f6f7a',trim:'#e7d7b0',hat:'beanie',hatC:'#c23a2e',hair:'#e8c45a'}},
 {id:'bargo',n:'붉은수염 바르고',s:'바르고',fac:'pirate',rar:'l',cls:'gun',w:'cannonSkull',p:'skull',tc:'#ff8a2a',bc:'#ff4a1a',sig:'앵무새 럼과 함께 불타는 해골 포탄을 쏩니다',cap:'포수 공격력 +30%',L:{skin:SK2,coat:'#a61e22',trim:'#f0c040',hat:'captain',hatC:'#1a1a1a',hair:'#d0451f',beard:'#d0451f',big:1,long:1,brave:1}},
 {id:'isabel',n:'검은 장미 이자벨',s:'이자벨',fac:'pirate',rar:'l',cls:'shot',w:'goldPistols',p:'goldPellet',tc:'#ff7aa8',bc:'#ff4f8a',sig:'황금 쌍권총에서 장미빛 탄환이 쏟아집니다',cap:'해적 동료 치명타 확률 +15%',L:{skin:SK,coat:'#26232e',trim:'#d6334a',hat:'captain',hatC:'#26232e',hair:'#1a1a22',fem:1,rose:1,long:1}},
 {id:'hans',n:'수병 한스',s:'한스',fac:'navy',rar:'c',cls:'gun',w:'cannon',p:'ball',tc:'#ffffff',bc:'#ff8a2a',sig:'해군 제식 대포를 다룹니다',L:{skin:SK,coat:'#2d5aa8',trim:'#ffffff',hat:'cap',hatC:'#f4f4f4',hair:'#e8c45a',cross:1}},
 {id:'emma',n:'견습 사관 엠마',s:'엠마',fac:'navy',rar:'c',cls:'sniper',w:'musket',p:'bullet',tc:'#ffffff',bc:'#ffe27a',sig:'망원경으로 살핀 뒤 머스킷을 쏩니다',L:{skin:SK,coat:'#2d5aa8',trim:'#f0c040',hat:'bicorne',hatC:'#1b2440',hair:'#8a5a2b',fem:1,cross:1}},
 {id:'otto',n:'석궁병 오토',s:'오토',fac:'navy',rar:'c',cls:'bow',w:'crossbow',p:'bolt',tc:'#ffffff',bc:'#ffcf6a',sig:'묵직한 석궁 볼트를 연사합니다',L:{skin:SK2,coat:'#3b4f8a',trim:'#ffffff',hat:'shako',hatC:'#1b2440',hair:'#6b4a2a',must:'#6b4a2a',cross:1}},
 {id:'gray',n:'포술장 그레이',s:'그레이',fac:'navy',rar:'r',cls:'gun',w:'cannonBrass',p:'ball',tc:'#ffffff',bc:'#ff8a2a',sig:'외알 안경 너머로 황동 대포를 조준합니다',L:{skin:SK2,coat:'#1f3a73',trim:'#f0c040',hat:'bicorne',hatC:'#1b2440',hair:'#c8c8c8',beard:'#c8c8c8',epa:1,mono:1}},
 {id:'bruno',n:'척탄 상사 브루노',s:'브루노',fac:'navy',rar:'r',cls:'bomb',w:'grenade',p:'grenade',tc:'#ffe0a0',bc:'#ff6a1a',sig:'수류탄을 높이 던져 넓게 터뜨립니다',L:{skin:SK,coat:'#b3322c',trim:'#ffffff',hat:'shako',hatC:'#1b2440',hair:'#2a2a2a',must:'#2a2a2a',cross:1,brave:1}},
 {id:'rian',n:'기병 리안',s:'리안',fac:'navy',rar:'r',cls:'shot',w:'blunder',p:'pellet',tc:'#ffe6a0',bc:'#ffcf6a',sig:'나팔총 한 방에 탄환이 넓게 퍼집니다',L:{skin:SK,coat:'#25407a',trim:'#f0c040',hat:'shako',hatC:'#8a1f1f',hair:'#2a2a2a',epa:1}},
 {id:'alex',n:'제독 알렉산더',s:'알렉산더',fac:'navy',rar:'l',cls:'gun',w:'cannonGold',p:'goldball',tc:'#ffe27a',bc:'#ffc23a',sig:'황금 대포에서 황금 포탄을 쏩니다',cap:'모든 선실 체력 +20%',L:{skin:SK,coat:'#13254d',trim:'#f0c040',hat:'admiral',hatC:'#13182b',hair:'#f2f2f2',must:'#f2f2f2',epa:1,long:1,brave:1}},
 {id:'eliza',n:'엘리자 대령',s:'엘리자',fac:'navy',rar:'l',cls:'sniper',w:'rifle',p:'tracerBlue',tc:'#7ac8ff',bc:'#a8e0ff',sig:'조준경 소총의 푸른 탄환이 벽을 꿰뚫습니다',cap:'조준 시 착탄 예측이 더 정확해짐',L:{skin:SK,coat:'#f2f0ea',trim:'#2d5aa8',hat:'bicorne',hatC:'#13182b',hair:'#f0d27a',fem:1,epa:1,long:1}},
 {id:'kasim',n:'용병 카심',s:'카심',fac:'neutral',rar:'r',cls:'shot',w:'blunder',p:'pellet',tc:'#ffe6a0',bc:'#ffcf6a',sig:'사막의 나팔총으로 가까운 곳을 휩쓸어 버립니다',L:{skin:SK3,coat:'#7b4a8c',trim:'#e0b44a',hat:'turban',hatC:'#f2efe6',hair:'#1e1e1e',beard:'#1e1e1e'}},
 {id:'mira',n:'사냥꾼 미라',s:'미라',fac:'neutral',rar:'r',cls:'bow',w:'longbow',p:'featherArrow',tc:'#b8ffb0',bc:'#c8ff9a',sig:'긴 활로 깃털 화살을 연달아 쏩니다',L:{skin:SK,coat:'#3f7a43',trim:'#c9a46a',hat:'hood',hatC:'#3f7a43',hair:'#8a5a2b',fem:1}},
 {id:'shadow',n:'현상금 사냥꾼 그림자',s:'그림자',fac:'neutral',rar:'l',cls:'sniper',w:'darkRifle',p:'tracerPurple',tc:'#c07aff',bc:'#d0a0ff',sig:'그림자 소총의 보랏빛 탄환이 벽을 꿰뚫습니다',cap:'적 동료에게 주는 피해 +30%',L:{skin:SK,coat:'#2e2e38',trim:'#9b2d2d',hat:'hood',hatC:'#26262e',hair:'#1e1e1e',mask:1,glow:1,long:1}},
 {id:'sera',n:'바다마녀 세라',s:'세라',fac:'neutral',rar:'l',cls:'bomb',w:'potion',p:'potion',tc:'#7affc8',bc:'#5affb0',sig:'바다 마법 물약을 던져 초록 폭발을 일으킵니다',cap:'공격 시 25% 확률로 화재',L:{skin:SK4,coat:'#2a5d73',trim:'#7fe0c8',hat:'witch',hatC:'#1f6f7a',hair:'#7fe0c8',fem:1,long:1}}
];
export const CHM=Object.fromEntries(CH.map(c=>[c.id,c]));
export const TRAITS={fin:{t:'벽 피해 +30%',wall:1.3},tom:{t:'맞은 선실에 3턴간 불이 붙음',fire:1},lu:{t:'화살 5발 연사',proj:5},ray:{t:'탄환 10발',proj:10},mago:{t:'폭발 반경 +35%',rad:1.35},kid:{t:'작살이 벽을 크게 찢음 (벽 피해 +60%)',wall:1.6},
 bargo:{t:'불타는 해골탄: 40% 확률로 화재',fireP:.4},isabel:{t:'치명타 확률 +20%',crit:.2},hans:{t:'바람 영향 -40%',wind:.6},emma:{t:'4칸까지 관통',pierce:4},otto:{t:'볼트가 무거워 바람 영향 -50%',wind:.5},gray:{t:'포탄 반경 +25%',rad:1.25},
 bruno:{t:'수류탄 2개를 연달아 투척',proj:2,spread:.035,delay:.22},rian:{t:'탄이 덜 퍼져 멀리서도 강함',spread:.55},alex:{t:'황금 포탄 피해 +25%',dmg:1.25},eliza:{t:'엄폐를 70% 무시',cover:.7},kasim:{t:'벽 피해 +40%',wall:1.4},mira:{t:'바람 영향을 받지 않음',wind:0},
 shadow:{t:'엄폐를 완전히 무시',cover:1},sera:{t:'독구름: 주변 선실에 3턴간 피해',poison:1}};
CH.forEach(c=>c.tr=TRAITS[c.id]);
export function eff(cr){const k=CLS[cr.cls],t=cr.def.tr||{};return{proj:t.proj||k.proj,spread:k.spread?k.spread*(t.spread||1):(t.spread||0),delay:t.delay!=null?t.delay:(k.delay||0),rad:k.rad*(t.rad||1),wind:t.wind!=null?t.wind:1,pierce:t.pierce||k.pierce||0,crit:t.crit||0,dmg:t.dmg||1,wall:k.wallMul*(t.wall||1),cig:Math.max(k.cig,t.cover||0),roomMul:k.roomMul,expMul:k.expMul};}
export const MAXF=3,MAXB=22;
export const defLayout=()=>[
 [[2,2,2,2],[1,2,2,1],[1,1,1,1]],
 [[0,1,1,0],[0,2,2,0],[0,0,0,0]],
 [[0,0,0,0],[0,0,0,0],[0,0,0,0]]];
export const S={gem:10,wood:480,gold:1520,stage:2,pity:47,chests:1,
 owned:{bargo:{lv:3,sh:2},fin:{lv:2,sh:4},tom:{lv:2,sh:1},lu:{lv:3,sh:3},ray:{lv:2,sh:2},hans:{lv:1,sh:1}},
 equip:['bargo','lu','ray','tom'],cap:'bargo',layout:defLayout(),
 place:{bargo:{f:1,r:0,c:1},lu:{f:0,r:1,c:0},ray:{f:0,r:0,c:3},tom:{f:1,r:1,c:2}},
 daily:[1,1,1,2,0],skin:'pirate',skins:{pirate:1,clipper:1}};
export const pad=l=>{while(l.length<MAXF)l.push([[0,0,0,0],[0,0,0,0],[0,0,0,0]]);return l;};
export const STAGES=[
 {name:'갈매기 여울',ship:'해군 순찰선',fac:'navy',crew:['hans','emma','otto'],layout:pad([[[1,1,1,1],[1,1,1,1],[0,1,1,0]],[[0,1,0,0],[0,1,1,0],[0,0,0,0]]])},
 {name:'산호초 해협',ship:'해군 쾌속선',fac:'navy',crew:['hans','otto','emma','bruno'],layout:pad([[[2,1,1,2],[1,2,2,1],[1,1,1,1]],[[1,0,0,1],[0,2,2,0],[0,1,0,0]]])},
 {name:'안개 해역',ship:'HMS 유니콘호',fac:'navy',crew:['gray','bruno','emma','rian'],layout:pad([[[3,2,2,3],[2,3,3,2],[2,2,2,2]],[[2,1,1,2],[0,3,3,0],[0,1,1,0]],[[0,0,0,0],[0,2,0,0],[0,0,0,0]]])},
 {name:'폭풍의 곶',ship:'HMS 그리폰호',fac:'navy',crew:['gray','rian','eliza','bruno'],layout:pad([[[3,3,3,3],[3,3,3,3],[2,2,2,2]],[[2,2,2,2],[0,3,3,0],[2,0,0,2]],[[0,2,0,0],[0,0,3,0],[0,0,0,0]]])},
 {name:'해적 소굴',ship:'검은 상어호',fac:'pirate',crew:['kid','mago','ray','fin'],layout:pad([[[3,3,3,3],[4,3,3,4],[3,3,3,3]],[[3,0,0,3],[3,4,4,3],[0,3,3,0]],[[0,3,0,0],[0,0,3,0],[0,0,0,0]]])},
 {name:'제독의 함대',ship:'HMS 로열 크라운',fac:'navy',boss:1,crew:['alex','eliza','gray','bruno'],layout:pad([[[4,4,4,4],[4,4,4,4],[3,3,3,3]],[[3,2,2,3],[3,4,4,3],[2,0,0,2]],[[0,2,2,0],[0,3,3,0],[0,0,0,0]]])}
];
export const lvMul=lv=>1+.08*(lv-1);
export function stats(id,lv){const c=CHM[id],k=CLS[c.cls],m=RAR[c.rar].mul*lvMul(lv);return{hp:Math.round(k.hp*m),dmg:Math.round(k.dmg*m),proj:k.proj,acc:Math.min(99,k.acc+lv*.4).toFixed(1),rad:(k.rad*(1+.02*(lv-1))).toFixed(2)};}
export const shNeed=lv=>lv*2+1,upCost=lv=>Math.round(18*lv*lv+5);
export const roomCost=lv=>({gold:60*lv*lv+15,wood:20*lv+5});
export const roomHp=lv=>160+90*(lv-1);
export const BUILD_COST=120;
