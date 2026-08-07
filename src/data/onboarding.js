// Onboarding schema v3.
//
// Changes from the drafted v2:
// - Conditions and option lookups are declarative data, not string expressions.
// - q1's "not sure" resolves through a triage step instead of dead-ending.
// - "Help me choose" sub-quizzes ask about observable preferences and declare
//   writesTo, so placement always keys off a real role.
// - Experience options carry an explicit `rung`, so placement is data rather
//   than inferred ordering across three unrelated axes.
// - Motivation and daily time are back; payoff screens sit between clusters.
// - An `outcomes` block finally says what the answers produce.

export const BRANCHES = [
  { value: 'web', label: 'Websites & Interfaces' },
  { value: 'mobile', label: 'Apps for Phones' },
  { value: 'backend', label: 'Servers & Databases' },
  { value: 'data', label: 'Data & Insights' },
  { value: 'ai', label: 'AI & Automation' },
  { value: 'product', label: 'Product & Business' },
  { value: 'marketing', label: 'Marketing & Growth' },
  { value: 'design', label: 'Design & User Experience' },
  { value: 'cloud', label: 'Cloud, Security & Deployment' },
]

export const roleOptions = {
  web: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'frontend_developer', label: 'Frontend Developer' },
    { value: 'fullstack_developer', label: 'Full-Stack Developer' },
    { value: 'ui_ux_developer', label: 'UI Engineer', note: 'Builds interfaces from designs' },
  ],
  mobile: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'ios_developer', label: 'Mobile Developer (iOS)' },
    { value: 'android_developer', label: 'Mobile Developer (Android)' },
    { value: 'cross_platform_developer', label: 'Cross-Platform Developer' },
  ],
  backend: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'backend_developer', label: 'Backend Developer' },
    { value: 'database_developer', label: 'Database Developer' },
    { value: 'api_systems_engineer', label: 'API / Systems Engineer' },
  ],
  data: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'data_analyst', label: 'Data Analyst' },
    { value: 'data_engineer', label: 'Data Engineer' },
    { value: 'business_intelligence', label: 'Business Intelligence' },
    { value: 'data_scientist', label: 'Data Scientist' },
  ],
  ai: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'ml_engineer', label: 'Machine Learning Engineer' },
    { value: 'ai_app_developer', label: 'AI Application Developer' },
    { value: 'automation_developer', label: 'Automation Developer' },
  ],
  product: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'business_analyst', label: 'Business Analyst', note: 'Requirements and process, not dashboards' },
    { value: 'technical_project_coordinator', label: 'Technical Project Coordinator' },
  ],
  marketing: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'digital_marketer', label: 'Digital Marketer' },
  ],
  design: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'ui_ux_designer', label: 'UI/UX Designer', note: 'Designs the interface rather than building it' },
    { value: 'product_designer', label: 'Product Designer' },
    { value: 'design_systems_specialist', label: 'Design Systems Specialist' },
  ],
  cloud: [
    { value: 'help_me_choose', label: 'Help me choose' },
    { value: 'devops_engineer', label: 'DevOps Engineer' },
    { value: 'cloud_engineer', label: 'Cloud Engineer' },
    { value: 'cybersecurity_specialist', label: 'Cybersecurity Specialist' },
  ],
}

const ladder = (...steps) => [
  ...steps.map(([value, label]) => ({ value, label })),
  { value: 'not_sure', label: 'Not sure, place me where it makes sense' },
]

