import React from 'react';
import useFetchData from '../hooks/useFetchData';

function displaySessions(data) {
    return (
        <>
            {data.map( (eachSession, index) => (
                <p key={index}>{JSON.stringify(eachSession)}</p>
            ))}
        </>
    )
}

export default function Sessions() {
    // TODO make dates dynamic
    const [loading, data] = useFetchData('sessions?start=2022-12-28T12:00:00Z&end=2022-12-29T12:00:00Z', 'sessions');

    return (
        <>
            {loading ? 'Loading...' : displaySessions(data)}
        </>
    );
}
