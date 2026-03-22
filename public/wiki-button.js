/**
 * 갓루트 위키 플로팅 버튼 (edu HTML 전용)
 * public/edu/*.html 파일 하단에 <script src="/wiki-button.js"></script> 로 주입
 *
 * 동작:
 *   1. 우하단에 📖 플로팅 버튼 생성
 *   2. 클릭 시 /wiki-popup.html 팝업 창 오픈
 *   3. data-technique-id 를 URL 파라미터로 전달 (현재 기법 필터링)
 */
(function () {
  // 버튼 중복 방지
  if (document.getElementById('gotroot-wiki-btn')) return;

  const techniqueId = document.body.dataset.techniqueId || '';
  const level = document.body.dataset.level || '';

  // 플로팅 버튼 생성
  const btn = document.createElement('button');
  btn.id = 'gotroot-wiki-btn';
  btn.title = '갓루트 위키 열기';
  btn.innerHTML = '📖';

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: '9000',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
    border: '2px solid rgba(96,165,250,0.4)',
    boxShadow: '0 4px 20px rgba(29,78,216,0.5)',
    cursor: 'pointer',
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    color: 'white',
    lineHeight: '1',
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 6px 28px rgba(29,78,216,0.7)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 20px rgba(29,78,216,0.5)';
  });

  btn.addEventListener('click', () => {
    const params = new URLSearchParams();
    if (techniqueId) params.set('techniqueId', techniqueId);
    if (level) params.set('level', level);
    const query = params.toString() ? '?' + params.toString() : '';
    window.open(
      '/wiki-popup.html' + query,
      'gotroot-wiki',
      'width=620,height=720,resizable=yes,scrollbars=yes'
    );
  });

  document.body.appendChild(btn);
})();
