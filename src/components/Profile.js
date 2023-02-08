import React from 'react';
import useFetchData from '../hooks/useFetchData';

export default function Profile() {
    const [loading, data] = useFetchData('me', 'profile');

    return (
        <div>
            {loading ? 'Loading...' : JSON.stringify(data)}
        </div>
    );
}
