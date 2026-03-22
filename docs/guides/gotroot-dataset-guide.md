# GOTROOT 원자성 데이터셋 구축 가이드

> MITRE ATT&CK 서브테크닉별 독립 교육 콘텐츠 데이터셋 설계, 수집, 검증, 자동화 전체 워크플로우

**버전:** 1.0.0
**최종 수정:** 2026-03-02
**대상 독자:** GOTROOT 교육 콘텐츠 제작자, 보안 리서처, 플랫폼 개발자

---

## 목차

1. [서론: 왜 GOTROOT만의 데이터셋이 필요한가](#1-서론-왜-gotroot만의-데이터셋이-필요한가)
2. [CTI 소스별 활용 가이드](#2-cti-소스별-활용-가이드)
3. [데이터 수집 프로세스](#3-데이터-수집-프로세스-전체-워크플로우)
4. [GOTROOT 원자성 데이터셋 JSON 스키마 정의](#4-gotroot-원자성-데이터셋-json-스키마-정의)
5. [샘플 데이터셋](#5-샘플-데이터셋)
6. [원자성 보장 체크리스트](#6-원자성-보장-체크리스트)
7. [자동화 파이프라인 가이드](#7-자동화-파이프라인-가이드)

---

## 1. 서론: 왜 GOTROOT만의 데이터셋이 필요한가

### 1.1 독자적 콘텐츠의 필요성

GOTROOT는 MITRE ATT&CK 프레임워크를 기반으로 한 사이버보안 교육 플랫폼이다. ATT&CK 매트릭스는 공격 기법의 분류 체계를 제공하지만, 교육에 직접 활용할 수 있는 형태의 콘텐츠는 제공하지 않는다. 기존 CTI(Cyber Threat Intelligence) 소스들은 각기 다른 형식, 깊이, 관점으로 데이터를 제공하므로, 이를 교육 목적에 맞게 통합하고 재구성하는 과정이 필수적이다.

독자적 데이터셋이 필요한 핵심 이유:

- **교육 수준별 콘텐츠 분리**: 같은 기법이라도 초급자에게는 비유와 개념을, 중급자에게는 코드 분석을, 고급자에게는 실전 구현을 제공해야 한다.
- **한국 맥락 반영**: 한국 정보통신망법, KISA 사례, 국내 APT 공격 사례 등을 반영한 로컬라이징이 필요하다.
- **상호작용 교육**: 정적 문서가 아닌, 미니랩(miniLab)과 퀴즈를 포함한 대화형 교육 콘텐츠 구조가 필요하다.
- **일관된 스키마**: 자동 HTML 생성 파이프라인에 적합한 표준화된 JSON 구조가 필요하다.

### 1.2 원자성(Atomicity) 개념

원자성이란 각 서브테크닉 데이터셋이 다음을 **독립적으로** 포함해야 함을 의미한다:

| 구성 요소 | 설명 | 예시 (T1003.001) |
|-----------|------|------------------|
| 고유 공격 방법론 | 해당 서브테크닉만의 절차 | LSASS 프로세스 메모리 접근 |
| 고유 도구 | 사용되는 대표 도구 | Mimikatz, comsvcs.dll |
| 고유 APT 사례 | 실제 위협 그룹의 활용 | APT28, APT29의 LSASS 덤프 |
| 고유 탐지 방법 | Sigma/YARA/Snort 규칙 | Sysmon Event ID 10 모니터링 |
| 고유 방어 전략 | 대응 및 완화 조치 | Credential Guard, PPL 활성화 |
| 고유 비유(analogy) | 초급 수준 설명용 | "은행 금고 관리인의 기억을 읽는 것" |

서브테크닉 간 비유, 도구, 사례가 중복되면 학습자가 기법의 차이를 인식하기 어렵다. 원자성은 각 데이터셋이 독립적으로 완결된 교육 단위가 되도록 보장한다.

### 1.3 교육 페이지 레벨 구조

GOTROOT 교육 콘텐츠는 3단계 레벨로 구성된다:

```
beginner (초급)
  - 목표: 개념 이해, 비유를 통한 직관적 파악
  - 콘텐츠: 비유(analogy), 개념 설명, 비교표, 다이어그램
  - POC 코드: 의사 코드(pseudocode)만 허용
  - 미니랩: matching_game, ordering_game (개념 매칭/순서 정렬)

intermediate (중급)
  - 목표: 코드 읽기 능력, 도구 사용법 이해
  - 콘텐츠: 주석 달린 실제 코드, 도구 출력 분석, 탐지 로그 해석
  - POC 코드: 주석이 달린 실제 코드 (annotated real code)
  - 미니랩: code_fill, step_click (코드 빈칸 채우기/단계별 클릭)

advanced (고급)
  - 목표: 실전 구현 능력, 탐지/우회 분석
  - 콘텐츠: 전체 구현 코드, Sigma/YARA 규칙 작성, 포렌식 분석
  - POC 코드: 전체 구현 (full implementation) + 빌드 명령어
  - 미니랩: code_fill (고급), step_click (분석 절차)
```

---

## 2. CTI 소스별 활용 가이드

### 2.1 MITRE CTI GitHub

- **URL**: https://github.com/mitre/cti
- **형식**: STIX 2.1 JSON
- **라이선스**: Apache 2.0 (자유 사용, 수정, 배포 가능)

**제공 데이터:**
- 전체 ATT&CK 기법/서브테크닉 정의 (`enterprise-attack/attack-pattern/*.json`)
- 탐지 권고사항 (Detection)
- 데이터 소스 매핑 (Data Sources)
- 완화 조치 (Mitigations) - `course-of-action/*.json`
- 위협 그룹-기법 관계 (Relationships)

**접근 방법:**
```bash
git clone https://github.com/mitre/cti.git
cd cti/enterprise-attack/attack-pattern/
```

**추출 대상:**
- 기법 설명 → 초급 개념 패널의 기초 자료
- Detection 필드 → 중/고급 탐지 챕터의 기초 자료
- Procedure Examples → 실제 공격 사례 참조
- Data Sources → 모니터링 대상 정의

**STIX JSON 파싱 예시 (T1003.001):**

```javascript
// scripts/parse-stix.mjs
import fs from 'fs';
import path from 'path';

const STIX_DIR = './cti/enterprise-attack/attack-pattern/';

function parseAttackPattern(stixId) {
  const files = fs.readdirSync(STIX_DIR);

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(STIX_DIR, file), 'utf8'));
    const objects = data.objects || [];

    for (const obj of objects) {
      if (obj.type !== 'attack-pattern') continue;

      // external_references에서 ATT&CK ID 매칭
      const attackRef = (obj.external_references || []).find(
        ref => ref.source_name === 'mitre-attack'
      );

      if (attackRef && attackRef.external_id === stixId) {
        return {
          id: attackRef.external_id,
          name: obj.name,
          description: obj.description,
          detection: obj.x_mitre_detection || null,
          platforms: obj.x_mitre_platforms || [],
          dataSources: obj.x_mitre_data_sources || [],
          created: obj.created,
          modified: obj.modified,
          url: attackRef.url
        };
      }
    }
  }
  return null;
}

// 사용 예시
const t1003_001 = parseAttackPattern('T1003.001');
console.log(JSON.stringify(t1003_001, null, 2));

/*
출력 예시:
{
  "id": "T1003.001",
  "name": "LSASS Memory",
  "description": "Adversaries may attempt to access credential material stored in ...",
  "detection": "Monitor for unexpected processes interacting with LSASS ...",
  "platforms": ["Windows"],
  "dataSources": ["Process: OS API Execution", "Process: Process Access"],
  ...
}
*/
```

**Relationship 파싱 (위협 그룹 연결):**

```javascript
// scripts/parse-stix-relationships.mjs
import fs from 'fs';

const REL_DIR = './cti/enterprise-attack/relationship/';
const GROUP_DIR = './cti/enterprise-attack/intrusion-set/';

function findGroupsUsingTechnique(techniqueStixId) {
  // 1. technique의 STIX internal ID 찾기
  // 2. relationship에서 source_ref가 group이고 target_ref가 technique인 것 필터
  // 3. group 정보 조회

  const relationships = [];
  const relFiles = fs.readdirSync(REL_DIR);

  for (const file of relFiles) {
    const data = JSON.parse(fs.readFileSync(`${REL_DIR}/${file}`, 'utf8'));
    for (const obj of data.objects || []) {
      if (obj.type === 'relationship' && obj.relationship_type === 'uses') {
        if (obj.target_ref && obj.target_ref.includes(techniqueStixId)) {
          relationships.push({
            sourceRef: obj.source_ref,
            description: obj.description || ''
          });
        }
      }
    }
  }

  return relationships;
}
```

### 2.2 ATT&CK Groups / Software / Campaigns

- **URL**: https://attack.mitre.org/groups/ , /software/ , /campaigns/
- **형식**: 웹 페이지 (구조화 데이터는 STIX JSON에 포함)
- **라이선스**: CC-BY 4.0 (출처 표기 시 자유 사용)

**제공 데이터:**
- Procedure Examples: 실제 위협 그룹이 기법을 사용한 구체적 방법
- Software 목록: 각 기법에 연결된 도구/악성코드
- Campaign 타임라인: 특정 캠페인에서의 기법 활용 이력

**추출 대상:**
- APT 그룹 프로필 → overviewPanel의 배경 정보
- Procedure Examples → 고급 레벨의 실전 사례
- 도구-기법 매핑 → 중급 레벨의 도구 분석 챕터

**활용 가이드라인:**
- Procedure Examples는 교육 콘텐츠에서 가장 가치가 높은 데이터이다.
- 해당 서브테크닉을 실제 사용한 APT 그룹 최소 2개를 식별하고 데이터셋에 포함한다.
- Campaign 정보는 공격의 시간적 맥락(언제, 어떤 목표에 대해)을 제공하므로 고급 레벨에서 활용한다.

### 2.3 Mandiant APT1 Report 및 M-Trends

- **출처**: Mandiant (Google Cloud Security)
- **형식**: PDF 보고서, 웹 블로그 포스트
- **라이선스**: 보고서별 상이 (인용 및 교육 목적 사용 시 출처 표기 필수)

**제공 데이터:**
- APT1 보고서: 최초의 종합적 APT 분석, IoC 데이터, 공격 타임라인
- M-Trends 연간 보고서: 글로벌 위협 트렌드, 체류 시간(dwell time) 통계, 산업별 공격 분포

**추출 대상:**
- 고급 레벨의 실전 시나리오 자료
- 공격 체인 전체를 보여주는 케이스 스터디
- 통계 데이터 (overviewPanel의 위험도 맥락 제공)

**주의사항:**
- PDF 보고서의 직접 인용 시 해당 보고서의 저작권 조건을 확인한다.
- 자체 분석과 재구성을 통해 교육 콘텐츠를 생성하고, 원본 보고서는 참조 소스로 명시한다.

### 2.4 Kaspersky Securelist

- **URL**: https://securelist.com/
- **형식**: 기술 분석 블로그, PDF 보고서
- **라이선스**: 블로그 인용 시 출처 표기 (CC 명시 없음, fair use 적용)

**제공 데이터:**
- 악성코드 기술 분석 (Technical Analysis)
- 신규 위협 그룹 보고서
- 취약점 악용 분석

**추출 대상:**
- POC 코드 참조: 악성코드 분석에서 추출한 기법별 코드 패턴
- 탐지 시그니처: YARA 규칙, IoC 리스트
- 중급 레벨의 코드 분석 챕터 자료

**활용 예시:**
```
서브테크닉: T1059.001 (PowerShell)
Securelist 검색: "PowerShell" site:securelist.com
추출: APT 그룹의 PowerShell 난독화 기법, 실제 사용된 스크립트 패턴
적용: 중급 챕터의 "실제 공격 코드 분석" 패널
```

### 2.5 CrowdStrike Global Threat Report

- **출처**: CrowdStrike
- **형식**: 연간 PDF 보고서 (등록 후 다운로드)
- **라이선스**: 교육 목적 인용 가능, 상업적 재배포 제한

**제공 데이터:**
- 글로벌 위협 트렌드 통계
- 위협 그룹 프로필 (BEAR, PANDA, KITTEN 등 명명 체계)
- 산업별 공격 벡터 분석

**추출 대상:**
- overviewPanel의 통계 데이터 및 위험 맥락
- 위협 그룹 정보 → metadata.aptGroups 필드
- 트렌드 데이터 → 교육 배경 설명

### 2.6 CISA Advisories

- **URL**: https://www.cisa.gov/news-events/cybersecurity-advisories
- **형식**: 웹 Advisory, JSON(STIX), PDF
- **라이선스**: US Government Public Domain (자유 사용)

**제공 데이터:**
- CVE 세부 정보 및 취약점 분석
- 방어 전략 및 패치 가이드
- Known Exploited Vulnerabilities (KEV) 카탈로그
- 연합 사이버보안 권고문 (Joint Advisories)

**추출 대상:**
- 방어 전략 → 모든 레벨의 방어 챕터
- 패치 가이드 → 고급 레벨의 완화 조치
- KEV 데이터 → 실습 시나리오의 현실성 강화

**활용 가이드라인:**
- CISA 데이터는 미국 정부 공공 도메인이므로 자유롭게 활용 가능하다.
- 한국 환경에 적용할 때는 KISA 권고사항과 교차 검증한다.
- 패치 가이드의 구체적 명령어는 중급/고급 레벨 미니랩에 활용한다.

### 2.7 KISA 침해사고 분석 보고서

- **출처**: 한국인터넷진흥원 (KISA)
- **URL**: https://www.boho.or.kr/
- **형식**: PDF 보고서, 웹 공지
- **라이선스**: 공공데이터 (출처 표기 시 활용 가능)

**제공 데이터:**
- 국내 침해사고 분석 보고서
- 한국 대상 APT 공격 사례
- 정보통신망법 관련 규정 및 대응 가이드

**추출 대상:**
- 한국 맥락 케이스 스터디 → 모든 레벨에 적용
- 규제 컴플라이언스 정보 → 방어 챕터
- 국내 인프라 대상 공격 사례 → 고급 레벨 시나리오

**활용 가이드라인:**
- GOTROOT는 한국 사용자를 주 대상으로 하므로, 가능한 모든 서브테크닉에 KISA 사례를 포함한다.
- 개인정보보호법, 정보통신망법의 관련 조항을 방어 전략에 반영한다.
- 보고서 원문의 URL과 발행일을 metadata.ctiSources에 반드시 기록한다.

### 2.8 APTnotes GitHub

- **URL**: https://github.com/kbandla/APTnotes
- **형식**: CSV/JSON 메타데이터 인덱스 + 외부 PDF 링크
- **라이선스**: 메타데이터 자체는 MIT, 개별 보고서는 원 저작권 적용

**제공 데이터:**
- APT 보고서 메타데이터 인덱스 (제목, 날짜, 소스, URL)
- 연도별/그룹별 분류

**추출 대상:**
- 교차 참조 링크 → metadata.ctiSources 확장
- 보고서 발견 및 수집 효율화
- 특정 서브테크닉에 관련된 보고서 목록 작성

**활용 방법:**
```bash
# APTnotes 메타데이터 다운로드
git clone https://github.com/kbandla/APTnotes.git
cd APTnotes

# 특정 키워드로 관련 보고서 검색
grep -i "credential dumping\|lsass\|mimikatz" APTnotes.csv
```

### 2.9 Phrack Archives

- **URL**: https://archives.phrack.org/
- **형식**: 텍스트 기반 기술 논문
- **라이선스**: Phrack License (비상업적 교육 목적 인용 가능)

**제공 데이터:**
- 시스템 수준 공격 기법 논문
- 익스플로잇 분석 기술 자료
- 역사적 해킹 기법 아카이브

**추출 대상:**
- 고급 레벨의 심층 기술 분석 참조
- 기법의 역사적 맥락 (해당 공격 기법이 언제, 어떻게 발전했는지)
- 시스템 내부 동작 원리 설명 자료

**주의사항:**
- Phrack 자료는 고급 레벨에서만 참조한다.
- 직접적인 익스플로잇 코드 복사는 금지하며, 개념 설명과 원리 이해 목적으로만 활용한다.
- 인용 시 Phrack 이슈 번호와 논문 제목을 명시한다.

---

## 3. 데이터 수집 프로세스 (전체 워크플로우)

```
Phase 1        Phase 2        Phase 3         Phase 4         Phase 5        Phase 6
수집      -->  정제      -->  원자성 매핑 -->  JSON 직렬화 -->  검증     -->   HTML 생성
(Collection)   (Curation)     (Atomic Map)    (Serialize)     (Validation)   (Generation)
```

### Phase 1: 수집 (Collection)

#### 1-1. MITRE STIX JSON 다운로드 및 파싱

```bash
# 전체 CTI 리포지토리 클론 (최초 1회)
git clone --depth 1 https://github.com/mitre/cti.git /data/mitre-cti

# 주기적 업데이트 (월 1회 권장)
cd /data/mitre-cti && git pull

# 특정 서브테크닉 STIX 데이터 추출
node scripts/parse-stix.mjs T1003.001 > /data/raw/T1003.001-stix.json
```

#### 1-2. APT 보고서 수집 및 분류

보고서 수집 우선순위:

1. **공식 소스 우선**: MITRE ATT&CK Procedure Examples에 인용된 보고서
2. **최신성 우선**: 최근 3년 이내 발행된 보고서
3. **한국 관련성**: KISA 보고서, 한국 대상 공격 사례

수집 메타데이터 기록 형식:

```json
{
  "reportId": "RPT-2025-001",
  "title": "APT37 Campaign Analysis",
  "source": "Mandiant",
  "publishDate": "2025-11-15",
  "url": "https://...",
  "relatedTechniques": ["T1003.001", "T1059.001"],
  "license": "citation-required",
  "language": "en",
  "collectedDate": "2026-03-01"
}
```

#### 1-3. 도구별 수집 방법

| 소스 | 수집 방법 | 자동화 가능 여부 |
|------|-----------|-----------------|
| MITRE CTI GitHub | `git clone` + JSON 파싱 | 완전 자동화 |
| ATT&CK 웹사이트 | STIX JSON API 또는 TAXII 서버 | 완전 자동화 |
| CISA Advisories | RSS 피드 구독 + API | 반자동화 |
| KISA 보고서 | 수동 다운로드 (RSS 미제공) | 수동 |
| Mandiant/CrowdStrike | 수동 수집 (등록 필요) | 수동 |
| APTnotes | `git clone` + CSV 파싱 | 완전 자동화 |
| Kaspersky Securelist | 웹 스크래핑 (robots.txt 준수) | 반자동화 |
| Phrack | 웹 접근 (아카이브 구조) | 반자동화 |

**웹 스크래핑 가이드라인:**
- 반드시 `robots.txt`를 확인하고 준수한다.
- 요청 간격을 최소 5초 이상 유지한다.
- User-Agent에 GOTROOT 프로젝트 식별자를 포함한다.
- 저작권이 명시된 콘텐츠는 원문 복사가 아닌 요약/재구성만 수행한다.

### Phase 2: 정제 (Curation)

#### 2-1. 중복 제거 및 최신 정보 우선 원칙

동일 서브테크닉에 대해 여러 소스의 정보가 존재할 때:

1. **최신 날짜 우선**: 같은 내용이라면 최신 소스를 채택한다.
2. **공식 소스 우선**: MITRE > CISA > 벤더 보고서 > 블로그 순서로 신뢰도를 부여한다.
3. **구체성 우선**: 추상적 설명보다 Procedure Example이 있는 데이터를 우선한다.
4. **중복 표기**: 여러 소스에서 동일 정보가 확인되면 `ctiSources`에 모든 소스를 기록한다.

#### 2-2. 한국어 번역 가이드라인

용어 통일 원칙:

| 영문 용어 | 한국어 표기 | 비고 |
|-----------|-----------|------|
| Credential Dumping | 자격 증명 덤프 | "크레덴셜 덤핑"은 사용하지 않음 |
| Lateral Movement | 측면 이동 | "래터럴 무브먼트"는 병기 가능 |
| Persistence | 지속성 확보 | "퍼시스턴스"는 사용하지 않음 |
| Exfiltration | 데이터 유출 | "엑스필트레이션"은 사용하지 않음 |
| Privilege Escalation | 권한 상승 | |
| Defense Evasion | 방어 우회 | |
| Command and Control | 명령 및 제어 (C2) | C2 약어 병기 |
| Initial Access | 초기 접근 | |
| Reconnaissance | 정찰 | |
| Phishing | 피싱 | 음차 허용 |
| Exploit | 익스플로잇 / 취약점 악용 | 맥락에 따라 선택 |
| Payload | 페이로드 | 음차 허용 |
| Beacon | 비콘 | 음차 허용 |

번역 규칙:
- 도구명은 번역하지 않는다: Mimikatz, BloodHound, Cobalt Strike 등
- 프로토콜명은 번역하지 않는다: NTLM, Kerberos, SMB, RDP 등
- 설명 텍스트는 한국어로 작성하되, 영문 기술 용어는 괄호 안에 병기한다.
- `titleEn` 필드에 항상 영문 제목을 함께 제공한다.

#### 2-3. 교육 수위 조절 기준

```
허용 범위 (교육 목적)
  - 공격 기법의 개념적 설명
  - 공개된 도구(Mimikatz 등)의 사용법 설명
  - 이미 공개된 CVE의 원리 분석
  - 탐지/방어 관점의 코드 분석
  - 의사 코드(pseudocode) 수준의 공격 흐름

주의 범위 (제한적 허용)
  - 실제 동작하는 POC 코드 (중급 이상, 주석 필수)
  - 실제 도구의 명령어 옵션 상세 설명
  - 구체적인 우회 기법 설명

금지 범위 (절대 불가)
  - 실제 악용 가능한 0-day 익스플로잇 코드
  - 특정 조직/개인을 대상으로 한 공격 가이드
  - 한국 정보통신망법 제48조 위반 가능 콘텐츠
  - 악성코드 배포 또는 다운로드 링크
```

**법적 경계 참조:**
- 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제48조 (정보통신망 침해행위 등의 금지)
- 형법 제314조 (업무방해) - 정당한 교육 목적 입증 필요
- POC 코드 포함 시 반드시 "교육 목적 전용, 실제 시스템 대상 사용 금지" 경고문을 삽입한다.

### Phase 3: 원자성 매핑 (Atomic Mapping)

#### 3-1. 서브테크닉 ID 단위 분류 체계

파일 구조:
```
src/data/edu-datasets/
  T1003.001.json    # OS Credential Dumping: LSASS Memory
  T1003.002.json    # OS Credential Dumping: SAM
  T1003.003.json    # OS Credential Dumping: NTDS
  T1059.001.json    # Command and Scripting Interpreter: PowerShell
  T1587.001.json    # Develop Capabilities: Malware
  ...
```

파일명 규칙: `{서브테크닉ID}.json` (마침표를 점으로 유지)

부모 테크닉(서브테크닉이 없는 경우): `T1486.json`

#### 3-2. 레벨별 콘텐츠 배분 규칙

```
beginner (15~20분 분량)
  - chapters: 2~3개
  - panels 유형: analogy(필수), concept(필수), comparison_table(선택)
  - miniLabs: 1~2개 (matching_game 또는 ordering_game)
  - quiz: 3~5문제 (개념 확인)

intermediate (25~35분 분량)
  - chapters: 2~3개
  - panels 유형: concept, code(필수), diagram(선택)
  - pocCode: 주석 달린 실제 코드 (필수)
  - miniLabs: 1~2개 (code_fill 또는 step_click)
  - quiz: 3~5문제 (코드 이해 + 분석)

advanced (35~50분 분량)
  - chapters: 2~3개
  - panels 유형: code(필수), concept, diagram(선택)
  - pocCode: 전체 구현 + 빌드 명령어 (필수)
  - miniLabs: 1~2개 (code_fill 고급)
  - quiz: 3~5문제 (실전 분석 + 대응)
```

#### 3-3. POC 코드 수위

```
초급 (pseudocode):
  // 1. LSASS 프로세스 찾기
  process = findProcess("lsass.exe")
  // 2. 메모리 접근 권한 획득
  handle = openProcess(process, DEBUG_PRIVILEGE)
  // 3. 메모리 읽기
  credentials = readMemory(handle, CREDENTIAL_AREA)

중급 (annotated real code):
  // SeDebugPrivilege 활성화 - LSASS 접근에 필수
  HANDLE hToken;
  OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES, &hToken);
  // 주의: 이 권한은 관리자 토큰에 포함되지만 명시적 활성화 필요
  SetPrivilege(hToken, SE_DEBUG_NAME, TRUE);

고급 (full implementation):
  // 전체 동작 코드 + 빌드 명령어 + 실행 환경 설명
  // 반드시 "교육 목적 전용" 경고 포함
```

### Phase 4: JSON 직렬화

데이터셋 스키마에 따라 JSON 파일을 생성한다. 상세 스키마는 [4장](#4-gotroot-원자성-데이터셋-json-스키마-정의)에서 정의한다.

#### 저장 경로

```
src/data/edu-datasets/{techniqueId}.json
```

예시:
```
src/data/edu-datasets/T1003.001.json
src/data/edu-datasets/T1587.001.json
```

#### 파일 명명 규칙

- 파일명은 서브테크닉 ID와 정확히 일치해야 한다.
- 대문자 T로 시작, 마침표로 서브테크닉 구분: `T1003.001.json`
- 서브테크닉이 없는 기법: `T1486.json`
- 확장자는 반드시 `.json`

### Phase 5: 검증 (Validation)

#### 5-1. JSON Schema Validation (자동)

```bash
# JSON 스키마 검증 실행
node scripts/validate-edu-dataset.js src/data/edu-datasets/T1003.001.json
```

검증 항목:
- 필수 필드 존재 여부
- 데이터 타입 일치 여부
- 배열 최소 길이 충족 여부
- 레벨별 필수 구성 요소 포함 여부

#### 5-2. 기술적 정확성 리뷰

보안 전문가 체크리스트:

- [ ] ATT&CK ID와 기법명이 MITRE 공식 데이터와 일치하는가?
- [ ] 공격 절차 설명이 기술적으로 정확한가?
- [ ] 탐지 방법이 실제 환경에서 유효한가?
- [ ] POC 코드가 설명된 기법을 정확히 시연하는가?
- [ ] 방어 전략이 현실적으로 적용 가능한가?
- [ ] APT 사례가 출처와 일치하는가?
- [ ] Sigma/YARA 규칙의 문법이 올바른가?

#### 5-3. 교육적 적합성 리뷰

- [ ] 초급 비유가 정확하면서도 이해하기 쉬운가?
- [ ] 레벨 간 난이도 상승이 자연스러운가?
- [ ] 미니랩이 학습 목표와 연결되는가?
- [ ] 퀴즈 문제가 핵심 개념을 평가하는가?
- [ ] 한국어 용어가 통일 기준에 맞는가?
- [ ] 교육 수위가 허용 범위 내인가?
- [ ] 예상 소요 시간이 실제와 부합하는가?

#### 5-4. 원자성 보장 체크리스트 검증

[6장](#6-원자성-보장-체크리스트)의 전체 항목을 통과해야 한다.

### Phase 6: HTML 생성

#### 6-1. 데이터셋에서 교육 HTML 생성

```bash
# 단일 서브테크닉 HTML 생성
node scripts/generate-edu-html.js --input src/data/edu-datasets/T1003.001.json

# 결과:
#   public/edu/t1003-001-lsass-memory.html           (beginner)
#   public/edu/t1003-001-lsass-memory-intermediate.html  (intermediate)
#   public/edu/t1003-001-lsass-memory-advanced.html      (advanced)
```

#### 6-2. 자동 생성 파이프라인

데이터셋 JSON을 EJS 템플릿과 결합하여 최종 교육 HTML을 생성한다. 생성 과정:

1. JSON 데이터셋 로드 및 검증
2. 레벨별 EJS 템플릿 선택
3. 데이터 바인딩 및 HTML 렌더링
4. DOMPurify를 통한 XSS 필터링
5. Prism.js 코드 하이라이팅 적용
6. 출력 파일 저장
7. edu-meta.json 자동 업데이트

#### 6-3. 품질 게이트

```bash
# HTML 품질 검증
node scripts/validate-edu-html.js public/edu/t1003-001-lsass-memory.html

# 검증 항목:
#   - Supabase 인증 게이트 존재 여부
#   - CSP 메타 태그 존재 여부
#   - 다크 모드 지원 여부
#   - 접근성 (alt 텍스트, ARIA 속성)
#   - 대시보드 복귀 버튼 존재 여부
#   - lab-link.js 포함 여부
```

---

## 4. GOTROOT 원자성 데이터셋 JSON 스키마 정의

### 4.1 전체 구조 개요

```json
{
  "techniqueId": "string (필수)",
  "techniqueName": "string (필수)",
  "techniqueNameKo": "string (필수)",
  "tacticIds": ["string[] (필수)"],
  "tacticName": "string (필수)",
  "tacticNameKo": "string (필수)",
  "levels": {
    "beginner": { ... },
    "intermediate": { ... },
    "advanced": { ... }
  },
  "metadata": { ... }
}
```

### 4.2 필드 상세 정의

#### 최상위 필드

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `techniqueId` | string | Y | ATT&CK 서브테크닉 ID (예: "T1003.001") |
| `techniqueName` | string | Y | 영문 기법명 (예: "LSASS Memory") |
| `techniqueNameKo` | string | Y | 한국어 기법명 (예: "LSASS 메모리 덤프") |
| `tacticIds` | string[] | Y | 소속 전술 ID 목록 (예: ["t8"]) |
| `tacticName` | string | Y | 영문 전술명 (예: "Credential Access") |
| `tacticNameKo` | string | Y | 한국어 전술명 (예: "자격 증명 접근") |
| `levels` | object | Y | beginner, intermediate, advanced 객체 |
| `metadata` | object | Y | CTI 소스, APT 그룹, 관련 기법 등 |

#### levels.beginner / intermediate / advanced 객체

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | string | Y | 한국어 레벨 제목 |
| `titleEn` | string | Y | 영문 레벨 제목 |
| `estimatedMinutes` | number | Y | 예상 학습 소요 시간 (분) |
| `overviewPanel` | object | Y | 도입부 개요 패널 |
| `chapters` | array | Y | 챕터 배열 (최소 2개) |
| `miniLabs` | array | Y | 미니랩 배열 (최소 1개) |
| `quiz` | object | Y | 퀴즈 객체 |

#### overviewPanel 객체

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `emoji` | string | Y | 대표 이모지 (예: "🔑") |
| `question` | string | Y | 학습자의 호기심을 유발하는 질문 |
| `explanation` | string | Y | 질문에 대한 간결한 답변/설명 |
| `learningGoals` | string[] | Y | 학습 목표 목록 (3~5개) |
| `nextLevelTeaser` | string | N | 다음 레벨 학습 유도 문구 |

#### chapter 객체

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string | Y | 챕터 고유 ID (예: "b-ch1") |
| `title` | string | Y | 챕터 제목 (한국어) |
| `titleEn` | string | Y | 챕터 제목 (영문) |
| `panels` | array | Y | 패널 배열 (최소 1개) |

#### panel 객체 (유형별)

**analogy 패널** (초급 전용):
```json
{
  "type": "analogy",
  "emoji": "🏦",
  "title": "은행 금고 비유",
  "content": "LSASS는 은행의 금고 관리인과 같습니다..."
}
```

**concept 패널**:
```json
{
  "type": "concept",
  "title": "LSASS 프로세스의 역할",
  "content": "LSASS(Local Security Authority Subsystem Service)는...",
  "highlights": ["NTLM 해시", "Kerberos 티켓", "WDigest"]
}
```

**comparison_table 패널**:
```json
{
  "type": "comparison_table",
  "title": "자격 증명 덤프 도구 비교",
  "headers": ["도구", "방법", "탐지 난이도", "필요 권한"],
  "rows": [
    ["Mimikatz", "직접 메모리 접근", "낮음", "관리자+Debug"],
    ["comsvcs.dll", "LOLBin MiniDump", "중간", "관리자"],
    ["Task Manager", "GUI 덤프", "높음", "관리자"]
  ]
}
```

**code 패널**:
```json
{
  "type": "code",
  "filename": "lsass-dump.ps1",
  "language": "powershell",
  "warning": "교육 목적 전용 - 실제 시스템 대상 사용 금지",
  "lines": [
    { "text": "# LSASS 프로세스 ID 확인", "color": "comment" },
    { "text": "$lsass = Get-Process lsass", "color": "default" },
    { "text": "$lsass.Id  # PID 출력", "color": "highlight" }
  ]
}
```

**diagram 패널**:
```json
{
  "type": "diagram",
  "title": "LSASS 메모리 구조",
  "format": "ascii",
  "content": "Attacker --> [OpenProcess] --> LSASS Memory --> [ReadProcessMemory] --> Credentials"
}
```

#### pocCode 객체 (중급/고급 전용)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `filename` | string | Y | 파일명 (예: "lsass-dump.c") |
| `language` | string | Y | 프로그래밍 언어 (예: "c", "python", "powershell") |
| `buildCommands` | string[] | N | 빌드/실행 명령어 (고급만) |
| `lines` | array | Y | 코드 라인 배열 |

pocCode.lines 배열의 각 항목:
```json
{ "text": "코드 텍스트", "color": "default|comment|highlight|warning" }
```

#### miniLab 객체

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | Y | "matching_game", "ordering_game", "step_click", "code_fill" |
| `title` | string | Y | 미니랩 제목 |
| `description` | string | Y | 미니랩 설명 |
| `items` | array | Y | 미니랩 항목 (유형별 구조 상이) |

**matching_game items:**
```json
[
  { "left": "LSASS", "right": "자격 증명 저장 프로세스" },
  { "left": "Mimikatz", "right": "자격 증명 추출 도구" },
  { "left": "SeDebugPrivilege", "right": "프로세스 메모리 접근 권한" }
]
```

**ordering_game items:**
```json
[
  { "step": 1, "text": "LSASS 프로세스 PID 확인" },
  { "step": 2, "text": "SeDebugPrivilege 획득" },
  { "step": 3, "text": "LSASS 메모리 접근" },
  { "step": 4, "text": "자격 증명 추출" }
]
```

**code_fill items:**
```json
{
  "codeTemplate": "Get-Process ______ | Select-Object Id",
  "blanks": [
    { "id": 1, "answer": "lsass", "hint": "자격 증명을 저장하는 프로세스 이름" }
  ]
}
```

**step_click items:**
```json
[
  { "step": 1, "label": "프로세스 목록 확인", "detail": "tasklist 명령으로 LSASS PID 확인" },
  { "step": 2, "label": "권한 상승", "detail": "SeDebugPrivilege 활성화" }
]
```

#### quiz 객체

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `questions` | array | Y | 퀴즈 문제 배열 (최소 3개) |

각 question:
```json
{
  "question": "LSASS 프로세스의 주요 역할은 무엇인가?",
  "options": [
    "파일 시스템 관리",
    "네트워크 패킷 처리",
    "인증 자격 증명 관리",
    "디스크 암호화"
  ],
  "correct": 2,
  "explanation": "LSASS는 Windows의 인증 자격 증명(NTLM 해시, Kerberos 티켓 등)을 메모리에 저장하고 관리하는 핵심 보안 프로세스입니다."
}
```

#### metadata 객체

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `ctiSources` | array | Y | CTI 출처 목록 |
| `aptGroups` | string[] | Y | 관련 APT 그룹 목록 |
| `relatedTechniques` | string[] | Y | 관련 서브테크닉 ID 목록 |
| `tags` | string[] | Y | 검색용 태그 |
| `lastUpdated` | string | Y | 최종 수정 일자 (ISO 8601) |
| `author` | string | Y | 작성자/팀 |
| `version` | string | Y | 데이터셋 버전 (semver) |

ctiSources 배열 항목:
```json
{
  "name": "MITRE ATT&CK",
  "url": "https://attack.mitre.org/techniques/T1003/001/",
  "license": "CC-BY-4.0",
  "accessDate": "2026-03-01"
}
```

---

## 5. 샘플 데이터셋

### 5.1 T1587.001 (Develop Capabilities: Malware)

기존 lab-scenarios 데이터에서 역공학(reverse-engineer)하여 edu-datasets 스키마로 재구성한 예시이다.

#### beginner 레벨 전체 JSON

```json
{
  "techniqueId": "T1587.001",
  "techniqueName": "Malware",
  "techniqueNameKo": "커스텀 악성코드 개발",
  "tacticIds": ["t15"],
  "tacticName": "Resource Development",
  "tacticNameKo": "자원 개발",
  "levels": {
    "beginner": {
      "title": "커스텀 악성코드 - 왜 기성품 대신 직접 만들까?",
      "titleEn": "Custom Malware - Why Build Instead of Buy?",
      "estimatedMinutes": 18,
      "overviewPanel": {
        "emoji": "🦠",
        "question": "해커들은 왜 이미 있는 악성코드를 쓰지 않고 직접 만들까요?",
        "explanation": "기존 악성코드는 백신에 이미 시그니처가 등록되어 있습니다. 커스텀 악성코드를 직접 개발하면 어떤 백신도 탐지하지 못하는 '투명 망토'를 만들 수 있습니다. 이 과정에는 페이로드 생성, 암호화, 탐지 우회 테스트, C2 통신 설정 등이 포함됩니다.",
        "learningGoals": [
          "커스텀 악성코드 개발의 동기와 목적을 이해한다",
          "악성코드의 주요 구성 요소(페이로드, 로더, RAT, 드롭퍼)를 구별한다",
          "탐지 우회(AV/EDR Evasion)의 기본 원리를 파악한다",
          "C2(Command & Control) 통신의 개념을 이해한다"
        ],
        "nextLevelTeaser": "중급에서는 실제 Crypter의 AES-256 암호화 코드를 분석하고, 프로세스 할로잉의 메모리 조작 원리를 코드 레벨에서 살펴봅니다."
      },
      "chapters": [
        {
          "id": "b-ch1",
          "title": "악성코드 제작 공장의 생산 라인",
          "titleEn": "The Malware Factory Production Line",
          "panels": [
            {
              "type": "analogy",
              "emoji": "🏭",
              "title": "자동차 공장 비유",
              "content": "커스텀 악성코드 제작은 자동차 공장과 비슷합니다. 엔진(페이로드)을 설계하고, 차체(로더)를 만들고, 도장(암호화/크립터)을 하고, 리모컨(C2)으로 원격 조종할 수 있게 합니다. 대량 생산된 차(기존 악성코드)는 번호판(시그니처)이 이미 경찰 데이터베이스에 있지만, 직접 만든 차는 아무도 모르는 차량입니다."
            },
            {
              "type": "concept",
              "title": "왜 커스텀인가?",
              "content": "공개된 악성코드(예: Metasploit 페이로드)는 세계 72개 이상의 백신 제품에 시그니처가 등록되어 있습니다. 이런 도구를 그대로 사용하면 즉시 탐지됩니다. APT 그룹들은 수개월에 걸쳐 자체 도구를 개발하며, 특정 대상 환경에 맞춤화된 악성코드를 사용합니다.",
              "highlights": ["시그니처 탐지 우회", "APT 맞춤 개발", "FUD (Fully Undetectable)"]
            }
          ]
        },
        {
          "id": "b-ch2",
          "title": "악성코드의 4대 구성 요소",
          "titleEn": "Four Key Components of Malware",
          "panels": [
            {
              "type": "comparison_table",
              "title": "구성 요소 비교",
              "headers": ["구성 요소", "역할", "비유", "탐지 포인트"],
              "rows": [
                ["페이로드 (Payload)", "실제 악성 행위 수행", "자동차 엔진", "시그니처 매칭"],
                ["크립터 (Crypter)", "암호화로 탐지 우회", "위장 도색", "엔트로피 분석"],
                ["로더 (Loader)", "정상 프로세스에 주입", "택배 상자", "프로세스 인젝션 탐지"],
                ["드롭퍼 (Dropper)", "피해자에게 전달", "초대장", "이메일 게이트웨이"]
              ]
            },
            {
              "type": "concept",
              "title": "C2 (Command & Control)",
              "content": "모든 구성 요소가 조립되면, C2 서버가 감염된 시스템을 원격으로 제어합니다. C2 통신은 일반적인 웹 트래픽(HTTPS, WebSocket)으로 위장하여 네트워크 보안 장비의 탐지를 우회합니다.",
              "highlights": ["WebSocket", "도메인 프론팅", "비콘 간격 지터"]
            }
          ]
        },
        {
          "id": "b-ch3",
          "title": "방어자의 대응 전략",
          "titleEn": "Defender's Response Strategy",
          "panels": [
            {
              "type": "concept",
              "title": "다층 방어 (Defense in Depth)",
              "content": "커스텀 악성코드는 단일 보안 제품으로 탐지하기 어렵습니다. 이메일 게이트웨이에서 드롭퍼를 차단하고, EDR에서 프로세스 인젝션을 감지하고, 네트워크에서 C2 비콘 패턴을 탐지하는 다층 방어가 필요합니다.",
              "highlights": ["이메일 게이트웨이", "EDR 행위 탐지", "네트워크 이상 탐지"]
            }
          ]
        }
      ],
      "miniLabs": [
        {
          "type": "matching_game",
          "title": "악성코드 구성 요소 매칭",
          "description": "각 구성 요소를 올바른 역할과 연결하세요",
          "items": [
            { "left": "페이로드", "right": "실제 악성 행위를 수행하는 핵심 코드" },
            { "left": "크립터", "right": "암호화로 백신 탐지를 우회하는 도구" },
            { "left": "로더", "right": "정상 프로세스에 악성코드를 주입하는 모듈" },
            { "left": "드롭퍼", "right": "피해자에게 악성코드를 전달하는 운반체" },
            { "left": "C2 서버", "right": "감염 시스템을 원격 제어하는 관제탑" }
          ]
        },
        {
          "type": "ordering_game",
          "title": "악성코드 제작 순서 정렬",
          "description": "커스텀 악성코드 제작 단계를 올바른 순서로 정렬하세요",
          "items": [
            { "step": 1, "text": "페이로드(Reverse Shell) 생성" },
            { "step": 2, "text": "크립터로 암호화/난독화" },
            { "step": 3, "text": "로더(프로세스 할로잉) 컴파일" },
            { "step": 4, "text": "RAT 모듈 조립" },
            { "step": 5, "text": "AV/EDR 탐지 우회 테스트" },
            { "step": 6, "text": "드롭퍼(문서 파일) 제작" },
            { "step": 7, "text": "C2 서버 가동" }
          ]
        }
      ],
      "quiz": {
        "questions": [
          {
            "question": "APT 그룹이 공개 도구 대신 커스텀 악성코드를 개발하는 주된 이유는?",
            "options": [
              "비용이 더 저렴하기 때문에",
              "공개 도구는 법적으로 사용할 수 없기 때문에",
              "백신에 이미 시그니처가 등록되어 탐지되기 때문에",
              "공개 도구는 기능이 부족하기 때문에"
            ],
            "correct": 2,
            "explanation": "공개 도구(Metasploit 등)는 전 세계 백신 제품에 시그니처가 등록되어 있어 즉시 탐지됩니다. 커스텀 개발은 이 시그니처 탐지를 우회하기 위한 것입니다."
          },
          {
            "question": "크립터(Crypter)의 주요 역할은?",
            "options": [
              "네트워크 트래픽을 암호화한다",
              "악성코드를 암호화하여 백신 시그니처 탐지를 우회한다",
              "피해자의 파일을 암호화한다 (랜섬웨어)",
              "C2 통신 채널을 생성한다"
            ],
            "correct": 1,
            "explanation": "크립터는 악성코드 자체를 AES 등으로 암호화하여 원본 코드의 패턴을 숨기는 도구입니다. 랜섬웨어의 파일 암호화와는 다릅니다."
          },
          {
            "question": "프로세스 할로잉(Process Hollowing)에 대한 설명으로 올바른 것은?",
            "options": [
              "새로운 프로세스를 생성하여 악성코드를 실행한다",
              "정상 프로세스의 메모리를 비우고 악성코드로 교체한다",
              "프로세스 목록에서 악성 프로세스를 숨긴다",
              "다른 프로세스의 권한을 복사한다"
            ],
            "correct": 1,
            "explanation": "프로세스 할로잉은 svchost.exe 같은 정상 프로세스를 생성한 뒤 메모리 내용을 비우고(hollow) 악성코드로 교체하는 기법입니다. 작업 관리자에서는 정상 프로세스로 보입니다."
          }
        ]
      }
    }
  },
  "metadata": {
    "ctiSources": [
      {
        "name": "MITRE ATT&CK",
        "url": "https://attack.mitre.org/techniques/T1587/001/",
        "license": "CC-BY-4.0",
        "accessDate": "2026-03-01"
      },
      {
        "name": "MITRE CTI GitHub",
        "url": "https://github.com/mitre/cti",
        "license": "Apache-2.0",
        "accessDate": "2026-03-01"
      }
    ],
    "aptGroups": ["APT28", "APT29", "Lazarus Group", "Turla"],
    "relatedTechniques": ["T1587.002", "T1587.003", "T1059.001", "T1055.001"],
    "tags": ["malware-development", "crypter", "process-hollowing", "RAT", "C2", "evasion"],
    "lastUpdated": "2026-03-02",
    "author": "GOTROOT Security Research",
    "version": "1.0.0"
  }
}
```

#### intermediate 레벨 chapter[0] 예시 (pocCode 포함)

```json
{
  "id": "i-ch1",
  "title": "AES-256 크립터 코드 분석",
  "titleEn": "AES-256 Crypter Code Analysis",
  "panels": [
    {
      "type": "concept",
      "title": "크립터의 내부 동작",
      "content": "크립터는 3단계로 동작합니다: (1) 원본 페이로드를 AES-256-CBC로 암호화, (2) PBKDF2 키 도출로 복호화 키를 생성, (3) 실행 시 stub loader가 메모리에서 복호화 후 실행. 안티-디버깅과 안티-샌드박스 검사도 내장됩니다.",
      "highlights": ["AES-256-CBC", "PBKDF2", "stub loader", "안티-분석"]
    },
    {
      "type": "code",
      "filename": "crypter_core.py",
      "language": "python",
      "warning": "교육 목적 전용 코드 - 실제 악성코드 제작에 사용 금지",
      "lines": [
        { "text": "import os", "color": "default" },
        { "text": "from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes", "color": "default" },
        { "text": "from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC", "color": "default" },
        { "text": "", "color": "default" },
        { "text": "# [1] 랜덤 솔트와 IV 생성 - 매 실행마다 다른 암호문 생성", "color": "comment" },
        { "text": "salt = os.urandom(16)", "color": "highlight" },
        { "text": "iv = os.urandom(16)", "color": "highlight" },
        { "text": "", "color": "default" },
        { "text": "# [2] PBKDF2로 마스터 키 도출 (10만 반복 = 무차별 대입 방지)", "color": "comment" },
        { "text": "kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32,", "color": "default" },
        { "text": "                 salt=salt, iterations=100_000)", "color": "default" },
        { "text": "key = kdf.derive(master_password.encode())", "color": "highlight" },
        { "text": "", "color": "default" },
        { "text": "# [3] AES-256-CBC 암호화 - 정적 분석 무력화", "color": "comment" },
        { "text": "cipher = Cipher(algorithms.AES(key), modes.CBC(iv))", "color": "default" },
        { "text": "encryptor = cipher.encryptor()", "color": "default" },
        { "text": "encrypted_payload = encryptor.update(padded_payload) + encryptor.finalize()", "color": "highlight" }
      ]
    }
  ],
  "pocCode": {
    "filename": "anti_sandbox_check.c",
    "language": "c",
    "buildCommands": [
      "gcc -o anti_sandbox anti_sandbox_check.c -lkernel32"
    ],
    "lines": [
      { "text": "#include <windows.h>", "color": "default" },
      { "text": "#include <winternl.h>", "color": "default" },
      { "text": "", "color": "default" },
      { "text": "// 안티-샌드박스: 마우스 움직임 감지", "color": "comment" },
      { "text": "// 샌드박스는 자동 분석이므로 마우스가 움직이지 않음", "color": "comment" },
      { "text": "BOOL check_mouse_movement() {", "color": "default" },
      { "text": "    POINT p1, p2;", "color": "default" },
      { "text": "    GetCursorPos(&p1);", "color": "highlight" },
      { "text": "    Sleep(3000);  // 3초 대기", "color": "warning" },
      { "text": "    GetCursorPos(&p2);", "color": "highlight" },
      { "text": "    // 마우스가 움직이지 않으면 샌드박스로 판단", "color": "comment" },
      { "text": "    return (p1.x != p2.x || p1.y != p2.y);", "color": "highlight" },
      { "text": "}", "color": "default" },
      { "text": "", "color": "default" },
      { "text": "// 안티-디버깅: NtQueryInformationProcess", "color": "comment" },
      { "text": "BOOL check_debugger() {", "color": "default" },
      { "text": "    DWORD debugPort = 0;", "color": "default" },
      { "text": "    // ProcessDebugPort(7)가 0이 아니면 디버거 연결됨", "color": "comment" },
      { "text": "    NtQueryInformationProcess(GetCurrentProcess(),", "color": "highlight" },
      { "text": "        7, &debugPort, sizeof(debugPort), NULL);", "color": "highlight" },
      { "text": "    return (debugPort == 0);  // 디버거 없으면 TRUE", "color": "highlight" },
      { "text": "}", "color": "default" }
    ]
  }
}
```

### 5.2 T1003.001 (OS Credential Dumping: LSASS Memory) - 신규 작성 예시

#### beginner 레벨 전체 JSON

```json
{
  "techniqueId": "T1003.001",
  "techniqueName": "LSASS Memory",
  "techniqueNameKo": "LSASS 메모리 자격 증명 덤프",
  "tacticIds": ["t8"],
  "tacticName": "Credential Access",
  "tacticNameKo": "자격 증명 접근",
  "levels": {
    "beginner": {
      "title": "LSASS 메모리 - 비밀번호가 메모리에 남아있다고?",
      "titleEn": "LSASS Memory - Passwords Lingering in Memory?",
      "estimatedMinutes": 15,
      "overviewPanel": {
        "emoji": "🔑",
        "question": "로그인한 순간, 당신의 비밀번호는 어디에 저장될까요?",
        "explanation": "Windows에서 로그인하면, 비밀번호의 해시(지문)가 LSASS라는 프로세스의 메모리에 저장됩니다. 이 해시를 훔치면 원래 비밀번호를 몰라도 다른 시스템에 로그인할 수 있습니다. Mimikatz라는 도구는 이 메모리를 읽어 모든 로그인 사용자의 자격 증명을 추출합니다.",
        "learningGoals": [
          "LSASS 프로세스의 역할과 자격 증명 저장 방식을 이해한다",
          "NTLM 해시와 Kerberos 티켓의 개념을 파악한다",
          "Mimikatz의 동작 원리를 비유를 통해 이해한다",
          "LSASS 보호를 위한 기본 방어 전략을 학습한다",
          "LOLBin(Living off the Land Binary) 개념을 이해한다"
        ],
        "nextLevelTeaser": "중급에서는 Mimikatz의 sekurlsa::logonpasswords 명령이 LSASS 메모리의 어떤 구조체를 파싱하는지 코드 레벨에서 분석합니다."
      },
      "chapters": [
        {
          "id": "b-ch1",
          "title": "은행 금고 관리인의 비밀",
          "titleEn": "The Bank Vault Manager's Secret",
          "panels": [
            {
              "type": "analogy",
              "emoji": "🏦",
              "title": "은행 금고 관리인 비유",
              "content": "LSASS는 은행의 금고 관리인과 같습니다. 모든 고객(사용자)이 방문할 때 신분증(비밀번호)을 확인하고, 그 정보를 머릿속(메모리)에 기억합니다. 공격자가 이 관리인의 머릿속을 읽을 수 있다면? 한 번에 모든 고객의 비밀번호를 알아낼 수 있습니다. Mimikatz는 바로 이 '관리인의 기억을 읽는 독심술 도구'입니다."
            },
            {
              "type": "concept",
              "title": "LSASS란 무엇인가?",
              "content": "LSASS(Local Security Authority Subsystem Service)는 Windows의 핵심 보안 프로세스입니다. 사용자가 로그인하면 LSASS는 비밀번호를 NTLM 해시로 변환하여 메모리에 보관합니다. 이후 네트워크 리소스 접근이나 재인증이 필요할 때 이 저장된 해시를 사용합니다. 즉, 시스템이 꺼지기 전까지 자격 증명이 메모리에 남아있습니다.",
              "highlights": ["NTLM 해시", "메모리 상주", "인증 프로세스", "PID 항상 존재"]
            },
            {
              "type": "comparison_table",
              "title": "자격 증명 유형 비교",
              "headers": ["유형", "형태", "위험도", "Windows 10+ 기본값"],
              "rows": [
                ["NTLM 해시", "32자 16진수 문자열", "높음 - PtH 공격 가능", "메모리에 저장됨"],
                ["Kerberos 티켓", "시간 제한 인증 토큰", "중간 - 만료 있음", "메모리에 저장됨"],
                ["WDigest 평문", "평문 비밀번호 그대로", "매우 높음", "비활성화됨 (Win 8.1+)"],
                ["DPAPI 마스터키", "데이터 보호 API 키", "높음 - 저장 데이터 복호화", "메모리에 저장됨"]
              ]
            }
          ]
        },
        {
          "id": "b-ch2",
          "title": "공격 도구와 방법",
          "titleEn": "Attack Tools and Methods",
          "panels": [
            {
              "type": "concept",
              "title": "Mimikatz - 가장 유명한 자격 증명 덤핑 도구",
              "content": "프랑스 보안 연구원 Benjamin Delpy가 개발한 Mimikatz는 LSASS 메모리에서 자격 증명을 추출하는 오픈 소스 도구입니다. 'sekurlsa::logonpasswords' 명령 하나로 현재 로그인된 모든 사용자의 NTLM 해시와 Kerberos 티켓을 추출할 수 있습니다.",
              "highlights": ["Mimikatz", "sekurlsa::logonpasswords", "SeDebugPrivilege"]
            },
            {
              "type": "analogy",
              "emoji": "🔧",
              "title": "LOLBin - 건물 안의 소방 도끼",
              "content": "LOLBin(Living off the Land Binary)은 도둑이 자기 도구를 가져오지 않고 건물에 이미 있는 소방 도끼로 금고를 부수는 것과 같습니다. Windows에 기본 설치된 comsvcs.dll의 MiniDump 기능을 이용하면 Mimikatz 없이도 LSASS 메모리를 파일로 덤프할 수 있습니다. 외부 도구를 사용하지 않으므로 파일 기반 탐지를 우회합니다."
            },
            {
              "type": "code",
              "filename": "lsass-attack-flow.pseudo",
              "language": "text",
              "warning": null,
              "lines": [
                { "text": "# LSASS 자격 증명 덤프 공격 흐름 (의사 코드)", "color": "comment" },
                { "text": "", "color": "default" },
                { "text": "1단계: LSASS 프로세스의 PID 확인", "color": "default" },
                { "text": "   process = findProcess(\"lsass.exe\")  --> PID: 684", "color": "highlight" },
                { "text": "", "color": "default" },
                { "text": "2단계: 디버그 권한 획득 (관리자 권한 필요)", "color": "default" },
                { "text": "   enablePrivilege(\"SeDebugPrivilege\")", "color": "highlight" },
                { "text": "", "color": "default" },
                { "text": "3단계: LSASS 메모리 접근 및 자격 증명 추출", "color": "default" },
                { "text": "   handle = openProcess(PID=684, ACCESS=ALL)", "color": "highlight" },
                { "text": "   credentials = readMemory(handle, AUTH_PACKAGES)", "color": "highlight" },
                { "text": "", "color": "default" },
                { "text": "4단계: 추출된 해시로 측면 이동 (Pass the Hash)", "color": "default" },
                { "text": "   login(target=\"DC01\", hash=credentials.ntlm)", "color": "warning" },
                { "text": "", "color": "default" },
                { "text": "5단계: 증거 인멸", "color": "default" },
                { "text": "   delete(\"mimikatz.exe\", \"lsass.dmp\")", "color": "warning" }
              ]
            }
          ]
        },
        {
          "id": "b-ch3",
          "title": "탐지와 방어",
          "titleEn": "Detection and Defense",
          "panels": [
            {
              "type": "concept",
              "title": "LSASS 보호 방법",
              "content": "Windows는 LSASS를 보호하기 위한 여러 기능을 제공합니다. Credential Guard는 가상화 기반 보안(VBS)으로 자격 증명을 격리하고, PPL(Protected Process Light)은 비인가 프로세스의 LSASS 메모리 접근을 차단합니다. 이 두 기능을 모두 활성화하면 Mimikatz의 직접적인 메모리 접근을 방어할 수 있습니다.",
              "highlights": ["Credential Guard", "PPL", "Sysmon 모니터링", "NTLM 해시 무력화"]
            },
            {
              "type": "comparison_table",
              "title": "방어 기법 효과 비교",
              "headers": ["방어 기법", "차단 대상", "구현 난이도", "효과"],
              "rows": [
                ["Credential Guard", "메모리 내 자격 증명 접근", "중간 (VBS 필요)", "높음"],
                ["LSASS PPL", "비인가 프로세스 접근", "낮음 (레지스트리 설정)", "중간"],
                ["Sysmon Event ID 10", "LSASS 접근 모니터링", "낮음 (Sysmon 배포)", "탐지만 가능"],
                ["비밀번호 주기 변경", "탈취된 해시 유효기간 단축", "낮음 (정책 설정)", "제한적"]
              ]
            }
          ]
        }
      ],
      "miniLabs": [
        {
          "type": "matching_game",
          "title": "LSASS 개념 매칭",
          "description": "각 용어를 올바른 설명과 연결하세요",
          "items": [
            { "left": "LSASS", "right": "Windows 인증 자격 증명을 관리하는 핵심 프로세스" },
            { "left": "NTLM 해시", "right": "비밀번호를 단방향 변환한 32자 16진수 값" },
            { "left": "SeDebugPrivilege", "right": "다른 프로세스의 메모리에 접근할 수 있는 권한" },
            { "left": "comsvcs.dll", "right": "Windows 내장 DLL로 프로세스 메모리 덤프 가능" },
            { "left": "Credential Guard", "right": "가상화 기반 보안으로 자격 증명을 격리하는 기능" }
          ]
        },
        {
          "type": "ordering_game",
          "title": "LSASS 덤프 공격 순서",
          "description": "LSASS 메모리 덤프 공격의 단계를 올바른 순서로 정렬하세요",
          "items": [
            { "step": 1, "text": "LSASS 프로세스의 PID 확인 (tasklist)" },
            { "step": 2, "text": "SeDebugPrivilege 권한 획득" },
            { "step": 3, "text": "LSASS 메모리 접근 및 자격 증명 추출" },
            { "step": 4, "text": "NTLM 해시로 Pass the Hash 측면 이동" },
            { "step": 5, "text": "도구 및 덤프 파일 삭제 (증거 인멸)" }
          ]
        }
      ],
      "quiz": {
        "questions": [
          {
            "question": "LSASS 프로세스가 메모리에 자격 증명을 저장하는 주된 이유는?",
            "options": [
              "디스크 공간을 절약하기 위해",
              "네트워크 리소스 접근 시 재인증에 사용하기 위해",
              "사용자 인터페이스에 표시하기 위해",
              "백업 목적으로 보관하기 위해"
            ],
            "correct": 1,
            "explanation": "LSASS는 사용자가 네트워크 공유 폴더, 이메일 서버 등에 접근할 때 저장된 자격 증명을 사용하여 재인증합니다. 매번 비밀번호를 입력하지 않아도 되는 SSO(Single Sign-On) 경험을 제공합니다."
          },
          {
            "question": "comsvcs.dll을 이용한 LSASS 덤프가 위험한 이유는?",
            "options": [
              "Mimikatz보다 더 많은 정보를 추출하기 때문에",
              "Windows 내장 파일이므로 파일 기반 탐지를 우회하기 때문에",
              "관리자 권한 없이 실행할 수 있기 때문에",
              "네트워크를 통해 원격으로 실행할 수 있기 때문에"
            ],
            "correct": 1,
            "explanation": "comsvcs.dll은 Windows에 기본 설치된 합법적 DLL이므로, 백신의 파일 해시/시그니처 기반 탐지에 걸리지 않습니다. 이것이 LOLBin(Living off the Land Binary) 기법의 핵심입니다."
          },
          {
            "question": "Credential Guard가 LSASS 메모리 덤프를 방어하는 원리는?",
            "options": [
              "LSASS 프로세스를 암호화하여 실행한다",
              "자격 증명을 가상화 기반 보안(VBS) 격리 영역에 저장한다",
              "모든 사용자의 비밀번호를 자동으로 변경한다",
              "LSASS 프로세스를 숨겨서 찾을 수 없게 한다"
            ],
            "correct": 1,
            "explanation": "Credential Guard는 하이퍼바이저(Hyper-V)를 이용하여 자격 증명을 일반 운영체제와 격리된 가상 환경에 저장합니다. Mimikatz가 LSASS 메모리를 읽어도 실제 자격 증명은 접근할 수 없는 별도 공간에 있습니다."
          },
          {
            "question": "NTLM 해시만으로 다른 시스템에 로그인할 수 있는 공격 기법은?",
            "options": [
              "Brute Force (무차별 대입)",
              "Pass the Hash (해시 전달)",
              "SQL Injection (SQL 삽입)",
              "Cross-Site Scripting (XSS)"
            ],
            "correct": 1,
            "explanation": "Pass the Hash(T1550.002)는 원래 비밀번호를 복원하지 않고도 NTLM 해시만으로 인증을 통과하는 공격 기법입니다. Windows NTLM 인증 프로토콜의 설계적 특성을 악용합니다."
          }
        ]
      }
    }
  },
  "metadata": {
    "ctiSources": [
      {
        "name": "MITRE ATT&CK",
        "url": "https://attack.mitre.org/techniques/T1003/001/",
        "license": "CC-BY-4.0",
        "accessDate": "2026-03-01"
      },
      {
        "name": "MITRE CTI GitHub",
        "url": "https://github.com/mitre/cti",
        "license": "Apache-2.0",
        "accessDate": "2026-03-01"
      },
      {
        "name": "CISA Advisory AA23-347A",
        "url": "https://www.cisa.gov/news-events/cybersecurity-advisories",
        "license": "US-Public-Domain",
        "accessDate": "2026-02-28"
      },
      {
        "name": "KISA 침해사고 분석 보고서",
        "url": "https://www.boho.or.kr/",
        "license": "공공데이터",
        "accessDate": "2026-02-28"
      }
    ],
    "aptGroups": ["APT28", "APT29", "APT3", "Kimsuky", "Lazarus Group", "FIN6"],
    "relatedTechniques": ["T1003.002", "T1003.003", "T1550.002", "T1558.003"],
    "tags": ["LSASS", "credential-dumping", "Mimikatz", "NTLM", "Kerberos", "LOLBin", "comsvcs.dll", "Credential Guard", "PPL"],
    "lastUpdated": "2026-03-02",
    "author": "GOTROOT Security Research",
    "version": "1.0.0"
  }
}
```

---

## 6. 원자성 보장 체크리스트

각 서브테크닉 데이터셋이 독립적이고 완결된 교육 단위인지 확인하기 위한 체크리스트이다. 모든 항목을 통과해야 검증 완료로 간주한다.

### 6.1 콘텐츠 고유성 검증

- [ ] **고유 비유(analogy)**: 초급 레벨에 해당 서브테크닉만의 독자적인 비유가 있는가? 다른 서브테크닉의 비유와 중복되지 않는가?
- [ ] **고유 공격 도구**: 해당 서브테크닉의 대표 도구가 명시되어 있으며, 다른 서브테크닉의 대표 도구와 구별되는가?
- [ ] **고유 APT 사례 + 캠페인**: 해당 서브테크닉을 실제 사용한 APT 그룹과 캠페인이 명시되어 있는가? (최소 2개 그룹)
- [ ] **고유 POC 코드 (중급 이상)**: 중급 및 고급 레벨에 해당 서브테크닉만의 고유한 POC 코드가 포함되어 있는가?
- [ ] **고유 탐지 시그니처**: Sigma, YARA, 또는 Snort 규칙 형태의 탐지 시그니처가 해당 서브테크닉에 특화되어 있는가?
- [ ] **고유 방어 전략**: 해당 서브테크닉에 특화된 방어/완화 조치가 명시되어 있는가?

### 6.2 데이터 정확성 검증

- [ ] **MITRE Procedure Examples 반영**: ATT&CK 웹사이트의 Procedure Examples가 데이터셋에 반영되어 있는가?
- [ ] **CTI 소스 출처 명시**: 모든 사실적 주장에 대해 metadata.ctiSources에 출처가 기록되어 있는가?
- [ ] **ATT&CK ID 정확성**: techniqueId, techniqueName, tacticIds가 MITRE 공식 데이터와 일치하는가?
- [ ] **도구명/버전 정확성**: 언급된 도구의 이름, 버전, 기능 설명이 정확한가?

### 6.3 교육 구조 검증

- [ ] **3레벨 완비**: beginner, intermediate, advanced 모든 레벨이 존재하는가?
- [ ] **난이도 상승**: beginner -> intermediate -> advanced 순으로 난이도가 자연스럽게 상승하는가?
- [ ] **미니랩 연결**: 각 레벨의 미니랩이 해당 레벨의 학습 목표와 직접 연결되는가?
- [ ] **퀴즈 범위**: 퀴즈 문제가 해당 레벨에서 다룬 내용만을 평가하는가?
- [ ] **예상 시간 적합**: estimatedMinutes가 실제 학습 소요 시간과 부합하는가?

### 6.4 한국어 품질 검증

- [ ] **용어 통일**: Phase 2에서 정의한 용어 통일 기준에 맞는가?
- [ ] **자연스러운 한국어**: 번역체가 아닌 자연스러운 한국어 문장인가?
- [ ] **영문 병기**: 기술 용어에 영문이 적절히 병기되어 있는가?
- [ ] **titleEn 존재**: 모든 title에 대응하는 titleEn이 있는가?

### 6.5 법적/윤리적 검증

- [ ] **수위 범위 내**: Phase 2의 교육 수위 조절 기준 범위 내인가?
- [ ] **경고문 포함**: POC 코드에 "교육 목적 전용" 경고가 포함되어 있는가?
- [ ] **라이선스 준수**: 인용한 CTI 소스의 라이선스 조건을 준수하는가?
- [ ] **개인정보 제거**: 실제 IP 주소, 도메인, 개인 식별 정보가 포함되어 있지 않은가?

---

## 7. 자동화 파이프라인 가이드

### 7.1 scripts/generate-edu-html.js 사용법

이 스크립트는 `src/data/edu-datasets/` 디렉토리의 JSON 데이터셋을 읽어 교육 HTML 파일을 자동 생성한다.

**기본 사용법:**
```bash
# 단일 파일 생성
node scripts/generate-edu-html.js --input src/data/edu-datasets/T1003.001.json

# 특정 레벨만 생성
node scripts/generate-edu-html.js --input src/data/edu-datasets/T1003.001.json --level beginner

# 모든 데이터셋 일괄 생성
node scripts/generate-edu-html.js --all

# 강제 덮어쓰기 (기존 파일 존재 시)
node scripts/generate-edu-html.js --input src/data/edu-datasets/T1003.001.json --force
```

**출력 파일 경로 규칙:**
```
입력: src/data/edu-datasets/T1003.001.json
출력:
  public/edu/t1003-001-lsass-memory.html              (beginner)
  public/edu/t1003-001-lsass-memory-intermediate.html  (intermediate)
  public/edu/t1003-001-lsass-memory-advanced.html      (advanced)
```

**파일명 생성 로직:**
1. techniqueId에서 `T`를 소문자 `t`로, `.`을 `-`로 변환: `T1003.001` -> `t1003-001`
2. techniqueName을 kebab-case로 변환: `LSASS Memory` -> `lsass-memory`
3. 결합: `t1003-001-lsass-memory`
4. 초급은 접미사 없음, 중급은 `-intermediate`, 고급은 `-advanced` 추가

**주요 옵션:**

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--input <path>` | 입력 JSON 데이터셋 파일 경로 | (필수) |
| `--level <level>` | 생성할 레벨 (beginner/intermediate/advanced/all) | all |
| `--force` | 기존 파일 덮어쓰기 | false |
| `--all` | 모든 데이터셋 일괄 처리 | false |
| `--dry-run` | 실제 파일 생성 없이 미리보기 | false |
| `--template <path>` | 커스텀 EJS 템플릿 경로 | 기본 템플릿 |

### 7.2 scripts/validate-edu-html.js 사용법

생성된 HTML 파일의 품질을 검증하는 스크립트이다.

**기본 사용법:**
```bash
# 단일 파일 검증
node scripts/validate-edu-html.js public/edu/t1003-001-lsass-memory.html

# 전체 edu 디렉토리 검증
node scripts/validate-edu-html.js --all

# 검증 결과를 JSON으로 출력
node scripts/validate-edu-html.js --all --format json > validation-report.json
```

**검증 항목:**

| 항목 | 검증 내용 | 심각도 |
|------|-----------|--------|
| auth-gate | Supabase 인증 게이트 스크립트 존재 | ERROR |
| csp | Content-Security-Policy 메타 태그 | ERROR |
| dark-mode | 다크 모드 토글 기능 | WARNING |
| dashboard-link | 대시보드 복귀 버튼 | ERROR |
| lab-link-js | lab-link.js 스크립트 포함 | WARNING |
| progress-tracker | progress-tracker.js 포함 | WARNING |
| tailwind | Tailwind CSS 로드 | ERROR |
| a11y | 기본 접근성 (alt, ARIA) | WARNING |
| encoding | UTF-8 인코딩 선언 | ERROR |
| viewport | 반응형 viewport 메타 태그 | WARNING |

**출력 예시:**
```
=== Validation Report ===
File: public/edu/t1003-001-lsass-memory.html
  [PASS] auth-gate: Supabase authentication gate found
  [PASS] csp: Content-Security-Policy header present
  [PASS] dark-mode: Dark mode toggle functional
  [PASS] dashboard-link: Dashboard return button present
  [PASS] lab-link-js: lab-link.js included
  [WARN] progress-tracker: progress-tracker.js not found
  [PASS] tailwind: Tailwind CSS loaded
  [PASS] a11y: Basic accessibility checks passed
  [PASS] encoding: UTF-8 declared
  [PASS] viewport: Responsive viewport present

Result: 9/10 passed, 1 warning, 0 errors
```

### 7.3 scripts/update-edu-meta.js 사용법

`public/edu/` 디렉토리의 HTML 파일을 스캔하여 `src/data/edu-meta.json`을 자동 업데이트한다. 기존 스크립트 `scripts/update-edu-meta.cjs`를 기반으로 한다.

**기본 사용법:**
```bash
# edu-meta.json 자동 업데이트
node scripts/update-edu-meta.cjs

# 드라이 런 (변경사항 미리보기만)
node scripts/update-edu-meta.cjs --dry-run
```

**동작 과정:**
1. `src/data/matrix-fallback.json`에서 전체 ATT&CK 매트릭스 구조 로드
2. `public/edu/*.html` 파일 스캔
3. 파일명에서 techniqueId 파싱 (예: `t1003-001-lsass-memory.html` -> `T1003.001`)
4. 매트릭스 데이터와 교차하여 tacticIds, techniqueName 등 자동 매핑
5. 기존 `edu-meta.json`과 비교하여 신규 항목 추가
6. 결과 파일 저장

### 7.4 배치 처리 명령어 예시

**전체 파이프라인 실행:**
```bash
# 1. 데이터셋 JSON 검증
for f in src/data/edu-datasets/*.json; do
  echo "Validating: $f"
  node scripts/validate-edu-dataset.js "$f"
done

# 2. HTML 일괄 생성
node scripts/generate-edu-html.js --all --force

# 3. HTML 품질 검증
node scripts/validate-edu-html.js --all

# 4. edu-meta.json 업데이트
node scripts/update-edu-meta.cjs

# 5. 결과 확인
echo "Generated HTML files:"
ls -la public/edu/*.html | wc -l
```

**특정 전술(Tactic)의 모든 서브테크닉 처리:**
```bash
# Credential Access(t8) 관련 데이터셋만 처리
for f in src/data/edu-datasets/T1003.*.json \
         src/data/edu-datasets/T1110.*.json \
         src/data/edu-datasets/T1558.*.json; do
  if [ -f "$f" ]; then
    echo "Processing: $f"
    node scripts/generate-edu-html.js --input "$f" --force
  fi
done
```

**변경된 파일만 재생성:**
```bash
# git에서 변경된 데이터셋 파일만 대상으로 재생성
git diff --name-only HEAD~1 -- 'src/data/edu-datasets/*.json' | while read f; do
  echo "Regenerating: $f"
  node scripts/generate-edu-html.js --input "$f" --force
done
```

### 7.5 CI/CD 통합 가이드

**GitHub Actions 워크플로우 예시:**

```yaml
# .github/workflows/edu-pipeline.yml
name: Education Content Pipeline

on:
  push:
    paths:
      - 'src/data/edu-datasets/**'
  pull_request:
    paths:
      - 'src/data/edu-datasets/**'

jobs:
  validate-and-generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Validate datasets (JSON Schema)
        run: |
          for f in src/data/edu-datasets/*.json; do
            echo "::group::Validating $f"
            node scripts/validate-edu-dataset.js "$f"
            echo "::endgroup::"
          done

      - name: Generate HTML
        run: node scripts/generate-edu-html.js --all --force

      - name: Validate HTML output
        run: node scripts/validate-edu-html.js --all --format json > validation-report.json

      - name: Update edu-meta.json
        run: node scripts/update-edu-meta.cjs

      - name: Check for changes
        id: changes
        run: |
          if git diff --quiet; then
            echo "has_changes=false" >> $GITHUB_OUTPUT
          else
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi

      - name: Commit generated files
        if: steps.changes.outputs.has_changes == 'true' && github.event_name == 'push'
        run: |
          git config user.name "GOTROOT Bot"
          git config user.email "bot@gotroot.co.kr"
          git add public/edu/ src/data/edu-meta.json
          git commit -m "chore: auto-generate education HTML from datasets"
          git push
```

**파이프라인 단계별 실패 처리:**

| 단계 | 실패 시 대응 |
|------|-------------|
| JSON Schema 검증 | 파이프라인 중단, 필수 필드 누락 알림 |
| HTML 생성 | 파이프라인 중단, 템플릿 오류 로그 출력 |
| HTML 품질 검증 | ERROR이면 중단, WARNING이면 경고만 표시 |
| edu-meta 업데이트 | 경고 표시, 수동 확인 요청 |

**로컬 개발 시 워크플로우:**

```bash
# 1. 데이터셋 JSON 작성/수정
code src/data/edu-datasets/T1003.001.json

# 2. 검증 (빠른 피드백)
node scripts/validate-edu-dataset.js src/data/edu-datasets/T1003.001.json

# 3. HTML 생성 (초급만 먼저 확인)
node scripts/generate-edu-html.js --input src/data/edu-datasets/T1003.001.json --level beginner

# 4. 로컬 미리보기 (Vite dev server)
npm run dev
# 브라우저에서 http://localhost:5173/edu/t1003-001-lsass-memory.html 확인

# 5. 전체 레벨 생성 및 검증
node scripts/generate-edu-html.js --input src/data/edu-datasets/T1003.001.json --force
node scripts/validate-edu-html.js public/edu/t1003-001-lsass-memory*.html

# 6. edu-meta.json 업데이트
node scripts/update-edu-meta.cjs
```

---

## 부록: 빠른 참조

### 데이터셋 작성 최소 요구사항 체크표

```
[ ] techniqueId, techniqueName, techniqueNameKo 정확히 입력
[ ] tacticIds 배열에 해당 전술 ID 포함
[ ] beginner 레벨: 최소 2개 챕터, 1개 미니랩, 3개 퀴즈 문제
[ ] beginner 레벨: 반드시 analogy 패널 1개 이상 포함
[ ] intermediate 레벨: pocCode 포함 (주석 달린 실제 코드)
[ ] advanced 레벨: pocCode 포함 (전체 구현 + buildCommands)
[ ] metadata.ctiSources: 최소 1개 CTI 소스 명시
[ ] metadata.aptGroups: 최소 2개 APT 그룹 명시
[ ] 모든 POC 코드에 "교육 목적 전용" 경고 포함
[ ] 원자성 보장 체크리스트 전항 통과
```

### 파일 경로 요약

| 용도 | 경로 |
|------|------|
| 원자성 데이터셋 JSON | `src/data/edu-datasets/{TechniqueId}.json` |
| 시뮬레이션 시나리오 JSON | `src/data/lab-scenarios/{TechniqueId}.json` |
| 교육 HTML (초급) | `public/edu/{kebab-id}.html` |
| 교육 HTML (중급) | `public/edu/{kebab-id}-intermediate.html` |
| 교육 HTML (고급) | `public/edu/{kebab-id}-advanced.html` |
| 교육 메타데이터 | `src/data/edu-meta.json` |
| 매트릭스 데이터 | `src/data/matrix-fallback.json` |
| HTML 생성 스크립트 | `scripts/generate-edu-html.js` |
| HTML 검증 스크립트 | `scripts/validate-edu-html.js` |
| 메타 업데이트 스크립트 | `scripts/update-edu-meta.cjs` |
| 기존 배치 생성 스크립트 | `scripts/generate-edu-batch.cjs` |

---

*이 가이드는 GOTROOT 사이버보안 교육 플랫폼의 콘텐츠 표준을 정의합니다. 질문이나 개선 제안은 GOTROOT 개발팀에 문의하십시오.*
