// Personas the weekly cohorts are drawn from. `pace` is baseline XP per active
// day in Bronze (scaled up per league); `consistency` is how likely they are to
// practise on any given day.
//
// ORDER IS LOAD-BEARING: buildCohort shuffles this array by index, so inserting,
// removing or reordering an entry silently rewrites every past and future
// cohort. Editing a field in place is safe; moving a line is not.
//
// `tag` is cosmetic and deliberately spread across the pace range. It used to
// sit almost entirely on the fastest personas, which put PRO badges on four of
// the top five rows every week and implied paying made you win — it does not,
// and nothing in scoring reads this field.
export const rivals = [
  { id: 'stefano-d', name: "Stefano D'Avascio", role: 'Product Designer', tag: 'PRO', pace: 96, consistency: 0.92 },
  { id: 'nuriye-s', name: 'Nuriye Sarıca', role: 'Product Designer', tag: null, pace: 88, consistency: 0.9 },
  { id: 'varun-y', name: 'Varun Yadav', role: 'UX/UI Designer', tag: null, pace: 82, consistency: 0.84 },
  { id: 'pranay-g', name: 'Pranay Goud', role: 'Product Designer', tag: null, pace: 76, consistency: 0.8 },
  { id: 'narduccio-v', name: 'Narduccio van der Veekens', role: 'UX/UI Designer', tag: null, pace: 71, consistency: 0.86 },
  { id: 'amara-k', name: 'Amara Kim', role: 'Data Scientist path', tag: null, pace: 68, consistency: 0.78 },
  { id: 'jonas-b', name: 'Jonas Berg', role: 'Backend Developer path', tag: null, pace: 64, consistency: 0.72 },
  { id: 'priya-s', name: 'Priya Sharma', role: 'AI Engineer path', tag: null, pace: 61, consistency: 0.81 },
  { id: 'leo-f', name: 'Leo Ferreira', role: 'Machine Learning Engineer path', tag: null, pace: 57, consistency: 0.7 },
  { id: 'mina-t', name: 'Mina Torres', role: 'Data Scientist path', tag: null, pace: 54, consistency: 0.68 },
  { id: 'hooriya-i', name: 'Hooriya Ibrar', role: 'Backend Developer path', tag: null, pace: 50, consistency: 0.66 },
  { id: 'samri-b', name: 'Samri Bek', role: 'UX/UI Designer', tag: null, pace: 47, consistency: 0.63 },
  { id: 'grid-g', name: 'Grid Guru', role: 'AI Engineer path', tag: null, pace: 44, consistency: 0.6 },
  { id: 'kazuhiro-c', name: 'Kazuhiro Chō', role: 'Student', tag: 'PRO', pace: 41, consistency: 0.58 },
  { id: 'sridevi-r', name: 'Sridevi Rao', role: 'Data Scientist path', tag: 'PRO', pace: 38, consistency: 0.55 },
  { id: 'tomas-n', name: 'Tomáš Novák', role: 'Backend Developer path', tag: null, pace: 79, consistency: 0.74 },
  { id: 'aisha-m', name: 'Aisha Mahmoud', role: 'AI Engineer path', tag: 'PRO', pace: 85, consistency: 0.88 },
  { id: 'wei-l', name: 'Wei Lin', role: 'Machine Learning Engineer path', tag: null, pace: 73, consistency: 0.76 },
  { id: 'sofia-r', name: 'Sofia Ramírez', role: 'Data Scientist path', tag: null, pace: 66, consistency: 0.71 },
  { id: 'daniel-o', name: 'Daniel Okonkwo', role: 'Student', tag: 'PRO', pace: 35, consistency: 0.52 },
  { id: 'elena-v', name: 'Elena Vasquez', role: 'UX/UI Designer', tag: null, pace: 59, consistency: 0.67 },
  { id: 'hiroshi-t', name: 'Hiroshi Tanaka', role: 'Backend Developer path', tag: null, pace: 91, consistency: 0.89 },
  { id: 'fatima-z', name: 'Fatima Zahra', role: 'AI Engineer path', tag: null, pace: 62, consistency: 0.69 },
  { id: 'lucas-m', name: 'Lucas Müller', role: 'Machine Learning Engineer path', tag: null, pace: 48, consistency: 0.61 },
  { id: 'ingrid-l', name: 'Ingrid Larsen', role: 'Data Scientist path', tag: null, pace: 70, consistency: 0.77 },
  { id: 'omar-h', name: 'Omar Haddad', role: 'Student', tag: null, pace: 32, consistency: 0.48 },
  { id: 'yuki-s', name: 'Yuki Sato', role: 'Product Designer', tag: 'PRO', pace: 55, consistency: 0.64 },
  { id: 'nadia-p', name: 'Nadia Petrova', role: 'Backend Developer path', tag: null, pace: 67, consistency: 0.73 },
  { id: 'carlos-s', name: 'Carlos Silva', role: 'AI Engineer path', tag: null, pace: 43, consistency: 0.57 },
  { id: 'mei-w', name: 'Mei Wong', role: 'Machine Learning Engineer path', tag: null, pace: 87, consistency: 0.85 },
  { id: 'rasmus-j', name: 'Rasmus Jensen', role: 'Data Scientist path', tag: 'PRO', pace: 51, consistency: 0.62 },
  { id: 'chidi-e', name: 'Chidi Eze', role: 'Student', tag: 'PRO', pace: 29, consistency: 0.45 },
  { id: 'anya-k', name: 'Anya Kowalski', role: 'UX/UI Designer', tag: null, pace: 60, consistency: 0.68 },
  { id: 'ravi-p', name: 'Ravi Patel', role: 'Backend Developer path', tag: null, pace: 74, consistency: 0.79 },
  { id: 'clara-b', name: 'Clara Bianchi', role: 'Product Designer', tag: null, pace: 46, consistency: 0.59 },
  { id: 'tunde-a', name: 'Tunde Adeyemi', role: 'AI Engineer path', tag: null, pace: 65, consistency: 0.7 },
  { id: 'sasha-i', name: 'Sasha Ivanov', role: 'Machine Learning Engineer path', tag: null, pace: 39, consistency: 0.54 },
  { id: 'linnea-o', name: 'Linnéa Öberg', role: 'Data Scientist path', tag: null, pace: 83, consistency: 0.87 },
  { id: 'kofi-m', name: 'Kofi Mensah', role: 'Student', tag: null, pace: 26, consistency: 0.42 },
  { id: 'zara-q', name: 'Zara Qureshi', role: 'UX/UI Designer', tag: null, pace: 58, consistency: 0.66 },
  { id: 'marco-r', name: 'Marco Rossi', role: 'Backend Developer path', tag: null, pace: 53, consistency: 0.65 },
  { id: 'hana-k', name: 'Hana Kim', role: 'AI Engineer path', tag: null, pace: 72, consistency: 0.75 },
  { id: 'pablo-g', name: 'Pablo Gómez', role: 'Machine Learning Engineer path', tag: null, pace: 36, consistency: 0.5 },
  { id: 'freya-n', name: 'Freya Nilsen', role: 'Data Scientist path', tag: null, pace: 63, consistency: 0.72 },
  { id: 'ibrahim-d', name: 'Ibrahim Diallo', role: 'Student', tag: null, pace: 30, consistency: 0.47 },
]
