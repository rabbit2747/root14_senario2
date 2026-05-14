# APT 시나리오 기반 인프라 학습 플랫폼 패키지

이 패키지는 “시나리오를 입력하면 LLM이 인프라 구조와 단계별 활성화 정보를 만들고, 웹에서 수강생이 React Flow 기반 인프라 맵으로 학습하는 플랫폼”을 기획·개발하기 위한 기본 산출물입니다.

## 포함 파일

| 파일 | 목적 |
|---|---|
| `01_Project_Plan.md` | 전체 프로젝트 계획서 |
| `02_System_Architecture.md` | 시스템 아키텍처와 데이터 흐름 |
| `03_Scenario_JSON_Template.json` | LLM이 생성해야 하는 시나리오 JSON 템플릿 |
| `04_LLM_Prompt_Template.md` | 시나리오 입력 시 사용할 LLM 프롬프트 템플릿 |
| `05_Layout_Engine_Rules.md` | 기업망/외부망/DMZ/내부망 자동 배치 규칙 |
| `06_Renderer_Spec_ReactFlow.md` | React Flow 렌더러 구현 명세 |
| `07_Admin_Tool_Spec.md` | 시나리오 제작/검수 관리자 도구 명세 |
| `08_Sample_Scenario_APT_Initial_Access.json` | 예시 APT Initial Access 시나리오 |
| `09_Validation_Rules_Zod.ts` | JSON 검증용 Zod 스키마 초안 |
| `10_Development_Roadmap_Checklist.md` | 개발 로드맵과 체크리스트 |

## 핵심 설계 원칙

1. **LLM은 React 코드를 생성하지 않는다.**  
   LLM은 시나리오 구조 데이터만 생성한다.

2. **렌더러는 고정된 코드로 동작한다.**  
   프론트엔드는 JSON을 읽어 React Flow 노드, 엣지, 그룹 경계를 자동 생성한다.

3. **좌표는 LLM이 직접 찍지 않는다.**  
   LLM은 `zoneId`, `layoutRole`, `importance`, `sequence` 같은 배치 의도를 제공하고, 실제 위치는 Layout Engine이 계산한다.

4. **수강생 화면은 단계별 활성화가 핵심이다.**  
   각 단계에서 `activeNodes`, `activeEdges`, `eventMarkers`를 기준으로 노드와 연결선을 강조한다.

5. **보안 교육 목적의 안전한 콘텐츠만 생성한다.**  
   실제 악용 가능한 명령어, 익스플로잇 코드, 우회 절차는 생성하지 않는다.
