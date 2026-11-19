import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function ExportNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data} noSource>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Format</label>
        <select
          value={data.format ?? 'csv'}
          onChange={(e) => update(id, { format: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="jsonl">JSONL</option>
        </select>
      </div>
    </BaseNode>
  );
}
const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
