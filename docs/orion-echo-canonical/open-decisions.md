# Orion Echo Open Decisions

이 파일은 정본을 만들면서 아직 결정이 필요한 불일치 항목을 기록한다. 코드와 문서를 수정할 때 이 항목을 먼저 해결해야 한다.

## 1. Safe C2 Emulator 유지 여부

현재 상태:

- `senario/09_platform/v2`는 C2를 main chain에서 제거하는 방향이다.
- `hands-on lab/orion-echo-hands-on-lab`의 현재 lab guide와 manifest는 `Safe C2 Emulator` 단계를 사용한다.
- 일부 practical 데이터도 `c2-emulator`를 포함한다.

정본 판단:

- 교육 목표상 C2는 핵심이 아니다.
- Orion Echo의 핵심은 supply chain, CI/CD, signing, update trust다.
- 따라서 C2는 최종 커리큘럼에서는 제거하거나, “구버전 호환/운영자 워크플로우 예시” 정도로만 남긴다.

권장 조치:

- Concept Class에서는 C2를 핵심 개념으로 가르치지 않는다.
- Lab이 아직 C2를 요구하면, 해당 단계는 “lab transport emulator”로 표현하고 실제 공격 핵심으로 강조하지 않는다.
- 장기적으로 lab도 direct internal service discovery 방식으로 바꾼다.

## 2. Flag와 Evidence 표현

현재 상태:

- 정본 설계는 evidence 기반 학습을 지향한다.
- Lab manifest와 일부 endpoint는 `flagId`, `final_flag`를 사용한다.

정본 판단:

- flag는 플랫폼 진행 체크용으로만 허용한다.
- 학생에게 보여주는 설명, Concept Class, Lab Guide, Report에서는 evidence/checkpoint로 표현한다.

권장 조치:

- UI 문구에서 `flag`를 `evidence marker`, `checkpoint`, `proof`로 바꾼다.
- 내부 manifest에는 진행 확인을 위해 `flagId`를 유지할 수 있다.

## 3. Dark Web Exfiltration 단계

현재 상태:

- Practical 3D MVP에는 `Customer Data Exfiltration To Dark Web` 단계가 있다.
- 이전 lab guide의 흐름은 customer export/object access와 defender report에서 끝났지만, 정본 결말은 이 구조가 아니다.

정본 판단:

- Dark Web Exfiltration이 정본 최종 단계다.
- Defender Report는 정본 시나리오 결말에서 제외한다.
- 보고서 작성은 필요하면 선택적 사후 과제나 instructor activity로만 둔다.

권장 조치:

- Concept Class, Practical Case Review, Practical 3D, Lab Guide 모두 마지막 흐름을 `Customer Data Exfiltration To Dark Web`로 맞춘다.
- Lab에는 dropped export file, supervisor verdict, dark-web drop record, exposed customer dataset을 확인하는 endpoint나 evidence file을 추가한다.
- 기존 defender report 단계는 `optional-after-action`으로 분리한다.

## 4. Lab Port

현재 상태:

- `src/pages/apt/orion-echo/data/orion-echo-curriculum.js`는 lab URL을 `http://localhost:8081`로 안내한다.
- `hands-on lab/orion-echo-hands-on-lab`의 README, student guide, walkthrough, platform manifest도 `http://localhost:8081` 기준으로 맞췄다.

정본 판단:

- 로컬에서 충돌 없이 띄우는 포트를 기준으로 하나로 통일해야 한다.

권장 조치:

- 현재 개발 환경에서는 8081을 표준으로 유지한다.
- 이후 실제 배포나 공유 환경에서 포트를 바꾸면 web curriculum, lab docs, walkthrough, manifest를 한 번에 갱신한다.

## 5. Concept Class와 Lab Command 연결

현재 상태:

- Concept Class는 개념 설명과 도식 중심으로 개선되었지만, 실제 lab 명령어와 expected output까지 완전히 연결되어 있지는 않다.

정본 판단:

- 학생이 혼자 실습을 진행하려면 Concept Class 마지막에 “실습 명령어 예습” 섹션이 필요하다.
- 각 명령어는 해당 개념, 인프라 zone, expected evidence와 연결되어야 한다.

권장 조치:

- `hands-on lab/orion-echo-hands-on-lab/docs/02-student-lab-guide-ko.md`의 실제 명령어를 기준으로 Concept Class walkthrough를 다시 작성한다.
- 각 command block에 `왜 이 명령어를 치는가`, `무엇을 봐야 하는가`, `다음 단계로 넘어가는 판단 기준`을 붙인다.
