# 09. LabCompletionPage - 랩 수료 화면

## Meta
| Key | Value |
|-----|-------|
| Route | `/lab/complete/:techniqueId` |
| File | `src/pages/lab/LabCompletionPage.jsx` |
| Auth Required | No (location.state로 데이터 수신) |
| Version | v0.5.0 (초기) |

## Purpose
랩 시뮬레이션 완료 후 성공 화면 표시.
훈련 요약 통계 + PDF 수료증 다운로드 + 재시도/돌아가기 버튼.

## Props (via location.state)
```javascript
const { state } = useLocation();
// state 구조:
{
  scenarioTitle: string,   // "악성코드 개발 시뮬레이션"
  userName: string,        // "홍길동"
  companyName: string,     // "Gotroot Security"
  totalSteps: number,      // 12
  duration: number,        // 480 (초)
}
```

## State Variables
```javascript
const { techniqueId } = useParams();
const [showCert, setShowCert] = useState(false);  // 수료증 모달
```

## Data Storage (on mount)
```javascript
// localStorage에 완료 기록 추가
useEffect(() => {
  const completed = JSON.parse(localStorage.getItem('gotroot_completed_labs') || '[]');
  const already = completed.some(c => c.technique === techniqueId);
  if (!already) {
    completed.push({
      name: state?.scenarioTitle || techniqueId,
      technique: techniqueId,
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem('gotroot_completed_labs', JSON.stringify(completed));
  }
}, []);
```

## Rendering Structure
```
<div class="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-[#1a1f2e]">
  <!-- 성공 아이콘 + 축하 메시지 -->
  <div>
    🎉 훈련 완료!
    "{scenarioTitle}" 시뮬레이션을 성공적으로 마쳤습니다.
  </div>

  <!-- 통계 카드 -->
  <div class="stats-grid">
    [총 단계: {totalSteps}]
    [소요 시간: {duration}분]
    [완료자: {userName}]
    [소속: {companyName}]
  </div>

  <!-- 수료증 버튼 -->
  <button onClick={() => setShowCert(true)}>
    📜 수료증 보기
  </button>

  <!-- 네비게이션 -->
  <div class="buttons">
    [🔄 다시 훈련하기] → navigate(`/lab/desktop/${techniqueId}`)
    [📚 과정으로 돌아가기] → navigate(`/edu/${techniqueId}`)
    [🏠 매트릭스로] → navigate('/')
  </div>

  <!-- 수료증 모달 -->
  {showCert && (
    <CertificateModal>
      <GotrootSeal />  <!-- SVG 직인 -->
      <p>수료자: {userName}</p>
      <p>과정: {scenarioTitle}</p>
      <p>날짜: {completedAt}</p>
      <button>PDF 다운로드</button>
    </CertificateModal>
  )}
</div>
```

## Certificate Design
- GotrootSeal SVG (직인 스타일)
- Calligraphy-style 텍스트
- 다크 배경 + 골드 액센트
- PDF 생성: 브라우저 window.print() 또는 html2canvas
