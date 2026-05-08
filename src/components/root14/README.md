# ROOT14 visual components

ROOT14 visual language를 코드로 고정하는 5종 공통 컴포넌트.

> ⚠️ 일반 SaaS UI 라이브러리로 쓰지 말 것. VISUAL_RULES.md 준수 전제.

## 사용

```jsx
import {
  MITREChip,
  OperationHeader,
  IntelPanel,
  ThreatLevel,
  OperationControl,
} from "@/components/root14";
```

또는 개별:
```jsx
import MITREChip from "@/components/root14/MITREChip";
```

## 컴포넌트

| 이름 | 역할 | 톤 |
|---|---|---|
| **MITREChip** | ATT&CK 기법 코드 표시 | 군사 작전 코드 스탬프 `[T1591]` |
| **OperationHeader** | 작전 브리핑 페이지 헤더 | classification + chapter + hero title + tagline + intent |
| **IntelPanel** | 첩보 문서 톤 컨테이너 | 좌측 굵은 시그니처 라인 + 코너 마커 옵션 (카드 X) |
| **ThreatLevel** | 위협도 HUD 인디케이터 | 펄스 점 + 가는 막대 + LOW/MED/HIGH/CRITICAL 단계 색 |
| **OperationControl** | 작전 콘솔 톤 버튼 | 외곽선 + 좌측 3px 액센트 + 펄스 점 prefix |

## 공통 규칙

- 모든 컴포넌트는 **순수 표현형** (state·router·fetch X)
- 인라인 스타일 + 컴포넌트 내부 `<style>` 만 사용 (외부 CSS 의존 0)
- 폰트: `Press Start 2P` (HUD 라벨) + `JetBrains Mono` (모노스페이스) + 기본 sans (본문)
- 색: 시그니처 시안 `#58a6ff` 기본 / accent prop으로 캠페인별 재칠
- 둥근 모서리 `borderRadius: 0` 강제
- 일반 그림자(`box-shadow: 0 4px ...`) 절제 — 대신 글로우 (`0 0 N color`) 만 사용

## 확장 원칙

- 새 컴포넌트는 **classified document / war room / intel HUD** 메타포에서 출발
- 카드형 layout (rounded + shadow + padding) 패턴은 도입 금지
- 컴포넌트마다 `accent` prop으로 캠페인 색 차별화 가능하게
- 애니메이션은 짧게(0.7~3.6s), 긴장감 우선 — 회전/탄성 효과 X

## 폰트 의존

`Press Start 2P` / `JetBrains Mono` 미로드 환경에서도 fallback 으로 monospace 유지.
사용 측에서 `<link>` 또는 `@import`로 두 폰트 선로드 권장.
