import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function FillMissingNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Strategy</label>
        <select
          value={data.strategy ?? 'value'}
          onChange={(e) => update(id, { strategy: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          {['value','mean','median','mode','ffill','bfill'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(data.strategy === 'value' || !data.strategy) && (
          <>
            <label style={labelStyle}>Fill value</label>
            <input
              placeholder="0"
              value={data.value ?? ''}
              onChange={(e) => update(id, { value: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={inputStyle}
            />
          </>
        )}
        <label style={labelStyle}>Columns (blank = all)</label>
        <input
          placeholder="col1, col2 …"
          value={data.columns?.join(', ') ?? ''}
          onChange={(e) =>
            update(id, { columns: e.target.value ? e.target.value.split(',').map((c) => c.trim()) : [] })
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
