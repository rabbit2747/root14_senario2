# HTTPS 전환 계획 (Cloudflare Tunnel)

> 현재: `http://맥미니IP:4173` 외부 접속
> 목표: `https://도메인.com` (443, 자동 SSL, IP 숨김)

---

## 사전 조건

- [ ] 도메인 구매 (godaddy, namecheap 등 — 연 1~2만원)
- [ ] Cloudflare 계정 생성 (무료) → https://dash.cloudflare.com
- [ ] 도메인 네임서버를 Cloudflare로 변경 (도메인 구매처에서 설정)

---

## Step 1. Homebrew 설치

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

설치 후 PATH 등록:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

## Step 2. cloudflared 설치

```bash
brew install cloudflare/cloudflare/cloudflared
```

---

## Step 3. Cloudflare 로그인

```bash
cloudflared tunnel login
```
→ 브라우저가 열리면 Cloudflare 계정으로 로그인

---

## Step 4. 터널 생성

```bash
cloudflared tunnel create gotroot
```
→ `~/.cloudflared/<UUID>.json` 파일 생성됨 (UUID 메모 필요)

---

## Step 5. DNS 연결

```bash
# example.com 자리에 실제 도메인 입력
cloudflared tunnel route dns gotroot example.com
```

---

## Step 6. 설정 파일 작성

`~/.cloudflared/config.yml` 파일 생성:

```yaml
tunnel: <Step 4에서 생성된 UUID>
credentials-file: /Users/db/.cloudflared/<UUID>.json

ingress:
  - hostname: example.com        # 실제 도메인으로 변경
    service: http://localhost:4173
  - service: http_status:404
```

---

## Step 7. 터널 실행 테스트

```bash
cloudflared tunnel run gotroot
```
→ `https://example.com` 접속 확인

---

## Step 8. 재부팅 자동 시작 등록

```bash
sudo cloudflared service install
sudo launchctl start com.cloudflare.cloudflared
```

---

## 완성 후 구조

```
[사용자 브라우저]
       ↓ HTTPS (443)
[Cloudflare 엣지 서버] — DDoS 차단, SSL 자동
       ↓ 암호화 터널
[Mac mini] → localhost:4173 (serve dist/)
```

---

## 비용 정리

| 항목 | 비용 |
|------|------|
| Cloudflare 계정 | 무료 |
| Cloudflare Tunnel | 무료 |
| SSL 인증서 | 무료 (자동) |
| 도메인 | 연 1~2만원 (외부 구매) |

---

## 현재 운영 중인 서버 정보

| 서버 | 포트 | 용도 |
|------|------|------|
| `gotroot-prod` (pm2) | 4173 | 프로덕션 — 외부 접근 가능 |
| `gotroot-dev` (vite) | 5173 | 개발 — 127.0.0.1 로컬 전용 |

배포 명령어: `./deploy.sh`
자동 배포: `./watch-deploy.sh` (fswatch 필요 — `brew install fswatch`)
