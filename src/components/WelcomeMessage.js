import { Text, Flex } from '@tremor/react';
import GitHubButton from 'react-github-btn';
import '../styles/WelcomeMessage.css';

export default function WelcomeMessage() {
    return (
        <div className='message'>
            <Text marginTop='mt-3'>
                Thanks for stopping by! My name is Quan. 👋
            </Text>
            <Text marginTop='mt-3'>
                I'm building this website to help you view details of your past FocusMate sessions.
            </Text>
            <Text marginTop='mt-3'>
                FocusMate has been life-changing for me, and I'm hoping that this dashboard will
                serve as a reminder of your past work and motivate you towards your goals.
            </Text>
            <Text marginTop='mt-3'>
                Above are my stats. I'm working on adding even more metrics.
            </Text>
            <Text marginTop='mt-3'>
                Soon, you will be able to sign in and view your own stats.
                Want to be the first to know when I launch?
                Provide your email <a href="https://mailchi.mp/32761f8aafc0/focusstats">here</a>. 
                You'll get a one-time email when this website is ready.
            </Text>
            <Flex marginTop='mt-4' justifyContent='justify-start' spaceX='space-x-2'>
                <Text>
                Are you on GitHub? 
                </Text>
                <GitHubButton 
                href="https://github.com/qu8n/focusmate-stats" 
                data-size="large" 
                aria-label="Star qu8n/focusmate-stats on GitHub">
                    Star my project
                </GitHubButton>
            </Flex>
        </div>
    )
};