import React from 'react';
import useFetchData from '../hooks/useFetchData';

function displaySessions(data) {
    let table = {
        '25 minutes': 0,
        '50 minutes': 0,
        '75 minutes': 0
    };
    for (let index in data) {
        table[`${data[index].duration / 60000} minutes`] += 1;
    };
    return (
        <table>    
            {Object.entries(table).map( ([key, value]) => ( 
                <tr key={key}><td>{key}</td><td>{value}</td></tr>
            ))}
        </table>
    )
};

export default function Sessions() {
    // TODO make dates dynamic
    const [loading, data] = useFetchData('sessions?start=2022-12-20T12:00:00Z&end=2022-12-29T12:00:00Z', 'sessions');

    return (
        <>
            {loading ? 'Loading...' : displaySessions(data)}
        </>
    );
}
