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
        reason: 'A clear map makes it easier to understand what you are building toward and how each part of the path supports real machine learning work.',
        goals: [
          'Understand how the path is organised',
          'Recognise the stages of a machine learning workflow',
          'Set a realistic learning goal',
        ],
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
        reason: 'Python is the working language used throughout the Machine Learning path. These foundations let you express instructions, store information and control what a program does.',
        goals: [
          'Explain how Python executes instructions',
          'Create, name and update variables',
          'Use expressions to calculate new values',
          'Display output and receive input',
          'Compare values using booleans',
          'Control program behaviour with conditions',
          'Read a short program and predict its result',
        ],
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
        reason: 'Models learn from numbers and relationships. This region gives you the vocabulary to inspect data and understand what a model is measuring.',
        goals: [
          'Recognise common Python data types',
          'Use the core maths behind simple models',
          'Reason about probability and relationships in data',
        ],
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
        reason: 'A model can only learn from the information it receives. Exploring and preparing data helps you find useful signals before training begins.',
        goals: [
          'Explore a dataset systematically',
          'Clean common data quality problems',
          'Create features that represent useful signals',
        ],
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
        reason: 'Training a model is only the beginning. This region teaches you how to judge whether its predictions are useful and improve them responsibly.',
        goals: [
          'Train a baseline machine learning model',
          'Evaluate model performance with suitable metrics',
          'Compare and improve candidate models',
        ],
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
        reason: 'A finished project proves that you can connect data, modelling and communication into one practical piece of work.',
        goals: [
          'Plan a focused machine learning project',
          'Build and evaluate an end-to-end solution',
          'Present your decisions and results clearly',
        ],
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
  { id: 'frontend-developer', type: 'career', category: 'Development', family: 'backend', title: 'Frontend Developer', meta: 'Beginner · 7 regions', reason: 'Create polished, accessible web interfaces that people enjoy using.', image: '/assets/thinking-in-code.png' },
  { id: 'fullstack-developer', type: 'career', category: 'Development', family: 'backend', title: 'Full-Stack Developer', meta: 'Beginner · 8 regions', reason: 'Build complete web products from interface to database.', image: '/assets/programming-with-variables.png' },
  { id: 'ui-engineer', type: 'career', category: 'Design & Product', family: 'backend', title: 'UI Engineer', meta: 'Beginner · 6 regions', reason: 'Turn product designs into responsive, high-quality interfaces.', image: '/assets/thinking-in-code.png' },
  { id: 'ios-developer', type: 'career', category: 'Development', family: 'backend', title: 'Mobile Developer (iOS)', meta: 'Beginner · 7 regions', reason: 'Build thoughtful, native mobile experiences for Apple devices.', image: '/assets/thinking-in-code.png' },
  { id: 'android-developer', type: 'career', category: 'Development', family: 'backend', title: 'Mobile Developer (Android)', meta: 'Beginner · 7 regions', reason: 'Create reliable Android apps for a wide range of devices.', image: '/assets/programming-with-variables.png' },
  { id: 'cross-platform-developer', type: 'career', category: 'Development', family: 'backend', title: 'Cross-Platform Developer', meta: 'Beginner · 7 regions', reason: 'Ship one mobile product across iOS and Android.', image: '/assets/thinking-in-code.png' },
  { id: 'database-developer', type: 'career', category: 'Data & AI', family: 'data', title: 'Database Developer', meta: 'Beginner · 6 regions', reason: 'Design dependable data stores and write efficient queries.', image: '/assets/exploring-data-visually.png' },
  { id: 'api-systems-engineer', type: 'career', category: 'Development', family: 'backend', title: 'API / Systems Engineer', meta: 'Intermediate · 8 regions', reason: 'Design the services and integrations that connect products.', image: '/assets/programming-with-variables.png' },
  { id: 'data-analyst', type: 'career', category: 'Data & AI', family: 'data', title: 'Data Analyst', meta: 'Beginner · 6 regions', reason: 'Use data to answer practical questions and guide decisions.', image: '/assets/exploring-data-visually.png' },
  { id: 'data-engineer', type: 'career', category: 'Data & AI', family: 'data', title: 'Data Engineer', meta: 'Intermediate · 8 regions', reason: 'Build trusted data pipelines that make analysis possible.', image: '/assets/programming-with-variables.png' },
  { id: 'business-intelligence', type: 'career', category: 'Data & AI', family: 'data', title: 'Business Intelligence', meta: 'Beginner · 6 regions', reason: 'Turn business data into clear reporting and useful insight.', image: '/assets/exploring-data-visually.png' },
  { id: 'ai-application-developer', type: 'career', category: 'Data & AI', family: 'ml', title: 'AI Application Developer', meta: 'Intermediate · 7 regions', reason: 'Build useful AI features into products people use every day.', image: '/assets/thinking-in-code.png' },
  { id: 'automation-developer', type: 'career', category: 'Data & AI', family: 'ml', title: 'Automation Developer', meta: 'Beginner · 6 regions', reason: 'Automate repetitive work with reliable, maintainable workflows.', image: '/assets/programming-with-variables.png' },
  { id: 'product-manager', type: 'career', category: 'Design & Product', family: 'data', title: 'Product Manager', meta: 'Beginner · 6 regions', reason: 'Guide product decisions from customer problems to outcomes.', image: '/assets/scientific-thinking.png' },
  { id: 'business-analyst', type: 'career', category: 'Design & Product', family: 'data', title: 'Business Analyst', meta: 'Beginner · 6 regions', reason: 'Clarify requirements and improve the processes behind products.', image: '/assets/exploring-data-visually.png' },
  { id: 'technical-project-coordinator', type: 'career', category: 'Design & Product', family: 'backend', title: 'Technical Project Coordinator', meta: 'Beginner · 6 regions', reason: 'Keep technical work organised, visible, and moving forward.', image: '/assets/programming-with-variables.png' },
  { id: 'ui-ux-designer', type: 'career', category: 'Design & Product', family: 'data', title: 'UI/UX Designer', meta: 'Beginner · 6 regions', reason: 'Design clear digital experiences around real user needs.', image: '/assets/thinking-in-code.png' },
  { id: 'product-designer', type: 'career', category: 'Design & Product', family: 'data', title: 'Product Designer', meta: 'Beginner · 7 regions', reason: 'Shape useful products from early ideas to refined experiences.', image: '/assets/scientific-thinking.png' },
  { id: 'design-systems-specialist', type: 'career', category: 'Design & Product', family: 'backend', title: 'Design Systems Specialist', meta: 'Intermediate · 7 regions', reason: 'Create reusable design foundations that help teams move faster.', image: '/assets/thinking-in-code.png' },
  { id: 'devops-engineer', type: 'career', category: 'Cloud & Security', family: 'security', title: 'DevOps Engineer', meta: 'Intermediate · 8 regions', reason: 'Improve how software is built, deployed, and operated.', image: '/assets/programming-with-variables.png' },
  { id: 'cloud-engineer', type: 'career', category: 'Cloud & Security', family: 'security', title: 'Cloud Engineer', meta: 'Intermediate · 7 regions', reason: 'Build scalable cloud infrastructure for dependable products.', image: '/assets/scientific-thinking.png' },
  { id: 'cybersecurity-specialist', type: 'career', category: 'Cloud & Security', family: 'security', title: 'Cybersecurity Specialist', meta: 'Beginner · 7 regions', reason: 'Protect systems, data, and people through practical security work.', image: '/assets/thinking-in-code.png' },
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
  'frontend-developer': ['HTML', 'CSS', 'JavaScript'],
  'fullstack-developer': ['JavaScript', 'APIs', 'Databases'],
  'ui-engineer': ['HTML', 'CSS', 'Design systems'],
  'ios-developer': ['Swift', 'iOS', 'Xcode'],
  'android-developer': ['Kotlin', 'Android', 'APIs'],
  'cross-platform-developer': ['React Native', 'Dart', 'Mobile'],
  'database-developer': ['SQL', 'Databases', 'Data modelling'],
  'api-systems-engineer': ['APIs', 'Python', 'Systems'],
  'data-analyst': ['SQL', 'Excel', 'Analytics'],
  'data-engineer': ['Python', 'SQL', 'Pipelines'],
  'business-intelligence': ['SQL', 'Dashboards', 'Analytics'],
  'ai-application-developer': ['Python', 'LLMs', 'APIs'],
  'automation-developer': ['Python', 'APIs', 'Workflows'],
  'product-manager': ['Discovery', 'Strategy', 'Analytics'],
  'business-analyst': ['Requirements', 'Processes', 'Analytics'],
  'technical-project-coordinator': ['Planning', 'Agile', 'Collaboration'],
  'ui-ux-designer': ['UX research', 'Wireframes', 'Prototyping'],
  'product-designer': ['UX', 'UI design', 'Prototyping'],
  'design-systems-specialist': ['Components', 'Tokens', 'Accessibility'],
  'devops-engineer': ['CI/CD', 'Docker', 'Cloud'],
  'cloud-engineer': ['Cloud', 'Infrastructure', 'Security'],
  'cybersecurity-specialist': ['Security', 'Networks', 'Risk'],
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
  'frontend-developer': 'Create polished, accessible web interfaces with the foundations of modern frontend development.',
  'fullstack-developer': 'Build complete web products by connecting user-facing features, APIs, and data storage.',
  'ui-engineer': 'Translate product designs into responsive, accessible interfaces that feel polished in use.',
  'ios-developer': 'Build thoughtful native mobile experiences for Apple devices using core iOS development patterns.',
  'android-developer': 'Create reliable Android apps that work well across the devices people use every day.',
  'cross-platform-developer': 'Ship mobile products across iOS and Android with shared code and platform-aware design.',
  'database-developer': 'Design dependable data stores and write efficient queries that support real applications.',
  'api-systems-engineer': 'Design the reliable APIs, services, and integrations that allow products to work together.',
  'data-analyst': 'Use data to answer practical questions, uncover patterns, and guide better everyday decisions.',
  'data-engineer': 'Build trusted data pipelines and foundations that give teams reliable information to work with.',
  'business-intelligence': 'Turn business data into useful reporting, dashboards, and insights people can act on.',
  'ai-application-developer': 'Build useful AI-powered product features with modern models, prompts, and integrations.',
  'automation-developer': 'Automate repetitive work with reliable workflows that save people time and reduce mistakes.',
  'product-manager': 'Guide product decisions from customer problems through delivery and measurable outcomes.',
  'business-analyst': 'Clarify requirements and improve the processes that help products and teams work better.',
  'technical-project-coordinator': 'Keep technical work organised, visible, and moving through the right people and milestones.',
  'ui-ux-designer': 'Design clear, inclusive digital experiences around real user needs, journeys, and feedback.',
  'product-designer': 'Shape useful products from early ideas through refined experiences that solve real problems.',
  'design-systems-specialist': 'Create reusable design foundations, components, and patterns that help teams move faster.',
  'devops-engineer': 'Improve how software is built, deployed, monitored, and operated across its lifecycle.',
  'cloud-engineer': 'Build scalable cloud infrastructure that keeps products dependable, secure, and ready to grow.',
  'cybersecurity-specialist': 'Protect systems, data, and people through practical security principles and safer operations.',
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
