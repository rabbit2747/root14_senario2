# APT 1인칭 시나리오 — 작업 핸드오프 문서

> **목적**: 다른 세션/계정에서 이 작업을 정확히 이어받기 위한 컨텍스트 보존
> **마지막 업데이트**: 2026-04-19 (계정 전환 시점)
> **마지막 커밋**: `a972367 feat(apt): 분기 인터셉트 + Scene 6 미니분기 + NotPetya 시나리오 #02`
> **이번 핸드오프 커밋**: `feat(apt): ChkdskScene 등록 + 핸드오프 문서` (이 문서가 포함된 커밋)

---

## 1. 컨셉 — "사용자가 공격을 완성한다"

학습자가 평범한 직원이 되어 업무를 처리한다 → **마지막에 "내가 한 모든 클릭이 공격이었다"는 충격**으로 ATT&CK 기법을 체화시킨다.

### 핵심 설계
- **Scene 1~6**: MITRE/공격 설명 0% — 평범한 업무 화면만
- **Scene 7 (결과)**: 자연어 라벨로 일괄 공개 (`💭 / 🔎 / ▶`)
- **리플레이 토글**: ATT&CK 기술번호 + 공격 실체

### CLAUDE.md 3원칙 (학습자 UI에는 절대 노출 금지, 작성자 체크리스트 전용)
| 원칙 | 학습자 라벨 | 데이터 필드 |
|------|------------|------------|
| 연계성 (Continuity) | 💭 당신이 지금 한 행동 | `result.continuity` |
| 연관성 (Relevance) | 🔎 비슷한 패턴의 다른 사건들 | `result.relevance[]` |
| 연결성 (Coherence) | ▶ 다음 챕터 예고 | `result.coherence{nextTitle, nextHint}` |

---

## 2. 현재 상태 — 무엇이 살아있고 무엇이 미완인지

### ✅ 완료된 산출물

| 영역 | 파일 | 상태 |
|------|------|------|
| **엔진** | `src/pages/apt/study/VictimScenario.jsx` | 7개 Scene 렌더러 + intercept 모달 + Result 리플레이 |
| **엔진 신규** | 같은 파일 — `ChkdskScene` | ✅ 등록까지 완료 (`chkdsk: ChkdskScene`) |
| **시나리오 #01** | `chapters/C0024-victim.js` | SUNBURST · 한빛은행 IT운영팀 · 9분 7Scene |
| **시나리오 #02** | `chapters/C0023-victim.js` | NotPetya · 키예프 회계사 · 7분 7Scene |
| **공격자 게임** | `Ch1Prototype.jsx` + `chapters/C0024-ch1.js` | 12-decision 지휘관 게임 (이전 작업 보존) |
| **밀도 비교** | `DensityPreview.jsx` | A/B 모드 비교 데모 |
| **라우트** | `App.jsx` | `/apt/{C0024,C0023}/scenario`, `/apt/preview-density`, `/apt/C0024/ch1-proto` |

### ⚠️ 미완 — 다음 세션이 이어서 할 작업

#### A. 즉시 작업 가능 (코드/데이터)
1. **C0023 Scene 5 → ui: 'chkdsk'로 교체**
   - 현재: `ui: 'download'` (단순 다운로드 패널로 위장)
   - 목표: 새 ChkdskScene 사용 → Windows 7 BSOD 스타일 진짜 위장 효과
   - 데이터 스키마 변경:
     ```js
     {
       ui: 'chkdsk',
       content: {
         title: 'CHKDSK is verifying files',
         subtitle: 'Stage 1 of 5',
         steps: [
           { label: 'Verifying file records', durationMs: 1200, percent: 100 },
           { label: 'Verifying indexes',      durationMs: 1100, percent:  85 },
           { label: 'Verifying security desc', durationMs: 1300, percent:  60 },
           { label: 'Looking for bad clusters', durationMs: 1100, percent:  35 },
           { label: 'Verifying USN journal',   durationMs:  900, percent:  10 },
         ],
         warning: '컴퓨터를 끄거나 전원을 분리하지 마세요. 이 작업은 몇 분 정도 걸릴 수 있습니다.',
         confirmLabel: '점검이 끝나길 기다리며 자리를 비운다 ▶',
       },
       hidden: { /* 기존 그대로 */ }
     }
     ```

