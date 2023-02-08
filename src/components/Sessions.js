import React, { useState, useEffect } from 'react';

export default function Sessions() {
    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", process.env.REACT_APP_FOCUSMATE_API_KEY);

        const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
        };

        fetch("https://api.focusmate.com/v1/sessions?start=2022-12-01T12:00:00Z&end=2023-01-01T13:00:00Z", requestOptions)
            .then(response => response.json())
            .then(result => setSessionData(result))
            .catch(error => console.log('error', error));
    }, []);

    return (
        <div>
        {!sessionData ? 
            <p>Loading...</p> :
            <p>{JSON.stringify(sessionData)}</p>} 
        </div>
    );
}
