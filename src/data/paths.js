export const pathShelves = [
  {
    id: 'machine-learning',
    family: 'ml',
    level: 'Career path',
    title: 'Machine Learning Engineer',
    description: 'Build the skills to prepare data, train models and deploy reliable ML systems.',
    progressValue: 23,
    emblem: '/assets/scientific-thinking.png',
    cards: [
      {
        id: 'orientation',
        level: 'Region 1',
        title: 'Orientation',
        summary: 'See how the career path is structured and how each unit builds toward real machine learning work.',
        state: 'completed',
        progress: '100%',
        progressValue: 100,
        image: '/assets/programming-with-variables.png',
        lessons: [
          { id: 'ml-welcome', title: 'Welcome to machine learning', state: 'completed' },
          { id: 'ml-map', title: 'How this path works', state: 'completed' },
          { id: 'ml-goals', title: 'Set your learning goals', state: 'completed' },
          { id: 'ml-workflow', title: 'The machine learning workflow', state: 'completed', checkpoint: true },
        ],
      },
      {
        id: 'python-foundations',
        level: 'Region 2',
        title: 'Python Foundations',
        summary: 'Learn to write clear Python programs, use variables, and turn simple ideas into working code.',
        state: 'current',
        progress: '35%',
        progressValue: 35,
        image: '/assets/programming-with-variables.png',
        lessons: [
          { id: 'writing-programs', title: 'Writing Programs', state: 'current', description: 'Turn ideas into simple programs a computer can run.' },
          { id: 'using-variables', title: 'Using Variables', state: 'available', description: 'Store information your programs can use.' },
          { id: 'input-output', title: 'Input and Output', state: 'available', checkpoint: true, description: 'Make a program respond and show its result.' },
          { id: 'program-flow', title: 'Program Flow', state: 'available', description: 'Guide a program through steps and decisions.' },
        ],
      },
      {
        id: 'data-math-foundations',
        level: 'Region 3',
        title: 'Data & Math Foundations',
        summary: 'Build the data and math intuition you need to understand how machine learning models work.',
        state: 'available',
        progress: '0%',
        progressValue: 0,
        image: '/assets/probability-and-chance.png',
        lessons: [
          { id: 'data-types', title: 'Working with data types', state: 'locked' },
          { id: 'math-for-ml', title: 'Math for machine learning', state: 'locked' },
          { id: 'probability-basics', title: 'Probability basics', state: 'locked', checkpoint: true },
          { id: 'data-relationships', title: 'Understanding data relationships', state: 'locked' },
        ],
      },
      {
        id: 'eda-features',
        level: 'Region 4',
        title: 'EDA & Features',
        summary: 'Explore datasets and shape raw information into useful features for a model.',
        state: 'locked',
        progress: '0%',
        progressValue: 0,
        image: '/assets/exploring-data-visually.png',
        lessons: [
          { id: 'explore-data', title: 'Explore a dataset', state: 'locked' },
          { id: 'feature-basics', title: 'Create useful features', state: 'locked' },
          { id: 'clean-data', title: 'Clean and prepare data', state: 'locked' },
          { id: 'feature-checkpoint', title: 'Feature engineering checkpoint', state: 'locked', checkpoint: true },
        ],
      },
      {
        id: 'core-ml',
        level: 'Region 5',
        title: 'Core ML',
        summary: 'Train your first models, evaluate their results, and learn how to improve them.',
        state: 'locked',
        progress: '0%',
        progressValue: 0,
        image: '/assets/scientific-thinking.png',
        lessons: [
          { id: 'train-model', title: 'Train your first model', state: 'locked' },
          { id: 'evaluate-model', title: 'Evaluate model results', state: 'locked', checkpoint: true },
          { id: 'model-selection', title: 'Choose the right model', state: 'locked' },
          { id: 'improve-model', title: 'Improve model performance', state: 'locked' },
        ],
      },
      {
        id: 'ml-career-capstone',
        level: 'Region 6',
        title: 'ML Career Capstone',
        summary: 'Bring your new skills together by shipping a practical machine learning project.',
        state: 'locked',
        progress: '0%',
        progressValue: 0,
        image: '/assets/exploring-data-visually.png',
        capstone: true,
        lessons: [
          { id: 'capstone-plan', title: 'Plan your capstone', state: 'locked' },
          { id: 'capstone-build', title: 'Build your solution', state: 'locked' },
          { id: 'capstone-present', title: 'Present your project', state: 'locked' },
          { id: 'ml-capstone', title: 'Ship an ML project', state: 'locked', checkpoint: true },
        ],
      },
    ],
  },
]

