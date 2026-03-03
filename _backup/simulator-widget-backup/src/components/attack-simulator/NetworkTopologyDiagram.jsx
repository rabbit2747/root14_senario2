import { memo, useMemo } from 'react';

/**
 * NetworkTopologyDiagram — SVG 네트워크 토폴로지 렌더링
 * GenericLabSimulator.jsx 패턴 기반 (glow filter + minPhase 활성화)
 *
 * @param {{ topology: Object, currentPhase: number, activeNodes: string[] }} props
 */
function NetworkTopologyDiagram({ topology, currentPhase, activeNodes = [] }) {
  if (!topology?.nodes?.length) return null;

  const { viewBox = '0 0 620 220', nodes, edges = [] } = topology;

  // 활성 노드 집합 (현재 페이즈 + edge 기반 누적 활성화)
  const activeSet = useMemo(() => {
    const set = new Set(activeNodes);
    edges.forEach(e => {
      if (currentPhase >= (e.minPhase || 1)) {
        set.add(e.from);
        set.add(e.to);
      }
    });
    return set;
  }, [activeNodes, edges, currentPhase]);

  // 현재 페이즈에서 "방금 활성화된" 노드 (강조 펄스용)
  const highlightSet = useMemo(() => new Set(activeNodes), [activeNodes]);

  return (
    <div className="w-full overflow-hidden rounded-xl bg-slate-900/80 border border-slate-700/50 p-2 sm:p-3">
      <svg
        viewBox={viewBox}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        style={{ minHeight: '120px', maxHeight: '240px' }}
      >
        <defs>
          {/* 빨간 글로우 — 활성 엣지/노드 */}
          <filter id="sim-glow-red">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 파란 글로우 — 현재 하이라이트 */}
          <filter id="sim-glow-blue">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 회색 글로우 — 비활성 */}
          <filter id="sim-glow-gray">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 그리드 배경 패턴 */}
          <pattern id="sim-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>

        {/* 그리드 배경 */}
        <rect width="100%" height="100%" fill="url(#sim-grid)" />

        {/* ── 엣지 렌더링 ── */}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const isActive = currentPhase >= (edge.minPhase || 1);

          return (
            <g key={`edge-${idx}`}>
              {/* 연결선 */}
              <line
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={isActive ? '#ef4444' : '#475569'}
                strokeWidth={isActive ? 2.5 : 1.2}
                strokeDasharray={isActive ? 'none' : '6 4'}
                filter={isActive ? 'url(#sim-glow-red)' : 'none'}
                opacity={isActive ? 1 : 0.4}
              >
                {isActive && (
                  <animate
                    attributeName="stroke-opacity"
                    values="1;0.4;1"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
              {/* 이동하는 도트 */}
              {isActive && (
                <circle r="3" fill="#ef4444" opacity="0.9">
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* ── 노드 렌더링 ── */}
        {nodes.map((node) => {
          const isActive = activeSet.has(node.id);
          const isHighlight = highlightSet.has(node.id);

          // 활성 색상 결정: 현재 하이라이트 = 파란색, 이전 활성화 = 빨간색
          const strokeColor = isHighlight ? '#3b82f6' : isActive ? '#ef4444' : '#475569';
          const fillColor = isHighlight ? '#1e1b4b' : isActive ? '#1e1b2e' : '#1e293b';
          const glowFilter = isHighlight
            ? 'url(#sim-glow-blue)'
            : isActive
              ? 'url(#sim-glow-red)'
              : 'url(#sim-glow-gray)';
          const labelColor = isHighlight ? '#93c5fd' : isActive ? '#fca5a5' : '#94a3b8';

          return (
            <g key={`node-${node.id}`}>
              {/* 노드 원 */}
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isHighlight ? 2.5 : isActive ? 2 : 1}
                filter={glowFilter}
              >
                {isHighlight && (
                  <animate
                    attributeName="stroke-width"
                    values="2.5;4;2.5"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* 노드 아이콘 (이모지) */}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="14"
                style={{ pointerEvents: 'none' }}
              >
                {node.icon || '●'}
              </text>

              {/* 노드 라벨 */}
              <text
                x={node.x}
                y={node.y + 36}
                textAnchor="middle"
                fill={labelColor}
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                style={{ pointerEvents: 'none' }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default memo(NetworkTopologyDiagram);
