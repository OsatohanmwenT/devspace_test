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
