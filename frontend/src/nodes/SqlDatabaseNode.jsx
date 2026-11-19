import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function SqlDatabaseNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data} noTarget>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>SQL Query</label>
        <textarea
          rows={3}
          placeholder="SELECT * FROM data"
          value={data.query ?? 'SELECT * FROM sales_orders'}
          onChange={(e) => update(id, { query: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 10 }}
        />
        <label style={labelStyle}>DB Path (optional SQLite)</label>
        <input
          placeholder=":memory:"
          value={data.dbPath ?? ''}
          onChange={(e) => update(id, { dbPath: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 11,
  padding: '3px 6px',
  width: '100%',
  boxSizing: 'border-box',
};
