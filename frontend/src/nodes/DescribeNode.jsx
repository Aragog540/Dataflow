import BaseNode from './BaseNode';

export default function DescribeNode({ id, type, data }) {
  return (
    <BaseNode id={id} type={type} data={data}>
      <span style={{ color: '#94a3b8', fontSize: 10 }}>
        Outputs comprehensive descriptive statistics (mean, std, percentiles, skew, null rate).
      </span>
    </BaseNode>
  );
}
