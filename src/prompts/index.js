
import { VITE_PRESETS } from '../constants/vite-features.js';
import { applyPresetFeatures, presetToSetupType } from '../utils/answer-helpers.js';

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
            }
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
            }
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
            }
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
                { name: 'Mantine', value: 'mantine' }
            ],

            when: (default_answers) => {
                const answers = default_answers ?? currentAnswers
                return answers.setupType === 'customize' || answers.allowCustomFeatures
            }
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
        }
    ];
}


/**
 * Stage 1 prompts: Framework, preset/setupType, project name, TypeScript
 * These are needed BEFORE running the scaffold (create-vite / create-next-app)
 */
export function getInitialPrompts(cliProjectName = null) {
    const prompts = [
        // 1. Framework selection
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
        // 2. Vite preset selector (for Vite + React only)
        {
            type: 'list',
            name: 'vitePreset',
            message: 'Choose your project setup:',
            choices: [
                { name: '🚀 Starter - Minimal setup (React + Vite + CSS)', value: 'starter' },
                { name: '📦 Standard - Recommended (Routing, State, Forms, UI) ⭐', value: 'standard' },
                { name: '🎨 Full Stack - Everything included', value: 'full' },
                { name: '⚙️  Custom - Advanced (choose features manually)', value: 'custom' }
            ],
            default: 1, // Standard is default
            when: (answers) => answers.framework === 'vite-react'
        },
        // 2b. Setup type for other frameworks
        {
            type: 'list',
            name: 'setupType',
            message: 'Choose a setup type:',
            choices: [
                { name: 'Default (Quick start with recommended settings)', value: 'default' },
                { name: 'Customize (Advanced: choose your own settings)', value: 'customize' }
            ],
            when: (answers) => answers.framework !== 'vite-react'
        }
    ];

    // 3. Project name - only ask if not provided via CLI
    if (!cliProjectName) {
        prompts.push({
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
        });
    }

    // 4. TypeScript - needed before scaffold for Vite (determines --template)
    prompts.push({
        type: 'list',
        name: 'typescript',
        message: 'Use TypeScript?',
        choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false }
        ],
        default: 0,
        when: (answers) =>
            answers.framework === 'vite-react' && answers.vitePreset === 'custom'
    });

    return prompts;
}

/**
 * Stage 3 prompts: CSS framework, auth, project structure, feature categories
 * Asked AFTER the scaffold is created so user sees progress early
 */
export function getCustomizationPrompts(initialAnswers) {
    const prompts = [
        {
            type: 'list',
            name: 'cssFramework',
            message: 'Choose a CSS framework:',
            choices: () => [
                { name: 'Tailwind CSS', value: 'tailwind' },
                { name: 'Bootstrap', value: 'bootstrap' },
                { name: 'Material-UI (MUI)', value: 'mui' },
                { name: 'Chakra UI', value: 'chakra' },
                { name: 'shadcn/ui', value: 'shadcn' },
                { name: 'Mantine', value: 'mantine' },
                { name: 'Styled Components', value: 'styled-components' },
                { name: 'Vanilla CSS', value: 'vanilla' }
            ],
            when: (answers) => {
                const merged = { ...initialAnswers, ...answers };
                // For Vite: show for non-Starter presets
                if (merged.framework === 'vite-react') {
                    return merged.vitePreset !== 'starter';
                }
                // Only show CSS framework for frontend frameworks
                if (merged.framework === 'nextjs') {
                    return merged.setupType === 'customize';
                }
                // Backend frameworks (Express, Fastify) don't need CSS frameworks
                return false;
            }
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
            when: (answers) => {
                const merged = { ...initialAnswers, ...answers };
                return merged.setupType === 'customize' && ['nextjs', 'vite-react'].includes(merged.framework);
            }
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
            when: (answers) => {
                const merged = { ...initialAnswers, ...answers };
                return merged.setupType === 'customize' && merged.framework === 'vite-react';
            }
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
        }
    ];

    // Add feature prompts for Vite + React users
    const featurePrompts = getFeaturePrompts();
    featurePrompts.forEach(prompt => {
        const originalWhen = prompt.when;
        prompt.when = (answers) => {
            const merged = { ...initialAnswers, ...answers };
            // Show for Vite + React framework
            if (merged.framework === 'vite-react') {
                // For Custom preset: show all feature prompts
                if (merged.vitePreset === 'custom') {
                    return originalWhen ? originalWhen(merged) : true;
                }
                // For Standard/Full presets: optionally show (user can add more features)
                if (merged.vitePreset === 'standard' || merged.vitePreset === 'full') {
                    return originalWhen ? originalWhen(merged) : true;
                }
            }
            return false;
        };
    });
    prompts.push(...featurePrompts);

    return prompts;
}

