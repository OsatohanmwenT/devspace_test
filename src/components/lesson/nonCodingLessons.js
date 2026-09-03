export const technicalTeamsLesson = {
  id: 'technical-teams-basics',
  title: 'How technical teams work',
  role: 'technical_project_coordinator',
  concepts: [
    {
      id: 'technical-team-coordination',
      title: 'Technical team coordination',
      activities: [
        {
          id: 'technical-team-coordination-learn',
          type: 'article',
          content: {
            title: 'Helping technical teams move together',
            intro: 'A technical project coordinator helps people understand what is happening, what comes next, and what could slow the work down.',
            sections: [
              {
                title: 'Coordination creates clarity',
                body: [
                  'Developers, designers, marketers, and stakeholders often depend on one another. A coordinator keeps the shared goal, current tasks, owners, and deadlines ',
                  { strong: 'visible' },
                  ' so nobody has to guess what is happening.',
                ],
              },
              {
                title: 'The role removes obstacles',
                body: 'A coordinator does not need to write the code. They notice missing decisions, unclear ownership, and blocked work, then help the right people resolve them.',
              },
            ],
            next: {
              title: 'Check the coordinator mindset',
              body: 'Use this idea to choose the clearest response to two everyday team situations.',
            },
          },
        },
        {
          id: 'technical-team-coordination-check',
          type: 'quiz',
          content: {
            title: 'Check technical team coordination',
            intro: 'Choose the response that makes work clearer and easier to move forward.',
            questions: [
              {
                id: 'coordination-q1',
                type: 'multiple-choice',
                prompt: 'A developer cannot start because a design has not been approved. What should the coordinator do first?',
                options: [
                  'Make the dependency visible and ask the design owner for a decision',
                  'Tell the developer to build something else without updating the plan',
                  'Wait until the next weekly meeting',
                  'Approve the design personally',
                ],
                correctIndex: 0,
                explanation: 'The coordinator makes the blocked dependency visible and brings the right owner into the decision.',
              },
              {
                id: 'coordination-q2',
                type: 'multiple-choice',
                prompt: 'Which project update is most useful to a team?',
                options: [
                  'Everything is fine',
                  'Work is continuing as normal',
                  'Invite testing is blocked until Sam approves the design by Thursday',
                  'The team has many tasks',
                ],
                correctIndex: 2,
                explanation: 'A useful update names the work, its current state, the dependency, the owner, and the needed timing.',
              },
            ],
          },
        },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand the coordinator’s role!',
    body: 'You learned how coordinators create clarity, expose dependencies, and help technical teams keep moving.',
  },
}

export const digitalMarketingLesson = {
  id: 'digital-marketing-basics',
  title: 'How digital marketing works',
  role: 'digital_marketer',
  concepts: [
    {
      id: 'digital-marketing-foundations',
      title: 'Digital marketing foundations',
      activities: [
        {
          id: 'digital-marketing-foundations-learn',
          type: 'article',
          content: {
            title: 'Connecting useful products with the right people',
            intro: 'Digital marketing uses online channels to help a specific audience discover, understand, and choose a product or service.',
            sections: [
              {
                title: 'Start with the audience and goal',
                body: [
                  'Good marketing begins by deciding ',
                  { strong: 'who' },
                  ' you want to reach and what useful action you want them to take. A clear goal might be trial signups, event registrations, or completed purchases.',
                ],
              },
              {
                title: 'Use evidence to improve',
                body: 'Marketers choose a message and channel, publish content, then measure what happened. Results such as clicks, signups, and cost help them decide what to improve next.',
              },
            ],
            next: {
              title: 'Check the marketing foundations',
              body: 'Choose the audience focused and measurable response in two short situations.',
            },
          },
        },
        {
          id: 'digital-marketing-foundations-check',
          type: 'quiz',
          content: {
            title: 'Check digital marketing foundations',
            intro: 'Use the audience, goal, and evidence behind each choice.',
            questions: [
              {
                id: 'marketing-q1',
                type: 'multiple-choice',
                prompt: 'Which is the clearest campaign goal?',
                options: [
                  'Become popular online',
                  'Generate 100 free trial signups this month',
                  'Post more often',
                  'Make everyone like the brand',
                ],
                correctIndex: 1,
                explanation: 'A useful goal names a measurable action, a target, and a time period.',
              },
              {
                id: 'marketing-q2',
                type: 'multiple-choice',
                prompt: 'Why should a marketer review clicks and signups after a campaign?',
                options: [
                  'To make the report look longer',
                  'To replace the campaign goal',
                  'To understand what worked and improve the next decision',
                  'To avoid learning about the audience',
                ],
                correctIndex: 2,
                explanation: 'Campaign evidence helps a marketer keep effective choices and change weaker ones.',
              },
            ],
          },
        },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand digital marketing!',
    body: 'You learned how audience, goals, messages, channels, and evidence work together.',
  },
}

// Northstar Store — a small fictional online retailer — is the one dataset
// this whole two-tile pilot returns to, so a learner builds one mental model
// of the data instead of a new unrelated example every screen.
const NORTHSTAR_COLUMNS = [
  { key: 'order_id', label: 'order_id' },
  { key: 'customer_segment', label: 'customer_segment' },
  { key: 'city', label: 'city' },
  { key: 'items', label: 'items' },
  { key: 'order_value_ngn', label: 'order_value_ngn' },
  { key: 'payment_method', label: 'payment_method' },
  { key: 'delivery_minutes', label: 'delivery_minutes' },
]

const NORTHSTAR_ROWS = [
  { order_id: 'NS1001', customer_segment: 'Student', city: 'Lagos', items: 2, order_value_ngn: '₦8,500', payment_method: 'Transfer', delivery_minutes: 35 },
  { order_id: 'NS1002', customer_segment: 'Professional', city: 'Abuja', items: 1, order_value_ngn: '₦12,400', payment_method: 'Card', delivery_minutes: 48 },
  { order_id: 'NS1003', customer_segment: 'Student', city: 'Ibadan', items: 3, order_value_ngn: '₦6,700', payment_method: 'Transfer', delivery_minutes: 41 },
  { order_id: 'NS1004', customer_segment: 'Business', city: 'Lagos', items: 5, order_value_ngn: '₦24,600', payment_method: 'Card', delivery_minutes: 62 },
  { order_id: 'NS1005', customer_segment: 'Professional', city: 'Abuja', items: 2, order_value_ngn: '₦15,800', payment_method: 'Transfer', delivery_minutes: 39 },
  { order_id: 'NS1006', customer_segment: 'Student', city: 'Lagos', items: 1, order_value_ngn: '₦4,200', payment_method: 'Cash', delivery_minutes: 52 },
]

// Same order data, deliberately damaged: a missing city (r3), an impossible
// item count that's also a duplicate row (r4/r5), and an inconsistently
// cased payment method (r6). `rowId` is the unique table key — `order_id`
// stays a plain column so the duplicate can legitimately repeat its value.
const NORTHSTAR_MESSY_COLUMNS = NORTHSTAR_COLUMNS
const NORTHSTAR_MESSY_ROWS = [
  { rowId: 'r1', order_id: 'NS1001', customer_segment: 'Student', city: 'Lagos', items: 2, order_value_ngn: '₦8,500', payment_method: 'Transfer', delivery_minutes: 35 },
  { rowId: 'r2', order_id: 'NS1002', customer_segment: 'Professional', city: 'Abuja', items: 1, order_value_ngn: '₦12,400', payment_method: 'Card', delivery_minutes: 48 },
  { rowId: 'r3', order_id: 'NS1003', customer_segment: 'Student', city: '—', items: 3, order_value_ngn: '₦6,700', payment_method: 'Transfer', delivery_minutes: 41 },
  { rowId: 'r4', order_id: 'NS1004', customer_segment: 'Business', city: 'Lagos', items: -2, order_value_ngn: '₦24,600', payment_method: 'Card', delivery_minutes: 62 },
  { rowId: 'r5', order_id: 'NS1004', customer_segment: 'Business', city: 'Lagos', items: -2, order_value_ngn: '₦24,600', payment_method: 'Card', delivery_minutes: 62 },
  { rowId: 'r6', order_id: 'NS1005', customer_segment: 'Professional', city: 'Abuja', items: 2, order_value_ngn: '₦15,800', payment_method: 'card', delivery_minutes: 39 },
]

// `note` is only read by the field-select practice (a plain-language reason
// to include or leave out each field) — LessonDataTable ignores it, so this
// same list is safe to reuse for the read-only Explain-screen table too.
const NORTHSTAR_CUSTOMER_COLUMNS = [
  { key: 'customer_name', label: 'customer_name', note: 'Identifies a specific person — not needed to compare delivery time by segment.' },
  { key: 'customer_email', label: 'customer_email', note: 'A direct contact identifier — this question has no reason to touch it.' },
  { key: 'phone_number', label: 'phone_number', note: 'A direct contact identifier — same reasoning as email.' },
  { key: 'customer_segment', label: 'customer_segment', note: 'The exact grouping Northstar asked about — required.' },
  { key: 'city', label: 'city', note: 'Not required, but a reasonable, non-identifying addition if you want a geographic breakdown too.' },
  { key: 'order_value_ngn', label: 'order_value_ngn', note: 'Not part of this question — leaving it out keeps the file focused.' },
  { key: 'delivery_minutes', label: 'delivery_minutes', note: 'The exact measurement Northstar asked about — required.' },
]

const NORTHSTAR_CUSTOMER_ROWS = [
  { order_id: 'NS1001', customer_name: 'Amaka O.', customer_email: 'amaka@example.com', phone_number: '080•••••01', customer_segment: 'Student', city: 'Lagos', order_value_ngn: '₦8,500', delivery_minutes: 35 },
  { order_id: 'NS1004', customer_name: 'Tunde B.', customer_email: 'tunde@example.com', phone_number: '080•••••04', customer_segment: 'Business', city: 'Lagos', order_value_ngn: '₦24,600', delivery_minutes: 62 },
]

export const dataAnalysisLesson = {
  id: 'data-analysis-basics',
  title: 'Datasets and Variable Types',
  role: 'data_analyst',
  concepts: [
    {
      id: 'rows-columns-datasets',
      title: 'Rows, columns, and datasets',
      activities: [
        {
          id: 'rows-columns-datasets-learn',
          type: 'article',
          content: {
            title: 'A dataset is a collection of observations',
            intro: 'Northstar Store wants to understand its orders better. Analysts usually work with many related pieces of information at once — when those pieces are organised together, we call the collection a dataset.',
            table: {
              columns: NORTHSTAR_COLUMNS,
              rows: NORTHSTAR_ROWS,
              rowKey: 'order_id',
              caption: 'Click a row, a column, or a cell to see what each one represents.',
            },
            sections: [
              {
                title: 'Every row is one observation',
                body: 'Each row in Northstar’s table describes one order — one thing that actually happened. NS1001 and NS1002 are two different orders, so they each get their own row.',
              },
              {
                title: 'Every column is one variable',
                body: [
                  'Each column describes one type of information recorded for every order — its city, its payment method, how long delivery took. Where a row and a column meet, you get one ',
                  { strong: 'value' },
                  ': a single fact about a single order.',
                ],
              },
            ],
            next: {
              title: 'Check rows, columns, and datasets',
              body: 'Use the Northstar table to answer two quick questions.',
            },
          },
        },
        {
          id: 'rows-columns-datasets-check',
          type: 'quiz',
          content: {
            title: 'Check rows, columns, and datasets',
            intro: 'Use the Northstar order table to answer these.',
            questions: [
              {
                id: 'na-q1',
                type: 'multiple-choice',
                prompt: 'In Northstar’s dataset, what does one row represent?',
                options: ['One city', 'One order', 'One payment method', 'One type of customer'],
                correctIndex: 1,
                explanation: 'Each row is one recorded order — look at order IDs such as NS1001 and NS1002, each in its own row.',
              },
              {
                id: 'na-q2',
                type: 'multiple-choice',
                prompt: [{ code: 'payment_method' }, ' — what does this column represent?'],
                options: ['One observation', 'One individual value', 'One variable recorded for every order', 'The whole dataset'],
                correctIndex: 2,
                explanation: 'A column is a variable — one type of information recorded for every row.',
              },
            ],
          },
        },
        {
          id: 'rows-columns-datasets-practice',
          type: 'practice',
          content: {
            eyebrow: 'Hands-on',
            title: 'Read the dataset',
            instruction: 'Use the Northstar table to answer three quick tasks.',
            mode: 'table-tasks',
            dataset: { columns: NORTHSTAR_COLUMNS, rows: NORTHSTAR_ROWS, rowKey: 'order_id' },
            tasks: [
              { id: 't1', prompt: 'Select the row representing order NS1004.', target: { type: 'row', rowId: 'NS1004' } },
              { id: 't2', prompt: 'Select the column that tells us how long delivery took.', target: { type: 'column', columnKey: 'delivery_minutes' } },
              { id: 't3', prompt: 'Select the exact cell that tells us how long order NS1003 took to arrive.', target: { type: 'cell', rowId: 'NS1003', columnKey: 'delivery_minutes' } },
            ],
            successBody: 'Nice. You can now read the basic shape of a dataset.',
            hints: [
              'Look at the order_id column to find the row you need.',
              'A column name usually describes exactly what it measures.',
              'Find the right row first, then look across to the right column.',
            ],
          },
        },
      ],
      transition: {
        eyebrow: 'Concept complete',
        title: 'Great work — you can read a dataset!',
        body: 'Next, you’ll learn that not every column means the same kind of thing.',
      },
    },
    {
      id: 'categorical-vs-numerical',
      title: 'Categorical vs numerical variables',
      activities: [
        {
          id: 'categorical-vs-numerical-learn',
          type: 'article',
          content: {
            title: 'Not every column means the same kind of thing',
            intro: 'Some variables describe groups or labels. Others describe amounts we can measure or count.',
            sections: [
              {
                title: 'Categorical variables',
                body: [
                  'Categorical variables tell us ',
                  { strong: 'what kind' },
                  ' of thing something is — like ',
                  { code: 'Student' },
                  ', ',
                  { code: 'Lagos' },
                  ', or ',
                  { code: 'Card' },
                  '.',
                ],
              },
              {
                title: 'Numerical variables',
                body: [
                  'Numerical variables tell us ',
                  { strong: 'how many or how much' },
                  ' — like 2 items, ₦8,500, or 35 minutes.',
                ],
              },
              {
                title: 'Numbers can still be labels',
                body: [
                  'A column can contain digits without being something you’d calculate with. An order ID like ',
                  { code: 'NS1003' },
                  ' is a label, even though it contains numbers — you’d never average two order IDs together.',
                ],
              },
            ],
            video: {
              title: 'Types of Data: Categorical vs Numerical Data',
              subtitle: '365 Data Science',
              duration: '4:13',
              badgeLabel: 'DS',
              videoId: 'DUcXZ08IdMo',
              segments: [{ id: 'default', label: null, startSeconds: 0, endSeconds: 253 }],
              transcriptSummary: 'Categorical data describes qualities or groups — names, labels, categories — that can be counted but not meaningfully measured. Numerical data describes quantities that can be measured or counted, like age or income, and further splits into discrete (countable, whole-number) and continuous (any value in a range) values.',
            },
            next: {
              title: 'Check categorical vs numerical',
              body: 'Use the Northstar table to tell the two apart.',
            },
          },
        },
        {
          id: 'categorical-vs-numerical-check',
          type: 'quiz',
          content: {
            title: 'Check categorical vs numerical',
            intro: 'Use what a column actually measures, not just whether it has digits.',
            questions: [
              {
                id: 'na-q3',
                type: 'multiple-choice',
                prompt: 'Which Northstar variable is categorical?',
                options: [{ code: 'delivery_minutes' }, { code: 'order_value_ngn' }, { code: 'payment_method' }, { code: 'items' }],
                correctIndex: 2,
                explanation: 'payment_method names a group — Transfer, Card, or Cash — not an amount.',
              },
              {
                id: 'na-q4',
                type: 'multiple-choice',
                prompt: 'Which variable could reasonably be averaged?',
                options: [{ code: 'city' }, { code: 'customer_segment' }, { code: 'payment_method' }, { code: 'delivery_minutes' }],
                correctIndex: 3,
                explanation: 'Delivery time is a numerical measurement — averaging city names or payment methods wouldn’t make sense.',
              },
            ],
          },
        },
        {
          id: 'categorical-vs-numerical-practice',
          type: 'practice',
          content: {
            eyebrow: 'Hands-on',
            title: 'Sort the data',
            instruction: 'Sort each value from Northstar’s table into the group it belongs to.',
            mode: 'sort-cards',
            items: [
              { id: 'lagos', label: 'Lagos', zone: 'categorical' },
              { id: 'value', label: '₦12,400', zone: 'numerical' },
              { id: 'student', label: 'Student', zone: 'categorical' },
              { id: 'delivery', label: '48 minutes', zone: 'numerical' },
              { id: 'card', label: 'Card', zone: 'categorical' },
              { id: 'items3', label: '3 items', zone: 'numerical' },
            ],
            zones: [{ id: 'categorical', label: 'Categorical' }, { id: 'numerical', label: 'Numerical' }],
            successBody: 'Categorical describes what kind. Numerical describes how much or how many.',
            hints: [
              'Ask yourself: is this telling me what kind of thing it is, or how much/how many?',
              '“Lagos” names a place — that’s a label, not an amount.',
              '“48 minutes” is something you could measure or average — that’s numerical.',
            ],
          },
        },
      ],
    },
  ],
  completion: {
    eyebrow: 'Tile complete',
    title: 'You can read the shape of a dataset now.',
    body: 'Next, we’ll learn how analysts decide whether data is trustworthy enough to use.',
  },
}

export const dataQualityWorkflowLesson = {
  id: 'data-quality-workflow',
  title: 'Quality and the Analysis Workflow',
  role: 'data_analyst',
  concepts: [
    {
      id: 'data-quality-checks',
      title: 'Basic data-quality checks',
      activities: [
        {
          id: 'data-quality-checks-learn',
          type: 'article',
          content: {
            title: 'Clean-looking data can still be wrong',
            intro: 'Data quality means asking whether the information is reliable enough to support the question you’re trying to answer. Here’s Northstar’s order data exactly as it arrived.',
            table: {
              columns: NORTHSTAR_MESSY_COLUMNS,
              rows: NORTHSTAR_MESSY_ROWS,
              rowKey: 'rowId',
              caption: 'This is the same order data — but nobody has checked it yet.',
            },
            sections: [
              {
                title: 'Missing',
                body: 'Is information absent where we expected a value? Order NS1003 has no city recorded.',
              },
              {
                title: 'Duplicate',
                body: 'Has the same observation been recorded more than once? Order NS1004 appears twice, with identical values both times.',
              },
              {
                title: 'Inconsistent',
                body: ['Is the same category written in different ways? This table has both ', { code: 'Card' }, ' and ', { code: 'card' }, '.'],
              },
              {
                title: 'Impossible or suspicious',
                body: 'Does a value contradict what could realistically happen? An order can’t have -2 items.',
              },
              {
                title: 'Investigate before you delete',
                body: 'Don’t automatically delete every suspicious value. First identify the problem, then decide what it means.',
              },
            ],
            video: {
              title: 'A Beginner’s Guide to the Data Analysis Process',
              subtitle: 'CareerFoundry — why cleaning comes before analysis',
              duration: '5:22–7:10',
              badgeLabel: 'CF',
              videoId: 'lgCNTuLBMK4',
              segments: [{ id: 'default', label: null, startSeconds: 322, endSeconds: 430 }],
              transcriptSummary: 'Cleaning means fixing structural problems in a dataset — removing exact duplicates, standardizing inconsistent labels, and deciding what to do with missing or impossible values — before any analysis runs on it. Cleaning is not the same as deleting: a duplicate or an outlier gets investigated first, not automatically discarded.',
            },
            next: {
              title: 'Check data-quality checks',
              body: 'Use Northstar’s messy table to decide what to do next.',
            },
          },
        },
        {
          id: 'data-quality-checks-check',
          type: 'quiz',
          content: {
            title: 'Check data-quality checks',
            intro: 'A weird value is a signal to investigate, not an instant delete.',
            questions: [
              {
                id: 'dq-q1',
                type: 'multiple-choice',
                prompt: 'Northstar has the exact same NS1004 row twice. What is the best first action?',
                options: ['Delete both rows immediately', 'Ignore them', 'Flag the duplicate and verify why it exists', 'Change one order ID randomly'],
                correctIndex: 2,
                explanation: 'A duplicate is a signal to investigate, not permission to blindly delete information.',
              },
              {
                id: 'dq-q2',
                type: 'multiple-choice',
                prompt: [{ code: 'items' }, ' — which value is clearly impossible for this column?'],
                options: ['1', '2', '3', '-2'],
                correctIndex: 3,
                explanation: 'An order can’t contain a negative number of items.',
              },
            ],
          },
        },
        {
          id: 'data-quality-checks-practice',
          type: 'practice',
          content: {
            eyebrow: 'Hands-on',
            title: 'Find the quality problems',
            instruction: 'Find four things you would investigate before analysing this dataset.',
            mode: 'issue-spotter',
            dataset: { columns: NORTHSTAR_MESSY_COLUMNS, rows: NORTHSTAR_MESSY_ROWS, rowKey: 'rowId' },
            issues: [
              { id: 'missing-city', rowId: 'r3', columnKey: 'city', label: 'Missing value' },
              { id: 'impossible-items', rowId: 'r4', columnKey: 'items', label: 'Impossible value' },
              { id: 'duplicate', rowId: 'r5', columnKey: 'order_id', label: 'Duplicate' },
              { id: 'inconsistent-payment', rowId: 'r6', columnKey: 'payment_method', label: 'Inconsistent category' },
            ],
            nonIssueNudge: 'That value might be unusual, but nothing we’ve learned tells us it’s definitely a quality problem.',
            successBody: 'You found all four — that’s the habit of checking before you trust a dataset.',
            hints: [
              'Look for something missing.',
              'Now check whether any order appears more than once.',
              'Compare how the payment-method labels are written.',
            ],
          },
        },
      ],
      transition: {
        eyebrow: 'Concept complete',
        title: 'You know what to check before you trust data.',
        body: 'Next, you’ll learn the repeatable workflow analysts follow from question to communicated result.',
      },
    },
    {
      id: 'analysis-workflow',
      title: 'The analysis workflow',
      activities: [
        {
          id: 'analysis-workflow-learn',
          type: 'article',
          content: {
            title: 'Analysis is a process, not a button',
            intro: 'Analysts don’t begin by throwing data into a chart. They begin with a question and move through a repeatable workflow.',
            diagram: {
              title: 'The analysis workflow',
              body: 'Each stage builds on the one before it — skipping ahead is how confident-looking wrong answers happen.',
              label: 'Ask, then inspect, then clean, then analyze, then visualize, then communicate',
              nodes: ['Ask', 'Inspect', 'Clean', 'Analyze', 'Visualize', 'Communicate'],
            },
            sections: [
              { title: 'Ask', body: 'What decision or question are we trying to answer? For Northstar: “Which customer segment experiences the longest delivery times?”' },
              { title: 'Inspect', body: 'What data do we have, and what does each part mean?' },
              { title: 'Clean', body: 'Fix or investigate problems that could mislead the analysis.' },
              { title: 'Analyze', body: 'Compare, summarize, or calculate what the data tells us.' },
              { title: 'Visualize', body: 'Use an appropriate visual when it makes the result easier to understand.' },
              { title: 'Communicate', body: 'Explain what you found, what it means, and what limitations remain.' },
            ],
            video: {
              title: 'A Beginner’s Guide to the Data Analysis Process',
              subtitle: 'CareerFoundry',
              duration: '0:21–10:06',
              badgeLabel: 'CF',
              videoId: 'lgCNTuLBMK4',
              segments: [
                { id: 'ask', label: 'Start with the question', startSeconds: 21, endSeconds: 166 },
                { id: 'analyze', label: 'Analyze', startSeconds: 431, endSeconds: 501 },
                { id: 'share', label: 'Share the result', startSeconds: 501, endSeconds: 606 },
              ],
              transcriptSummary: 'Start by defining the decision the analysis needs to support — a vague question produces a vague answer. Once the data is clean, analyzing means comparing, summarizing, or calculating what it actually shows. Sharing the result means explaining the finding plainly, including what it does and doesn’t prove, to whoever asked the original question.',
            },
            next: {
              title: 'Check the analysis workflow',
              body: 'Put the six stages, and Northstar’s next move, in the right order.',
            },
          },
        },
        {
          id: 'analysis-workflow-check',
          type: 'quiz',
          content: {
            title: 'Check the analysis workflow',
            intro: 'Use the order of the six stages.',
            questions: [
              {
                id: 'aw-q1',
                type: 'multiple-choice',
                prompt: 'A manager says, “Customers are complaining about slow delivery.” What should an analyst do first?',
                options: ['Build a chart', 'Define the question they need to answer', 'Delete slow deliveries', 'Calculate every possible statistic'],
                correctIndex: 1,
                explanation: 'Every workflow starts with a clear question, not a chart.',
              },
              {
                id: 'aw-q2',
                type: 'multiple-choice',
                prompt: 'You discover missing cities and duplicate order records. Which stage should happen before analysis?',
                options: ['Ask', 'Analyze', 'Clean', 'Communicate'],
                correctIndex: 2,
                explanation: 'Cleaning always comes before you analyze or visualize.',
              },
            ],
          },
        },
        {
          id: 'analysis-workflow-practice',
          type: 'practice',
          content: {
            eyebrow: 'Hands-on',
            title: 'Build the analysis workflow',
            instruction: 'Put the six stages in order, then decide Northstar’s next move.',
            mode: 'reorder',
            items: [
              { id: 'communicate', label: 'Communicate' },
              { id: 'clean', label: 'Clean' },
              { id: 'ask', label: 'Ask' },
              { id: 'analyze', label: 'Analyze' },
              { id: 'inspect', label: 'Inspect' },
              { id: 'visualize', label: 'Visualize' },
            ],
            correctOrder: ['ask', 'inspect', 'clean', 'analyze', 'visualize', 'communicate'],
            scenario: {
              prompt: 'Northstar asks: “Which customer segment experiences the longest delivery times?” What should you do next?',
              options: ['Inspect the relevant columns', 'Build a machine learning model', 'Send a conclusion', 'Delete Student orders'],
              correctIndex: 0,
              explanation: 'Inspecting the relevant columns comes right after asking the question, and before cleaning or analyzing.',
            },
            successBody: 'That’s the workflow — asking first is what keeps the rest of the analysis honest.',
            hints: [
              'Every workflow starts with a question, not a chart.',
              'Cleaning always comes before you analyze or visualize.',
              'Communicating the result is always the last step.',
            ],
          },
        },
      ],
      transition: {
        eyebrow: 'Concept complete',
        title: 'You know the analysis workflow.',
        body: 'Last: what responsible analysts do — and don’t do — with people’s data.',
      },
    },
    {
      id: 'ethics-privacy',
      title: 'Ethics and privacy basics',
      activities: [
        {
          id: 'ethics-privacy-learn',
          type: 'article',
          content: {
            title: 'Having access to data does not mean you should use all of it',
            intro: 'Analysts often work with information connected to real people. Good analysis requires more than getting the calculation right — it also requires using data responsibly.',
            table: {
              columns: NORTHSTAR_CUSTOMER_COLUMNS,
              rows: NORTHSTAR_CUSTOMER_ROWS,
              rowKey: 'order_id',
              caption: 'Northstar’s full customer file — more than most questions actually need.',
            },
            sections: [
              { title: 'Use what you need', body: 'If an analysis doesn’t require a person’s email address, don’t include it unnecessarily.' },
              { title: 'Protect personal information', body: 'Names, phone numbers, email addresses, and similar identifiers shouldn’t casually appear in shared analysis files.' },
              { title: 'Respect purpose and permission', body: 'Data collected for one purpose shouldn’t automatically be treated as permission for every other possible use.' },
              { title: 'Communicate honestly', body: 'Don’t hide limitations or manipulate results because a stakeholder prefers a different answer.' },
            ],
            diagram: {
              title: 'From raw data to a shared result',
              body: 'Each stage removes what the question doesn’t actually need.',
              label: 'Raw customer data becomes an analysis dataset with unnecessary personal fields removed, then a shared result',
              nodes: ['Raw customer data', 'Remove unnecessary personal fields', 'Analysis dataset', 'Shared result'],
            },
            next: {
              title: 'Check ethics and privacy',
              body: 'Decide what a question actually needs — and what it doesn’t.',
            },
          },
        },
        {
          id: 'ethics-privacy-check',
          type: 'quiz',
          content: {
            title: 'Check ethics and privacy',
            intro: 'Use only what the question in front of you actually requires.',
            questions: [
              {
                id: 'ep-q1',
                type: 'multiple-choice',
                prompt: 'You need to compare average delivery time by customer segment. Which fields do you need?',
                options: [
                  [{ code: 'customer_name' }, ' + ', { code: 'customer_email' }],
                  [{ code: 'phone_number' }, ' + ', { code: 'customer_email' }],
                  [{ code: 'customer_segment' }, ' + ', { code: 'delivery_minutes' }],
                  [{ code: 'customer_name' }, ' + ', { code: 'phone_number' }],
                ],
                correctIndex: 2,
                explanation: 'The question can be answered without exposing any personal contact information.',
              },
              {
                id: 'ep-q2',
                type: 'multiple-choice',
                prompt: 'A manager asks you to remove results that make their team look bad. What should you do?',
                options: ['Remove them to keep the peace', 'Keep the analysis honest and explain the result and its limitations', 'Only show good months', 'Delete the raw data'],
                correctIndex: 1,
                explanation: 'A responsible analyst reports what the data actually shows, limitations included.',
              },
            ],
          },
        },
        {
          id: 'ethics-privacy-practice',
          type: 'practice',
          content: {
            eyebrow: 'Hands-on',
            title: 'Prepare a safe analysis file',
            instruction: 'Northstar wants to understand delivery time by customer segment. Choose only the fields needed for the analysis.',
            mode: 'field-select',
            columns: NORTHSTAR_CUSTOMER_COLUMNS,
            required: ['customer_segment', 'delivery_minutes'],
            optional: ['city'],
            prepareLabel: 'Prepare dataset',
            successBody: 'Good analysts remove unnecessary exposure before they start sharing results.',
            hints: [
              'Start with only the fields this specific question needs.',
              'Northstar’s question is about segment and delivery time — nothing about who the customer is.',
              'customer_segment and delivery_minutes are the two fields this needs.',
            ],
          },
        },
      ],
    },
  ],
  completion: {
    eyebrow: 'Tile complete',
    title: 'You now know how an analyst approaches data before the tools begin.',
    body: 'Before analyzing data: ask a clear question, check for missing, duplicate, inconsistent, or impossible values, clean what needs attention, then communicate honestly — and only use what a question actually needs.',
    enablePodcast: true,
    reinforcementConceptId: 'data-quality-checks',
  },
}

export const videoEditingLesson = {
  id: 'video-editing-basics',
  title: 'How video editing works',
  role: 'video_editor',
  concepts: [{
    id: 'video-editing-basics-foundations',
    title: 'Video editing foundations',
    activities: [
      {
        id: 'video-editing-basics-learn',
        type: 'article',
        content: {
          title: 'Video editing foundations',
          intro: 'Video editing turns selected images and sounds into a sequence with a clear purpose, feeling, and flow.',
          sections: [
            { title: 'Start with the story', body: 'Before choosing transitions or effects, decide what the viewer should understand or feel. That purpose guides which footage belongs in the edit.' },
            { title: 'Selection and timing create meaning', body: 'Editors choose the strongest moments, place them in a useful order, and adjust timing so each cut helps the viewer follow the story.' },
          ],
          next: { title: 'Check video editing foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'video-editing-basics-check',
        type: 'quiz',
        content: {
          title: 'Check video editing foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'video-editing-basics-q1',
            type: 'multiple-choice',
            prompt: 'You receive an hour of footage for a 60 second story. What should you do first?',
            options: ['Add effects to every clip', 'Define the story and select footage that supports it', 'Use the clips in the order they were filmed', 'Choose music before watching the footage'],
            correctIndex: 1,
            explanation: 'The story and audience give you a reason to include or remove each piece of footage.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand video editing foundations!',
    body: 'You learned how purpose, selection, order, and timing shape raw footage into a clear story.',
  },
}

export const contentCreationLesson = {
  id: 'content-creation-basics',
  title: 'How content creation works',
  role: 'content_creator',
  concepts: [{
    id: 'content-creation-basics-foundations',
    title: 'Content creation foundations',
    activities: [
      {
        id: 'content-creation-basics-learn',
        type: 'article',
        content: {
          title: 'Content creation foundations',
          intro: 'Useful content gives a specific audience a clear reason to watch, read, save, or share.',
          sections: [
            { title: 'Know who it is for', body: 'A focused audience makes the idea easier to shape. Start with a real question, need, or interest instead of trying to speak to everyone.' },
            { title: 'Make one clear promise', body: 'Strong content tells the audience what they will learn, feel, or be able to do, then delivers that value in a suitable format.' },
          ],
          next: { title: 'Check content creation foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'content-creation-basics-check',
        type: 'quiz',
        content: {
          title: 'Check content creation foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'content-creation-basics-q1',
            type: 'multiple-choice',
            prompt: 'Which is the strongest starting point for a new piece of content?',
            options: ['A trend everyone else is copying', 'A clear audience question you can answer well', 'The most expensive camera available', 'A format with no defined purpose'],
            correctIndex: 1,
            explanation: 'A real audience question provides both relevance and a clear promise for the content.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand content creation foundations!',
    body: 'You learned how audience, purpose, format, and a clear promise shape useful content.',
  },
}

export const socialMediaLesson = {
  id: 'social-media-basics',
  title: 'How social media management works',
  role: 'social_media_manager',
  concepts: [{
    id: 'social-media-basics-foundations',
    title: 'Social media foundations',
    activities: [
      {
        id: 'social-media-basics-learn',
        type: 'article',
        content: {
          title: 'Social media foundations',
          intro: 'Social media management connects what an audience values with a clear organisation goal and a healthy community.',
          sections: [
            { title: 'Give each channel a job', body: 'A channel should have a clear audience, purpose, and role. Posting everywhere without a reason creates work without creating value.' },
            { title: 'Measure the useful action', body: 'Reach and likes can provide context, but the best measure depends on the goal, such as useful replies, event signups, qualified visits, or retained community members.' },
          ],
          next: { title: 'Check social media foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'social-media-basics-check',
        type: 'quiz',
        content: {
          title: 'Check social media foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'social-media-basics-q1',
            type: 'multiple-choice',
            prompt: 'A team wants more event registrations. Which result is most useful to track?',
            options: ['How many posts were published', 'Event registrations attributed to social content', 'The total number of emojis used', 'Whether every channel used identical copy'],
            correctIndex: 1,
            explanation: 'The measure should connect directly to the goal the social work is meant to support.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand social media foundations!',
    body: 'You learned how audience value, channel purpose, community, and measurable goals work together.',
  },
}

export const graphicDesignLesson = {
  id: 'graphic-design-basics',
  title: 'How graphic design works',
  role: 'graphic_designer',
  concepts: [{
    id: 'graphic-design-basics-foundations',
    title: 'Graphic design foundations',
    activities: [
      {
        id: 'graphic-design-basics-learn',
        type: 'article',
        content: {
          title: 'Graphic design foundations',
          intro: 'Graphic design organises type, image, colour, and space so a message is clear, useful, and memorable.',
          sections: [
            { title: 'Hierarchy guides attention', body: 'Scale, weight, contrast, and position tell people what to notice first, what supports it, and what action or detail comes next.' },
            { title: 'Composition supports the message', body: 'Alignment, spacing, and grouping create relationships between elements. Every visual choice should help the intended audience understand the message.' },
          ],
          next: { title: 'Check graphic design foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'graphic-design-basics-check',
        type: 'quiz',
        content: {
          title: 'Check graphic design foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'graphic-design-basics-q1',
            type: 'multiple-choice',
            prompt: 'A poster has five messages competing at the same size and weight. What should the designer do first?',
            options: ['Add more colours', 'Choose the primary message and create a clear hierarchy', 'Make every message bold', 'Remove all spacing'],
            correctIndex: 1,
            explanation: 'A clear primary message gives the design an intentional reading order.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand graphic design foundations!',
    body: 'You learned how hierarchy, composition, type, and colour guide attention and communicate meaning.',
  },
}
