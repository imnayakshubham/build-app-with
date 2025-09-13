const APP_NAME = "create-new-app";
const NPM_URL = "https://www.npmjs.com/package/create-new-app";
const GITHUB_URL = "https://github.com/your-username/create-new-app";


const containerStyle = {
  fontFamily: 'sans-serif',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'inherit',
  margin: '1rem',
};

const boxStyle = {
  marginBottom: '0.5em',
  border: '1px solid #ccc',
  padding: '1rem',
  borderRadius: '8px',
};

const headingStyle = {
  marginBottom: '0.5em',
};


export const creditString = (framework) => ` <div style={${JSON.stringify(containerStyle)}}>
      <div style={${JSON.stringify(boxStyle)}}>
        <h2 style={${JSON.stringify(headingStyle)}}>
          Start building something amazing!{' '}
          <span style={{ fontSize: '1.2em' }}>🚀</span>
        </h2>
        ${framework === 'nextjs'
    ? `<Link href="${NPM_URL}" target="_blank" rel="noopener noreferrer">Install via npm: <strong>${APP_NAME}</strong></Link>`
    : `<a href="${NPM_URL}" target="_blank" rel="noopener noreferrer">Install via npm: <strong>${APP_NAME}</strong></a>`
  }
      </div>
    </div>
`

