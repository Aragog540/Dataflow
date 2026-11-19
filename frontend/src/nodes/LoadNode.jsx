import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function LoadNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data} noTarget>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <input
          placeholder="File path or URL"
          value={data.filePath ?? ''}
          onChange={(e) => update(id, { filePath: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <select
          value={data.format ?? 'csv'}
          onChange={(e) => update(id, { format: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
        {data.filePath && (
          <span style={{ color: '#94a3b8', fontSize: 10, wordBreak: 'break-all' }}>
            {data.filePath.split(/[\\/]/).pop()}
          </span>
        )}
      </div>
    </BaseNode>
  );
}

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
