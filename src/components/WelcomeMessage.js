import { Text, Flex } from '@tremor/react';
import '../styles/WelcomeMessage.css';

export default function WelcomeMessage() {
    return (
        <div className='message'>
            <Text marginTop='mt-3'>
            👋🏼 Hi there! I'm building this (in-progress) website to help us view more stats on our past FocusMate sessions.
            </Text>
            <Text marginTop='mt-3'>
                FocusMate has been life-changing for me, and I'm hoping that this dashboard will
                serve as a reminder of our past work and motivate us all towards your goals.
            </Text>
            <Text marginTop='mt-3'>
                Below are my stats. I'm working on adding even more metrics. Stay tuned!
            </Text>
        </div>
    )
};