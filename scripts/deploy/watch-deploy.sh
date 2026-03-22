#!/bin/bash
# ─────────────────────────────────────────────
# 코드 변경 감지 → 자동 빌드 + prod 재시작
# 사용법: ./watch-deploy.sh
# 종료: Ctrl+C
# ─────────────────────────────────────────────
source /Users/db/.nvm/nvm.sh

PROJECT="/Users/db/Desktop/Gotroot_Edu"
cd "$PROJECT"

echo "👁 src/ 변경 감시 시작 (Ctrl+C로 종료)"

# fswatch는 macOS 내장 kqueue 기반 — brew 없이도 사용 가능
if ! command -v fswatch &>/dev/null; then
  echo "⚠ fswatch가 없습니다. 아래 명령어로 설치하세요:"
  echo "  brew install fswatch"
  echo ""
  echo "  또는 수동 배포: ./deploy.sh"
  exit 1
fi

LAST_BUILD=0
DEBOUNCE=3  # 연속 저장 시 3초 후 빌드 (중복 방지)

fswatch -r "$PROJECT/src" | while read -r event; do
  NOW=$(date +%s)
  if (( NOW - LAST_BUILD >= DEBOUNCE )); then
    LAST_BUILD=$NOW
    echo ""
    echo "🔄 변경 감지: $(date '+%H:%M:%S') — 빌드 시작..."
    if npm run build 2>&1; then
      pm2 restart gotroot-prod 2>/dev/null || pm2 start ecosystem.config.cjs
      echo "✓ 배포 완료"
    else
      echo "✗ 빌드 실패 — prod 서버 유지"
    fi
  fi
done
