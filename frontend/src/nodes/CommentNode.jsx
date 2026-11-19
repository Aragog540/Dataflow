import { Handle, Position } from '@xyflow/react';
import usePipelineStore from '../store';

export default function CommentNode({ id, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  const deleteNode = usePipelineStore((s) => s.deleteNode);

  return (
    <div
      style={{
        background: '#fef08a',
        border: '1px solid #ca8a04',
        borderRadius: 8,
        minWidth: 160,
        maxWidth: 240,
        padding: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        color: '#713f12',
        fontSize: 12,
        fontFamily: 'sans-serif',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#ca8a04' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 11 }}>💬 Note / Annotation</span>
        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#854d0e',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          ✕
        </button>
      </div>
      <textarea
        rows={3}
        placeholder="Add pipeline documentation notes here..."
        value={data.text ?? ''}
        onChange={(e) => update(id, { text: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          color: '#422006',
          fontSize: 11,
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      <Handle type="source" position={Position.Bottom} style={{ background: '#ca8a04' }} />
    </div>
  );
}
