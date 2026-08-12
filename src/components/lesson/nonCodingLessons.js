export const technicalTeamsLesson = {
  id: 'technical-teams-basics',
  title: 'How technical teams work',
  role: 'technical_project_coordinator',
  concepts: [
    {
      id: 'technical-team-coordination',
      title: 'Technical team coordination',
      activities: [
        {
          id: 'technical-team-coordination-learn',
          type: 'article',
          content: {
            title: 'Helping technical teams move together',
            intro: 'A technical project coordinator helps people understand what is happening, what comes next, and what could slow the work down.',
            sections: [
              {
                title: 'Coordination creates clarity',
                body: [
                  'Developers, designers, marketers, and stakeholders often depend on one another. A coordinator keeps the shared goal, current tasks, owners, and deadlines ',
                  { strong: 'visible' },
                  ' so nobody has to guess what is happening.',
                ],
              },
              {
                title: 'The role removes obstacles',
                body: 'A coordinator does not need to write the code. They notice missing decisions, unclear ownership, and blocked work, then help the right people resolve them.',
              },
            ],
            next: {
              title: 'Check the coordinator mindset',
              body: 'Use this idea to choose the clearest response to two everyday team situations.',
            },
          },
        },
        {
          id: 'technical-team-coordination-check',
          type: 'quiz',
          content: {
            title: 'Check technical team coordination',
            intro: 'Choose the response that makes work clearer and easier to move forward.',
            questions: [
              {
                id: 'coordination-q1',
                type: 'multiple-choice',
                prompt: 'A developer cannot start because a design has not been approved. What should the coordinator do first?',
                options: [
                  'Make the dependency visible and ask the design owner for a decision',
                  'Tell the developer to build something else without updating the plan',
                  'Wait until the next weekly meeting',
                  'Approve the design personally',
                ],
                correctIndex: 0,
                explanation: 'The coordinator makes the blocked dependency visible and brings the right owner into the decision.',
              },
              {
                id: 'coordination-q2',
                type: 'multiple-choice',
                prompt: 'Which project update is most useful to a team?',
                options: [
                  'Everything is fine',
                  'Work is continuing as normal',
                  'Invite testing is blocked until Sam approves the design by Thursday',
                  'The team has many tasks',
                ],
                correctIndex: 2,
                explanation: 'A useful update names the work, its current state, the dependency, the owner, and the needed timing.',
              },
            ],
          },
        },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand the coordinator’s role!',
    body: 'You learned how coordinators create clarity, expose dependencies, and help technical teams keep moving.',
  },
}

export const digitalMarketingLesson = {
  id: 'digital-marketing-basics',
  title: 'How digital marketing works',
  role: 'digital_marketer',
  concepts: [
    {
      id: 'digital-marketing-foundations',
      title: 'Digital marketing foundations',
      activities: [
        {
          id: 'digital-marketing-foundations-learn',
          type: 'article',
          content: {
            title: 'Connecting useful products with the right people',
            intro: 'Digital marketing uses online channels to help a specific audience discover, understand, and choose a product or service.',
            sections: [
              {
                title: 'Start with the audience and goal',
                body: [
                  'Good marketing begins by deciding ',
                  { strong: 'who' },
                  ' you want to reach and what useful action you want them to take. A clear goal might be trial signups, event registrations, or completed purchases.',
                ],
              },
              {
                title: 'Use evidence to improve',
                body: 'Marketers choose a message and channel, publish content, then measure what happened. Results such as clicks, signups, and cost help them decide what to improve next.',
              },
            ],
            next: {
              title: 'Check the marketing foundations',
              body: 'Choose the audience focused and measurable response in two short situations.',
            },
          },
        },
        {
          id: 'digital-marketing-foundations-check',
          type: 'quiz',
          content: {
            title: 'Check digital marketing foundations',
            intro: 'Use the audience, goal, and evidence behind each choice.',
            questions: [
              {
                id: 'marketing-q1',
                type: 'multiple-choice',
                prompt: 'Which is the clearest campaign goal?',
                options: [
                  'Become popular online',
                  'Generate 100 free trial signups this month',
                  'Post more often',
                  'Make everyone like the brand',
                ],
                correctIndex: 1,
                explanation: 'A useful goal names a measurable action, a target, and a time period.',
              },
              {
                id: 'marketing-q2',
                type: 'multiple-choice',
                prompt: 'Why should a marketer review clicks and signups after a campaign?',
                options: [
                  'To make the report look longer',
                  'To replace the campaign goal',
                  'To understand what worked and improve the next decision',
                  'To avoid learning about the audience',
                ],
                correctIndex: 2,
                explanation: 'Campaign evidence helps a marketer keep effective choices and change weaker ones.',
              },
            ],
          },
        },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand digital marketing!',
    body: 'You learned how audience, goals, messages, channels, and evidence work together.',
  },
}

export const dataAnalysisLesson = {
  id: 'data-analysis-basics',
  title: 'How data analysis works',
  role: 'data_analyst',
  concepts: [
    {
      id: 'data-analysis-foundations',
      title: 'Data analysis foundations',
      activities: [
        {
          id: 'data-analysis-foundations-learn',
          type: 'article',
          content: {
            title: 'Turning raw data into a decision',
            intro: 'A data analyst answers a real question by moving from raw, messy data to a clear, trustworthy conclusion.',
            sections: [
              {
                title: 'Start with a clear question',
                body: [
                  'Good analysis begins before you open a spreadsheet. Decide ',
                  { strong: 'what decision the answer needs to support' },
                  ', such as whether signups dropped after a pricing change, not just "look at the data".',
                ],
              },
              {
                title: 'Clean before you conclude',
                body: 'Raw data usually has duplicates, missing values, and inconsistent formats. Cleaning it first means the patterns you find later are real, not artifacts of messy data.',
              },
            ],
            diagram: {
              title: 'From raw data to a decision',
              body: 'Each stage removes noise and adds meaning, until the result is something a person can act on.',
              label: 'Raw data becomes cleaned data, then analysis, then an insight, then a decision',
              nodes: ['Raw data', 'Cleaned data', 'Analysis', 'Insight', 'Decision'],
            },
            next: {
              title: 'Check the analysis foundations',
              body: 'Choose the clearer question and the sounder next step in two short situations.',
            },
          },
        },
        {
          id: 'data-analysis-foundations-check',
          type: 'quiz',
          content: {
            title: 'Check data analysis foundations',
            intro: 'Use the question, the data, and the decision behind each choice.',
            questions: [
              {
                id: 'data-analysis-q1',
                type: 'multiple-choice',
                prompt: 'Which is the clearest question to start an analysis with?',
                options: [
                  'What does the data say?',
                  'Did signups drop after the March 1 pricing change, and by how much?',
                  'Can we make a chart?',
                  'Is the data interesting?',
                ],
                correctIndex: 1,
                explanation: 'A useful question names the event, the metric it affects, and asks for a measurable answer.',
              },
              {
                id: 'data-analysis-q2',
                type: 'multiple-choice',
                prompt: 'A spreadsheet of signups has duplicate rows and blank dates. What should the analyst do first?',
                options: [
                  'Build the chart anyway, duplicates rarely matter',
                  'Clean the duplicates and missing values before analyzing',
                  'Delete the whole dataset and ask for a new one',
                  'Ignore the dates and use only the totals',
                ],
                correctIndex: 1,
                explanation: 'Cleaning the data first keeps later patterns and conclusions trustworthy.',
              },
            ],
          },
        },
      ],
    },
  ],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand data analysis!',
    body: 'You learned how a clear question, clean data, and honest evidence lead to a decision worth trusting.',
  },
}

export const videoEditingLesson = {
  id: 'video-editing-basics',
  title: 'How video editing works',
  role: 'video_editor',
  concepts: [{
    id: 'video-editing-basics-foundations',
    title: 'Video editing foundations',
    activities: [
      {
        id: 'video-editing-basics-learn',
        type: 'article',
        content: {
          title: 'Video editing foundations',
          intro: 'Video editing turns selected images and sounds into a sequence with a clear purpose, feeling, and flow.',
          sections: [
            { title: 'Start with the story', body: 'Before choosing transitions or effects, decide what the viewer should understand or feel. That purpose guides which footage belongs in the edit.' },
            { title: 'Selection and timing create meaning', body: 'Editors choose the strongest moments, place them in a useful order, and adjust timing so each cut helps the viewer follow the story.' },
          ],
          next: { title: 'Check video editing foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'video-editing-basics-check',
        type: 'quiz',
        content: {
          title: 'Check video editing foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'video-editing-basics-q1',
            type: 'multiple-choice',
            prompt: 'You receive an hour of footage for a 60 second story. What should you do first?',
            options: ['Add effects to every clip', 'Define the story and select footage that supports it', 'Use the clips in the order they were filmed', 'Choose music before watching the footage'],
            correctIndex: 1,
            explanation: 'The story and audience give you a reason to include or remove each piece of footage.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand video editing foundations!',
    body: 'You learned how purpose, selection, order, and timing shape raw footage into a clear story.',
  },
}

export const contentCreationLesson = {
  id: 'content-creation-basics',
  title: 'How content creation works',
  role: 'content_creator',
  concepts: [{
    id: 'content-creation-basics-foundations',
    title: 'Content creation foundations',
    activities: [
      {
        id: 'content-creation-basics-learn',
        type: 'article',
        content: {
          title: 'Content creation foundations',
          intro: 'Useful content gives a specific audience a clear reason to watch, read, save, or share.',
          sections: [
            { title: 'Know who it is for', body: 'A focused audience makes the idea easier to shape. Start with a real question, need, or interest instead of trying to speak to everyone.' },
            { title: 'Make one clear promise', body: 'Strong content tells the audience what they will learn, feel, or be able to do, then delivers that value in a suitable format.' },
          ],
          next: { title: 'Check content creation foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'content-creation-basics-check',
        type: 'quiz',
        content: {
          title: 'Check content creation foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'content-creation-basics-q1',
            type: 'multiple-choice',
            prompt: 'Which is the strongest starting point for a new piece of content?',
            options: ['A trend everyone else is copying', 'A clear audience question you can answer well', 'The most expensive camera available', 'A format with no defined purpose'],
            correctIndex: 1,
            explanation: 'A real audience question provides both relevance and a clear promise for the content.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand content creation foundations!',
    body: 'You learned how audience, purpose, format, and a clear promise shape useful content.',
  },
}

export const socialMediaLesson = {
  id: 'social-media-basics',
  title: 'How social media management works',
  role: 'social_media_manager',
  concepts: [{
    id: 'social-media-basics-foundations',
    title: 'Social media foundations',
    activities: [
      {
        id: 'social-media-basics-learn',
        type: 'article',
        content: {
          title: 'Social media foundations',
          intro: 'Social media management connects what an audience values with a clear organisation goal and a healthy community.',
          sections: [
            { title: 'Give each channel a job', body: 'A channel should have a clear audience, purpose, and role. Posting everywhere without a reason creates work without creating value.' },
            { title: 'Measure the useful action', body: 'Reach and likes can provide context, but the best measure depends on the goal, such as useful replies, event signups, qualified visits, or retained community members.' },
          ],
          next: { title: 'Check social media foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'social-media-basics-check',
        type: 'quiz',
        content: {
          title: 'Check social media foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'social-media-basics-q1',
            type: 'multiple-choice',
            prompt: 'A team wants more event registrations. Which result is most useful to track?',
            options: ['How many posts were published', 'Event registrations attributed to social content', 'The total number of emojis used', 'Whether every channel used identical copy'],
            correctIndex: 1,
            explanation: 'The measure should connect directly to the goal the social work is meant to support.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand social media foundations!',
    body: 'You learned how audience value, channel purpose, community, and measurable goals work together.',
  },
}

export const graphicDesignLesson = {
  id: 'graphic-design-basics',
  title: 'How graphic design works',
  role: 'graphic_designer',
  concepts: [{
    id: 'graphic-design-basics-foundations',
    title: 'Graphic design foundations',
    activities: [
      {
        id: 'graphic-design-basics-learn',
        type: 'article',
        content: {
          title: 'Graphic design foundations',
          intro: 'Graphic design organises type, image, colour, and space so a message is clear, useful, and memorable.',
          sections: [
            { title: 'Hierarchy guides attention', body: 'Scale, weight, contrast, and position tell people what to notice first, what supports it, and what action or detail comes next.' },
            { title: 'Composition supports the message', body: 'Alignment, spacing, and grouping create relationships between elements. Every visual choice should help the intended audience understand the message.' },
          ],
          next: { title: 'Check graphic design foundations', body: 'Choose the response that best applies the foundation you just learned.' },
        },
      },
      {
        id: 'graphic-design-basics-check',
        type: 'quiz',
        content: {
          title: 'Check graphic design foundations',
          intro: 'Choose the clearest next step.',
          questions: [{
            id: 'graphic-design-basics-q1',
            type: 'multiple-choice',
            prompt: 'A poster has five messages competing at the same size and weight. What should the designer do first?',
            options: ['Add more colours', 'Choose the primary message and create a clear hierarchy', 'Make every message bold', 'Remove all spacing'],
            correctIndex: 1,
            explanation: 'A clear primary message gives the design an intentional reading order.',
          }],
        },
      },
    ],
  }],
  completion: {
    eyebrow: 'Lesson complete',
    title: 'You understand graphic design foundations!',
    body: 'You learned how hierarchy, composition, type, and colour guide attention and communicate meaning.',
  },
}
