#!/bin/bash
# ─────────────────────────────────────────────
# Gotroot Edu 배포 스크립트
# 사용법: ./deploy.sh
# 기능: 빌드 → pm2 prod 서버 재시작
# ─────────────────────────────────────────────
set -e

source /Users/db/.nvm/nvm.sh

PROJECT="/Users/db/Desktop/Gotroot_Edu"
cd "$PROJECT"

echo "▶ [1/3] 빌드 시작..."
npm run build

echo "▶ [2/3] prod 서버 재시작..."
if pm2 list | grep -q "gotroot-prod"; then
  pm2 delete gotroot-prod
fi
pm2 start ecosystem.config.cjs

echo "▶ [3/3] 상태 확인..."
pm2 show gotroot-prod

echo "✓ 배포 완료 — http://$(ipconfig getifaddr en0):4173"
