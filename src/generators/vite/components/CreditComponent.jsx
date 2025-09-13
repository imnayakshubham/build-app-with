import { APP_NAME, NPM_URL } from "../../constants";

export function CreditComponent({ appName = APP_NAME, npmUrl = NPM_URL }) {
    const containerStyle = {
        fontFamily: 'sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'inherit',
        borderRadius: '8px',
        margin: '1rem',
        border: '1px solid',
        maxWidth: '600px',
        flexDirection: 'column',
        textAlign: 'center',
    };

    const headingStyle = {
        marginBottom: '0.5em',
    };

    const linkStyle = {
        color: '#0070f3',
        fontWeight: 'bold',
        textDecoration: 'none',
    };

    return (
        <div style={containerStyle}>
            <div>
                <h2 style={headingStyle}>
                    Start building something amazing! <span style={{ fontSize: '1.2em' }}>🚀</span>
                </h2>
                <a href={npmUrl ?? NPM_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Install via npm: <strong>{appName ?? APP_NAME}</strong>
                </a>
            </div>
        </div>
    );
}
