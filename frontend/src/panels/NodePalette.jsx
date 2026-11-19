/**
 * NodePalette.jsx – left-hand sidebar listing draggable node types.
 * Drag a card onto the canvas to create a node.
 */
const PALETTE_GROUPS = [
  {
    label: '📥 Input / Output',
    nodes: [
      { type: 'load',    emoji: '📥', label: 'Load' },
      { type: 'preview', emoji: '👁️',  label: 'Preview' },
      { type: 'export',  emoji: '💾', label: 'Export' },
    ],
  },
  {
    label: '🧹 Cleaning',
    nodes: [
      { type: 'dropNulls',   emoji: '🧹', label: 'Drop Nulls' },
      { type: 'dedupe',      emoji: '🔁', label: 'Dedupe' },
      { type: 'fillMissing', emoji: '✏️',  label: 'Fill Missing' },
    ],
  },
  {
    label: '🔄 Transform',
    nodes: [
      { type: 'filterColumns', emoji: '🔽', label: 'Filter Cols' },
      { type: 'rename',        emoji: '🏷️',  label: 'Rename' },
      { type: 'calcField',     emoji: '🧮', label: 'Calc Field' },
    ],
  },
  {
    label: '🔀 Combine',
    nodes: [
      { type: 'merge',   emoji: '🔀', label: 'Merge' },
      { type: 'groupBy', emoji: '📊', label: 'Group By' },
    ],
  },
  {
    label: '📈 Analyze',
    nodes: [
      { type: 'profiler', emoji: '📈', label: 'Profiler' },
      { type: 'chart',    emoji: '📉', label: 'Chart' },
    ],
  },
];

const TYPE_COLORS = {
  load: '#3b82f6', dropNulls: '#ef4444', dedupe: '#f97316',
  fillMissing: '#eab308', filterColumns: '#8b5cf6', rename: '#06b6d4',
  calcField: '#10b981', merge: '#ec4899', groupBy: '#f59e0b',
  profiler: '#6366f1', chart: '#14b8a6', preview: '#64748b', export: '#22c55e',
};

export default function NodePalette() {
  const onDragStart = (e, nodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={paletteStyle}>
      <div style={{ padding: '12px 10px 6px', borderBottom: '1px solid #1e293b' }}>
        <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
          NODE PALETTE
        </span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 6px' }}>
        {PALETTE_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 12 }}>
            <div style={groupLabelStyle}>{group.label}</div>
            {group.nodes.map(({ type, emoji, label }) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                style={{
                  ...nodeCardStyle,
                  borderLeft: `3px solid ${TYPE_COLORS[type]}`,
                }}
              >
                <span style={{ marginRight: 6 }}>{emoji}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

const paletteStyle = {
  width: 170,
  minWidth: 170,
  background: '#0f172a',
  borderRight: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const groupLabelStyle = {
  color: '#475569',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  padding: '4px 4px 2px',
  textTransform: 'uppercase',
};

const nodeCardStyle = {
  background: '#1e293b',
  borderRadius: 6,
  color: '#cbd5e1',
  cursor: 'grab',
  fontSize: 12,
  marginBottom: 4,
  padding: '6px 8px',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  transition: 'background 0.15s',
};
