import GitHubButton from 'react-github-btn';

export default function WelcomeMessage() {
    return (
        <>
            <p className='text-center leading-5'>
                👋🏼 Hi! I'm building this metrics dashboard for FocusMate users. Below are my stats.<br/>
                I'm working on adding more stats and letting you sign in to see your own.<br/><br/>
                <GitHubButton
                    href="https://github.com/qu8n/focusbeacon"
                    data-size="large" 
                    aria-label="Star project on GitHub">
                        &nbsp; Star project on GitHub
                </GitHubButton>
            </p>
        </>
    )
};