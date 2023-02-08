import React from 'react';
import useFetchData from '../hooks/useFetchData';

export default function Sessions() {
    const [loading, data] = useFetchData('sessions?start=2022-12-01T12:00:00Z&end=2023-01-01T13:00:00Z', 'sessions');

    return (
        <div>
            {loading ? 'Loading...' : JSON.stringify(data)}
        </div>
    );
}
