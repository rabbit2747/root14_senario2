# Orion Echo — 관리자(창조자) 전용 메모

> 학습자 페이지에는 절대 노출하지 않는다. 인프라·운영·debugging 관점 정보 한곳에 모음.

---

## 1. 인프라 사이즈

- 세션당 컨테이너: **~20대**
- 동시 세션 권장: 최대 20 (UAE 여름학교 기준)
- 권장 production 사양:
  - 24 OCPU / 384 GB RAM / 4TB Block Volume
  - Ubuntu Server 24.04
  - OCI UAE 리전

## 2. 네트워크 존 (Docker network)

| Network | 목적 |
|---|---|
| `public_net` | 외부 진입점 |
| `dmz_net` | DMZ 서비스 |
| `corp_net` | 사내 |
| `dev_net` | 개발/CI |
| `release_net` | 서명·배포 |
| `customer_net` | ANRC 고객 환경 |
| `control_net` | 랩 컨트롤·flag·세션 |

세션 간 완전 격리. 학생 → corp/dev/release/customer 기본 deny.

## 3. 스테이지별 flag 식별자 (운영용)

| Stage | Flag ID |
|---|---|
| 0 | `flag_0_recon_context` |
| 1 | `flag_1_initial_access` |
| 2 | `flag_2_foothold_execution` |
| 3 | `flag_3_persistence_c2` |
| 4 | `flag_4_internal_discovery` |
| 5 | `flag_5_credential_material` |
| 6 | `flag_6_devops_lateral_movement` |
| 7 | `flag_7_supply_chain_stage` |
| 8 | `flag_8_customer_reach` |
| 9 | `flag_9_customer_discovery` |
| 10 | `flag_10_final_objective` |

flag-service에서 `session_id + stage_id` deterministic 발급.

## 4. 안전 규칙 (운영자 책임)

- 실제 malware/destructive payload 절대 금지
- 외부 C2 인프라 사용 금지
- Docker host escape · docker.sock abuse · privileged container abuse 금지
- Persistence·backdoor·C2는 control_net 안 lab-controlled emulator로만
- 컨테이너 → 인터넷 egress 기본 비활성
- 학생 세션 간 완전 격리

## 5. MITRE ATT&CK 매핑 (스테이지별)

| Stage | MITRE | 학습자 노출 |
|---|---|---|
| 0 External Recon | T1591, T1592.002 | 학습 단계에서 노출 |
| 1 Initial Access | T1190 | 학습 단계에서 노출 |
| 2 Execution | T1059.004, T1082, T1083 | 학습 단계에서 노출 |
| 3 Persistence/C2 | T1071 | 학습 단계에서 노출 |
| 4 Internal Discovery | T1046, T1213 | 학습 단계에서 노출 |
| 5 Credential | T1552, T1213.003 | 학습 단계에서 노출 |
| 6 Lateral DevOps | T1550.001 | 학습 단계에서 노출 |
| 7 Supply Chain | T1195.002, T1072 | 학습 단계에서 노출 |
| 8 Trusted Update | T1199, T1550.001 | 학습 단계에서 노출 |
| 9 Customer Discovery | T1046, T1083 | 학습 단계에서 노출 |
| 10 Final Collection | T1530 | 학습 단계에서 노출 |

체험(시네마틱) 페이지에서는 MITRE 코드 노출 X.
학습 정리(Lesson) 페이지에서 비로소 코드와 함께 개념화.

## 6. 페이지 노출 정책

| 항목 | 학습자 페이지 | 관리자 .md |
|---|---|---|
| 스토리·narrative | ✅ | — |
| 스테이지 이름·목적 | ✅ | — |
| 시나리오 배경·고객 | ✅ | — |
| 컨테이너 수 | ❌ | ✅ |
| 네트워크 존 이름 | ❌ | ✅ |
| flag 식별자 | ❌ | ✅ |
| 운영 안전 규칙 | ❌ | ✅ |
| MITRE 코드 | △ 학습 단계만 | ✅ |
| Docker 사양 | ❌ | ✅ |

## 7. 디자인·페이지 흐름 가이드

→ `PAGE_PERSONALITY_GUIDE.md` 참조 (5대 차별화 원칙 + 8 페이지 적용)

## 8. 원본 spec 문서

→ `ai_instruction_enterprise_apt_range.md`, `data_schema.md`, `mitre_mapping_implementation_plan.md` 등 동일 폴더 내 7개 md 보관
