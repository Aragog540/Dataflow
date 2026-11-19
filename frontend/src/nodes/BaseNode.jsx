/**
 * BaseNode.jsx – shared shell for every node type.
 * Renders a coloured header, the node label, source/target handles,
 * and a delete button.
 */
import { Handle, Position } from '@xyflow/react';
import usePipelineStore from '../store';

const TYPE_META = {
  load:            { color: '#3b82f6', emoji: '📥', label: 'Load' },
  sqlDatabase:     { color: '#2563eb', emoji: '🗄️', label: 'SQL DB' },
  apiSource:       { color: '#0284c7', emoji: '🌐', label: 'REST API' },
  dropNulls:       { color: '#ef4444', emoji: '🧹', label: 'Drop Nulls' },
  dedupe:          { color: '#f97316', emoji: '🔁', label: 'Dedupe' },
  deduplicate:     { color: '#f97316', emoji: '🔁', label: 'Deduplicate' },
  fillMissing:     { color: '#eab308', emoji: '✏️', label: 'Fill Missing' },
  typeCast:        { color: '#84cc16', emoji: '🔄', label: 'Type Cast' },
  trimStrings:     { color: '#10b981', emoji: '✂️', label: 'Trim Strings' },
  scaleNormalize:  { color: '#06b6d4', emoji: '⚖️', label: 'Scale & Norm' },
  filterColumns:   { color: '#8b5cf6', emoji: '🔽', label: 'Filter Cols' },
  selectColumns:   { color: '#a855f7', emoji: '🎯', label: 'Select Cols' },
  rename:          { color: '#06b6d4', emoji: '🏷️', label: 'Rename' },
  calcField:       { color: '#10b981', emoji: '🧮', label: 'Calc Field' },
  addColumn:       { color: '#14b8a6', emoji: '➕', label: 'Add Column' },
  stringOps:       { color: '#6366f1', emoji: '🔤', label: 'String Ops' },
  pivot:           { color: '#ec4899', emoji: '🔲', label: 'Pivot Table' },
  melt:            { color: '#f43f5e', emoji: '↕️', label: 'Melt (Unpivot)' },
  rollingWindow:   { color: '#d946ef', emoji: '🌊', label: 'Rolling Window' },
  groupBy:         { color: '#f59e0b', emoji: '📊', label: 'Group By' },
  aggregate:       { color: '#ea580c', emoji: '∑',  label: 'Aggregate' },
  sort:            { color: '#38bdf8', emoji: '📶', label: 'Sort' },
  slice:           { color: '#e11d48', emoji: '🔪', label: 'Slice' },
  sample:          { color: '#fb923c', emoji: '🎲', label: 'Sample' },
  describe:        { color: '#a78bfa', emoji: '📋', label: 'Describe' },
  profiler:        { color: '#6366f1', emoji: '📈', label: 'Profiler' },
  merge:           { color: '#ec4899', emoji: '🔀', label: 'Merge' },
  join:            { color: '#ec4899', emoji: '🔗', label: 'Join' },
  concat:          { color: '#059669', emoji: '🧱', label: 'Concat' },
  schemaValidator: { color: '#dc2626', emoji: '🛡️', label: 'Schema Validator' },
  comment:         { color: '#eab308', emoji: '💬', label: 'Comment' },
  chart:           { color: '#14b8a6', emoji: '📉', label: 'Chart' },
  preview:         { color: '#64748b', emoji: '👁️', label: 'Preview' },
  export:          { color: '#22c55e', emoji: '💾', label: 'Export' },
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
        {data.label && data.label !== type && (
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>
            {data.label}
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
