import React from 'react';
import useFetchData from '../hooks/useFetchData';

function displaySessions(data) {
    let table = {};
    for (let index in data) {
        let duration = data[index].duration;
        if (!(duration in table)) {
            table[duration] = 0
        };
        table[duration] += 1;
    };

    return (
        <table>    
            {Object.entries(table).map( ([key, value]) => ( 
                <tr key={key}><td>{key}</td><td>{value}</td></tr>
            ))}
        </table>
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
