import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteObfuscateFile } from 'vite-plugin-obfuscator'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
    host: '0.0.0.0',
    port: 5173,
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
