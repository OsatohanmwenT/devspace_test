export const lessonContent = {
  regionLabel: 'Terrain 2',
  heading: 'Programming Foundations with Python',
  bodyParagraphs: [
    'Learn core Python syntax by writing a real, working script.',
    'This terrain contributes to your Personal Data Calculator.',
    'Use the evidence in this lesson to make the next action clear and explainable.',
  ],
  devyQuestion: 'What should guide your work in programming foundations with python?',
  devyOptions: [
    'The clearest available evidence',
    'A guess',
    'The longest possible answer',
    'An unrelated task',
  ],
  introCornerMessage: "New terrain starts here. Ask Devy if the vocabulary doesn't click.",
  exercise: {
    instruction: 'Drive forward and deliver the package.',
    tag: { label: 'Solitary', superscript: 'ST' },
    remainingLabel: '1 left',
    commands: [
      { id: 'drive-forward', verb: 'drive', object: 'forward' },
      { id: 'deliver-package', verb: 'deliver', object: 'package' },
    ],
    correctSequence: ['drive-forward', 'deliver-package'],
    cornerMessage: 'You know how to move the truck around.',
    chatHistory: [
      { id: 1, text: 'You know how to move the truck around.' },
      { id: 2, text: "Let's add a new command: delivering packages." },
      { id: 3, text: 'Drive forward and deliver the package.', active: true },
    ],
  },
}

export const programExecutionArticle = {
  title: 'Program execution',
  intro: 'A Python program is a set of instructions that the computer follows in order.',
  video: {
    title: 'Hello, programs!',
    subtitle: 'Program execution',
    duration: '3:12',
    badgeLabel: 'PY',
  },
  sections: [
    {
      title: 'Programs are instructions',
      body: 'Each line tells Python to do one small thing. When you run a file, Python starts at the top and works through the statements in sequence.',
    },
  ],
  next: {
    title: 'Check the execution order',
    body: 'Use what you just learned to identify how Python works through a file.',
  },
}

export const variablesExpressionsArticle = {
  title: 'Variables and expressions',
  intro: 'Variables give values useful names, while expressions combine those values to produce a result.',
  sections: [
    {
      title: 'Variables keep track of values',
      body: 'A variable gives a value a useful name. Instead of repeating a number, you can store it once and reuse that name in a calculation.',
    },
  ],
  diagram: {
    title: 'How a program flows',
    body: 'A program turns starting values into a useful result through a short chain of instructions.',
    label: 'Weekly hours becomes a named variable, is calculated into yearly hours, then printed as an output',
    nodes: ['Weekly hours', 'Named variable', 'Yearly calculation', 'Printed result'],
  },
  example: {
    title: 'A short program',
    body: 'This program stores weekly learning hours, calculates a yearly total, then displays the answer.',
    code: 'hours_per_week = 6\nyearly_hours = hours_per_week * 52\nprint(yearly_hours)',
  },
  next: {
    title: 'Your first calculation',
    body: 'Check your understanding, then use these building blocks to finish and run a short Python program.',
  },
}

export const programExecutionQuiz = {
  title: 'Check program execution',
  intro: 'Show that you understand how Python works through a file before moving on.',
  questions: [
    {
      id: 'q1',
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
  ],
}

export const variablesExpressionsQuiz = {
  title: 'Check variables and expressions',
  intro: 'Answer these questions before applying the concept in code.',
  questions: [
    {
      id: 'q2',
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
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: 'In `yearly_hours = hours_per_week * 52`, what does `yearly_hours` become?',
      options: [
        'A copy of the number 52',
        'The result of multiplying hours_per_week by 52',
        'An error, since hours_per_week is undefined',
        'The string "hours_per_week * 52"',
      ],
      correctIndex: 1,
      explanation: 'The expression on the right is evaluated first, then stored in yearly_hours.',
    },
  ],
}

export const writingProgramsClickFillQuiz = {
  title: 'Fill in the program',
  intro: 'Use the variables and values from this lesson to complete the calculation.',
  questions: [
    {
      id: 'q4',
      type: 'fill',
      prompt: 'Fill in the blanks to complete the program.',
      segments: ['A variable named ', ' stores the value calculated by ', ' multiplied by ', '.'],
      answers: ['yearly_hours', 'hours_per_week', '52'],
      options: ['yearly_hours', 'hours_per_week', '52'],
      explanation: 'yearly_hours stores the result of hours_per_week multiplied by 52.',
    },
  ],
}

export const writingProgramsLesson = {
  id: 'writing-programs',
  title: 'Writing programs',
  concepts: [
    {
      id: 'program-execution',
      title: 'Program execution',
      activities: [
        { id: 'program-execution-learn', type: 'article', content: programExecutionArticle },
        { id: 'program-execution-check', type: 'quiz', content: programExecutionQuiz },
      ],
      transition: {
        eyebrow: 'Concept complete',
        title: 'Great work—you finished Program execution!',
        body: 'Next, you’ll learn how Python stores and works with values.',
      },
    },
    {
      id: 'variables-expressions',
      title: 'Variables and expressions',
      activities: [
        { id: 'variables-expressions-learn', type: 'article', content: variablesExpressionsArticle },
        { id: 'variables-expressions-check', type: 'quiz', content: variablesExpressionsQuiz },
        { id: 'variables-expressions-fill', type: 'quiz', content: writingProgramsClickFillQuiz },
        { id: 'variables-expressions-code', type: 'coding' },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'Lesson complete!',
    body: 'You learned how Python runs instructions and uses variables in calculations.',
  },
}