export const startingPointOptions = {
  frontend_developer: ladder(['html_css_basics', 'HTML & CSS basics'], ['js_fundamentals', 'JavaScript fundamentals'], ['dom_interactivity', 'DOM manipulation / interactivity'], ['react_basics', 'React basics'], ['react_routing_apis', 'React with routing & APIs']),
  fullstack_developer: ladder(['html_css_js_basics', 'HTML, CSS & JavaScript basics'], ['frontend_framework_basics', 'Frontend framework basics'], ['backend_fundamentals', 'Backend fundamentals'], ['databases_apis', 'Databases & APIs'], ['fullstack_integration', 'Connecting frontend, backend & database']),
  ui_ux_developer: ladder(['design_fundamentals', 'Design fundamentals'], ['figma_basics', 'Figma / prototyping basics'], ['html_css_for_designers', 'HTML & CSS for designers'], ['design_handoff', 'Prototyping & developer handoff'], ['basic_frontend_implementation', 'Implementing designs in code']),

  ios_developer: ladder(['swift_basics', 'Swift basics'], ['swiftui_basics', 'SwiftUI / UIKit basics'], ['navigation_state', 'Navigation & app state'], ['networking_apis', 'Networking & APIs'], ['app_store_deployment', 'App Store deployment']),
  android_developer: ladder(['kotlin_basics', 'Kotlin basics'], ['jetpack_compose_basics', 'Jetpack Compose / UI basics'], ['navigation_state', 'Navigation & app state'], ['networking_apis', 'Networking & APIs'], ['play_store_deployment', 'Play Store deployment']),
  cross_platform_developer: ladder(['js_dart_basics', 'JavaScript / Dart basics'], ['component_widget_basics', 'Component & widget basics'], ['navigation_state', 'Navigation & app state'], ['native_device_features', 'Native APIs & device features'], ['publishing_both_stores', 'Publishing to app stores']),

  backend_developer: ladder(['language_fundamentals', 'Language fundamentals'], ['http_rest_basics', 'HTTP & REST basics'], ['databases_queries', 'Databases & queries'], ['auth_security', 'Authentication & security'], ['api_design_scaling', 'API design & scaling']),
  database_developer: ladder(['sql_fundamentals', 'SQL fundamentals'], ['schema_design', 'Schema design & normalization'], ['indexing_optimization', 'Indexing & query optimization'], ['nosql_basics', 'NoSQL basics'], ['migrations_backups', 'Migrations & backups']),
  api_systems_engineer: ladder(['networking_fundamentals', 'HTTP & networking fundamentals'], ['rest_graphql_design', 'REST / GraphQL API design'], ['authn_authz', 'Authentication & authorization'], ['caching_performance', 'Caching & performance'], ['microservices_design', 'Microservices & system design']),

  data_analyst: ladder(['excel_fundamentals', 'Spreadsheet fundamentals'], ['sql_fundamentals', 'SQL fundamentals'], ['data_cleaning_viz', 'Data cleaning & visualization'], ['statistics_basics', 'Statistics basics'], ['dashboarding', 'Dashboarding']),
  data_engineer: ladder(['python_sql_fundamentals', 'Python & SQL fundamentals'], ['etl_basics', 'ETL pipeline basics'], ['data_warehousing', 'Data warehousing'], ['workflow_orchestration', 'Workflow orchestration'], ['cloud_data_platforms', 'Cloud data platforms']),
  business_intelligence: ladder(['excel_fundamentals', 'Excel fundamentals'], ['power_bi_basics', 'Power BI basics'], ['data_modeling', 'Data modeling'], ['dax_formulas', 'DAX formulas'], ['dashboard_design', 'Dashboard design']),
  data_scientist: ladder(['python_statistics_basics', 'Python & statistics fundamentals'], ['pandas_data_wrangling', 'Data wrangling with pandas'], ['data_visualization', 'Data visualization'], ['ml_basics', 'Machine learning basics'], ['model_eval_deployment', 'Model evaluation & deployment']),

  ml_engineer: ladder(['python_fundamentals', 'Python fundamentals'], ['math_stats_for_ml', 'Math & statistics for ML'], ['core_ml_algorithms', 'Core ML algorithms'], ['model_training_eval', 'Model training & evaluation'], ['deployment_mlops', 'Deployment & MLOps']),
  ai_app_developer: ladder(['python_fundamentals', 'Python fundamentals'], ['working_with_llm_apis', 'Working with LLM APIs'], ['prompt_engineering', 'Prompt engineering'], ['building_ai_apps', 'Building AI-powered apps'], ['vector_db_rag', 'Vector databases & RAG']),
  automation_developer: ladder(['python_js_fundamentals', 'Python / JavaScript fundamentals'], ['scripting_basics', 'Scripting & automation basics'], ['working_with_apis', 'Working with APIs'], ['scheduling_workflows', 'Scheduling & workflows'], ['bots_integrations', 'Bots & integrations']),

  product_manager: ladder(['product_fundamentals', 'Product fundamentals'], ['user_research_basics', 'User research basics'], ['roadmapping_prioritization', 'Roadmapping & prioritization'], ['working_with_eng_design', 'Working with engineering & design'], ['metrics_analytics', 'Metrics & analytics']),
  business_analyst: ladder(['business_analysis_fundamentals', 'Business analysis fundamentals'], ['requirements_gathering', 'Requirements gathering'], ['data_analysis_basics', 'Data analysis basics'], ['process_mapping', 'Process mapping'], ['stakeholder_communication', 'Stakeholder communication']),
  technical_project_coordinator: ladder(['project_management_fundamentals', 'Project management fundamentals'], ['agile_scrum_basics', 'Agile & Scrum basics'], ['pm_tools', 'Tools (Jira / Trello)'], ['technical_communication', 'Technical communication'], ['risk_timeline_tracking', 'Risk & timeline tracking']),
  digital_marketer: ladder(['marketing_fundamentals', 'Marketing fundamentals'], ['audience_research', 'Audience research'], ['content_campaigns', 'Content and campaigns'], ['channel_analytics', 'Channels and analytics'], ['campaign_optimisation', 'Campaign optimisation']),

  ui_ux_designer: ladder(['design_fundamentals', 'Design fundamentals'], ['wireframing_prototyping', 'Wireframing & prototyping'], ['user_research_basics', 'User research basics'], ['usability_testing', 'Usability testing'], ['design_systems', 'Design systems']),
  product_designer: ladder(['design_fundamentals', 'Design fundamentals'], ['end_to_end_design_process', 'End-to-end design process'], ['prototyping_testing', 'Prototyping & testing'], ['collaborating_with_engineering', 'Collaborating with engineering'], ['design_systems', 'Design systems']),
  design_systems_specialist: ladder(['design_fundamentals', 'Design fundamentals'], ['component_libraries', 'Component libraries'], ['design_tokens', 'Design tokens'], ['documentation_governance', 'Documentation & governance'], ['cross_team_collaboration', 'Cross-team collaboration']),

  devops_engineer: ladder(['linux_cli_basics', 'Linux & command line basics'], ['git_version_control', 'Version control (Git)'], ['ci_cd_pipelines', 'CI/CD pipelines'], ['containers_docker', 'Containers (Docker)'], ['iac_cloud_basics', 'Infrastructure as code']),
  cloud_engineer: ladder(['cloud_fundamentals', 'Cloud fundamentals'], ['networking_basics', 'Networking basics'], ['compute_storage_services', 'Compute & storage services'], ['infrastructure_as_code', 'Infrastructure as code'], ['security_cost_management', 'Security & cost management']),
  cybersecurity_specialist: ladder(['networking_security_fundamentals', 'Networking & security fundamentals'], ['owasp_vulnerabilities', 'Common vulnerabilities (OWASP)'], ['security_tools_monitoring', 'Security tools & monitoring'], ['incident_response', 'Incident response'], ['pentesting_basics', 'Penetration testing basics']),
}

