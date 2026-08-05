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
          example: 'name = "Devy"\nprint(name)\n# Devy',
          mistake: 'Do not assume every line runs at once. A later line can only use values created before it.',
        },
        guidebook: {
          mentalModel: 'Think of Python as following a written recipe. It starts with the first instruction, completes it, then moves to the next.',
          walkthrough: 'The first line stores the text "Devy" under the name user. The second line reads that stored value and prints it.',
          code: 'user = "Devy"\nprint(user)\n# Devy',
          why: 'Every statement runs against the state left by the ones before it. That is why moving a line changes what a program does, and why an error on line 3 often comes from something missing on line 1.',
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
          example: 'hours_per_week = 6\nyearly_hours = hours_per_week * 52\n# yearly_hours is now 312',
          mistake: 'The single equals sign assigns a value. It does not ask whether two values are equal.',
        },
        guidebook: {
          mentalModel: 'A variable is a labelled place to find a value again. The label stays readable even when the calculation becomes more complex.',
          walkthrough: 'Python evaluates hours_per_week * 52 first, then stores the result under yearly_hours.',
          code: 'hours_per_week = 6\nyearly_hours = hours_per_week * 52\nprint(yearly_hours)\n# 312',
          why: 'A name never stores a calculation, only the value that calculation produced. Change hours_per_week afterwards and yearly_hours keeps 312 — it is a stored result, not a live formula.',
          mistakes: ['Putting the result name on the wrong side of =', 'Expecting a variable to update itself when a value it was calculated from changes'],
          takeaway: 'Read assignment from right to left: calculate the value, then store it under the name.',
          builtOn: 'program-execution',
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
          example: 'level = 1\nlevel = level + 1\nprint(level)\n# 2',
          mistake: 'Updating a variable is not a permanent equation. Python uses the current value once and stores the new result.',
        },
        guidebook: {
          mentalModel: 'A variable name is a reusable label, not a sealed box. Reassignment moves that label to the newest value.',
          walkthrough: 'level begins as 1. Python reads that current value, adds 1, then assigns the result 2 back to level.',
          code: 'level = 1\nlevel = level + 1\nprint(level)\n# 2',
          why: 'level = level + 1 looks impossible as maths, and it would be. It works because the two sides happen at different moments: Python finishes reading the right side before the name on the left is repointed.',
          mistakes: ['Expecting the original value to remain after reassignment', 'Reading level = level + 1 as an equation to solve rather than a step to perform'],
          takeaway: 'Reassignment lets a program remember how a value changes over time.',
          builtOn: 'variables-expressions',
        },
      },
      {
        id: 'printing-reading-input',
        lessonId: 'input-output',
        lessonTitle: 'Input and Output',
        title: 'Printing and reading input',
        cheatsheet: {
          rule: 'input() reads text from whoever is running the program, and print() displays a value back to them.',
          syntax: 'value = input("Prompt: ")\nprint(value)',
          example: 'name = input("Your name: ")\nprint("Hello", name)\n# Your name: Ada\n# Hello Ada',
          mistake: 'input() always returns text, even when the person types digits. Convert it with int() or float() before doing numeric calculations.',
        },
        guidebook: {
          mentalModel: 'Input and output form a conversation: the program asks, stores the response, then uses or displays it.',
          walkthrough: 'The prompt waits for a response. input() returns that response as text, which is stored in age_text before conversion.',
          code: 'age_text = input("Age: ")\nage = int(age_text)\nprint(age + 1)\n# Age: 29\n# 30',
          why: 'input() has no way to know what you meant to type, so it hands back text every time. Without int(), "29" + 1 is not a sum Python can do — the conversion is what turns a reply into something you can calculate with.',
          mistakes: ['Trying to add a number directly to input text', 'Printing a variable before input has assigned it'],
          takeaway: 'Receive text, convert when necessary, then use or display the result.',
          builtOn: 'assigning-updating-values',
        },
      },
      {
        id: 'comparisons-booleans',
        lessonId: 'program-flow',
        lessonTitle: 'Program Flow',
        title: 'Comparisons and booleans',
        cheatsheet: {
          rule: 'A comparison produces True or False, which a program can use to make a decision.',
          syntax: 'is_equal = a == b\nis_bigger = a > b\n# also: != , < , <= , >=',
          example: 'score = 80\npassed = score >= 70\nprint(passed)\n# True',
          mistake: 'Use == to compare two values. A single = assigns a value instead.',
        },
        guidebook: {
          mentalModel: 'A comparison is a yes-or-no question asked by the program. Its answer is a boolean value: True or False.',
          walkthrough: 'Python compares score with 70. Because 80 is greater than or equal to 70, passed becomes True.',
          code: 'score = 80\npassed = score >= 70\nprint(passed)\n# True',
          why: 'A comparison reads its two values and leaves both untouched, producing a brand new True or False. That is why you can store the answer in a variable and reuse it without disturbing what you compared.',
          mistakes: ['Confusing assignment = with equality ==', 'Comparing incompatible values such as unconverted input text and a number'],
          takeaway: 'Comparisons turn relationships between values into decisions a program can use.',
          builtOn: 'variables-expressions',
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
          example: 'score = 65\nif score >= 70:\n    print("Passed")\nelse:\n    print("Keep going")\n# Keep going',
          mistake: 'The colon and indentation are required. They show which statements belong to each branch.',
        },
        guidebook: {
          mentalModel: 'A conditional is a fork in the program. Python tests each route in order and follows the first one whose condition is True.',
          walkthrough: 'Here score is 65, so score >= 70 is False. Python skips the indented block under if and runs the else block instead.',
          code: 'score = 65\nif score >= 70:\n    print("Passed")\nelse:\n    print("Keep going")\n# Keep going',
          why: 'The branches are alternatives, not a list of checks — once one runs, the rest are skipped entirely. Order therefore decides the outcome when more than one condition could be True.',
          mistakes: ['Forgetting the colon after a condition', 'Misaligning statements that should belong to the same branch'],
          takeaway: 'Conditions let the same program respond differently to different values.',
          builtOn: 'comparisons-booleans',
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
