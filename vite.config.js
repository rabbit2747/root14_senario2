import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteObfuscateFile } from 'vite-plugin-obfuscator'
import http from 'node:http'
import { execFileSync } from 'node:child_process'

// ── Dev 방문자 IP 수집 (server.js 프로덕션 미들웨어와 동일 로직) ──
// Supabase REST API 직접 호출. IP당 1시간 1회 제한.
const devVisitedIPs = new Map();

function normalizeClientIp(ip = '') {
  return ip.replace(/^::ffff:/, '');
}

function isPrivateOrLocalIp(ip) {
  if (ip === '127.0.0.1' || ip === '::1') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  const match = ip.match(/^172\.(\d+)\./);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}
const DEV_VISIT_COOLDOWN = 60 * 60 * 1000; // 1시간

async function devLogVisitorIP(ip, path) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
    if (!supabaseUrl || !supabaseKey) return;

    await fetch(`${supabaseUrl}/rest/v1/access_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${serviceKey}`, // service role → RLS 우회
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: null,
        email: 'anonymous',
        ip,
        action: 'page_visit',
        technique: path,
      }),
    });
  } catch { /* fire-and-forget */ }
}

// ── Dev 보안 플러그인: 외부 IP에서 소스 파일 직접 접근 차단 + IP 수집 ──
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

      // ── Dev 방문자 IP 수집 (HTML 페이지 요청만) ──
      const url = req.url?.split('?')[0] || '';
      const hasExt = url.lastIndexOf('.') > url.lastIndexOf('/');
      const isPage = !hasExt || url.endsWith('.html');
      const isInternal = url.startsWith('/@') || url.startsWith('/__') || url.startsWith('/node_modules/') || url.startsWith('/src/');
      if (isPage && !isInternal) {
        const forwarded = req.headers['x-forwarded-for'];
        const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
        if (clientIp !== 'unknown') {
          const now = Date.now();
          const lastVisit = devVisitedIPs.get(clientIp);
          if (!lastVisit || (now - lastVisit) >= DEV_VISIT_COOLDOWN) {
            devVisitedIPs.set(clientIp, now);
            devLogVisitorIP(clientIp, url);
            // 캐시 크기 제한
            if (devVisitedIPs.size > 5000) {
              for (const [k, v] of devVisitedIPs) { if (now - v > DEV_VISIT_COOLDOWN) devVisitedIPs.delete(k); }
            }
          }
        }
      }

      const ip = normalizeClientIp(req.socket?.remoteAddress ?? '');
      if (!isPrivateOrLocalIp(ip) && BLOCKED.some(p => req.url?.startsWith(p))) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end('403 Forbidden: Source access denied from external IP');
        return;
      }
      next();
    });
  },
};

function rewriteLabHtml(html) {
  return html
    .replaceAll('href="/', 'href="/orion-lab/')
    .replaceAll("href='/", "href='/orion-lab/")
    .replaceAll('action="/', 'action="/orion-lab/')
    .replaceAll("action='/", "action='/orion-lab/")
    .replaceAll('src="/', 'src="/orion-lab/')
    .replaceAll("src='/", "src='/orion-lab/");
}

function discoverWslIp() {
  try {
    const output = execFileSync('wsl', ['-e', 'sh', '-lc', "hostname -I | awk '{print $1}'"], {
      encoding: 'utf8',
      timeout: 3000,
    }).trim();
    return output.split(/\s+/)[0] || '';
  } catch {
    return '';
  }
}

function buildLabTargets() {
  const configuredHost = process.env.ORION_LAB_HOST || '';
  const configuredPort = Number(process.env.ORION_LAB_PORT || '28081');
  const targets = [];
  if (configuredHost) targets.push({ host: configuredHost, port: configuredPort });
  targets.push({ host: '127.0.0.1', port: 18081 });
  const wslIp = discoverWslIp();
  if (wslIp) targets.push({ host: wslIp, port: 28081 });
  targets.push({ host: '127.0.0.1', port: 28081 });

  const seen = new Set();
  return targets.filter((target) => {
    const key = `${target.host}:${target.port}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const orionLabProxyPlugin = {
  name: 'orion-lab-proxy',
  apply: 'serve',
  configureServer(server) {
    const labTargets = buildLabTargets();
    console.log(`[orion-lab-proxy] targets: ${labTargets.map((target) => `${target.host}:${target.port}`).join(', ')}`);

    server.middlewares.use('/orion-lab', (req, res) => {
      if (req.url === '' || req.url === '/') {
        req.url = '/';
      }
      const targetPath = req.url || '/';

      const requestChunks = [];
      req.on('data', (chunk) => requestChunks.push(chunk));
      req.on('end', () => {
        const requestBody = Buffer.concat(requestChunks);
        let lastError = null;

        const tryTarget = (index) => {
          const target = labTargets[index];
          if (!target) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(`Orion lab proxy unavailable: ${lastError?.message || 'no reachable target'}\n`);
            return;
          }

          const headers = { ...req.headers, host: `${target.host}:${target.port}`, connection: 'close' };
          delete headers['proxy-connection'];
          if (requestBody.length > 0) headers['content-length'] = String(requestBody.length);

          const proxyReq = http.request(
            {
              hostname: target.host,
              port: target.port,
              path: targetPath,
              method: req.method,
              headers,
              agent: false,
            },
            (proxyRes) => {
              const chunks = [];
              proxyRes.on('data', (chunk) => chunks.push(chunk));
              proxyRes.on('end', () => {
                const body = Buffer.concat(chunks);
                const contentType = proxyRes.headers['content-type'] || '';
                const responseHeaders = { ...proxyRes.headers };
                delete responseHeaders['content-length'];
                res.statusCode = proxyRes.statusCode || 502;
                for (const [key, value] of Object.entries(responseHeaders)) {
                  if (value !== undefined) res.setHeader(key, value);
                }
                if (contentType.includes('text/html')) {
                  res.end(rewriteLabHtml(body.toString('utf8')));
                  return;
                }
                res.end(body);
              });
            },
          );

          proxyReq.setTimeout(5000, () => {
            proxyReq.destroy(new Error(`${target.host}:${target.port} timed out`));
          });

          proxyReq.on('error', (error) => {
            lastError = error;
            tryTarget(index + 1);
          });

          proxyReq.end(requestBody);
        };

        tryTarget(0);
      });
    });
  },
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    orionLabProxyPlugin,
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