// Asks what someone has enjoyed or wants to make — not the same role choice in
// different words, which is what made "help me choose" useless in v2.
export const roleSubQuiz = {
  web: {
    prompt: 'Which of these would you rather spend an afternoon on?',
    options: [
      { value: 'frontend_developer', label: 'Getting a page to look and behave exactly right' },
      { value: 'fullstack_developer', label: 'Making a form actually save something and come back' },
      { value: 'ui_ux_developer', label: 'Turning a designer’s file into a working screen' },
    ],
  },
  mobile: {
    prompt: 'Which phone do you actually use day to day?',
    options: [
      { value: 'ios_developer', label: 'iPhone — and I mostly build for people who use one' },
      { value: 'android_developer', label: 'Android — and I mostly build for people who use one' },
      { value: 'cross_platform_developer', label: 'It varies, and I’d rather write things once' },
    ],
  },
  backend: {
    prompt: 'A feature is slow. What would you enjoy digging into?',
    options: [
      { value: 'backend_developer', label: 'The logic deciding what happens' },
      { value: 'database_developer', label: 'How the data is stored and queried' },
      { value: 'api_systems_engineer', label: 'How the services talk to each other' },
    ],
  },
  data: {
    prompt: 'Someone hands you a messy spreadsheet. What do you want to do with it?',
    options: [
      { value: 'data_analyst', label: 'Find out what it’s telling us' },
      { value: 'data_engineer', label: 'Make it arrive clean automatically next time' },
      { value: 'business_intelligence', label: 'Turn it into something the team checks weekly' },
      { value: 'data_scientist', label: 'Use it to predict what happens next' },
    ],
  },
  ai: {
    prompt: 'Which finished result would you be proudest of?',
    options: [
      { value: 'ml_engineer', label: 'A model that makes accurate predictions' },
      { value: 'ai_app_developer', label: 'An app people use that happens to run on AI' },
      { value: 'automation_developer', label: 'A script that saves you an hour every week' },
    ],
  },
  product: {
    prompt: 'In a project you’ve been part of, what did you naturally end up doing?',
    options: [
      { value: 'product_manager', label: 'Arguing for what was worth building' },
      { value: 'business_analyst', label: 'Working out what people actually needed' },
      { value: 'technical_project_coordinator', label: 'Keeping everyone unblocked and on schedule' },
    ],
  },
  marketing: {
    prompt: 'Which result would you most enjoy working toward?',
    options: [
      { value: 'digital_marketer', label: 'A campaign that reaches the right people and improves over time' },
    ],
  },
  design: {
    prompt: 'Which would bother you most in an app you use?',
    options: [
      { value: 'ui_ux_designer', label: 'A screen that’s confusing to use' },
      { value: 'product_designer', label: 'A feature that solves the wrong problem' },
      { value: 'design_systems_specialist', label: 'Buttons that look different on every page' },
    ],
  },
  cloud: {
    prompt: 'Which problem would you rather be the one to solve?',
    options: [
      { value: 'devops_engineer', label: 'Shipping takes all day and often breaks' },
      { value: 'cloud_engineer', label: 'The bill is high and nobody knows what’s running' },
      { value: 'cybersecurity_specialist', label: 'Nobody has checked whether this is safe' },
    ],
  },
}

