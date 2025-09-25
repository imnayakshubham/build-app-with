// Simple version constant that works with Jest
// Read package.json using a simple relative path resolution
import fs from 'fs';
import path from 'path';

let version = '2.0.2'; // Fallback version

// Try to read version from package.json
try {
  // This works for both CommonJS and ES modules in Jest
  const packagePath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  ({ version } = packageJson);
} catch (error) {
  // Use fallback version if reading fails
}

export { version };