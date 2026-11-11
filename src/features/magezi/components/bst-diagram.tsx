const NODES = [
  { key: 50, x: 110, y: 26, root: true },
  { key: 30, x: 60, y: 88 },
  { key: 70, x: 160, y: 88 },
  { key: 20, x: 26, y: 150 },
  { key: 40, x: 96, y: 150 },
] as const;

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
];

/**
 * The binary search tree for 50, 30, 70, 20, 40 (Magezi's answer to 2(a)).
 * The text alternative describes the same tree.
 */
export function BstDiagram() {
  return (
    <svg
      viewBox="0 0 190 176"
      role="img"
      aria-label="Binary search tree: 50 at the root, 30 to its left and 70 to its right; 20 and 40 under 30."
      className="h-auto w-full max-w-[220px]"
    >
      {EDGES.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--cobalt)"
          strokeWidth="2.5"
        />
      ))}
      {NODES.map((node) => (
        <g key={node.key}>
          <circle
            cx={node.x}
            cy={node.y}
            r="21"
            fill={'root' in node ? 'var(--sun)' : 'var(--surface)'}
            stroke={'root' in node ? 'var(--edge)' : 'var(--cobalt)'}
            strokeWidth="2.5"
          />
          <text
            x={node.x}
            y={node.y + 6}
            textAnchor="middle"
            fontSize="17"
            fontWeight="800"
            fill={'root' in node ? 'var(--on-sun)' : 'var(--link)'}
          >
            {node.key}
          </text>
        </g>
      ))}
    </svg>
  );
}
