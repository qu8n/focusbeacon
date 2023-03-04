import { RefreshIcon } from "@heroicons/react/outline";
import { Badge, Divider, Text } from "@tremor/react";
import "../styles/Footer.css";

export default function Footer({data}) {
    const updateTime = data;
    return (
        <>
            <Divider/>
            <div className={'mt-5 flex justify-center'}>
                <Badge
                    text={updateTime}
                    color="slate"
                    size="sm"
                    icon={RefreshIcon}
                    marginTop="mt-3"
                />
            </div>
            <div className={'mt-4 mb-14 flex justify-center'}>
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