// DgaSandbox — 공격자 샌드박스 #1: SUNBURST DGA 도메인 생성기
//
// 학습 목표:
//   - DGA(Domain Generation Algorithm)가 어떻게 작동하는지 "직접 돌려 보며" 이해
//   - SUNBURST는 컴퓨터 이름을 base32 변형 해시로 바꿔 avsvmcloud.com 서브도메인을 만들었다
//   - 학생은 컴퓨터 이름을 넣고 생성 버튼을 눌러 공격자가 C2로 본 도메인과 비슷한 값을 얻는다
//
// 단순화:
//   - 실제 SUNBURST 알고리즘은 FNV-1a 기반 + 커스텀 base32 매핑이지만
//   - 교육용이라 "문자열 → 32글자 해시" → "대문자 알파벳·숫자 치환" 단순 버전으로 구현
//   - 핵심은 "왜 매번 다른 도메인처럼 보이게 만들었는가"를 체감시키는 것
//
// 공격자 관점 전용:
//   - "당신이 APT29라면" 프롬프트
//   - 탐지 관점은 이 샌드박스에 넣지 않음 (펜테스터 교육)

import { useState, useMemo } from 'react';

// 매우 단순화된 해시 (교육용, 실제 FNV-1a 아님)
function simpleHash(str, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

// 32자 base32 매핑 (교육용 고정 테이블)
const B32_ALPHABET = 'ph2eifo3n5utg1j8d94qrvbmk0sal76c';

function toBase32(num, length = 16) {
  let out = '';
  let n = num >>> 0;
  for (let i = 0; i < length; i++) {
    out = B32_ALPHABET[n & 0x1f] + out;
    n = Math.floor(n / 32);
    if (n === 0 && i < length - 1) {
      n = simpleHash(out, n ^ 0xdeadbeef);
    }
  }
  return out;
}

function generateDomain(computerName) {
  const clean = String(computerName || '').trim().replace(/[^a-zA-Z0-9\-.]/g, '');
  if (!clean) return null;
  const h1 = simpleHash(clean.toLowerCase());
  const h2 = simpleHash(clean.toUpperCase(), h1);
  const sub = toBase32(h1 ^ h2, 16);
  return `${sub}.appsync-api.us-east-1.avsvmcloud.com`;
}

const PRESETS = [
  { name: 'DC01.bank.com', role: '은행 도메인 컨트롤러' },
  { name: 'MAIL01.gov.local', role: '정부 메일 서버' },
  { name: 'WSUS.corp.internal', role: '패치 배포 서버' },
  { name: 'ORION.lab.test', role: '내부 테스트 랩 (샘플)' },
];

export default function DgaSandbox({ isDark }) {
  const [name, setName] = useState('');
  const [history, setHistory] = useState([]);

  const currentDomain = useMemo(() => generateDomain(name), [name]);

  const generate = () => {
    if (!currentDomain) return;
    setHistory(h => {
      if (h.find(x => x.input === name)) return h;
      return [{ input: name, domain: currentDomain, at: Date.now() }, ...h].slice(0, 6);
    });
  };

  const usePreset = (p) => {
    setName(p.name);
  };

  return (
    <div
      className={`rounded-lg my-5 p-5 border-2 ${
        isDark ? 'bg-[#0f0f13] border-red-900' : 'bg-[#fff5f5] border-red-200'
      }`}
    >
      <div className={`flex items-center gap-2 text-[11px] font-bold tracking-wider mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
        🎮 공격자 샌드박스 — DGA 도메인 생성기
      </div>
      <h4 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
        "당신이 APT29라면": 감염된 컴퓨터가 집(C2)에 편지를 보낸다
      </h4>
      <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-[#bbb]' : 'text-[#555]'}`}>
        SUNBURST는 감염된 컴퓨터의 이름을 해시로 변형해서, <b>컴퓨터마다 전혀 다른 주소로 보이는 도메인</b>을 만들었어요.
        방화벽은 <code>avsvmcloud.com</code>을 "AWS 비슷한 정상 서비스"로 착각했고, 그 덕분에 수천 개 기관이 조용히 통신했죠.
        아래 입력창에 회사 서버 이름을 넣고 <b>생성</b> 버튼을 눌러, 공격자가 본 도메인이 어떻게 생겼는지 직접 확인해 보세요.
      </p>

      {/* 프리셋 버튼 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`text-[10px] font-semibold self-center ${isDark ? 'text-[#888]' : 'text-[#888]'}`}>
          예시 타겟:
        </span>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => usePreset(p)}
            className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
              isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ddd]' : 'bg-white hover:bg-[#f5f5f5] text-[#333] border border-[#e5e5e5]'
            }`}
            title={p.role}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* 입력 + 생성 */}
      <div className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: DC01.victim.local"
          onKeyDown={(e) => e.key === 'Enter' && generate()}
          className={`flex-1 px-3 py-2 text-sm font-mono rounded border ${
            isDark
              ? 'bg-[#1a1a1a] border-[#3a3a3a] text-white placeholder-[#666]'
              : 'bg-white border-[#d5d5d5] text-[#1a1a1a] placeholder-[#aaa]'
          }`}
        />
        <button
          onClick={generate}
          disabled={!currentDomain}
          className={`text-sm font-bold px-4 py-2 rounded transition-colors ${
            currentDomain
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : isDark
              ? 'bg-[#333] text-[#666] cursor-not-allowed'
              : 'bg-[#e5e5e5] text-[#aaa] cursor-not-allowed'
          }`}
        >
          ▶ 생성
        </button>
      </div>

      {/* 현재 결과 (미리보기) */}
      {currentDomain && (
        <div
          className={`p-3 rounded mb-3 text-[12px] font-mono break-all ${
            isDark ? 'bg-[#2a0a0a] text-red-300 border border-red-900' : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          <div className={`text-[10px] font-sans font-bold mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
            → C2 콜백 대상:
          </div>
          {currentDomain}
        </div>
      )}

      {/* 히스토리 */}
      {history.length > 0 && (
        <div
          className={`rounded-lg p-3 ${
            isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e5e5e5]'
          }`}
        >
          <div className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-[#999]' : 'text-[#666]'}`}>
            생성 기록 ({history.length})
          </div>
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className={isDark ? 'text-[#888]' : 'text-[#888]'}>
                <th className="text-left pb-1 pr-2">원본 (컴퓨터명)</th>
                <th className="text-left pb-1">생성된 C2 도메인</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className={`border-t ${isDark ? 'border-[#2a2a2a]' : 'border-[#eee]'}`}>
                  <td className={`py-1.5 pr-2 ${isDark ? 'text-[#ddd]' : 'text-[#333]'}`}>
                    {h.input}
                  </td>
                  <td className={`py-1.5 break-all ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    {h.domain}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 인사이트 */}
      <div
        className={`mt-3 p-3 rounded text-xs leading-relaxed ${
          isDark ? 'bg-[#1a1a2a] text-[#ccc]' : 'bg-blue-50 text-[#333] border border-blue-100'
        }`}
      >
        <span className="font-bold">💡 공격자 인사이트: </span>
        컴퓨터 이름이 <b>딱 한 글자만</b> 달라도 도메인은 완전히 바뀝니다. 방어자가 IoC(침해지표)로 한 도메인을 차단해도,
        다른 감염 컴퓨터는 전혀 다른 주소로 통신하기 때문에 <b>블랙리스트 기반 차단이 무력화</b>됩니다.
        2020년 FireEye가 이 알고리즘을 역분석한 뒤에야 비로소 전체 피해 범위가 드러났죠.
      </div>

      <div
        className={`mt-2 p-2 rounded text-[11px] ${
          isDark ? 'bg-[#2a1a0a] text-amber-300' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}
      >
        ⚠️ 교육용 시뮬레이션입니다. 실제 SUNBURST는 <code>FNV-1a XOR</code> + 커스텀 base32 + 타임스탬프 블랙리스트를 썼으며, 이 샌드박스는 알고리즘의 <b>원리</b>만 단순화해 보여줍니다.
      </div>
    </div>
  );
}