2. **ResultScene 리플레이에 분기 결과 통합** (인터셉트/알림 선택 시각화)
   - 현재: `actionLog`에 `s4 deny` / `s6 report-or-ignore` 가 기록되지만 리플레이엔 표시 안 됨
   - 목표: 각 Scene에 `intercepts` 또는 `alertResolutions`가 있으면 사용자 선택 라벨과 모달 메시지를 리플레이 카드에 추가 표시
   - 위치: `ResultScene` → `<ol>` 안 각 `<li>` 카드의 "👤 당신의 행동" 다음에 분기 결과 박스
   - 추천 마크업:
     ```jsx
     {scene.intercepts && /* userAct.actionId 가 intercept 키 */ (
       <div className="mt-2 text-[11px] bg-amber-50 border-l-2 border-amber-400 px-2 py-1.5">
         🌀 분기: {scene.intercepts[interceptKey].confirmLabel}
       </div>
     )}
     ```

3. **신규 시나리오 — Colonial Pipeline (DarkSide)**
   - 파일 신규: `chapters/C1004-victim.js`
   - 페르소나: 휴스턴 파이프라인 운영자 (1인칭)
   - 기반 사건: 2021.05.07 Colonial Pipeline DarkSide 공격
   - MITRE: T1078 (Valid Accounts) + T1133 (External Remote Services) + T1486 (Encryption)
   - 7 Scene 구조:
     - s1 mail: 잊어버린 OldVPN 자격증명 안내 메일
     - s2 progress: VPN 클라이언트 자동 재인증
     - s3 login: SSO (MFA 없는 구식 OldVPN)
     - s4 dialog: 파일서버 접근 요청 (intercept: 동료가 이미 사용 중)
     - s5 download: 청구·계측 데이터 백업
     - s6 background: 야간 IT망 트래픽 ambient + 의심 라인 (alertAt) — 미국 동부 휘발유 공급 마비 뉴스
     - s7 result: ▶ 다음 챕터: "공격자가 4.4M$ 받고도 OFAC 추적당한 이유"
   - 등록: `VictimScenario.jsx`의 `SCENARIOS` map에 `C1004: c1004VictimData` 추가
   - 라우트: `App.jsx`에 `<Route path="/apt/G1004/scenario" element={<VictimScenario campaignId="C1004" />} />`

4. **시나리오 인덱스 페이지** (`/apt/scenarios`)
   - 파일 신규: `src/pages/apt/study/ScenarioIndex.jsx`
   - SCENARIOS map의 메타(`name`, `basedOn`, `group`, `persona`, `durationMin`) 자동 노출 카드 그리드
   - 새 시나리오 추가 시 자동 반영되는 구조 (메타 → 카드 변환만)
   - 라우트: `/apt/scenarios`
   - lazy import 등록 + AptGalleryPage 또는 IntroMatrix 어딘가에서 진입 링크 추가

5. **C0024 Ch2 — 공격자 1인칭 시나리오**
   - 파일 신규: `chapters/C0024-ch2-attacker.js`
   - **컨셉 차별화**:
     - Ch1Prototype: 공격자 *지휘관* (전략 결정 게임, 5 beats, 보드뷰)
     - **Ch2 (신규): 공격자 *현장 멀웨어 개발자* 1인칭 (몰입형 7 Scene, VictimScenario 엔진 재활용)**
   - 페르소나: 모스크바 SVR 작전실 멀웨어 개발자
   - 7 Scene 흐름:
     - s1: Microsoft Visual Studio 솔루션 열기 (SolarWinds.Orion.Core.BusinessLayer)
     - s2: 빌드 서버 자격증명 탈취 (탈취된 도메인 admin)
     - s3: SUNBURST 백도어 코드 삽입 (코드 diff 화면)
     - s4: 빌드 트리거 (다이얼로그 — "정식 릴리스인가?")
     - s5: 첫 콜백 (avsvmcloud.com → 18,000 PC 응답 카운터)
     - s6: 9개월 잠복 (background, ambient — 시간 흐름)
     - s7: result — 첫 정찰 시작, 다음 챕터: "정부망에 도달하기까지 287일"
   - 라우트: `/apt/C0024/ch2`
   - **주의**: VictimScenario 엔진을 그대로 재활용하되, "공격자 시점"이라는 점을 인트로에서 명확히 표시 (페르소나 박스 톤 다르게)

