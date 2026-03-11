/**
 * PM2 Ecosystem Config
 * 실행: pm2 start ecosystem.config.cjs
 * 재부팅 자동시작: pm2 startup → (출력 명령어 복붙) → pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'gotroot-prod',
      script: '/Users/db/Desktop/Gotroot_Edu/serve-prod.sh',
      interpreter: '/bin/bash',
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
