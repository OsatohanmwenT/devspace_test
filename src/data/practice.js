export const practiceTopics = ['All', 'Python', 'SQL', 'Git', 'Data', 'Theory']

export const practiceSessions = [
  {
    id: 'python-basics-warmup',
    title: 'Python Basics Warm-Up',
    topic: 'Python',
    minutes: 4,
    questions: [
      {
        id: 'py-1',
        type: 'multiple-choice',
        prompt: 'What order does Python follow when it runs a file?',
        options: [
          'Top to bottom, one statement at a time',
          'Whichever line is shortest first',
          'Bottom to top',
          'A random order each run',
        ],
        correctIndex: 0,
        explanation: 'Python starts at the top of the file and works through statements in sequence.',
      },
      {
        id: 'py-2',
        type: 'fill',
        prompt: 'Fill in the blanks to complete the assignment.',
        segments: ['A variable named ', ' stores the value calculated by ', ' multiplied by ', '.'],
        answers: ['yearly_hours', 'hours_per_week', '52'],
        options: ['yearly_hours', 'hours_per_week', '52'],
        explanation: 'yearly_hours stores the result of hours_per_week multiplied by 52.',
      },
    ],
  },
  {
    id: 'python-variables-drill',
    title: 'Variables & Naming',
    topic: 'Python',
    minutes: 3,
    questions: [
      {
        id: 'py-3',
        type: 'multiple-choice',
        prompt: 'Why use a variable instead of repeating a number?',
        options: [
          'It makes the program run faster',
          'It gives the value a useful name you can reuse',
          'Python requires every number to be a variable',
          'It hides the value from the console',
        ],
        correctIndex: 1,
        explanation: 'A variable names a value once so you can reuse it in later calculations.',
      },
    ],
  },
  {
    id: 'sql-select-basics',
    title: 'SELECT Statement Basics',
    topic: 'SQL',
    minutes: 5,
    questions: [
      {
        id: 'sql-1',
        type: 'multiple-choice',
        prompt: 'Which clause filters rows before they are grouped?',
        options: ['GROUP BY', 'HAVING', 'WHERE', 'ORDER BY'],
        correctIndex: 2,
        explanation: 'WHERE filters individual rows before any grouping happens; HAVING filters after grouping.',
      },
      {
        id: 'sql-2',
        type: 'fill',
        prompt: 'Fill in the blanks to complete the query.',
        segments: ['', ' name ', ' users ', ' age > 18;'],
        answers: ['SELECT', 'FROM', 'WHERE'],
        options: ['SELECT', 'FROM', 'WHERE'],
        explanation: 'SELECT the column, FROM the table, WHERE the condition holds.',
      },
    ],
  },
  {
    id: 'git-commit-flow',
    title: 'Everyday Git Commands',
    topic: 'Git',
    minutes: 4,
    questions: [
      {
        id: 'git-1',
        type: 'multiple-choice',
        prompt: 'Which command stages a file for the next commit?',
        options: ['git commit', 'git add', 'git push', 'git status'],
        correctIndex: 1,
        explanation: 'git add stages changes; git commit then records the staged snapshot.',
      },
    ],
  },
  {
    id: 'data-cleaning-check',
    title: 'Spotting Messy Data',
    topic: 'Data',
    minutes: 5,
    questions: [
      {
        id: 'data-1',
        type: 'multiple-choice',
        prompt: 'A column of ages contains the value -5. What is this an example of?',
        options: [
          'A perfectly valid data point',
          'An invalid value that needs cleaning',
          'A missing value',
          'A duplicate row',
        ],
        correctIndex: 1,
        explanation: 'A negative age is impossible, so it signals bad data that needs cleaning or removal.',
      },
      {
        id: 'data-2',
        type: 'fill',
        prompt: 'Fill in the blanks to describe the cleaning step.',
        segments: ['Rows with ', ' values are often ', ' or filled with a placeholder.'],
        answers: ['missing', 'dropped'],
        options: ['missing', 'dropped'],
        explanation: 'Missing values are typically dropped or imputed depending on the analysis.',
      },
    ],
  },
  {
    id: 'theory-algorithms-intro',
    title: 'Thinking in Algorithms',
    topic: 'Theory',
    minutes: 3,
    questions: [
      {
        id: 'theory-1',
        type: 'multiple-choice',
        prompt: 'What best describes an algorithm?',
        options: [
          'A programming language',
          'A step-by-step procedure for solving a problem',
          'A type of database',
          'A hardware component',
        ],
        correctIndex: 1,
        explanation: 'An algorithm is a finite, well-defined sequence of steps to solve a problem.',
      },
    ],
  },
]
