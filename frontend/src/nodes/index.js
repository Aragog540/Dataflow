// index.js – re-exports every node component keyed by its type name.
// Used by App.jsx as the `nodeTypes` prop to ReactFlow.

import LoadNode from './LoadNode';
import SqlDatabaseNode from './SqlDatabaseNode';
import ApiSourceNode from './ApiSourceNode';
import DropNullsNode from './DropNullsNode';
import DedupeNode from './DedupeNode';
import FillMissingNode from './FillMissingNode';
import TypeCastNode from './TypeCastNode';
import TrimStringsNode from './TrimStringsNode';
import ScaleNormalizeNode from './ScaleNormalizeNode';
import FilterColumnsNode from './FilterColumnsNode';
import SelectColumnsNode from './SelectColumnsNode';
import RenameNode from './RenameNode';
import CalcFieldNode from './CalcFieldNode';
import AddColumnNode from './AddColumnNode';
import StringOpsNode from './StringOpsNode';
import PivotNode from './PivotNode';
import MeltNode from './MeltNode';
import RollingWindowNode from './RollingWindowNode';
import MergeNode from './MergeNode';
import JoinNode from './JoinNode';
import ConcatNode from './ConcatNode';
import GroupByNode from './GroupByNode';
import AggregateNode from './AggregateNode';
import SortNode from './SortNode';
import SliceNode from './SliceNode';
import SampleNode from './SampleNode';
import DescribeNode from './DescribeNode';
import ProfilerNode from './ProfilerNode';
import SchemaValidatorNode from './SchemaValidatorNode';
import CommentNode from './CommentNode';
import ChartNode from './ChartNode';
import PreviewNode from './PreviewNode';
import ExportNode from './ExportNode';

const nodeTypes = {
  // Input / Output
  load: LoadNode,
  sqlDatabase: SqlDatabaseNode,
  apiSource: ApiSourceNode,
  preview: PreviewNode,
  export: ExportNode,

  // Data Cleaning & Validation
  dropNulls: DropNullsNode,
  dedupe: DedupeNode,
  deduplicate: DedupeNode,
  fillMissing: FillMissingNode,
  trimStrings: TrimStringsNode,
  schemaValidator: SchemaValidatorNode,

  // Transformation & Fields
  typeCast: TypeCastNode,
  scaleNormalize: ScaleNormalizeNode,
  filterColumns: FilterColumnsNode,
  selectColumns: SelectColumnsNode,
  rename: RenameNode,
  calcField: CalcFieldNode,
  addColumn: AddColumnNode,
  stringOps: StringOpsNode,

  // Reshape & Combine
  pivot: PivotNode,
  melt: MeltNode,
  merge: MergeNode,
  join: JoinNode,
  concat: ConcatNode,

  // Aggregation & Analytics
  groupBy: GroupByNode,
  aggregate: AggregateNode,
  rollingWindow: RollingWindowNode,
  sort: SortNode,
  slice: SliceNode,
  sample: SampleNode,
  describe: DescribeNode,
  profiler: ProfilerNode,

  // Visualization & Annotation
  chart: ChartNode,
  comment: CommentNode,
};

export default nodeTypes;
