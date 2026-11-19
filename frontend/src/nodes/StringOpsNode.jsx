import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function StringOpsNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Target Column</label>
        <input
          placeholder="e.g. product"
          value={data.column ?? ''}
          onChange={(e) => update(id, { column: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        />
        <label style={labelStyle}>Operation</label>
        <select
          value={data.operation ?? 'lower'}
          onChange={(e) => update(id, { operation: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          <option value="lower">Lowercase</option>
          <option value="upper">Uppercase</option>
          <option value="replace">Replace Substring</option>
          <option value="regex_replace">Regex Replace</option>
          <option value="contains">Check Contains (Boolean)</option>
          <option value="length">Character Length</option>
        </select>
        {(data.operation === 'replace' || data.operation === 'regex_replace' || data.operation === 'contains') && (
          <>
            <label style={labelStyle}>Find / Pattern</label>
            <input
              placeholder="Widget"
              value={data.find ?? ''}
              onChange={(e) => update(id, { find: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={inputStyle}
            />
          </>
        )}
        {(data.operation === 'replace' || data.operation === 'regex_replace') && (
          <>
            <label style={labelStyle}>Replace With</label>
            <input
              placeholder="Item"
              value={data.replaceWith ?? ''}
              onChange={(e) => update(id, { replaceWith: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={inputStyle}
            />
          </>
        )}
        <label style={labelStyle}>Output Column (blank = in-place)</label>
        <input
          placeholder="leave blank for in-place"
          value={data.newColumn ?? ''}
          onChange={(e) => update(id, { newColumn: e.target.value })}
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
