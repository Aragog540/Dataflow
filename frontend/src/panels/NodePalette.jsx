/**
 * NodePalette.jsx – left-hand sidebar listing draggable node types.
 * Drag a card onto the canvas to create a node.
 */
const PALETTE_GROUPS = [
  {
    label: '📥 Input / Output',
    nodes: [
      { type: 'load',        emoji: '📥', label: 'Load File' },
      { type: 'sqlDatabase', emoji: '🗄️', label: 'SQL Database' },
      { type: 'apiSource',   emoji: '🌐', label: 'REST API Source' },
      { type: 'preview',     emoji: '👁️', label: 'Preview' },
      { type: 'export',      emoji: '💾', label: 'Export' },
    ],
  },
  {
    label: '🧹 Data Cleaning',
    nodes: [
      { type: 'dropNulls',       emoji: '🧹', label: 'Drop Nulls' },
      { type: 'deduplicate',     emoji: '🔁', label: 'Deduplicate' },
      { type: 'fillMissing',     emoji: '✏️', label: 'Fill Missing' },
      { type: 'trimStrings',     emoji: '✂️', label: 'Trim Strings' },
      { type: 'schemaValidator', emoji: '🛡️', label: 'Schema Validator' },
    ],
  },
  {
    label: '🔄 Transformation',
    nodes: [
      { type: 'selectColumns',  emoji: '🎯', label: 'Select Columns' },
      { type: 'filterColumns',  emoji: '🔽', label: 'Filter Columns' },
      { type: 'typeCast',       emoji: '🔄', label: 'Type Cast' },
      { type: 'scaleNormalize', emoji: '⚖️', label: 'Scale & Normalize' },
      { type: 'rename',         emoji: '🏷️', label: 'Rename Column' },
      { type: 'addColumn',      emoji: '➕', label: 'Add Column' },
      { type: 'calcField',      emoji: '🧮', label: 'Calc Field' },
      { type: 'stringOps',      emoji: '🔤', label: 'String Ops' },
    ],
  },
  {
    label: '🔀 Reshape & Combine',
    nodes: [
      { type: 'join',   emoji: '🔗', label: 'Join' },
      { type: 'merge',  emoji: '🔀', label: 'Merge' },
      { type: 'concat', emoji: '🧱', label: 'Concat' },
      { type: 'pivot',  emoji: '🔲', label: 'Pivot Table' },
      { type: 'melt',   emoji: '↕️', label: 'Melt (Unpivot)' },
    ],
  },
  {
    label: '📊 Aggregation & Analytics',
    nodes: [
      { type: 'groupBy',       emoji: '📊', label: 'Group By' },
      { type: 'aggregate',     emoji: '∑',  label: 'Aggregate' },
      { type: 'rollingWindow', emoji: '🌊', label: 'Rolling Window' },
      { type: 'sort',          emoji: '📶', label: 'Sort' },
      { type: 'slice',         emoji: '🔪', label: 'Slice' },
      { type: 'sample',        emoji: '🎲', label: 'Sample' },
      { type: 'describe',      emoji: '📋', label: 'Describe' },
      { type: 'profiler',      emoji: '📈', label: 'Profiler' },
    ],
  },
  {
    label: '📉 Visuals & Notes',
    nodes: [
      { type: 'chart',   emoji: '📉', label: 'Chart' },
      { type: 'comment', emoji: '💬', label: 'Comment' },
    ],
  },
];

const TYPE_COLORS = {
  load: '#3b82f6', sqlDatabase: '#2563eb', apiSource: '#0284c7', preview: '#64748b', export: '#22c55e',
  dropNulls: '#ef4444', dedupe: '#f97316', deduplicate: '#f97316', fillMissing: '#eab308',
  trimStrings: '#10b981', schemaValidator: '#dc2626',
  typeCast: '#84cc16', scaleNormalize: '#06b6d4', filterColumns: '#8b5cf6', selectColumns: '#a855f7',
  rename: '#06b6d4', calcField: '#10b981', addColumn: '#14b8a6', stringOps: '#6366f1',
  pivot: '#ec4899', melt: '#f43f5e', rollingWindow: '#d946ef', groupBy: '#f59e0b',
  aggregate: '#ea580c', sort: '#38bdf8', slice: '#e11d48', sample: '#fb923c', describe: '#a78bfa',
  profiler: '#6366f1', merge: '#ec4899', join: '#ec4899', concat: '#059669',
  chart: '#14b8a6', comment: '#eab308',
};

export default function NodePalette() {
  const onDragStart = (e, nodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={paletteStyle}>
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #1e293b' }}>
        <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
          NODE PALETTE
        </span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 8px' }}>
        {PALETTE_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 14 }}>
            <div style={groupLabelStyle}>{group.label}</div>
            {group.nodes.map(({ type, emoji, label }) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                style={{
                  ...nodeCardStyle,
                  borderLeft: `3px solid ${TYPE_COLORS[type] || '#3b82f6'}`,
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
  width: 190,
  minWidth: 190,
  background: '#0a0f1d',
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
  padding: '4px 4px 3px',
  textTransform: 'uppercase',
};

const nodeCardStyle = {
  background: '#161f30',
  borderRadius: 6,
  color: '#cbd5e1',
  cursor: 'grab',
  fontSize: 11,
  fontWeight: 500,
  marginBottom: 4,
  padding: '6px 8px',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  transition: 'background 0.15s',
};
