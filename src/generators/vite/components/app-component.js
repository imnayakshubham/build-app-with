export function generateAppComponent(answers) {
  const imports = [`import React from 'react'`];
  let componentContent = '';

  // Automatically add API hooks for React-based apps
  if (answers.framework === 'vite-react' || answers.framework === 'nextjs') {
    const ext = answers.typescript ? 'ts' : 'js';
    imports.push(`import { useApiQuery, useCreateItem } from './lib/use-api.${ext}'`);
    imports.push(`import { api } from './lib/axios-config.${ext}'`);
  }

  // Add feature-specific imports and content
  if (answers.features.includes('router')) {
    imports.push(`import { Routes, Route, Link } from 'react-router-dom'`);
  }

  if (answers.features.includes('framer-motion')) {
    imports.push(`import { motion } from 'framer-motion'`);
  }

  if (answers.features.includes('react-icons')) {
    imports.push(`import { FaReact, FaRocket, FaStar } from 'react-icons/fa'`);
  }

  // Generate component based on CSS framework
  switch (answers.cssFramework) {
    case 'tailwind':
      componentContent = generateTailwindApp(answers);
      break;
    case 'bootstrap':
      componentContent = generateBootstrapApp(answers);
      break;
    case 'mui':
      imports.push(`import { Container, Typography, Button, Box } from '@mui/material'`);
      componentContent = generateMUIApp(answers);
      break;
    case 'chakra':
      imports.push(`import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'`);
      componentContent = generateChakraApp(answers);
      break;
    case 'styled-components':
      imports.push(`import styled from 'styled-components'`);
      componentContent = generateStyledComponentsApp(answers);
      break;
    default:
      componentContent = generateVanillaApp(answers);
  }

  const functionDeclaration = answers.typescript ?
    `function App(): JSX.Element {` :
    `function App() {`;

  return `${imports.join('\n')}

${componentContent}

${functionDeclaration}
  ${generateAppReturn(answers)}
}

export default App
`;
}

function generateTailwindApp(answers) {
  const apiExample = answers.framework === 'vite-react' || answers.framework === 'nextjs' ? `
  // Example API usage with TanStack Query
  const { data: posts, isLoading, error } = useApiQuery(
    ['posts'],
    '/posts',
    { enabled: true }
  );

  const createPost = useCreateItem('/posts', {
    onSuccess: () => {
      console.log('Post created successfully!');
    }
  });

  const handleCreatePost = () => {
    createPost.mutate({
      title: 'New Post',
      content: 'This is a new post created with the API!'
    });
  };` : '';

  return `const features = [
  { icon: '⚡', title: 'Vite', description: 'Lightning fast build tool' },
  { icon: '⚛️', title: 'React', description: 'Modern UI library' },
  { icon: '🎨', title: 'Tailwind CSS', description: 'Utility-first CSS framework' },
  ${answers.framework === 'vite-react' || answers.framework === 'nextjs' ? `{ icon: '🔗', title: 'TanStack Query', description: 'Powerful data fetching' },\n  { icon: '🌐', title: 'Axios', description: 'HTTP client with interceptors' },` : ''}
  ${answers.features.map(feature => `{ icon: '🔧', title: '${feature}', description: 'Additional feature' }`).join(',\n  ')}
];${apiExample}`;
}

function generateBootstrapApp(answers) {
  return `const features = [
  { icon: '⚡', title: 'Vite', description: 'Lightning fast build tool' },
  { icon: '⚛️', title: 'React', description: 'Modern UI library' },
  { icon: '🅱️', title: 'Bootstrap', description: 'Popular CSS framework' },
  ${answers.features.map(feature => `{ icon: '🔧', title: '${feature}', description: 'Additional feature' }`).join(',\n  ')}
];`;
}

function generateMUIApp(answers) {
  return '';
}

function generateChakraApp(answers) {
  return '';
}

function generateStyledComponentsApp(answers) {
  return `const Container = styled.div\`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
\`;

const Card = styled.div\`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 600px;
\`;

const Title = styled.h1\`
  color: #333;
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
\`;`;
}

function generateVanillaApp(answers) {
  return `const features = [
  { icon: '⚡', title: 'Vite', description: 'Lightning fast build tool' },
  { icon: '⚛️', title: 'React', description: 'Modern UI library' },
  { icon: '🎨', title: 'CSS', description: 'Custom styling' },
  ${answers.features.map(feature => `{ icon: '🔧', title: '${feature}', description: 'Additional feature' }`).join(',\n  ')}
];`;
}

function generateAppReturn(answers) {
  console.log({ answers })
  switch (answers.cssFramework) {
    case 'tailwind':
      return `return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to ${answers.projectName}
          </h1>
          <p className="text-xl text-gray-600">
            Built with Vite + React + Tailwind CSS
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Start building something amazing! 🚀</p>
          ${answers.framework === 'vite-react' || answers.framework === 'nextjs' ? `
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">API Ready!</h3>
            <p className="text-blue-600 text-sm mb-3">
              TanStack Query and Axios are configured and ready to use.
            </p>
            <button 
              onClick={handleCreatePost}
              disabled={createPost.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createPost.isPending ? 'Creating...' : 'Test API Call'}
            </button>
          </div>` : ''}
        </div>
      </div>
    </div>
  );`;

    case 'bootstrap':
      return `return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-5">
                  <h1 className="display-4 fw-bold text-dark mb-3">
                    Welcome to ${answers.projectName}
                  </h1>
                  <p className="lead text-muted">
                    Built with Vite + React + Bootstrap
                  </p>
                </div>
                
                <div className="row g-4">
                  {features.map((feature, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body text-center">
                          <div className="display-6 mb-3">{feature.icon}</div>
                          <h5 className="card-title">{feature.title}</h5>
                          <p className="card-text text-muted">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-5">
                  <p className="text-muted">Start building something amazing! 🚀</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );`;

    case 'mui':
      return `return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 4,
            padding: 4,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            Welcome to ${answers.projectName}
          </Typography>
          <Typography variant="h5" component="p" color="text.secondary" gutterBottom>
            Built with Vite + React + Material-UI
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button variant="contained" size="large">
              Get Started 🚀
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );`;

    case 'chakra':
      return `return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        p={8}
        boxShadow="2xl"
        textAlign="center"
        maxW="2xl"
        w="full"
      >
        <VStack spacing={6}>
          <Heading as="h1" size="2xl" color="purple.600">
            Welcome to ${answers.projectName}
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Built with Vite + React + Chakra UI
          </Text>
          <Button colorScheme="purple" size="lg">
            Get Started 🚀
          </Button>
        </VStack>
      </Box>
    </Box>
  );`;

    case 'styled-components':
      return `return (
    <Container>
      <Card>
        <Title>Welcome to ${answers.projectName}</Title>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Built with Vite + React + Styled Components
        </p>
        <button 
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Get Started 🚀
        </button>
      </Card>
    </Container>
  );`;

    default:
      return `return (
    <div className="app">
      <div className="container">
        <h1>Welcome to ${answers.projectName}</h1>
        <p>Built with Vite + React</p>
        
        <div className="features">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
        
        <p>Start building something amazing! 🚀</p>
      </div>
    </div>
  );`;
  }
}