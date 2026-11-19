import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function FilterColumnsNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Mode</label>
        <select
          value={data.mode ?? 'keep'}
          onChange={(e) => update(id, { mode: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="keep">Keep</option>
          <option value="drop">Drop</option>
        </select>
        <label style={labelStyle}>Columns</label>
        <input
          placeholder="col1, col2 …"
          value={data.columns?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { columns: e.target.value.split(',').map((c) => c.trim()).filter(Boolean) })
          }
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
      </div>
    </BaseNode>
  );
}
const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
