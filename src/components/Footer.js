import { RefreshIcon } from "@heroicons/react/outline";
import { Badge, Divider, Text } from "@tremor/react";
import "../styles/Footer.css";

export default function Footer({data}) {
    const updateTime = data;
    return (
        <>
            <Divider/>
            <div className={'mt-7 mb-1 flex justify-center'}>
                <Text>
                    Made with 🧋 by&nbsp;
                    <a className="hyperlink" href="https://github.com/qu8n" target="_blank" rel="noreferrer">
                        Quan Nguyen
                    </a>
                </Text>
            </div>
            <div className={'mb-10 flex justify-center'}>
                <Badge
                    text={updateTime}
                    color="slate"
                    size="sm"
                    icon={RefreshIcon}
                    marginTop="mt-3"
                />
            </div>
        </>
    )
};