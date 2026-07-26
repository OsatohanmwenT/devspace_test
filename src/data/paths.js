export const pathShelves = [
  {
    id: 'machine-learning',
    family: 'ml',
    level: 'Career path',
    title: 'Machine Learning Engineer',
    description: 'Build the skills to prepare data, train models and deploy reliable ML systems.',
    progress: '12% complete',
    progressValue: 12,
    emblem: '/assets/scientific-thinking.png',
    cards: [
      { id: 'orientation', title: 'Orientation', state: 'completed', progressValue: 100, image: '/assets/programming-with-variables.png' },
      { id: 'python-foundations', title: 'Python Foundations', state: 'completed', progressValue: 100, image: '/assets/programming-with-variables.png' },
      { id: 'data-math-foundations', title: 'Data & Math Foundations', state: 'current', progress: '35%', progressValue: 35, image: '/assets/probability-and-chance.png' },
      { id: 'eda-features', title: 'EDA & Features', state: 'available', progressValue: 0, image: '/assets/exploring-data-visually.png' },
      { id: 'core-ml', title: 'Core ML', state: 'locked', progressValue: 0, image: '/assets/scientific-thinking.png' },
      { id: 'ml-career-capstone', title: 'ML Career Capstone', state: 'locked', progressValue: 0, image: '/assets/exploring-data-visually.png', capstone: true },
    ],
  },
]

export const currentPath = pathShelves[0]

const currentRegionIndex = currentPath.cards.findIndex((card) => card.state === 'current')
// Fall back to the first card (and no "next" region) if no card is marked current,
// so consumers never dereference an undefined region.
export const currentRegion = currentPath.cards[currentRegionIndex] ?? currentPath.cards[0]
export const nextRegion = currentPath.cards[currentRegionIndex + 1] ?? null

export const detailLevels = [
  {
    level: 'Level 1',
    title: 'Taking the First Steps',
    lessons: [
      { id: 'writing-programs', title: 'Writing Programs', state: 'current', description: 'Turn ideas into simple programs a computer can run.' },
      { id: 'sequencing-commands', title: 'Sequencing Commands', state: 'available', description: 'Put instructions in an order a computer can follow.' },
      { id: 'using-variables', title: 'Using Variables', state: 'available', checkpoint: true, description: 'Store information your programs can use.' },
    ],
  },
  {
    level: 'Level 2',
    title: 'Building Blocks',
    lessons: [
      { id: 'making-decisions', title: 'Making Decisions', state: 'locked' },
      { id: 'repeating-instructions', title: 'Repeating Instructions', state: 'locked' },
      { id: 'working-with-data', title: 'Working with Data', state: 'locked', checkpoint: true },
    ],
  },
  {
    level: 'Level 3',
    title: 'Thinking in Systems',
    lessons: [
      { id: 'designing-solutions', title: 'Designing Solutions', state: 'locked' },
      { id: 'testing-your-ideas', title: 'Testing Your Ideas', state: 'locked' },
      { id: 'a-complete-program', title: 'A Complete Program', state: 'locked', checkpoint: true },
    ],
  },
  {
    level: 'Level 4',
    title: 'Functions',
    lessons: [
      { id: 'reusable-steps', title: 'Reusable Steps', state: 'locked' },
      { id: 'building-blocks', title: 'Building Blocks', state: 'locked' },
      { id: 'function-challenge', title: 'Function Challenge', state: 'locked', checkpoint: true },
    ],
  },
  {
    level: 'Level 5',
    title: 'Working with Data',
    lessons: [
      { id: 'data-structures', title: 'Data Structures', state: 'locked' },
      { id: 'patterns-in-data', title: 'Patterns in Data', state: 'locked' },
      { id: 'data-practice', title: 'Data Practice', state: 'locked', checkpoint: true },
    ],
  },
  {
    level: 'Level 6',
    title: 'Algorithms',
    lessons: [
      { id: 'step-by-step-solutions', title: 'Step-by-Step Solutions', state: 'locked' },
      { id: 'finding-patterns', title: 'Finding Patterns', state: 'locked' },
      { id: 'algorithm-challenge', title: 'Algorithm Challenge', state: 'locked', checkpoint: true },
    ],
  },
  {
    level: 'Level 7',
    title: 'Debugging',
    lessons: [
      { id: 'spotting-mistakes', title: 'Spotting Mistakes', state: 'locked' },
      { id: 'testing-ideas', title: 'Testing Ideas', state: 'locked' },
      { id: 'debugging-challenge', title: 'Debugging Challenge', state: 'locked', checkpoint: true },
    ],
  },
  {
    level: 'Level 8',
    title: 'Exploring with Logic',
    lessons: [
      { id: 'logical-conditions', title: 'Logical Conditions', state: 'locked' },
      { id: 'combining-ideas', title: 'Combining Ideas', state: 'locked' },
      { id: 'logic-challenge', title: 'Logic Challenge', state: 'locked', checkpoint: true },
    ],
  },
  {
    level: 'Level 9',
    title: 'Building Programs',
    lessons: [
      { id: 'putting-it-together', title: 'Putting It Together', state: 'locked' },
      { id: 'project-foundations', title: 'Project Foundations', state: 'locked' },
      { id: 'final-program', title: 'Final Program', state: 'locked', checkpoint: true },
    ],
  },
]

export const explorePaths = [
  { type: 'career', category: 'Data & AI', family: 'ml', title: 'Machine Learning Engineer', meta: 'Beginner · 8 regions', reason: 'Prepare data, train models and deploy ML systems.', image: '/assets/scientific-thinking.png' },
  { type: 'career', category: 'Data & AI', family: 'data', title: 'Data Scientist', meta: 'Beginner · 7 regions', reason: 'Turn evidence into clear decisions with data.', image: '/assets/exploring-data-visually.png' },
  { type: 'career', category: 'Development', family: 'backend', title: 'Backend Developer', meta: 'Beginner · 8 regions', reason: 'Build reliable services and software systems.', image: '/assets/programming-with-variables.png' },
  { type: 'career', category: 'Cloud & Security', family: 'security', title: 'AI Engineer', meta: 'Intermediate · 7 regions', reason: 'Build intelligent products with modern AI tools.', image: '/assets/thinking-in-code.png' },
  { type: 'skill', category: 'Development', family: 'backend', title: 'Learn Python', meta: 'Beginner · 7 lessons', reason: 'Build useful programs with Python.', image: '/assets/programming-with-variables.png' },
  { type: 'skill', category: 'Data & AI', family: 'data', title: 'Learn SQL', meta: 'Beginner · 6 lessons', reason: 'Query data and turn questions into answers.', image: '/assets/exploring-data-visually.png' },
  { type: 'skill', category: 'Development', family: 'backend', title: 'Learn Git', meta: 'Beginner · 5 lessons', reason: 'Work confidently with versions and collaboration.', image: '/assets/scientific-thinking.png' },
  { type: 'skill', category: 'Development', family: 'backend', title: 'Learn Docker', meta: 'Beginner · 6 lessons', reason: 'Package and run projects anywhere.', image: '/assets/thinking-in-code.png' },
]

export const categories = ['All', 'Development', 'Data & AI', 'Cloud & Security', 'Design & Product', 'Business & Marketing', 'Quality']
