import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function ApiSourceNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data} noTarget>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>API URL</label>
        <input
          placeholder="https://api.example.com/data"
          value={data.url ?? ''}
          onChange={(e) => update(id, { url: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Method</label>
        <select
          value={data.method ?? 'GET'}
          onChange={(e) => update(id, { method: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <label style={labelStyle}>JSON Key Path (optional)</label>
        <input
          placeholder="e.g. data or results"
          value={data.responsePath ?? ''}
          onChange={(e) => update(id, { responsePath: e.target.value })}
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
