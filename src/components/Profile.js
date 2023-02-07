import React, { useState, useEffect } from 'react';

export default function Profile() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", process.env.REACT_APP_FOCUSMATE_API_KEY);

        const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
        };

        fetch("https://api.focusmate.com/v1/me", requestOptions)
            .then(response => response.json())
            .then(result => setUserData(result))
            .catch(error => console.log('error', error));
    }, []);

    return (
        <div>
        {!userData ? 
            <p>Loading...</p> :
            <p>{JSON.stringify(userData)}</p>} 
        </div>
    );
}
