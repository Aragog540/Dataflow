import BaseNode from './BaseNode';
import usePipelineStore from '../store';

export default function ChartNode({ id, type, data }) {
  const update = usePipelineStore((s) => s.updateNodeData);
  return (
    <BaseNode id={id} type={type} data={data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>Chart type</label>
        <select
          value={data.chartType ?? 'bar'}
          onChange={(e) => update(id, { chartType: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={inputStyle}
        >
          {['bar','line','scatter','pie','area','histogram'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label style={labelStyle}>X axis</label>
        <input placeholder="column" value={data.xAxis ?? ''}
          onChange={(e) => update(id, { xAxis: e.target.value })}
          onClick={(e) => e.stopPropagation()} style={inputStyle} />
        <label style={labelStyle}>Y axis</label>
        <input placeholder="column" value={data.yAxis ?? ''}
          onChange={(e) => update(id, { yAxis: e.target.value })}
          onClick={(e) => e.stopPropagation()} style={inputStyle} />
      </div>
    </BaseNode>
  );
}
const labelStyle = { color: '#94a3b8', fontSize: 10 };
const inputStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 4,
  color: '#e2e8f0', fontSize: 11, padding: '3px 6px', width: '100%', boxSizing: 'border-box',
};
