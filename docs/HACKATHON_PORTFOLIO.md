# 🛡️ GOTROOT EDU — 해커톤 포트폴리오

> **"사이버 공격을 직접 체험하며 배우는 MITRE ATT&CK 기반 실전 보안 교육 플랫폼"**

---

## 📋 발표 버전 선택 가이드

| 시간 | 버전 | 이동할 섹션 |
|------|------|-------------|
| 1분  | 엘리베이터 피치 | [바로 가기 →](#-1분-발표-엘리베이터-피치) |
| 3분  | 핵심 시연 | [바로 가기 →](#-3분-발표-핵심-시연-플로우) |
| 5분  | 전체 발표 | [처음부터 순서대로] |

---

## 🎯 1분 발표: 엘리베이터 피치

```
"사이버 보안을 배우려면 해커처럼 생각해야 합니다.

 저는 MITRE ATT&CK 프레임워크 — 실제 해킹 조직들이 사용하는
 250개 이상의 공격 기법을 데이터베이스 — 를 기반으로,
 초보자도 WannaCry, SolarWinds, NotPetya 같은
 세계적 사이버 공격을 직접 시뮬레이션할 수 있는
 교육 플랫폼을 만들었습니다.

 단순 강의가 아닙니다.
 5단계 레벨 시스템, 170개 인터랙티브 실습 랩,
 5개 언어 지원 — 그리고 해커 시점 vs 방어자 시점을
 동시에 체험할 수 있는 듀얼뷰 시뮬레이터입니다.

 보안 교육의 접근성을 전 세계로 확장하는 것,
 그게 GOTROOT EDU입니다."
```

---

## 🔥 3분 발표: 핵심 시연 플로우

### 시연 순서 (스크립트 포함)

```
[00:00 - 00:20] 히어로 화면 (MITRE ATT&CK 시네마틱)
  → "이게 실제 해킹 사고들입니다. 화면에 보이는 8개 카드 —
     SolarWinds, WannaCry, Equifax, MOVEit...
     전부 뉴스에 나온 실제 사건입니다."

[00:20 - 00:50] Full Matrix 클릭 → 전술 선택
  → "MITRE ATT&CK의 14개 전술 중 '초기 접근'을 보면
     피싱, 공급망 침해 등 기법이 나옵니다.
     EDU 버튼 하나로 교육 페이지로 이동합니다."

[00:50 - 01:30] 교육 레벨 선택 (CourseSelector)
  → "novice → beginner → intermediate → advanced → expert
     5단계 순차 잠금 해제 시스템.
     이전 레벨 완료 없이는 다음 진입 불가."

[01:30 - 02:30] 실습 랩 시뮬레이터 (DesktopLab)
  → "해커 시점과 방어자 시점을 동시에 봅니다.
     왼쪽: 해커가 터미널에 명령어 실행.
     오른쪽: SOC 팀이 탐지 로그 분석.
     TTS(음성)와 함께 자동으로 단계 진행됩니다."

[02:30 - 03:00] 마무리
  → "203개 교육 페이지, 170개 랩 시나리오,
     5개 언어(한/영/일/베트남/아랍어), RTL 지원.
     모바일에서도 풀 기능 동작합니다."
```

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | GOTROOT EDU |
| **카테고리** | 사이버보안 교육 / EdTech |
| **현재 버전** | v0.9.3 |
| **개발 기간** | 2026년 2월 28일 ~ 현재 (약 8일 집중 개발) |
| **개발자** | 단독 풀스택 개발 |
| **접근 주소** | localhost:5173 (데모) |
| **타겟 사용자** | 보안 입문자 ~ 중급 실무자 |

---

## 🎯 문제 정의 (Why)

### 현재 보안 교육의 한계

```
❌ 이론 중심: 실제 공격 시나리오를 체험할 기회 없음
❌ 분절된 학습: MITRE ATT&CK 지식 ↔ 실습 환경이 별개로 존재
❌ 언어 장벽: 대부분의 고급 자료가 영어 전용
❌ 접근성: 고가의 사이버 레인지(Cyber Range) 구축 비용
❌ 게임화 부재: 진행률·성취감 없는 단방향 강의
```

### 시장 맥락

- 전 세계 사이버보안 인력 부족: **340만 명** (2023 ISC² 보고서)
- 국내 보안 전문가 양성 예산: 연간 수천억 규모
- 보안 교육 시장 CAGR: **15.6%** (2023~2028)

---

## 💡 솔루션 (What)

### GOTROOT EDU의 3대 핵심 가치

```
1. 실제 사고 기반 학습 (Incident-Based Learning)
   ├─ 8개 세계적 사이버 공격 사고 시뮬레이션
   │   (SolarWinds, WannaCry, Equifax, MOVEit 등)
   └─ MITRE ATT&CK ID와 1:1 매핑된 실습 시나리오

2. 듀얼 시점 체험 (Dual-Perspective Simulator)
   ├─ 해커 시점: 터미널 명령어 실행, 공격 단계 로그
   └─ 방어자 시점: SOC 탐지 분석, 대응 전략, 체크포인트

3. 접근성 극대화 (Accessibility-First)
   ├─ 5개 언어 (한/영/일/베트남어/아랍어 + RTL)
   ├─ 모바일 완전 지원 (390px~)
   └─ 무료, 회원가입만으로 전 기능 이용
```

---

## 🏗️ 기술 스택

### 프론트엔드

| 기술 | 용도 | 선택 이유 |
|------|------|-----------|
| **React 18** + Vite | SPA 코어 | 빠른 HMR, lazy loading |
| **Tailwind CSS** | 스타일링 | 유틸리티 우선, 반응형 |
| **React Router v6** | 클라이언트 라우팅 | 11개 라우트 관리 |
| **Framer Motion** | 애니메이션 | 히어로 시네마틱, 카드 플립 |
| **Prism.js** | 코드 하이라이팅 | 교육 HTML 코드블록 |
| **DOMPurify** | XSS 필터링 | dangerouslySetInnerHTML 보안 |
| **lucide-react** | 아이콘 | 인터랙티브 게임 UI |

### 백엔드 / 인프라

| 기술 | 용도 |
|------|------|
| **Supabase** | 인증(Auth) + PostgreSQL DB + RLS |
| **Web Speech API** | TTS 자동 음성 진행 |
| **localStorage** | 진행률 오프라인 폴백 |
| **Google Analytics 4** | 페이지 트래킹 |

### 보안 아키텍처

```
클라이언트                    Supabase
──────────────               ──────────────────────
DOMPurify (XSS)   ─────►    RLS 정책 (Row Level Security)
AdminGuard (역할)  ─────►    profiles.role 검증
AdminVerifyModal  ─────►    감사 로그 (audit_logs)
세션 타임아웃 10분 ─────►    supabase.auth.signOut()
```

---

## 🚀 핵심 기능 (Feature Map)

### 1. MITRE ATT&CK 매트릭스 대화형 뷰어

```
히어로 시네마틱 → Full Matrix 뷰 → 전술별 기법 탐색
     │                 │                  │
 8개 실제 사고    14개 전술 타일    기법 상세 + 서브기법
 TTP 체인 시각화  줌 50~200%       EDU 버튼 → 교육 연결
```

- 실시간 Supabase 데이터 + fallback JSON 이중 구조
- 기법 검색 (영문 ID / 한글 키워드)
- 5개 언어 전환 (localStorage 영속)

### 2. 5단계 레벨 기반 교육 시스템

```
novice → beginner → intermediate → advanced → expert
  🟡        🟢           🔵            🔴          ⭐
[항상]   [novice    [beginner   [intermediate  [advanced
        완료 시]    완료 시]      완료 시]       완료 시]
```

- 203개 교육 HTML 파일 (챕터별 진행률 추적)
- edu-meta.json 기반 동적 콘텐츠 관리
- CTA 라벨 자동 전환: 시작하기 → 이어하기 → 복습하기

### 3. 듀얼뷰 랩 시뮬레이터

```
┌─────────────────────┬─────────────────────┐
│     🎭 해커 PC       │    🛡️ 방어자 SOC     │
│                     │                     │
│  > nmap -sV ...     │  [ALERT] Port Scan  │
│  > mimikatz ...     │  탐지: Credential   │
│  > net user ...     │  대응: 계정 잠금    │
│                     │                     │
│  ▼ 자동 진행 (8초)  │  ✅ 체크포인트 완료 │
└─────────────────────┴─────────────────────┘
```

- 170+ JSON 시나리오 (동적 import, code-splitting)
- TTS 음성 + 타이머 이중 완료 조건
- 진행률: Supabase edu_progress + localStorage 이중 저장

### 4. 관리자 시스템 (8탭)

| 탭 | 기능 |
|----|------|
| 교육관리 | edu-meta.json CRUD (레벨/챕터/태그) |
| 매트릭스 | Supabase tactics/techniques 실시간 편집 |
| 공지사항 | 카테고리별 공지 CRUD |
| 사용자 | 역할(role) 부여/회수 |
| 랩 HTML | 실습 HTML 직접 편집 (Prism 하이라이팅) |
| 랩 시나리오 | JSON 시나리오 관리 |
| 통계 | 기법별/레벨별 학습 진행 통계 |
| 감사 로그 | 관리자 작업 이력 조회 |

---

## 📊 개발 지표

### 코드 규모

| 항목 | 수량 |
|------|------|
| React 컴포넌트 | 50+ |
| 커스텀 훅 | 10개 |
| 라우트 | 11개 |
| 교육 HTML 파일 | 203개 |
| 실습 시나리오 JSON | 170+ |
| 지원 언어 | 5개 (ko/en/ja/vi/ar) |
| Supabase 테이블 | 9개 |

### 개발 속도 (8일간 스프린트)

```
Day 1~2: 커뮤니티, 피드백, 공지사항, 이모지 피커
Day 3:   실습 에디터, Prism.js, DOMPurify, 감사 로그
Day 4:   히어로 MITRE ATT&CK 매트릭스, 다크모드, SVG 일러스트
Day 5:   교육 레벨 3→5단계, GraphicExplanation/ScenarioExplanation 신규
Day 6:   히어로 무비모드, 줌 슬라이더, 다국어(vi/ar), RTL 지원
Day 7:   번역 전면 수정, 동적 시나리오 분기, 인터랙티브 게임
Day 8:   모바일 클릭 버그 수정, 비로그인 통합 테스트, 포트폴리오
```

---

## ✨ 차별점 및 혁신성

### 기존 솔루션과 비교

| 항목 | GOTROOT EDU | Hack The Box | TryHackMe | SANS |
|------|-------------|-------------|-----------|------|
| MITRE ATT&CK 매핑 | ✅ 완전 연동 | 부분적 | 부분적 | ✅ |
| 실제 사고 시뮬레이션 | ✅ 8개 | ❌ | ❌ | 일부 |
| 무료 접근 | ✅ | 부분 유료 | 부분 유료 | 💰 고가 |
| 한국어 완전 지원 | ✅ | ❌ | ❌ | ❌ |
| 모바일 최적화 | ✅ | 미흡 | 미흡 | ❌ |
| 아랍어 RTL | ✅ | ❌ | ❌ | ❌ |
| 듀얼뷰(해커+방어) | ✅ | ❌ | ❌ | 일부 |

### 기술적 혁신

```
1. 실제 사고 → 교육 연결 파이프라인
   incidentData.js (8 사고) → MITRE ATT&CK ID → edu-meta.json → 실습 랩

2. pointer-events 계층 설계
   히어로(none) ↔ 매트릭스(auto) 상태 전환으로 클릭 이벤트 정밀 제어

3. SPA 외부 HTML 교육 시스템
   public/edu/*.html ↔ Supabase 직접 통신 (edu_progress upsert)
   React SPA와 무관하게 독립 동작 가능

4. 이중 저장 진행률 시스템
   Supabase (서버) + localStorage (오프라인 폴백) 동시 기록
```

---

## 🗺️ 시연 시나리오 (Demo Script)

### 시나리오 A: "신입 보안 담당자가 WannaCry를 배우는 여정"

```
Step 1. 히어로 화면 접속
  → WannaCry 카드 자동 하이라이트 (투어 루프)
  → "2017년 150개국 20만 대 감염, 병원·인프라 마비"

Step 2. Full Matrix → Execution → T1059 클릭
  → EDU 버튼 클릭 → /edu/T1059

Step 3. CourseSelector
  → beginner 카드 선택 → "시작하기"
  → 교육 HTML 로드 (챕터별 진행)

Step 4. 교육 완료 → graphic-link.js → GraphicExplanationPage
  → 시나리오 기반 그래픽 설명

Step 5. ScenarioExplanationPage → "실습 랩 시작"
  → DesktopLab 듀얼뷰 시뮬레이터 실행

Step 6. 실습 완료 → LabCompletionPage
  → 수료 보고서 모달 + 진행률 업데이트
```

### 시나리오 B: "관리자가 새 교육 콘텐츠를 추가하는 과정"

```
/admin → 교육관리 탭 → EduFormManager
→ 새 기법 추가 (techniqueId, 레벨, 챕터, 태그)
→ 랩 시나리오 탭 → JSON 시나리오 업로드
→ 공지사항 등록 → 사용자에게 알림
```

---

## 🔮 향후 로드맵

### 단기 (v1.0.0 목표)

```
□ AI 조교 (ChatGPT API) — 현재 AI ROOT 버튼 플레이스홀더
□ 배지/인증서 시스템
□ 팀 대항 실습 (멀티플레이어 시나리오)
□ 진행률 대시보드 고도화
```

### 중기 (사용자 50명 도달 시)

```
□ Supabase → NestJS + PostgreSQL 마이그레이션
□ WebSocket 실시간 협업
□ 모바일 앱 (React Native)
```

### 장기

```
□ 기업/학교 대상 B2B 플랜
□ 사이버 레인지 연동
□ CTF(Capture The Flag) 게임 모드
```

---

## 📁 프로젝트 구조 요약

```
Gotroot_Edu/
├── src/
│   ├── pages/          # 11개 라우트 페이지
│   ├── components/     # 50+ 재사용 컴포넌트
│   │   └── hero/       # 히어로 시네마틱 7개 컴포넌트
│   ├── hooks/          # 10개 커스텀 훅
│   ├── data/
│   │   ├── edu-meta.json        # 교육 메타데이터
│   │   └── lab-scenarios/       # 170+ 시나리오 JSON
│   └── context/        # AuthContext (세션 관리)
├── public/
│   ├── edu/            # 203개 독립 교육 HTML
│   └── videos/hero/    # 배경 영상 5개
└── docs/               # 문서
```

---

## 👤 개발자 정보

```
프로젝트: GOTROOT EDU
역할: 기획 + 디자인 + 풀스택 개발 (1인)
스택: React, Vite, Tailwind, Supabase, Node.js
특기: 보안 교육 콘텐츠 설계 + 인터랙티브 시뮬레이션 구현
```

---

## 🏆 핵심 메시지 (한 줄 요약)

> **"MITRE ATT&CK의 250개 실제 해킹 기법을 체험식 시뮬레이션으로 배우는,
> 전 세계 누구나 무료로 접근 가능한 사이버보안 교육 플랫폼"**

---

*📅 작성일: 2026-03-07 | 버전: v0.9.3*
*🔧 빌드: Vite + React 18 | 2918 modules | 빌드 성공*
