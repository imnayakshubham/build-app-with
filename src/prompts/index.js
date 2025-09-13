
export function getFeaturePrompts(currentAnswers) {
    return [
        {
            type: 'checkbox',
            name: 'routing',
            message: 'Select Routing features:',
            choices: [
                { name: 'React Router DOM (Navigation)', value: 'react-router-dom' }
            ],
            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return (answers.setupType === 'customize' || answers.allowCustomFeatures) &&
                    answers.framework === 'vite-react'
            }
        },
        {
            type: 'list',
            name: 'stateMgmt',
            message: 'Select State Management features:',
            choices: [
                { name: 'None', value: '' }, // option to skip selection
                { name: 'Redux Toolkit (State Management)', value: 'redux' },
                { name: 'Zustand (State Management)', value: 'zustand' },
                { name: 'MobX (State Management)', value: 'mobx' },
                { name: 'Recoil (State Management)', value: 'recoil' }
            ],
            default: "",
            default: [],
            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return answers.setupType === 'customize' || answers.allowCustomFeatures || answers.selectedFeatures < 1
            }
        },
        // Data fetching is automatically included for React apps
        // TanStack Query and Axios with Interceptor are added by default
        {
            type: 'checkbox',
            name: 'forms',
            message: 'Select Forms features:',
            choices: [
                { name: 'React Hook Form', value: 'hook-form' },
                { name: 'Formik (Form Handling)', value: 'formik' }
            ],
            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return answers.setupType === 'customize' || answers.allowCustomFeatures
            },
        },
        {
            type: 'checkbox',
            name: 'animations',
            message: 'Select Animations features:',
            choices: [
                { name: 'Framer Motion (Animations)', value: 'framer-motion' },
                { name: 'React Spring (Animations)', value: 'react-spring' },
                { name: 'React Transition Group', value: 'react-transition-group' }
            ],
            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return answers.setupType === 'customize' || answers.allowCustomFeatures
            },
        },
        {
            type: 'checkbox',
            name: 'dragDrop',
            message: 'Select Drag & Drop features:',
            choices: [
                { name: 'React DnD (Drag & Drop)', value: 'react-dnd' },
                { name: 'React Beautiful DnD', value: 'react-beautiful-dnd' }
            ],
            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return answers.setupType === 'customize' || answers.allowCustomFeatures
            },
        },
        {
            type: 'checkbox',
            name: 'uiLibs',
            message: 'Select UI Library features:',
            choices: [
                { name: 'Ant Design', value: 'ant-design' },
                { name: 'Bootstrap', value: 'bootstrap' },
                { name: 'Material-UI (MUI)', value: 'mui' },
                { name: 'Chakra UI', value: 'chakra' },
                { name: 'shadcn/ui', value: 'shadcn' },
                { name: 'Mantine', value: 'mantine' },
            ],

            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return answers.setupType === 'customize' || answers.allowCustomFeatures
            },
        },
        {
            type: 'checkbox',
            name: 'utilities',
            message: 'Select Utilities features:',
            choices: [
                { name: 'React Icons', value: 'react-icons' },
                { name: 'React Toastify (Notifications)', value: 'react-toastify' },
                { name: 'React Table', value: 'react-table' },
                { name: 'React Select', value: 'react-select' },
                { name: 'React Helmet (Document Head mgmt)', value: 'react-helmet' },
                { name: 'React i18next (Internationalization)', value: 'react-i18next' },
                { name: 'Storybook (UI Dev Environment)', value: 'storybook' }
            ],
            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return answers.setupType === 'customize' || answers.allowCustomFeatures
            }
        },
    ];
}


