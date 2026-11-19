/**
 * pipelineTemplates.js
 * Pre-configured visual ETL pipelines with embedded datasets for 1-click execution.
 */

const SALES_CSV = `order_id,region,product,quantity,unit_price,revenue,order_date
1,North,Widget A,10,15.00,150.00,2024-01-05
2,South,Widget B,5,40.00,200.00,2024-01-06
3,East,Widget A,8,15.00,120.00,2024-01-07
4,North,Widget C,3,80.00,240.00,2024-01-08
5,West,Widget B,7,40.00,280.00,2024-01-09
6,South,Widget A,12,15.00,180.00,2024-01-10
7,East,Widget C,2,80.00,160.00,2024-01-11
8,North,Widget B,6,40.00,240.00,2024-01-12
9,West,Widget A,9,15.00,135.00,2024-01-13
10,South,Widget C,4,80.00,320.00,2024-01-14
11,North,Widget A,,15.00,,2024-01-15
12,East,Widget B,3,40.00,120.00,2024-01-16
13,West,Widget C,5,80.00,400.00,2024-01-17
14,South,Widget A,10,15.00,150.00,2024-01-05
15,North,Widget B,6,40.00,240.00,2024-01-18`;

const CUSTOMER_CSV = `customer_id,name,email,plan,monthly_spend,signup_date,status
C001, John Doe ,john.doe@example.com,Pro,79.99,2023-01-15,Active
C002,Jane Smith,jane.smith@example.com,Basic,29.99,2023-02-10,Active
C003,Bob Johnson ,bob.j@example.com,Enterprise,299.99,2022-11-05,Churned
C004, Alice Williams,alice.w@example.com,Pro,79.99,2023-04-20,Active
C005,Charlie Brown,charlie.b@example.com,Basic,,2023-05-12,Active
C006,David Miller ,david.m@example.com,Enterprise,299.99,2022-08-30,Active
C007,Emma Wilson,emma.w@example.com,Pro,79.99,2023-03-25,Churned
C008, John Doe ,john.doe@example.com,Pro,79.99,2023-01-15,Active
C009,Frank Thomas,frank.t@example.com,Basic,29.99,2023-06-18,Active
C010,Grace Lee ,grace.l@example.com,Pro,,2023-07-01,Active
C011,Henry Clark,henry.c@example.com,Enterprise,299.99,2022-09-14,Active
C012,Ivy Taylor,ivy.t@example.com,Basic,29.99,2023-08-22,Churned`;

const STOCK_CSV = `date,ticker,open,high,low,close,volume
2024-01-02,AAPL,187.15,188.44,183.89,185.64,82488700
2024-01-03,AAPL,184.22,185.88,183.43,184.25,58414500
2024-01-04,AAPL,182.15,183.09,180.88,181.91,71983600
2024-01-05,AAPL,181.99,182.76,180.17,181.18,62303300
2024-01-08,AAPL,182.09,185.60,181.50,185.56,59144500
2024-01-09,AAPL,183.92,185.15,182.73,185.14,42841800
2024-01-10,AAPL,184.35,186.40,183.92,186.19,46792900
2024-01-11,AAPL,186.54,187.05,183.62,185.59,49128400
2024-01-12,AAPL,186.06,186.74,185.19,185.92,40444700
2024-01-16,AAPL,182.16,184.26,180.93,183.63,65603000
2024-01-17,AAPL,181.27,182.93,180.30,182.68,47317400
2024-01-18,AAPL,186.09,189.14,185.83,188.63,78005800
2024-01-19,AAPL,189.33,191.95,188.82,191.56,68741000`;

const EMPLOYEES_CSV = `emp_id,name,department,salary,join_date,rating
101,Alice Smith,Engineering,95000,2021-03-15,4.8
102,Bob Jones,Marketing,72000,2020-07-22,4.2
103,Charlie Brown,Engineering,105000,2019-01-10,4.9
104,Diana Prince,Sales,68000,2022-11-01,3.9
105,Evan Wright,Marketing,75000,2021-09-18,4.5
106,Fiona Gallagher,Engineering,,2023-02-14,4.1
107,George Clark,Sales,71000,2020-05-30,4.0
108,Hannah Abbott,HR,62000,2018-08-12,4.6
109,Ian Malcolm,Sales,84000,2019-12-05,4.7
110,Julia Roberts,HR,64000,2022-04-19,4.3`;

const REGIONAL_TARGETS_CSV = `region,target_revenue
North,800
South,750
East,350
West,700`;

