#!/bin/bash
source /Users/db/.nvm/nvm.sh

# v0.9.7: Express 서버로 교체 (/edu/*.html 서버 측 JWT 인증)
# 롤백: 아래 줄을 주석하고, 그 아래 serve 줄 주석 해제
exec node /Users/db/Desktop/Gotroot_Edu/server.js

# [롤백용] 원래 정적 서버 (인증 없음)
# exec serve -s /Users/db/Desktop/Gotroot_Edu/dist -p 4173 --no-clipboard
