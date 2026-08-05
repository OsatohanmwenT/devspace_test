export const learningResources = {
  'python-foundations': {
    topics: [
      {
        id: 'program-execution',
        lessonId: 'writing-programs',
        lessonTitle: 'Writing Programs',
        title: 'Program execution',
        cheatsheet: {
          rule: 'Python reads a program from top to bottom and runs one statement at a time.',
          syntax: 'print("First")\nprint("Second")',
          example: 'name = "Devy"\nprint(name)',
          mistake: 'Do not assume every line runs at once. A later line can only use values created before it.',
        },
        guidebook: {
          mentalModel: 'Think of Python as following a written recipe. It starts with the first instruction, completes it, then moves to the next.',
          walkthrough: 'The first line stores the text "Devy" under the name user. The second line reads that stored value and prints it.',
          code: 'user = "Devy"\nprint(user)',
          why: 'The assignment runs before print(user), so the name user already points to a value when Python reaches the second line.',
          mistakes: ['Using a name before assigning a value to it', 'Expecting Python to jump between lines without a control statement'],
          takeaway: 'Order matters: each statement changes what the next statement can use.',
        },
      },
      {
        id: 'variables-expressions',
        lessonId: 'writing-programs',
        lessonTitle: 'Writing Programs',
        title: 'Variables and expressions',
        cheatsheet: {
          rule: 'A variable gives a value a reusable name; an expression combines values to produce a new one.',
          syntax: 'name = value\nresult = value_a + value_b',
          example: 'hours_per_week = 6\nyearly_hours = hours_per_week * 52',
          mistake: 'The single equals sign assigns a value. It does not ask whether two values are equal.',
        },
        guidebook: {
          mentalModel: 'A variable is a labelled place to find a value again. The label stays readable even when the calculation becomes more complex.',
          walkthrough: 'Python evaluates hours_per_week * 52 first, then stores the result under yearly_hours.',
          code: 'hours_per_week = 6\nyearly_hours = hours_per_week * 52\nprint(yearly_hours)',
          why: 'The right side of an assignment is calculated before its result is attached to the name on the left.',
          mistakes: ['Putting the result name on the wrong side of =', 'Using spaces or inconsistent casing in variable names'],
          takeaway: 'Read assignment from right to left: calculate the value, then store it under the name.',
        },
      },
      {
        id: 'assigning-updating-values',
        lessonId: 'using-variables',
        lessonTitle: 'Using Variables',
        title: 'Assigning and updating values',
        cheatsheet: {
          rule: 'Assigning a new value to an existing variable replaces the value that name refers to.',
          syntax: 'score = 10\nscore = score + 5',
          example: 'level = 1\nlevel = level + 1\nprint(level)',
          mistake: 'Updating a variable is not a permanent equation. Python uses the current value once and stores the new result.',
        },
        guidebook: {
          mentalModel: 'A variable name is a reusable label, not a sealed box. Reassignment moves that label to the newest value.',
          walkthrough: 'level begins as 1. Python reads that current value, adds 1, then assigns the result 2 back to level.',
          code: 'level = 1\nlevel = level + 1\nprint(level)  # 2',
          why: 'The right side is evaluated using the old value before the assignment updates the name.',
          mistakes: ['Expecting the original value to remain after reassignment', 'Choosing vague names such as x when a descriptive name is clearer'],
          takeaway: 'Reassignment lets a program remember how a value changes over time.',
        },
      },
      {
        id: 'printing-reading-input',
        lessonId: 'input-output',
        lessonTitle: 'Input and Output',
        title: 'Printing and reading input',
        cheatsheet: {
          rule: 'input() receives text from the learner and print() displays a value.',
          syntax: 'value = input("Prompt: ")\nprint(value)',
          example: 'name = input("Your name: ")\nprint("Hello", name)',
          mistake: 'input() returns text. Convert it with int() or float() before doing numeric calculations.',
        },
        guidebook: {
          mentalModel: 'Input and output form a conversation: the program asks, stores the response, then uses or displays it.',
          walkthrough: 'The prompt waits for a response. input() returns that response as text, which is stored in age_text before conversion.',
          code: 'age_text = input("Age: ")\nage = int(age_text)\nprint(age + 1)',
          why: 'Converting the text to an integer gives Python a numeric value it can add to.',
          mistakes: ['Trying to add a number directly to input text', 'Printing a variable before input has assigned it'],
          takeaway: 'Receive text, convert when necessary, then use or display the result.',
        },
      },
      {
        id: 'comparisons-booleans',
        lessonId: 'program-flow',
        lessonTitle: 'Program Flow',
        title: 'Comparisons and booleans',
        cheatsheet: {
          rule: 'A comparison produces True or False, which a program can use to make a decision.',
          syntax: '==  !=  <  <=  >  >=',
          example: 'score = 80\npassed = score >= 70',
          mistake: 'Use == to compare two values. A single = assigns a value instead.',
        },
        guidebook: {
          mentalModel: 'A comparison is a yes-or-no question asked by the program. Its answer is a boolean value: True or False.',
          walkthrough: 'Python compares score with 70. Because 80 is greater than or equal to 70, passed becomes True.',
          code: 'score = 80\npassed = score >= 70\nprint(passed)',
          why: 'Comparison operators evaluate the relationship between two values rather than changing either value.',
          mistakes: ['Confusing assignment = with equality ==', 'Comparing incompatible values such as unconverted input text and a number'],
          takeaway: 'Comparisons turn relationships between values into decisions a program can use.',
        },
      },
      {
        id: 'conditional-branches',
        lessonId: 'program-flow',
        lessonTitle: 'Program Flow',
        title: 'Conditional branches',
        cheatsheet: {
          rule: 'if, elif and else choose which indented block of code should run.',
          syntax: 'if condition:\n    statement\nelse:\n    statement',
          example: 'if score >= 70:\n    print("Passed")\nelse:\n    print("Keep going")',
          mistake: 'The colon and indentation are required. They show which statements belong to each branch.',
        },
        guidebook: {
          mentalModel: 'A conditional is a fork in the program. Python tests each route in order and follows the first one whose condition is True.',
          walkthrough: 'The if condition is checked first. When it is False, Python skips its indented block and runs the else block.',
          code: 'score = 65\nif score >= 70:\n    print("Passed")\nelse:\n    print("Keep going")',
          why: 'Only one branch in this if/else pair runs, so the output always matches the comparison result.',
          mistakes: ['Forgetting the colon after a condition', 'Misaligning statements that should belong to the same branch'],
          takeaway: 'Conditions let the same program respond differently to different values.',
        },
      },
    ],
  },
}

export function getRegionTopics(regionId) {
  return learningResources[regionId]?.topics ?? []
}

// Reference is what you reach for when you're stuck, so it is never gated —
// looking up syntax mid-lesson is the whole point of a cheatsheet.
export function getLessonTopics(lessonId) {
  return Object.values(learningResources)
    .flatMap((resource) => resource.topics)
    .filter((topic) => topic.lessonId === lessonId)
}
