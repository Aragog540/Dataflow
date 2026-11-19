/**
 * BaseNode.jsx – shared shell for every node type.
 * Renders a coloured header, the node label, source/target handles,
 * and a delete button.
 */
import { Handle, Position } from '@xyflow/react';
import usePipelineStore from '../store';

const TYPE_META = {
  load:          { color: '#3b82f6', emoji: '📥', label: 'Load' },
  dropNulls:     { color: '#ef4444', emoji: '🧹', label: 'Drop Nulls' },
  dedupe:        { color: '#f97316', emoji: '🔁', label: 'Dedupe' },
  fillMissing:   { color: '#eab308', emoji: '✏️',  label: 'Fill Missing' },
  filterColumns: { color: '#8b5cf6', emoji: '🔽', label: 'Filter Cols' },
  rename:        { color: '#06b6d4', emoji: '🏷️',  label: 'Rename' },
  calcField:     { color: '#10b981', emoji: '🧮', label: 'Calc Field' },
  merge:         { color: '#ec4899', emoji: '🔀', label: 'Merge' },
  groupBy:       { color: '#f59e0b', emoji: '📊', label: 'Group By' },
  profiler:      { color: '#6366f1', emoji: '📈', label: 'Profiler' },
  chart:         { color: '#14b8a6', emoji: '📉', label: 'Chart' },
  preview:       { color: '#64748b', emoji: '👁️',  label: 'Preview' },
  export:        { color: '#22c55e', emoji: '💾', label: 'Export' },
};

export default function BaseNode({ id, type, data, children, noTarget = false, noSource = false }) {
  const deleteNode = usePipelineStore((s) => s.deleteNode);
  const setSelectedNodeId = usePipelineStore((s) => s.setSelectedNodeId);
  const meta = TYPE_META[type] ?? { color: '#94a3b8', emoji: '⬡', label: type };

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        background: '#1e293b',
        border: `2px solid ${meta.color}`,
        borderRadius: 10,
        minWidth: 160,
        fontFamily: 'sans-serif',
        fontSize: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        cursor: 'pointer',
      }}
    >
      {!noTarget && (
        <Handle type="target" position={Position.Top} style={{ background: meta.color }} />
      )}

      {/* Header */}
      <div
        style={{
          background: meta.color,
          borderRadius: '8px 8px 0 0',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
        }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>
          {meta.emoji} {meta.label}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          style={{
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 10,
            padding: '1px 5px',
            lineHeight: 1.4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 10px', color: '#cbd5e1' }}>
        {data.label && (
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>
            {data.label !== type ? data.label : ''}
          </div>
        )}
        {children}
      </div>

      {!noSource && (
        <Handle type="source" position={Position.Bottom} style={{ background: meta.color }} />
      )}
    </div>
  );
}
