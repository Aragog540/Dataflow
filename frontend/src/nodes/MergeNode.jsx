import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function MergeNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Join key</label>
        <input
          placeholder="column name"
          value={data.on ?? ''}
          onChange={(e) => update(id, { on: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>How</label>
        <select
          value={data.how ?? 'inner'}
          onChange={(e) => update(id, { how: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          {['inner','left','right','outer'].map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <span style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>⚠ Needs 2 input edges</span>
      </div>
    </BaseNode>
  );
}
const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
