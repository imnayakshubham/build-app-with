export function generateViteConfig(answers) {
  const imports = [`import { defineConfig } from 'vite'`, `import react from '@vitejs/plugin-react'`];
  const plugins = ['react()'];

  const config = `${imports.join('\n')}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [${plugins.join(', ')}],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
`;

  return config;
}