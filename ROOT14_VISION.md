# ROOT14 Vision

ROOT14는 보안 교육 플랫폼이 아니다.
**"APT 경험 디자인"** 이다.

사용자가 "내가 실제 공격 캠페인을 운영하고 있다"는 감각을 갖는
공격 캠페인 체험 플랫폼.

> ROOT14_RULES.md를 먼저 읽는다. 그 다음 이 문서를 본다.

---

## 두 캠페인은 완전히 다른 작품이다

| 요소 | Ledger Mirage | Orion Echo |
|---|---|---|
| **공격 방식** | 사람 조작 | 인프라 침투 |
| **핵심** | 신뢰 악용 | 공급망 장악 |
| **중심 자산** | 이메일/결재 | 빌드/업데이트 |
| **주요 감정** | 압박감 | 탐험감 |
| **플레이 속도** | 빠름 | 장기적 |
| **핵심 UI** | 메일/결재 흐름 | 네트워크/DevOps |
| **공격자 스타일** | 사기형 공격자 | APT 운영자 |
| **주요 기술** | BEC | Supply Chain |
| **최종 목표** | 송금 조작 | 고객 환경 침투 |
| **영화 톤** | Catch Me If You Can / White Collar Fraud | Mr. Robot / Zero Day / SolarWinds |

---

## PAGE 01 · Operation Ledger Mirage
**"조직의 신뢰 구조를 해킹하라."**

### 기반
BEC · Executive Impersonation · Mailbox Manipulation · Payment Workflow Abuse

### 핵심 플레이 감정
압박 · 조작 · 심리전 · 은닉 · 신뢰 악용

### 플레이어 역할
**Financial Fraud Operator**

### 플레이 흐름
```
Recon
 → Trust Building
 → Thread Hijacking
 → Mailbox Manipulation
 → Payment Redirection
 → Defensive Pressure
 → Outcome
```

### 메인 UI
- 이메일 스레드 콘솔
- Finance Approval Flow
- Mailbox Rule Engine
- Executive Pressure Meter
- Suspicion Meter

### MITRE
T1566.002 · T1078 · T1114 · T1098.002 · T1656

### 분위기
사회공학 · 비즈니스 사기 · 화이트칼라 범죄 · 메일 기반 심리전

---

## PAGE 02 · Operation Orion Echo
**"신뢰된 공급망을 장악하라."**

### 기반
SolarWinds-inspired · Enterprise APT · Supply Chain · DevOps Pivoting · Trusted Update Abuse

### 핵심 플레이 감정
침투 · 정찰 · 내부망 확장 · 장기 작전 · 공급망 장악

### 플레이어 역할
**Advanced Persistent Threat Operator**

### 플레이 흐름
```
External Recon
 → Initial Access
 → Foothold
 → C2 Registration
 → Internal Discovery
 → Credential Discovery
 → DevOps Pivot
 → Build Pipeline
 → Trusted Update
 → Customer Environment
 → Final Collection
```

### 메인 UI
- Enterprise Network Map
- Service Discovery Console
- C2 Emulator Panel
- Build Pipeline Graph
- Update Propagation Monitor
- Customer Environment View

### MITRE
T1190 · T1046 · T1213 · T1550.001 · T1072 · T1195.002 · T1530

### 분위기
APT · Red Team · Supply Chain · Corporate Intrusion · Infrastructure Warfare

---

## 플랫폼 11 섹션 구조

### (1) 시나리오 선택 페이지 — Threat Intelligence Archive
"게임 선택"이 아니라 첩보 기록 보관소 느낌.

각 시나리오 카드:
- Campaign Name · Threat Type · Estimated Duration
- ATT&CK Coverage · Difficulty · Target Industry · APT Style

추천 효과: VHS 노이즈, CCTV 스타일, Intel dossier, classified stamp, campaign timeline preview

### (2) Intro 페이지 — 작전 브리핑
단순 목차 X. 작전 브리핑.

```
SECTION 1  Mission Brief         (Target · Threat Context · Operation Objective)
SECTION 2  What You Will Experience  (단계 미리보기)
SECTION 3  ATT&CK Coverage       (전술별 막대 시각화)
SECTION 4  Cinematic Preview     (짧은 영상/3D 프리뷰)
```

### (3) 시네마틱 체험 — 인터랙티브 시네마틱
**영상 만들지 마. 인터랙티브 다큐멘터리로.**

스택: React Three Fiber + Framer Motion + GSAP + Theatre.js

```
Camera Path → Scene Trigger → Event Animation → UI Overlay → Threat Narrative
```

진짜 게임처럼 만들려 하지 말 것.

### (4) 외부 공격자 관점 3D — ROOT14의 가장 큰 무기 (90%)
"APT가 도시를 침투하는 느낌."

복잡한 네트워크보다 공격 흐름의 직관성이 우선.

```
Internet → DMZ → Corp → DevOps → Release → Customer
```
지형처럼 표현. 공격 성공 시 네트워크가 붉게 활성화, 데이터 흐름·토큰 이동·권한 상승이 시각적으로.

### (5) 내부 피해 관점 — 최종 병기 (20%)
**"디지털 트윈 SOC"**

대부분 교육은 공격자가 뭘 했는지만. ROOT14는 내부에서 어떻게 보였는가까지.

처음부터 실시간 로그 만들지 말 것.
스크립트 기반 이벤트로 시작. **Event Timeline Engine**.

```json
{
  "event": "support_portal_exploited",
  "time": "00:03:12",
  "effects": ["network_alert", "build_server_access", "soc_log_generated"]
}
```

### (6) ATT&CK Replay
사용자가 했던 공격을 타임라인 · MITRE · 사용 기술 · 탐지 위험으로 재생.

### (7) Threat Graph
APT 흐름 그래프. Recon → Initial Access → Persistence → Discovery → Lateral Movement 실시간 시각화.

### (8) Operator Decision
사용자가 선택했던 판단 분석. 왜 phishing 대신 supply-chain을 골랐는가.

### (9) Detection Pressure
Blue Team이 얼마나 탐지했는가. SOC Visibility · EDR Risk · Network Noise.

### (10) Campaign Intelligence
이 공격이 실제 어떤 APT와 유사한가. (SolarWinds · Midnight Blizzard · BEC Fraud Rings 등)

### (11) Final Debrief — ROOT14의 진짜 핵심
**"너는 어떤 공격자였는가?"**

```
Aggressive Operator
Stealth Score: 42%
Operational Risk: HIGH
Detection Events: 17
```

---

## MVP 전략 — 절대 처음부터 만들지 말 것

❌ 멀티플레이 / 실시간 시뮬 / AI 자율 공격 / 완전 동적 엔진

```
PHASE 1  연출형 체험      ← 현재 단계
PHASE 2  반응형 분기
PHASE 3  동적 시나리오 생성
```

---

## 우리는 무엇을 하고 있는가

**"보안 교육"이 아니라 "APT 경험 디자인"**.

사용자가 "내가 실제 공격 캠페인을 운영하고 있다"는 감각을 갖도록 만든다.