// The "I'm not sure" destination at q1 — resolves a branch from what someone
// enjoys, then rejoins the normal flow.
export const branchTriage = {
  prompt: 'No problem. Which of these sounds most like a good day?',
  writesTo: 'branch',
  options: [
    { value: 'web', label: 'Making something people can click around in' },
    { value: 'design', label: 'Deciding how something should look and feel' },
    { value: 'data', label: 'Finding the story hidden in a pile of numbers' },
    { value: 'ai', label: 'Teaching a computer to do something on its own' },
    { value: 'backend', label: 'Building the machinery nobody sees but everyone relies on' },
    { value: 'mobile', label: 'Making something that lives on a phone' },
    { value: 'product', label: 'Working out what’s worth building and why' },
    { value: 'marketing', label: 'Helping the right people discover and choose a product' },
    { value: 'cloud', label: 'Keeping everything running, safe and online' },
  ],
}

export const motivationOptions = [
  { value: 'professional_developer', label: 'I want to become a professional developer', icon: '🧑‍💻' },
  { value: 'advance_career', label: 'To advance my current career', icon: '💼' },
  { value: 'build_things', label: 'To build apps, websites, or internal tools', icon: '🧱' },
  { value: 'for_fun', label: 'Just to have fun', icon: '🎉' },
  { value: 'different_reason', label: 'I have a different reason', icon: '❓' },
]

// `rung` is explicit so placement never has to infer an ordering across what
// are really three different axes (tooling, shipping, professional context).
export const experienceOptions = [
  { value: 'complete_beginner', label: 'Complete beginner', rung: 1 },
  { value: 'watched_tutorials', label: 'I’ve watched tutorials', rung: 1 },
  { value: 'tried_small_exercises', label: 'I’ve tried small exercises', rung: 2 },
  { value: 'built_small_projects', label: 'I’ve built small projects', rung: 3 },
  { value: 'pushed_to_platform', label: 'I’ve pushed work to GitHub, Figma, Power BI or similar', rung: 3 },
  { value: 'built_used_by_others', label: 'I’ve built something people used', rung: 4 },
  { value: 'worked_clients_teams', label: 'I’ve worked with clients or teams', rung: 4 },
]

export const projectInterestOptions = [
  { value: 'ai_tools', label: 'AI tools' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'productivity', label: 'Productivity tools' },
  { value: 'games', label: 'Games' },
  { value: 'social', label: 'Social platforms' },
  { value: 'dashboards', label: 'Business dashboards' },
  { value: 'school_project', label: 'School / final-year projects' },
]

export const immediateNeedOptions = [
  { value: 'career_path', label: 'Pick the right career path' },
  { value: 'choose_stack', label: 'Choose the right stack' },
  { value: 'learn_basics', label: 'Learn the basics from scratch' },
  { value: 'build_projects', label: 'Build projects' },
  { value: 'improve_portfolio', label: 'Improve my portfolio' },
  { value: 'fix_gaps', label: 'Fix gaps in my knowledge' },
  { value: 'interview_prep', label: 'Prepare for interviews' },
]

export const dailyTimeOptions = [
  { value: 5, label: '5 min', aside: 'A coffee queue' },
  { value: 10, label: '10 min', aside: 'A bus ride' },
  { value: 15, label: '15 min', aside: 'A lunch break' },
  { value: 20, label: '20 min +', aside: 'I’m serious' },
]