#### B. 더 큰 확장 (별도 챕터)
6. **각 시나리오 Ch2 — 그 사건 직후의 대응자 1인칭**
   - C0024 Ch3: SOC 분석가가 287일 후 SUNBURST를 발견하는 1인칭
   - C0023 Ch2: 백업 복구 시도하는 IT팀 1인칭 (영영 안 깨어남)
   - C1004 Ch2: 4.4M$ 협상하는 CEO 1인칭

7. **APT 갤러리에 진입점 추가**
   - `AptGalleryPage` 카드에 "1인칭 시나리오 ▶" 보조 버튼
   - `/apt/scenarios` 인덱스로 연결

---

## 3. 엔진 아키텍처 — 재사용 패턴

### 데이터 / 엔진 분리
```
VictimScenario.jsx  ← 엔진 (Scene 컴포넌트 + 상태 머신, 데이터 무지)
   │
   ├── SCENARIOS = { C0024, C0023, ... }   ← 단일 진입점
   │
chapters/{id}-victim.js  ← 순수 데이터 (스키마 표준)
```

### 새 시나리오 추가 = 3단계
1. `chapters/{id}-victim.js` 작성 (C0024-victim.js의 주석 헤더 스키마 그대로)
2. `VictimScenario.jsx` `SCENARIOS` map에 1줄 추가
3. `App.jsx` Route 1줄 추가

### Scene UI 종류 (현재 7종)
| ui 키 | 컴포넌트 | 용도 |
|------|---------|------|
| `mail` | MailScene | Outlook 스타일 메일 |
| `progress` | ProgressScene | Windows Update 진행바 |
| `login` | LoginScene | SSO 재인증 |
| `dialog` | DialogScene | UAC 권한 요청 (intercept 가능) |
| `download` | DownloadScene | 파일 다운로드 패널 |
| `background` | BackgroundScene | 자리 비움 + ambient 로그 + 미니 분기 |
| `chkdsk` | ChkdskScene | Windows BSOD 점검 위장 (와이퍼용) |
| `result` | ResultScene | 마지막 결과/리플레이 (Scene 7 전용) |

### 새 UI 추가 시
1. `VictimScenario.jsx` 안에 Scene 컴포넌트 함수 추가
2. `SCENE_RENDERERS` map에 1줄 등록
3. 데이터에서 `ui: '신규키'` 사용

### Intercept 메커니즘
- `actions[].intercept: 'key'` + `intercepts[key]: { icon, title, body, insight, confirmLabel }`
- 모달이 뜨고 닫으면 자동으로 다음 Scene으로 진행 (`__pendingAdvance: true`)
- BackgroundScene의 `alertResolutions[id]`는 모달만 띄우고 진행은 별도 버튼 (`__pendingAdvance: false`)

---

## 4. 데이터 스키마 표준

```js
{
  scenarioId: 'C0024-victim',
  name: '...',           // 인트로/인덱스 제목
  basedOn: '...',        // 기반 사건
  group: '...',          // APT 그룹
  persona: { role, company, setup },
  difficulty: 'Beginner | Intermediate | Advanced',
  durationMin: 9,

  scenes: [
    {
      id: 's1', num: 1,
      ui: 'mail | progress | login | dialog | download | background | chkdsk | result',
      content: { /* ui별 다른 필드 */ },
      hidden: {
        tactic: 'Initial Access',
        technique: 'T1195.002',
        techniqueName: 'Compromise Software Supply Chain',
        attack: '실제로 일어난 일 한 문장',
        replayDescription: '리플레이 화면에서 보여줄 설명',
      },
      // 선택 — Dialog/Mail에 거부/대안 시 인터셉트
      intercepts: { 'colleague-allowed': { icon, title, body, insight, confirmLabel } },
    },
    // ... s7 ui:'result' (hidden:null, content:{})
  ],

  result: {
    headline: '🚨 INCIDENT DETECTED',
    subline: '...',
    summary: [{ icon, label, value }],
    continuity: '...',                                    // 💭 당신이 지금 한 행동
    relevance: [{ label, note }],                         // 🔎 비슷한 패턴
    coherence: { nextTitle, nextHint },                   // ▶ 다음 챕터
  },
}
```