/**
 * Backward-compatible: returns all prompts combined (initial + customization)
 * Used by non-progressive flows or tests that expect the old single-call pattern
 */
export function getPrompts(cliProjectName = null) {
    const initialPrompts = getInitialPrompts(cliProjectName);

    // Build customization prompts without initial answers (will use inquirer's accumulated answers)
    const customizationPrompts = [
        {
            type: 'list',
            name: 'cssFramework',
            message: 'Choose a CSS framework:',
            choices: () => [
                { name: 'Tailwind CSS', value: 'tailwind' },
                { name: 'Bootstrap', value: 'bootstrap' },
                { name: 'Material-UI (MUI)', value: 'mui' },
                { name: 'Chakra UI', value: 'chakra' },
                { name: 'shadcn/ui', value: 'shadcn' },
                { name: 'Mantine', value: 'mantine' },
                { name: 'Styled Components', value: 'styled-components' },
                { name: 'Vanilla CSS', value: 'vanilla' }
            ],
            when: (answers) => {
                // For Vite: show for non-Starter presets
                if (answers.framework === 'vite-react') {
                    return answers.vitePreset !== 'starter';
                }
                // Only show CSS framework for frontend frameworks
                if (answers.framework === 'nextjs') {
                    return answers.setupType === 'customize';
                }
                // Backend frameworks (Express, Fastify) don't need CSS frameworks
                return false;
            }
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
        }
    ];

    // Add feature prompts
    const featurePrompts = getFeaturePrompts();
    featurePrompts.forEach(prompt => {
        const originalWhen = prompt.when;
        prompt.when = (answers) => {
            if (answers.framework === 'vite-react') {
                if (answers.vitePreset === 'custom') {
                    return originalWhen ? originalWhen(answers) : true;
                }
                if (answers.vitePreset === 'standard' || answers.vitePreset === 'full') {
                    return originalWhen ? originalWhen(answers) : true;
                }
            }
            return false;
        };
    });
    customizationPrompts.push(...featurePrompts);

    return [...initialPrompts, ...customizationPrompts];
}

// After prompting, always enforce TS for Next.js and default to TS for Vite+React
export function finalizeAnswers(answers) {
    if (answers.framework === 'nextjs') {
        answers.typescript = true;
    }
    // Default to TypeScript for Vite+React if not explicitly set
    if (answers.framework === 'vite-react' && answers.typescript === undefined) {
        answers.typescript = true;
    }

    // Apply Vite preset features
    if (answers.framework === 'vite-react' && answers.vitePreset) {
        // Set setupType for compatibility with existing code
        answers.setupType = presetToSetupType(answers.vitePreset);

        // For Starter: set default CSS framework if not selected
        if (answers.vitePreset === VITE_PRESETS.STARTER) {
            answers.cssFramework = answers.cssFramework || 'vanilla';
        }

        // Apply preset features (merges with user selections)
        answers = applyPresetFeatures(answers, answers.vitePreset);
    }

    return answers;
}


export const postSetupPrompts = () => {
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
