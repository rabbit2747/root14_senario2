# Voxel Assets — CC0 복셀 모델 드롭존

## 동작 원리
시나리오 JSON의 `clip.glb` 경로에 `.glb` 파일이 있으면 자동 로드.
없으면 절차적 복셀 씬(`clip.scene` 프리셋)이 fallback으로 렌더됨.

```json
{
  "id": "intro",
  "type": "voxel",
  "scene": "city-night-wide",          // procedural fallback
  "glb": "/voxels/c0024-intro-city.glb", // 이 파일이 있으면 우선 사용
  "cameraPreset": "slow-pan-up",
  "duration": 8
}
```

## 권장 CC0 복셀 소스 (모두 무료·상업 사용 가능)

| 소스 | 설명 | 다운로드 |
|---|---|---|
| **Quaternius — Ultimate Voxel City Pack** | 빌딩·차량·가로수 통일 톤 | https://quaternius.com/packs/ultimatevoxelcity.html |
| **Kenney.nl — Voxel Pack** | 100+ 일반 모델 (의자·책상·서버랙) | https://kenney.nl/assets/voxel-pack |
| **Poly Pizza** | CC0 복셀 검색 | https://poly.pizza/search/voxel |
| **Sketchfab — Filter: Downloadable + CC0** | 다양 | https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&q=voxel |
| **OpenGameArt** | 인디 게임 자산 | https://opengameart.org/art-search-advanced?keys=voxel&field_art_type_tid%5B%5D=10 |

## MagicaVoxel에서 GLB 내보내기

1. MagicaVoxel에서 디자인 (.vox 저장)
2. 메뉴: `Export → GLTF` (또는 .obj 후 Blender에서 .glb 변환)
3. 결과 `.glb`를 이 폴더에 배치
4. 시나리오 JSON의 `clip.glb` 경로와 맞춰 파일명 지정

### MagicaVoxel 카메라·렌더 팁
- 야외 야경: View → Sky 비활성, Skylight 약하게, 빌딩 발광 강하게
- 카메라 각도: 1/4 각도 (45° 사선 위)
- 해상도: 256×256 ~ 1024×1024

## C0024 시나리오 — 권장 자산 목록

| 클립 ID | 추천 모델 | 카메라 |
|---|---|---|
| `intro` | 야경 도시 와이드샷 | slow-pan-up |
| `lobby` | 빈 사무실 복도 | dolly-forward |
| `admin-pc` | PC 책상 모니터 | static-wide |
| `firewall` | 서버랙 | orbit |
| `server-rack` | 서버랙×4 | tilt-up |

## 라이선스
이 폴더의 파일들은 각 출처의 라이선스를 따릅니다 (대부분 CC0).
사용 전 출처 확인 권장.
