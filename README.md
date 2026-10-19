# 블랙 타이드 (Black Tide)

해적선 포격전 모바일 게임. 웹(Vite + Three.js)으로 만들고, 나중에 Capacitor로 안드로이드/iOS 앱으로 감쌉니다.

## 실행

```bash
npm install      # 처음 한 번
npm run dev      # 개발 서버 실행
```

- PC: 터미널에 나오는 `Local` 주소를 엽니다.
- 휴대폰: PC와 같은 와이파이에 연결한 뒤, 터미널의 `Network` 주소(예: `http://192.168.0.10:5173`)를 휴대폰 브라우저로 엽니다.

```bash
npm run build    # 배포용 파일을 dist/ 에 생성
npm run preview  # 빌드 결과 미리보기
```

## 폴더 구조

| 파일 | 내용 |
|---|---|
| `src/main.js` | 화면(로비, 배 건조, 동료, 상점, 지도), 배와 선실, 전투, 게임 루프 |
| `src/crew.js` | 동료 20명의 3D 모델, 얼굴, 무기, 1인칭 손 모델 |
| `src/data.js` | 클래스, 동료, 고유 능력, 스테이지, 기본 진행 상태 등 밸런스 데이터 |
| `src/audio.js` | 효과음 (외부 파일 없이 코드로 합성) |
| `src/util.js` | Three.js 공통 도구 (툰 재질, 도형 생성 등) |
| `src/save.js` | 진행 상황 자동 저장 (2초마다, 앱을 닫을 때) |
| `src/style.css` | UI 스타일 |

밸런스(피해량, 비용, 확률)를 바꾸려면 `src/data.js`만 고치면 됩니다.

## 다음 단계

- `src/main.js`를 화면별, 전투별 파일로 더 나누기
- 저장 데이터 초기화 버튼, 설정 화면
- 3D 모델을 전문 에셋으로 교체
- Capacitor로 안드로이드 앱 빌드 (iOS는 Mac 필요)