---

## 5. 라우트 현황 (App.jsx)

```jsx
<Route path="/apt"                          element={<AptGalleryPage />} />
<Route path="/apt/:campaignId"              element={<AptDetailPage />} />
<Route path="/apt/:campaignId/study"        element={<AptStudyPage />} />
<Route path="/apt/preview-density"          element={<DensityPreview />} />
<Route path="/apt/C0024/ch1-proto"          element={<Ch1Prototype />} />
<Route path="/apt/C0024/scenario"           element={<VictimScenario campaignId="C0024" />} />
<Route path="/apt/C0023/scenario"           element={<VictimScenario campaignId="C0023" />} />
```

### 추가 예정
```jsx
<Route path="/apt/scenarios"                element={<ScenarioIndex />} />
<Route path="/apt/G1004/scenario"           element={<VictimScenario campaignId="C1004" />} />
<Route path="/apt/C0024/ch2"                element={<VictimScenario campaignId="C0024-ch2" />} />
```

---

## 6. 다음 세션 시작할 때 — 정확한 첫 명령

```bash
# 1. 환경 확인
cd /Users/db/Desktop/Gotroot_Edu
git pull origin master
git log --oneline -5  # 이 핸드오프 커밋이 보여야 함

# 2. 작업 우선순위 (이 순서대로 권장)
#    A. C0023 Scene 5 ui:'chkdsk' 전환 (10분, 데이터만 수정)
#    B. ResultScene 리플레이에 분기 결과 통합 (20분, 엔진 일부 수정)
#    C. C1004 Colonial Pipeline 데이터 + 라우트 (60분)
#    D. ScenarioIndex 페이지 (30분, 자동 반영)
#    E. C0024-ch2 공격자 1인칭 (90분, 신규 데이터)

# 3. 빌드 검증 필수
cd /Users/db/Desktop/Gotroot_Edu && npm run build
```

### 다음 세션 입력 예시 (그대로 복붙)
```
APT 1인칭 시나리오 작업 이어가자.
docs/apt-victim-scenario-handoff.md 읽고 "다음 세션 우선순위 A → E" 순서대로 진행.
A부터 시작.
```

---

## 7. 알려진 제약 / 주의사항

- **Worktree vs main 동기화**: `/Users/db/Desktop/Gotroot_Edu/.claude/worktrees/serene-antonelli/` 가 worktree. 편집은 가능하면 main에서 하고, 둘 다 master 브랜치라면 git이 자동 처리. 다른 브랜치를 worktree에 체크아웃해서 쓰려면 `cp` 동기화 필요.
- **푸시 대상 브랜치 2개**: `master` 와 `feature/hero-incident-matrix` 둘 다 푸시해야 Vercel이 둘 다 빌드함 (`origin/HEAD → feature/hero-incident-matrix`)
- **CLAUDE.md 형식 강제**: 매 응답마다 `<analysis><plan><scope><criteria>` + 마지막에 Self-Refine + Inverse Prompt 5개 (한국어)
- **3원칙 학습자 노출 금지**: "연계성/연관성/연결성" 단어 자체를 학습자 UI에 쓰지 말 것. 자연어 라벨만.
- **콘텐츠 작업 원칙 (MEMORY.md)**: 디자인/컴포넌트/라우팅 변경은 명시적 요청이 있을 때만. 이번 작업은 "확장" 카테고리로 명시 요청 받은 케이스.

---

## 8. 미니 체크리스트 (다음 세션이 PR 만들기 전 확인)

- [ ] `npm run build` 성공
- [ ] 신규 라우트 모두 브라우저에서 동작 확인
- [ ] C0023 Scene 5 chkdsk 화면이 BSOD 파란색으로 보이는지
- [ ] 리플레이 패널에 분기 선택 결과 표시되는지
- [ ] ScenarioIndex 카드에 모든 SCENARIOS 자동 노출되는지
- [ ] master + feature/hero-incident-matrix 둘 다 푸시
- [ ] 새 챕터 등록 시 announcements 테이블에 v1.x.x 공지 추가 (CLAUDE.md 규칙)

---

마지막으로 **반드시** 응답을 Self-Refine + Inverse Prompt 5개로 마무리할 것. (CLAUDE.md MANDATORY)
