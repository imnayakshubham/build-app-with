export function generateMainFile(answers) {
  const imports = [`import React from 'react'`, `import ReactDOM from 'react-dom/client'`];
  const appImport = `import App from './App.${answers.typescript ? 'tsx' : 'jsx'}'`;
  const cssImport = `import './index.css'`;

  // Add framework-specific imports
  if (answers.cssFramework === 'bootstrap') {
    imports.push(`import 'bootstrap/dist/css/bootstrap.min.css'`);
  }

  const allImports = [...imports, appImport, cssImport].join('\n');

  let providerWrappers = ['<App />'];

  // Add Redux provider if selected
  if (answers.features.includes('redux')) {
    imports.push(`import { Provider } from 'react-redux'`);
    imports.push(`import { store } from './store/store.${answers.typescript ? 'ts' : 'js'}'`);
    providerWrappers = [`<Provider store={store}>`, `  <App />`, `</Provider>`];
  }

  // Add React Query provider if selected
  if (answers.features.includes('react-query')) {
    imports.push(`import { QueryClient, QueryClientProvider } from '@tanstack/react-query'`);
    const queryClientSetup = `\nconst queryClient = new QueryClient();`;
    
    if (providerWrappers.length === 1) {
      providerWrappers = [`<QueryClientProvider client={queryClient}>`, `  <App />`, `</QueryClientProvider>`];
    } else {
      providerWrappers.splice(0, 0, `<QueryClientProvider client={queryClient}>`);
      providerWrappers.push(`</QueryClientProvider>`);
    }
  }

  // Add Router provider if selected
  if (answers.features.includes('router')) {
    imports.push(`import { BrowserRouter } from 'react-router-dom'`);
    
    if (providerWrappers.length === 1) {
      providerWrappers = [`<BrowserRouter>`, `  <App />`, `</BrowserRouter>`];
    } else {
      providerWrappers.splice(0, 0, `<BrowserRouter>`);
      providerWrappers.push(`</BrowserRouter>`);
    }
  }

  // Add Chakra UI provider if selected
  if (answers.cssFramework === 'chakra') {
    imports.push(`import { ChakraProvider } from '@chakra-ui/react'`);
    
    if (providerWrappers.length === 1) {
      providerWrappers = [`<ChakraProvider>`, `  <App />`, `</ChakraProvider>`];
    } else {
      providerWrappers.splice(0, 0, `<ChakraProvider>`);
      providerWrappers.push(`</ChakraProvider>`);
    }
  }

  const renderContent = providerWrappers.length === 1 ? 
    providerWrappers[0] : 
    providerWrappers.map((line, index) => {
      if (index === 0 || index === providerWrappers.length - 1) return line;
      return `  ${line}`;
    }).join('\n');

  return `${allImports}

ReactDOM.createRoot(document.getElementById('root')${answers.typescript ? '!' : ''}).render(
  <React.StrictMode>
    ${renderContent}
  </React.StrictMode>,
)
`;
}