export function getPrompts() {
    return [
        // 1. Framework selection at the top
        {
            type: 'list',
            name: 'framework',
            message: 'Choose your app framework:',
            choices: [
                { name: 'Next.js (React Full-stack)', value: 'nextjs' },
                { name: 'Vite + React (Frontend)', value: 'vite-react' },
                { name: 'Express.js (Node.js Backend)', value: 'express' },
                { name: 'Fastify (Node.js Backend)', value: 'fastify' }
            ]
        },
        // 2. Setup type—Default or Customize
        {
            type: 'list',
            name: 'setupType',
            message: 'Choose a setup type:',
            choices: [
                { name: 'Default (Quick start with recommended settings)', value: 'default' },
                { name: 'Customize (Advanced: choose your own settings)', value: 'customize' }
            ]
        },
        // 3. Project name
        {
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            validate: (input) => {
                if (!input) return 'Project name is required';
                if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                    return 'Project name can only contain letters, numbers, hyphens, and underscores';
                }
                return true;
            },
            default: "my-app"
        },
        // 4. Customization questions (only for "customize")
        {
            type: 'list',
            name: 'cssFramework',
            message: 'Choose a CSS framework:',
            choices: (answer) => [
                { name: 'Tailwind CSS', value: 'tailwind' },
                { name: 'Bootstrap', value: 'bootstrap' },
                { name: 'Material-UI (MUI)', value: 'mui' },
                { name: 'Chakra UI', value: 'chakra' },
                { name: 'shadcn/ui', value: 'shadcn' },
                { name: 'Mantine', value: 'mantine' },
                { name: 'Styled Components', value: 'styled-components' },
                { name: 'Vanilla CSS', value: 'vanilla' }
            ],
            when: (answers) => answers.setupType === 'customize'
        },
        {
            type: 'list',
            name: 'authStrategy',
            message: 'Choose authentication strategy:',
            choices: [
                { name: 'Clerk (Recommended for React)', value: 'clerk' },
                { name: 'NextAuth.js (Next.js only)', value: 'nextauth' },
                { name: 'Auth0', value: 'auth0' },
                { name: 'Firebase Auth', value: 'firebase-auth' },
                { name: 'None', value: 'none' }
            ],
            default: 'clerk',
            when: (answers) => answers.setupType === 'customize' && ['nextjs', 'vite-react'].includes(answers.framework)
        },
        {
            type: 'list',
            name: 'projectStructure',
            message: 'Choose project structure:',
            choices: [
                { name: 'Feature-based (Organized by features)', value: 'feature-based' },
                { name: 'Simple (Basic structure)', value: 'simple' },
                { name: 'Domain-driven (Advanced architecture)', value: 'domain-driven' }
            ],
            when: (answers) => answers.setupType === 'customize' && answers.framework === 'vite-react'
        },
        {
            type: 'list',
            name: 'typescript',
            message: 'Use TypeScript?',
            choices: [
                { name: 'Yes', value: true },
                { name: 'No', value: false }
            ],
            default: 0,
            when: (answers) =>
                answers.setupType === 'customize' && answers.framework === 'react'
        },
        // ESLint and Prettier prompts hidden per user request
        {
            type: 'list',
            name: 'eslint',
            message: 'Include ESLint configuration?',
            choices: [
                { name: 'Yes', value: true },
                { name: 'No', value: false }
            ],
            default: 0,
            when: () => false
        },
        {
            type: 'list',
            name: 'prettier',
            message: 'Include Prettier configuration?',
            choices: [
                { name: 'Yes', value: true },
                { name: 'No', value: false }
            ],
            default: 0,
            when: () => false
        },
        // 5. Final actions

    ];
}

// After prompting, always enforce TS for Next.js
export function finalizeAnswers(answers) {
    if (answers.framework === 'nextjs') {
        answers.typescript = true;
    }
    return answers;
}


export const postSetupPrompts = (answer) => {
    return [
        {
            type: 'checkbox',
            name: 'postSetup',
            message: 'After setup, do you want to:',
            choices: (answers) => [
                ...(answers.framework !== 'nextjs'
                    ? [{ name: 'Initialize a Git repository', value: 'git' }]
                    : []),

                ...(answers.framework !== 'nextjs'
                    ? [{ name: 'Install dependencies (npm/yarn/pnpm install)', value: 'install' }] : []),
                { name: 'Run the development server', value: 'devServer' }
            ]
        }
    ]
}