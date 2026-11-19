import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function AddColumnNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>New Column Name</label>
        <input
          placeholder="col_name"
          value={data.columnName ?? 'new_col'}
          onChange={(e) => update(id, { columnName: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Mode</label>
        <select
          value={data.mode ?? 'constant'}
          onChange={(e) => update(id, { mode: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="constant">Constant Value</option>
          <option value="row_number">Row Number (1..N)</option>
          <option value="index">Index (0..N-1)</option>
          <option value="expression">Math Expression</option>
        </select>
        {(data.mode === 'constant' || data.mode === 'expression' || !data.mode) && (
          <>
            <label style={labelStyle}>{data.mode === 'expression' ? 'Expression' : 'Value'}</label>
            <input
              placeholder={data.mode === 'expression' ? 'revenue * 1.1' : 'Active'}
              value={data.value ?? ''}
              onChange={(e) => update(id, { value: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={inputStyle}
            />
          </>
        )}
      </div>
    </BaseNode>
  );
}

const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
