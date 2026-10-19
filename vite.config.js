import { defineConfig } from 'vite';

// base './': GitHub Pages 하위 주소(…/저장소이름/)에서도 파일 경로가 맞도록 상대 경로로 빌드
export default defineConfig({ base: './' });
