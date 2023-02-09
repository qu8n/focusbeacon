import React from 'react';
import useFetchData from '../hooks/useFetchData';

export default function Profile() {
    const [loading, data] = useFetchData('me', 'profile');
    const {name, totalSessionCount, timeZone, photoUrl} = data;

    const profileCard = 
        <>
            <img src={photoUrl} alt='profile' style={{'border-radius':'50%', 'height':'100px'}}/>
            <p>{name}</p>
            <p>{totalSessionCount}</p>
            <p>{timeZone}</p>
        </>

    return (
        <div>
            {loading ? 'Loading...' : profileCard}
        </div>
    );
}
