import { contentCreationLesson, dataAnalysisLesson, digitalMarketingLesson, graphicDesignLesson, socialMediaLesson, technicalTeamsLesson, videoEditingLesson } from './nonCodingLessons.js'

export const programExecutionArticle = {
  title: 'Program execution',
  intro: 'A Python program is a set of instructions that the computer follows in order.',
  spokenIntro: 'Here’s the whole secret to reading Python code: it’s just a to-do list.',
  video: {
    title: 'Hello, programs!',
    subtitle: 'Program execution',
    duration: '3:12',
    badgeLabel: 'PY',
    // Opening minutes of freeCodeCamp's "Learn Python - Full Course for
    // Beginners" — hello world and running your first script, matching this
    // concept's intro-to-execution scope.
    videoId: 'rfscVS0vtbw',
    segments: [{ id: 'intro', label: 'Getting started', startSeconds: 0, endSeconds: 192 }],
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
      spoken: 'Each line tells Python to do one small thing, and it works through them top to bottom — in order, no shuffling. So if print of "first" is on line one, that genuinely is the first thing that happens. Python’s not being clever here, it’s being polite: first come, first served.',
    },
    {
      title: 'What happens when something goes wrong',
      body: [
        'Python doesn’t skip a broken line and carry on — it runs everything up to the mistake, then stops right there. Nothing after that line runs, and nothing before it gets undone.',
      ],
      spoken: 'One more thing worth knowing early: Python doesn’t skip a broken line and carry on. If line four has a mistake, lines one through three still run just fine — then Python stops cold at line four. Nothing after it runs. Good news is, that makes bugs easy to find: the error is always exactly where it stopped.',
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
  spokenIntro: 'A variable is a label, not a box — you’re not stuffing a value into a container, you’re just giving it a name so you can call on it later. Nobody wants to type the same number nineteen times in one program.',
  sections: [
    {
      title: 'Variables keep track of values',
      body: [
        'A variable gives a value a useful name. Instead of repeating a number, store it once as ',
        { code: 'hours_per_week' },
        ' and reuse that name wherever the calculation needs it.',
      ],
      spoken: 'A variable gives a value a useful name. Instead of repeating a number, you store it once — as hours_per_week, say — and reuse that name wherever the calculation needs it.',
    },
    {
      title: 'Variables can change',
      body: [
        'A variable isn’t locked to its first value — assign it again and the old value is simply replaced. ',
        { code: 'score = 10' },
        ' followed later by ',
        { code: 'score = score + 5' },
        ' leaves ',
        { code: 'score' },
        ' holding ',
        { code: '15' },
        ' — the name didn’t change, only what it points to did.',
      ],
      spoken: 'One thing that trips people up: a variable isn’t locked to its first value. Assign it again, and the old value just gets replaced. If score starts at 10 and you later write score equals score plus 5, score becomes 15. The name didn’t change — only what it’s pointing to changed.',
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

export const namingCommentsArticle = {
  title: 'Naming and comments',
  intro: 'Code is read far more often than it’s written — a clear name and a short comment save the next reader real time.',
  spokenIntro: 'Quick style detour — and I promise this one actually matters once you’re working with other people’s code, or your own code a week from now.',
  sections: [
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
      spoken: 'When a name needs more than one word, Python folks join them with underscores: home_city, not homeCity. It’s called snake_case — yes, because it kind of looks like it’s slithering. Every language has its own house style; this one’s Python’s.',
    },
    {
      title: 'Comments explain the why',
      body: [
        'A line starting with ',
        { code: '#' },
        ' is a comment — Python skips it completely when running the program. Comments don’t change what the code does; they tell the next reader ',
        { strong: 'why' },
        ' it does it.',
      ],
      spoken: 'A line that starts with a hash mark is a comment. Python skips it entirely when the program runs — it’s there for humans, not the computer. The best comments don’t repeat what the code obviously does, they explain why it’s doing it that way.',
    },
  ],
  example: {
    title: 'A commented calculation',
    body: 'The comments explain the plan; the code carries it out.',
    code: '# Weekly learning hours\nhours_per_week = 6\n\n# Multiply by the weeks in a year\nyearly_hours = hours_per_week * 52',
  },
  next: {
    title: 'Check what you know',
    body: 'One question on naming before you put everything together.',
  },
}

export const puttingItTogetherArticle = {
  title: 'Putting it together',
  intro: 'Every program you’ve seen so far follows the same shape — time to prove you can finish one yourself.',
  spokenIntro: 'Three lines. Store it, calculate it, show it — that’s the whole rhythm of basically every beginner Python program you’ll write.',
  sections: [
    {
      title: 'The pattern so far',
      body: [
        'Store a value, calculate something from it, then show the result — the same three-line shape you’ve now seen with ',
        { code: 'hours_per_week' },
        ' and ',
        { code: 'yearly_hours' },
        '. A comment or two and a clear, snake_case name make that shape easy for someone else — or future you — to follow.',
      ],
      spoken: 'Add a comment or two and a clear name to that same three-line shape, and anyone can follow along — including future you.',
    },
  ],
  next: {
    title: 'Finish the program',
    body: 'Use everything from this lesson to complete a real program.',
  },
}

export const programExecutionQuiz = {
  title: 'Check program execution',
  intro: 'Show that you understand how Python works through a file before moving on.',
  spokenIntro: 'Alright, quick check — one question. Honestly, if you were listening just now, this one’s basically a gimme.',
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
  intro: 'Answer this question before applying the concept in code.',
  spokenIntro: 'Straightforward one — think about why you’d bother naming something in the first place.',
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
  ],
}

export const namingCommentsQuiz = {
  title: 'Check naming',
  intro: 'One question on how Python names are written.',
  spokenIntro: 'This one’s basically vibes at this point — you’ve just seen the pattern.',
  questions: [
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

export const variablesExpressionsFillQuiz = {
  title: 'Fill in the program',
  intro: 'Use the variables and values from this lesson to complete the sentence.',
  spokenIntro: 'Same program you just saw — but now you’re filling in the blanks instead of me handing it to you.',
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
  ],
}

export const writingProgramsClickFillQuiz = {
  title: 'Finish the program',
  intro: 'Use the variables and values from this lesson to complete the calculation.',
  spokenIntro: 'Last one, and this time it’s real code, not a sentence. Same idea though: hours_per_week times 52 goes into yearly_hours, then you print it.',
  questions: [
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
        { id: 'variables-expressions-fill', type: 'quiz', content: variablesExpressionsFillQuiz },
      ],
      transition: {
        eyebrow: 'Concept complete',
        title: 'Nice — Variables and expressions is done!',
        body: 'Next, a quick style detour: naming things well and leaving a note for later.',
      },
    },
    {
      id: 'naming-comments',
      title: 'Naming and comments',
      activities: [
        { id: 'naming-comments-learn', type: 'article', content: namingCommentsArticle },
        { id: 'naming-comments-check', type: 'quiz', content: namingCommentsQuiz },
      ],
      transition: {
        eyebrow: 'Concept complete',
        title: 'Naming and comments — done!',
        body: 'Last stop: put everything from this lesson into one finished program.',
      },
    },
    {
      id: 'putting-it-together',
      title: 'Putting it together',
      activities: [
        { id: 'putting-it-together-learn', type: 'article', content: puttingItTogetherArticle },
        { id: 'putting-it-together-check', type: 'quiz', content: writingProgramsClickFillQuiz },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'Lesson complete!',
    body: 'You learned how Python runs instructions, stores values in variables, names them clearly, and used all of it to finish a real program.',
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

const lessons = [writingProgramsLesson, dataTypesLesson, technicalTeamsLesson, digitalMarketingLesson, dataAnalysisLesson, videoEditingLesson, contentCreationLesson, socialMediaLesson, graphicDesignLesson]

export const lessonsById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]))

export function getLesson(lessonId) {
  return lessonsById[lessonId] ?? null
}