// Only `machine-learning` has authored regions. For any other selected path we
// keep that path's own identity — title, description, emblem — and borrow the
// authored region structure, so a user who picks Backend Developer sees Backend
// Developer rather than silently being shown ML.
export function getPath(pathId) {
  const authored = pathShelves.find((path) => path.id === pathId)
  if (authored) return authored

  const stub = explorePaths.find((path) => path.id === pathId)
  if (!stub) return pathShelves[0]

  return {
    ...pathShelves[0],
    id: stub.id,
    title: stub.title,
    description: stub.description ?? pathDescriptions[stub.id],
    emblem: stub.image,
    level: stub.type === 'skill' ? 'Skill path' : 'Career path',
    family: stub.family,
  }
}

export const currentPath = pathShelves[0]
const currentRegionIndex = currentPath.cards.findIndex((card) => card.state === 'current')
export const currentRegion = currentPath.cards[currentRegionIndex] ?? currentPath.cards[0]
export const nextRegion = currentPath.cards[currentRegionIndex + 1] ?? null

// Kept as a compatibility export while consumers move to path.cards.
export const detailLevels = currentPath.cards

export const explorePaths = [
  { id: 'machine-learning', type: 'career', category: 'Data & AI', family: 'ml', title: 'Machine Learning Engineer', meta: 'Beginner · 6 regions', reason: 'Prepare data, train models and deploy ML systems.', image: '/assets/scientific-thinking.png' },
  { id: 'data-scientist', type: 'career', category: 'Data & AI', family: 'data', title: 'Data Scientist', meta: 'Beginner · 7 regions', reason: 'Turn evidence into clear decisions with data.', image: '/assets/exploring-data-visually.png' },
  { id: 'backend-developer', type: 'career', category: 'Development', family: 'backend', title: 'Backend Developer', meta: 'Beginner · 8 regions', reason: 'Build reliable services and software systems.', image: '/assets/programming-with-variables.png' },
  { id: 'ai-engineer', type: 'career', category: 'Cloud & Security', family: 'security', title: 'AI Engineer', meta: 'Intermediate · 7 regions', reason: 'Build intelligent products with modern AI tools.', image: '/assets/thinking-in-code.png' },
  { id: 'learn-python', type: 'skill', category: 'Development', family: 'backend', title: 'Learn Python', meta: 'Beginner · 7 lessons', reason: 'Build useful programs with Python.', image: '/assets/programming-with-variables.png' },
  { id: 'learn-sql', type: 'skill', category: 'Data & AI', family: 'data', title: 'Learn SQL', meta: 'Beginner · 6 lessons', reason: 'Query data and turn questions into answers.', image: '/assets/exploring-data-visually.png' },
  { id: 'learn-git', type: 'skill', category: 'Development', family: 'backend', title: 'Learn Git', meta: 'Beginner · 5 lessons', reason: 'Work confidently with versions and collaboration.', image: '/assets/scientific-thinking.png' },
  { id: 'learn-docker', type: 'skill', category: 'Development', family: 'backend', title: 'Learn Docker', meta: 'Beginner · 6 lessons', reason: 'Package and run projects anywhere.', image: '/assets/thinking-in-code.png' },
]

export const categories = ['All', 'Development', 'Data & AI', 'Cloud & Security', 'Design & Product', 'Business & Marketing', 'Quality']

const pathTools = {
  'machine-learning': ['Python', 'Data', 'ML'],
  'data-scientist': ['Python', 'SQL', 'Analytics'],
  'backend-developer': ['Python', 'APIs', 'Databases'],
  'ai-engineer': ['Python', 'LLMs', 'ML'],
  'learn-python': ['Python', 'Logic'],
  'learn-sql': ['SQL', 'Data'],
  'learn-git': ['Git', 'Collaboration'],
  'learn-docker': ['Docker', 'Containers'],
}

const pathDescriptions = {
  'machine-learning': 'Prepare data, train models, and deploy reliable ML systems that solve practical problems.',
  'data-scientist': 'Turn evidence into clear decisions by exploring data, finding patterns, and communicating results.',
  'backend-developer': 'Build reliable APIs, data services, and software systems that power useful applications.',
  'ai-engineer': 'Build intelligent products with modern AI tools, from useful prompts to production-ready features.',
  'learn-python': 'Build useful programs with Python and learn the programming patterns behind clear, confident code.',
  'learn-sql': 'Query data, answer real questions, and turn raw tables into useful insight for better decisions.',
  'learn-git': 'Work confidently with versions, collaboration, and the everyday Git workflow used by development teams.',
  'learn-docker': 'Package and run projects consistently, so your development environment works wherever it needs to.',
}

explorePaths.forEach((path) => {
  path.tools = pathTools[path.id]
  path.description = pathDescriptions[path.id]
  path.recommended = path.id === 'ai-engineer'
})
