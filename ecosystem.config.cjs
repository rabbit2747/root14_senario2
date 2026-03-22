/**
 * PM2 Ecosystem Config
 * 실행: pm2 start ecosystem.config.cjs
 * 재부팅 자동시작: pm2 startup → (출력 명령어 복붙) → pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'gotroot-prod',
      script: 'server.js',
      cwd: '/Users/db/Desktop/Gotroot_Edu',
      interpreter: '/Users/db/.nvm/versions/node/v24.14.0/bin/node',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
// 변경 이력:
// v0.9.7 (2026-03-09): serve -s → Express server.js 전환
//   serve-prod.sh 내에서 node server.js 실행 (nvm 환경 필요)
//   롤백: serve-prod.sh의 exec 줄을 원래대로 변경
// v1.1.0 (2026-03-14): serve-prod.sh → server.js 직접 실행으로 변경
//   macOS com.apple.provenance 보안 속성이 bash 스크립트 실행 차단
//   interpreter를 nvm 절대경로로 지정하여 우회
