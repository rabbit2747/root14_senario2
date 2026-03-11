import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteObfuscateFile } from 'vite-plugin-obfuscator'

// ── Dev 보안 플러그인: 외부 IP에서 소스 파일 직접 접근 차단 ──
// host: '127.0.0.1' 바인딩이 1차 방어선. 이 미들웨어는 심층방어(defense-in-depth)
// /@vite/ 는 Vite 내부 HMR 엔드포인트이므로 제외 (차단 시 서버 404 발생)
const blockExternalSourcePlugin = {
  name: 'block-external-source',
  apply: 'serve',
  configureServer(server) {
    const BLOCKED = ['/src/', '/@fs/', '/.env', '/node_modules/'];
    server.middlewares.use((req, res, next) => {
      // /api/ip — 개발 서버에서도 클라이언트 IP 반환 (프로덕션 server.js와 동일)
      if (req.url === '/api/ip') {
        const forwarded = req.headers['x-forwarded-for'];
        const clientIp = forwarded
          ? forwarded.split(',')[0].trim()
          : req.socket?.remoteAddress || 'unknown';
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ip: clientIp }));
        return;
      }

      const ip = req.socket?.remoteAddress ?? '';
      const isLocal =
        ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
      if (!isLocal && BLOCKED.some(p => req.url?.startsWith(p))) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end('403 Forbidden: Source access denied from external IP');
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    blockExternalSourcePlugin,
    viteObfuscateFile({
      apply: 'build',
      debugProtection: false,
      options: {
        // ── 문자열 보호 (강화) ──
        stringArray: true,
        stringArrayThreshold: 1.0,               // 모든 문자열 암호화 (기존 0.75)
        stringArrayEncoding: ['base64'],          // Base64 인코딩 적용
        stringArrayWrappersCount: 2,              // 래퍼 함수 2중
        stringArrayWrappersChainedCalls: true,    // 래퍼 체이닝
        stringArrayWrappersType: 'function',      // 함수형 래퍼
        rotateStringArray: true,
        stringArrayRotate: true,
        splitStrings: true,
        splitStringsChunkLength: 8,               // 더 잘게 분할 (기존 10)

        // ── 식별자 난독화 ──
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,                     // React 호환성 유지

        // ── 제어 흐름 난독화 (안전 수준) ──
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.3,      // 30%만 적용 (성능 보호)

        // ── 데드 코드 삽입 (역분석 방해) ──
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,          // 20% — 번들 크기 최소 증가

        // ── 숫자/불리언 변환 ──
        numbersToExpressions: true,               // 42 → 0x2a + 0x0
        transformObjectKeys: false,               // React props 보호 (false 유지!)

        // ── 보호 메커니즘 ──
        selfDefending: true,                      // 포맷팅 시 코드 중단
        disableConsoleOutput: true,               // 프로덕션 console 차단

        // ── Unicode 이스케이프 ──
        unicodeEscapeSequence: true,              // 한국어 문자열도 이스케이프
      },
    }),
  ],
  server: {
    host: '127.0.0.1', // 로컬호스트 전용 — 외부 네트워크에서 dev 서버 접근 차단
    port: 5173,
    // ── Dev 소스맵 절대경로 노출 차단 ──
    // Burp Proxy 등으로 로컬 트래픽 감청 시 /Users/db/... 경로 노출 방지
    sourcemapIgnoreList: () => true,
    // ── 파일시스템 접근 제한 ──
    fs: {
      strict: true,    // 허용 목록 외 파일 /@fs/ 접근 차단
      deny: [
        '.env',
        '.env.*',
        '*.{pem,key,crt,p12,pfx}',
        '.git',
        'node_modules/.cache',
      ],
    },
  },
  build: {
    // ── 소스맵 명시적 비활성화 ──
    sourcemap: false,
    rollupOptions: {
      output: {
        // ── 파일명에서 구조 정보 제거 (해시만 사용) ──
        chunkFileNames: 'assets/c-[hash].js',
        entryFileNames: 'assets/e-[hash].js',
        assetFileNames: 'assets/a-[hash].[ext]',
        manualChunks: {
          // ── 벤더 라이브러리 분리 (이름은 해시로 대체됨) ──
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-router':   ['react-router-dom'],
          'vendor-framer':   ['framer-motion'],
          'vendor-ga':       ['react-ga4'],
        },
      },
    },
    chunkSizeWarningLimit: 1200, // 난독화로 약간 증가 예상
  },
})
