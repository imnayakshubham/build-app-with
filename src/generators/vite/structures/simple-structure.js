import fs from 'fs-extra';
import path from 'path';
import { generateAppComponent } from '../components/app-component.js';
import { generateMainFile } from '../components/main-file.js';
import { generateIndexCSS } from '../styles/index-css.js';

export async function generateSimpleStructure(projectPath, answers) {
  const srcPath = path.join(projectPath, 'src');
  await fs.ensureDir(srcPath);

  // Generate main entry file
  const mainFile = generateMainFile(answers);
  const mainExtension = answers.typescript ? 'tsx' : 'jsx';
  await fs.writeFile(path.join(srcPath, `main.${mainExtension}`), mainFile);

  // Generate App component
  const appComponent = generateAppComponent(answers);
  const appExtension = answers.typescript ? 'tsx' : 'jsx';
  await fs.writeFile(path.join(srcPath, `App.${appExtension}`), appComponent);

  // Generate CSS file
  const indexCSS = generateIndexCSS(answers);
  await fs.writeFile(path.join(srcPath, 'index.css'), indexCSS);

  // Generate a simple components directory
  const componentsPath = path.join(srcPath, 'components');
  await fs.ensureDir(componentsPath);

  // Create a sample component
  const sampleComponent = answers.typescript ? `import React from 'react';

interface WelcomeProps {
  name: string;
}

const Welcome: React.FC<WelcomeProps> = ({ name }) => {
  return (
    <div className="welcome">
      <h2>Welcome, {name}!</h2>
      <p>Your React app is ready to go.</p>
    </div>
  );
};

export default Welcome;
` : `import React from 'react';

const Welcome = ({ name }) => {
  return (
    <div className="welcome">
      <h2>Welcome, {name}!</h2>
      <p>Your React app is ready to go.</p>
    </div>
  );
};

export default Welcome;
`;

  const componentExtension = answers.typescript ? 'tsx' : 'jsx';
  await fs.writeFile(path.join(componentsPath, `Welcome.${componentExtension}`), sampleComponent);
}