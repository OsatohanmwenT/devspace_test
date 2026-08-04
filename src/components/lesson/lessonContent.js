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
      body: [
        'Each line tells Python to do one small thing. When you run a file, Python starts at the ',
        { strong: 'top' },
        ' and works through the statements in sequence — so ',
        { code: 'print("first")' },
        ' really does run before the line beneath it.',
      ],
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
      body: [
        'A variable gives a value a useful name. Instead of repeating a number, store it once as ',
        { code: 'hours_per_week' },
        ' and reuse that name wherever the calculation needs it.',
      ],
    },
    {
      title: 'Names use snake case',
      body: [
        'When a name needs more than one word, join them with underscores — ',
        { code: 'home_city' },
        ', not ',
        { code: 'homeCity' },
        '. Python programmers call this ',
        { strong: 'snake case' },
        '.',
      ],
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
    body: 'Check your understanding, then use these building blocks to finish a short Python program.',
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
      prompt: 'What do computers use variables for?',
      options: [
        'To display information on the screen',
        'To store information for later use',
        'To make the program run faster',
        'To hide values from the console',
      ],
      correctIndex: 1,
      explanation: 'A variable names a value once so you can reuse it in later calculations.',
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: [{ code: 'yearly_hours = hours_per_week * 52' }, ' — what does ', { code: 'yearly_hours' }, ' become?'],
      options: [
        'A copy of the number 52',
        [{ code: 'hours_per_week' }, ' multiplied by 52'],
        [{ code: 'hours_per_week' }, ' is undefined, so this errors'],
        'The text of the expression itself',
      ],
      correctIndex: 1,
      explanation: 'The expression on the right is evaluated first, then stored in yearly_hours.',
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: 'How does snake case format multiple words when creating a variable name?',
      options: [
        [{ strong: 'Using capital letters' }, ' — ', { code: 'myVariableName' }],
        [{ strong: 'Using underscores' }, ' — ', { code: 'my_variable_name' }],
      ],
      correctIndex: 1,
      explanation: 'Snake case joins words with underscores and keeps every letter lowercase.',
    },
  ],
}

export const writingProgramsClickFillQuiz = {
  title: 'Fill in the program',
  intro: 'Use the variables and values from this lesson to complete the calculation.',
  questions: [
    {
      id: 'q5',
      type: 'fill',
      prompt: 'Fill in the blanks to complete the sentence.',
      segments: ['A variable named ', ' stores the value calculated by ', ' multiplied by ', '.'],
      answers: ['yearly_hours', 'hours_per_week', '52'],
      options: ['yearly_hours', 'hours_per_week', '52'],
      explanation: 'yearly_hours stores the result of hours_per_week multiplied by 52.',
    },
    {
      id: 'q6',
      type: 'code-fill',
      filename: 'warmup.py',
      prompt: 'Finish the program so it prints the yearly total.',
      segments: [
        '# Weekly learning hours\nhours_per_week = 6\n\n# Multiply by the weeks in a year\nyearly_hours = ',
        ' * 52\n\n# Show the result\nprint(',
        ')',
      ],
      answers: ['hours_per_week', 'yearly_hours'],
      options: ['hours_per_week', 'yearly_hours'],
      explanation: 'The expression reads hours_per_week, multiplies it by 52, and stores it in yearly_hours — which is what print then shows.',
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
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'Lesson complete!',
    body: 'You learned how Python runs instructions and uses variables in calculations.',
  },
}

export const dataTypesArticle = {
  title: 'Values have types',
  intro: 'Every value in Python has a type, and the type decides what you can do with it.',
  sections: [
    {
      title: 'Three types to start with',
      body: [
        'Text is a ',
        { strong: 'string' },
        ' and goes in quotes — ',
        { code: '"word"' },
        '. Whole numbers are ',
        { strong: 'integers' },
        ' like ',
        { code: '42' },
        '. And ',
        { code: 'True' },
        ' or ',
        { code: 'False' },
        ' is a ',
        { strong: 'boolean' },
        '.',
      ],
    },
    {
      title: 'Types change what happens',
      body: [
        { code: '2 + 2' },
        ' gives ',
        { code: '4' },
        ', but ',
        { code: '"2" + "2"' },
        ' gives ',
        { code: '"22"' },
        ' — the same operator behaves differently depending on the type.',
      ],
    },
  ],
  example: {
    title: 'One of each',
    body: 'Three variables, three different types.',
    code: 'name = "Ada"\nage = 36\nis_learning = True\nprint(name, age, is_learning)',
  },
  next: {
    title: 'Check what you know',
    body: 'Identify the types before you use them in code.',
  },
}

export const dataTypesQuiz = {
  title: 'Check data types',
  intro: 'Match each value to the type Python gives it.',
  questions: [
    {
      id: 'dt1',
      type: 'multiple-choice',
      prompt: [{ code: '"42"' }, ' — what type is this value?'],
      options: [
        [{ strong: 'Integer' }, ' — a whole number'],
        [{ strong: 'String' }, ' — text in quotes'],
        [{ strong: 'Boolean' }, ' — true or false'],
      ],
      correctIndex: 1,
      explanation: 'The quotes make it a string. Without them, 42 would be an integer.',
    },
    {
      id: 'dt2',
      type: 'code-fill',
      filename: 'types.py',
      prompt: 'Give each variable a value of the right type.',
      segments: ['name = ', '\nage = ', '\nis_learning = ', ''],
      answers: ['"Ada"', '36', 'True'],
      options: ['"Ada"', '36', 'True'],
      explanation: 'A string in quotes, an integer with no quotes, and a boolean written with a capital T.',
    },
  ],
}

export const dataTypesLesson = {
  id: 'data-types',
  title: 'Data types',
  concepts: [
    {
      id: 'value-types',
      title: 'Values have types',
      activities: [
        { id: 'value-types-learn', type: 'article', content: dataTypesArticle },
        { id: 'value-types-check', type: 'quiz', content: dataTypesQuiz },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'Lesson complete!',
    body: 'You can now tell strings, integers and booleans apart — and you know why it matters.',
  },
}

const lessons = [writingProgramsLesson, dataTypesLesson]

export const lessonsById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]))

export function getLesson(lessonId) {
  return lessonsById[lessonId] ?? null
}