export const PIPELINE_TEMPLATES = [
  {
    name: 'Sales Revenue & Regional Analytics',
    emoji: '📊',
    badge: 'E-Commerce',
    description: 'Clean orders, calculate profit margin, group by region, and visualize on a bar chart.',
    nodes: [
      {
        id: 'sales-load',
        type: 'load',
        data: { fileContent: SALES_CSV, fileName: 'sales_orders.csv' },
        position: { x: 80, y: 150 },
      },
      {
        id: 'sales-drop',
        type: 'dropNulls',
        data: {},
        position: { x: 300, y: 150 },
      },
      {
        id: 'sales-calc',
        type: 'calcField',
        data: { newColumn: 'profit', expression: 'revenue * 0.25' },
        position: { x: 520, y: 150 },
      },
      {
        id: 'sales-group',
        type: 'groupBy',
        data: { groupBy: ['region'], agg: { revenue: 'sum', profit: 'sum', quantity: 'sum' } },
        position: { x: 740, y: 150 },
      },
      {
        id: 'sales-chart',
        type: 'chart',
        data: { chartType: 'bar', xAxis: 'region', yAxis: 'revenue' },
        position: { x: 960, y: 150 },
      },
      {
        id: 'sales-preview',
        type: 'preview',
        data: { rows: 20 },
        position: { x: 1180, y: 150 },
      },
    ],
    edges: [
      { id: 'e1', source: 'sales-load', target: 'sales-drop', animated: true },
      { id: 'e2', source: 'sales-drop', target: 'sales-calc', animated: true },
      { id: 'e3', source: 'sales-calc', target: 'sales-group', animated: true },
      { id: 'e4', source: 'sales-group', target: 'sales-chart', animated: true },
      { id: 'e5', source: 'sales-chart', target: 'sales-preview', animated: true },
    ],
  },
  {
    name: 'Customer Deduplication & Quality Validation',
    emoji: '🧹',
    badge: 'Data Cleaning',
    description: 'Deduplicate customer emails, trim string whitespace, impute null spends, and validate schema.',
    nodes: [
      {
        id: 'cust-load',
        type: 'load',
        data: { fileContent: CUSTOMER_CSV, fileName: 'customer_churn.csv' },
        position: { x: 80, y: 150 },
      },
      {
        id: 'cust-dedupe',
        type: 'deduplicate',
        data: { columns: ['email'], keep: 'first' },
        position: { x: 300, y: 150 },
      },
      {
        id: 'cust-trim',
        type: 'trimStrings',
        data: { columns: ['name'], side: 'both', case: 'title' },
        position: { x: 520, y: 150 },
      },
      {
        id: 'cust-fill',
        type: 'fillMissing',
        data: { strategy: 'median', columns: ['monthly_spend'] },
        position: { x: 740, y: 150 },
      },
      {
        id: 'cust-validate',
        type: 'schemaValidator',
        data: { requiredColumns: ['customer_id', 'email', 'monthly_spend'], maxNullPct: 0.0, minRows: 5 },
        position: { x: 960, y: 150 },
      },
      {
        id: 'cust-export',
        type: 'export',
        data: { format: 'csv' },
        position: { x: 1180, y: 150 },
      },
    ],
    edges: [
      { id: 'e1', source: 'cust-load', target: 'cust-dedupe', animated: true },
      { id: 'e2', source: 'cust-dedupe', target: 'cust-trim', animated: true },
      { id: 'e3', source: 'cust-trim', target: 'cust-fill', animated: true },
      { id: 'e4', source: 'cust-fill', target: 'cust-validate', animated: true },
      { id: 'e5', source: 'cust-validate', target: 'cust-export', animated: true },
    ],
  },
  {
    name: 'Financial Stock Rolling Moving Average',
    emoji: '🌊',
    badge: 'Time Series',
    description: 'Sort daily stock records, calculate a 3-day simple moving average (SMA), and render a line graph.',
    nodes: [
      {
        id: 'stock-load',
        type: 'load',
        data: { fileContent: STOCK_CSV, fileName: 'stock_prices.csv' },
        position: { x: 80, y: 150 },
      },
      {
        id: 'stock-sort',
        type: 'sort',
        data: { by: 'date', ascending: true },
        position: { x: 300, y: 150 },
      },
      {
        id: 'stock-rolling',
        type: 'rollingWindow',
        data: { column: 'close', window: 3, agg: 'mean', newColumn: 'close_sma_3' },
        position: { x: 520, y: 150 },
      },
      {
        id: 'stock-select',
        type: 'selectColumns',
        data: { columns: ['date', 'close', 'close_sma_3', 'volume'] },
        position: { x: 740, y: 150 },
      },
      {
        id: 'stock-chart',
        type: 'chart',
        data: { chartType: 'line', xAxis: 'date', yAxis: 'close' },
        position: { x: 960, y: 150 },
      },
      {
        id: 'stock-preview',
        type: 'preview',
        data: { rows: 20 },
        position: { x: 1180, y: 150 },
      },
    ],
    edges: [
      { id: 'e1', source: 'stock-load', target: 'stock-sort', animated: true },
      { id: 'e2', source: 'stock-sort', target: 'stock-rolling', animated: true },
      { id: 'e3', source: 'stock-rolling', target: 'stock-select', animated: true },
      { id: 'e4', source: 'stock-select', target: 'stock-chart', animated: true },
      { id: 'e5', source: 'stock-chart', target: 'stock-preview', animated: true },
    ],
  },
  {
    name: 'Workforce Department Salary Pivot Matrix',
    emoji: '🔲',
    badge: 'Analytics',
    description: 'Clean employee records, normalize salaries, and pivot average salary across departments and ratings.',
    nodes: [
      {
        id: 'emp-load',
        type: 'load',
        data: { fileContent: EMPLOYEES_CSV, fileName: 'employees.csv' },
        position: { x: 80, y: 150 },
      },
      {
        id: 'emp-drop',
        type: 'dropNulls',
        data: {},
        position: { x: 300, y: 150 },
      },
      {
        id: 'emp-scale',
        type: 'scaleNormalize',
        data: { columns: ['salary'], method: 'minmax' },
        position: { x: 520, y: 150 },
      },
      {
        id: 'emp-pivot',
        type: 'pivot',
        data: { index: 'department', columns: 'rating', values: 'salary', aggfunc: 'mean' },
        position: { x: 740, y: 150 },
      },
      {
        id: 'emp-preview',
        type: 'preview',
        data: { rows: 50 },
        position: { x: 960, y: 150 },
      },
    ],
    edges: [
      { id: 'e1', source: 'emp-load', target: 'emp-drop', animated: true },
      { id: 'e2', source: 'emp-drop', target: 'emp-scale', animated: true },
      { id: 'e3', source: 'emp-scale', target: 'emp-pivot', animated: true },
      { id: 'e4', source: 'emp-pivot', target: 'emp-preview', animated: true },
    ],
  },
  {
    name: 'SQL Analytics & Query Pipeline',
    emoji: '🗄️',
    badge: 'SQL Database',
    description: 'Execute grouped SQL query directly in-memory and visualize aggregated sales performance.',
    nodes: [
      {
        id: 'sql-src',
        type: 'sqlDatabase',
        data: {
          query: 'SELECT region, product, SUM(revenue) as total_revenue, COUNT(*) as orders_count FROM sales_orders WHERE revenue IS NOT NULL GROUP BY region, product HAVING total_revenue > 150 ORDER BY total_revenue DESC',
        },
        position: { x: 100, y: 150 },
      },
      {
        id: 'sql-sort',
        type: 'sort',
        data: { by: 'total_revenue', ascending: false },
        position: { x: 340, y: 150 },
      },
      {
        id: 'sql-chart',
        type: 'chart',
        data: { chartType: 'bar', xAxis: 'region', yAxis: 'total_revenue' },
        position: { x: 580, y: 150 },
      },
      {
        id: 'sql-preview',
        type: 'preview',
        data: { rows: 20 },
        position: { x: 800, y: 150 },
      },
    ],
    edges: [
      { id: 'e1', source: 'sql-src', target: 'sql-sort', animated: true },
      { id: 'e2', source: 'sql-sort', target: 'sql-chart', animated: true },
      { id: 'e3', source: 'sql-chart', target: 'sql-preview', animated: true },
    ],
  },
  {
    name: 'Multi-Source Regional Sales Join',
    emoji: '🔗',
    badge: 'Multi-Table Join',
    description: 'Join live sales revenue against regional benchmark quotas to evaluate performance.',
    nodes: [
      {
        id: 'join-sales',
        type: 'load',
        data: { fileContent: SALES_CSV, fileName: 'sales_orders.csv' },
        position: { x: 80, y: 80 },
      },
      {
        id: 'join-targets',
        type: 'load',
        data: { fileContent: REGIONAL_TARGETS_CSV, fileName: 'regional_targets.csv' },
        position: { x: 80, y: 260 },
      },
      {
        id: 'join-group',
        type: 'groupBy',
        data: { groupBy: ['region'], agg: { revenue: 'sum' } },
        position: { x: 320, y: 80 },
      },
      {
        id: 'join-node',
        type: 'join',
        data: { on: 'region', how: 'inner' },
        position: { x: 540, y: 170 },
      },
      {
        id: 'join-calc',
        type: 'calcField',
        data: { newColumn: 'surplus', expression: 'revenue - target_revenue' },
        position: { x: 760, y: 170 },
      },
      {
        id: 'join-preview',
        type: 'preview',
        data: { rows: 20 },
        position: { x: 980, y: 170 },
      },
    ],
    edges: [
      { id: 'e1', source: 'join-sales', target: 'join-group', animated: true },
      { id: 'e2', source: 'join-group', target: 'join-node', animated: true },
      { id: 'e3', source: 'join-targets', target: 'join-node', animated: true },
      { id: 'e4', source: 'join-node', target: 'join-calc', animated: true },
      { id: 'e5', source: 'join-calc', target: 'join-preview', animated: true },
    ],
  },
];