const branchInsights = {
  web: 'The web turns ideas into tools anyone can reach.',
  mobile: 'Phones put your work directly into people’s hands.',
  backend: 'Reliable products depend on strong invisible systems.',
  data: 'Good data turns uncertainty into better decisions.',
  ai: 'AI is reshaping how every industry works.',
  product: 'Great products begin with the right problem.',
  marketing: 'Good marketing connects useful products with the right people.',
  design: 'Good design makes complex things feel simple.',
  cloud: 'Modern products depend on secure, reliable infrastructure.',
  not_sure: 'Exploring is how the right direction becomes clear.',
}

const roleInsights = {
  web: 'Web roles blend logic with visual craft.',
  mobile: 'Mobile roles design for life beyond the desk.',
  backend: 'Backend roles keep data moving safely.',
  data: 'Data roles turn patterns into better decisions.',
  ai: 'AI roles turn data into useful predictions and tools.',
  product: 'Product roles connect user needs with execution.',
  marketing: 'Marketing roles connect customer insight with measurable growth.',
  design: 'Design roles turn friction into clear experiences.',
  cloud: 'Cloud roles keep digital products secure and available.',
}

// Short pauses acknowledge what the learner shared and add one useful spark
// without changing their learning profile.
export const breakPrompts = {
  motivation: { message: () => 'That’s a strong reason to start.', insight: 'Clear goals make consistent practice easier.' },
  branch: { message: (answer, _, values) => values.includes('not_sure') ? 'We’ll narrow it down together.' : `${answer} it is.`, insight: (branch) => branchInsights[branch] ?? branchInsights.not_sure },
  branch_triage: { message: (answer) => `${answer} fits you well.`, insight: (branch) => branchInsights[branch] ?? branchInsights.not_sure },
  role: { message: (answer, _, values) => values.includes('help_me_choose') ? 'I’ll help you find the right fit.' : `${answer} it is.`, insight: (branch) => roleInsights[branch] ?? 'Every role grows from strong foundations.' },
  role_sub_quiz: { message: (answer) => `${answer} sounds right.`, insight: (branch) => roleInsights[branch] ?? 'Every role grows from strong foundations.' },
  experience: { message: () => 'We’ll start at your level.', insight: 'The right starting level keeps challenge productive.' },
  starting_point: { message: () => 'That’s where your path will begin.', insight: 'You can revisit earlier lessons whenever you need.' },
  project_interest: { message: (answer, labels) => labels.length > 1 ? 'Nice mix. Your projects will feel familiar.' : `Projects inspired by ${answer}.`, insight: 'Relevant projects make new skills stick.' },
  immediate_need: { message: (answer, labels) => labels.length > 1 ? 'We’ll put those goals first.' : `We’ll focus on ${answer.toLowerCase()} first.`, insight: 'A clear priority keeps learning focused.' },
  daily_time: { message: (answer) => `${answer} a day. You’ve got this.`, insight: 'Short daily practice beats occasional long sessions.' },
}

// What the answers actually produce. v2 declared nothing here at all.
export const outcomes = {
  roleToPath: {
    frontend_developer: 'backend-developer', fullstack_developer: 'backend-developer', ui_ux_developer: 'backend-developer',
    ios_developer: 'backend-developer', android_developer: 'backend-developer', cross_platform_developer: 'backend-developer',
    backend_developer: 'backend-developer', database_developer: 'learn-sql', api_systems_engineer: 'backend-developer',
    data_analyst: 'data-analyst', data_engineer: 'data-scientist', business_intelligence: 'learn-sql', data_scientist: 'data-scientist',
    ml_engineer: 'machine-learning', ai_app_developer: 'ai-engineer', automation_developer: 'learn-python',
    product_manager: 'data-scientist', business_analyst: 'data-scientist', technical_project_coordinator: 'technical-project-coordinator',
    digital_marketer: 'digital-marketing',
    ui_ux_designer: 'backend-developer', product_designer: 'backend-developer', design_systems_specialist: 'backend-developer',
    devops_engineer: 'learn-docker', cloud_engineer: 'learn-docker', cybersecurity_specialist: 'ai-engineer',
  },
  // Minutes a day at roughly one lesson per five minutes, over a week.
  dailyGoalXp: (minutes) => Math.max(25, Math.round((minutes / 5) * 25)),
  lessonsPerWeek: (minutes) => Math.max(1, Math.round((minutes / 5) * 7)),
}

export const ALL_ROLES = Object.values(roleOptions)
  .flat()
  .map((option) => option.value)
  .filter((value) => value !== 'help_me_choose')
