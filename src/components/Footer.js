import { Divider, Text } from "@tremor/react";
import "../styles/Footer.css";

export default function Footer() {
    return (
        <>
            <Divider/>
            <div className={'mt-8 mb-12 flex justify-center'}>
                <Text>
                    Made with 🧋 by&nbsp;
                    <a className="hyperlink" href="https://github.com/qu8n" target="_blank" rel="noreferrer">
                        Quan Nguyen
                    </a>
                </Text>
            </div>
        </>
    )
};