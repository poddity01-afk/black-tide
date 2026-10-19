import { S } from './data.js';

// 진행 상황을 브라우저(폰)에 자동 저장합니다.
const KEY = 'blacktide.save.v1';
let last = '';

export function loadSave() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && d.v === 1) Object.assign(S, d.s);
  } catch (e) { /* 저장 데이터가 없거나 손상됨: 새로 시작 */ }
}

export function saveNow() {
  try {
    const j = JSON.stringify({ v: 1, s: S });
    if (j !== last) { localStorage.setItem(KEY, j); last = j; }
  } catch (e) { /* 저장 공간을 쓸 수 없는 환경 */ }
}

export function resetSave() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  location.reload();
}

export function startAutosave() {
  setInterval(saveNow, 2000);
  addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
  addEventListener('pagehide', saveNow);
}

// 홈 화면 앱(오프라인 지원) 등록: 배포된 사이트에서만 동작
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
