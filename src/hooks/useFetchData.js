import { useState, useEffect } from 'react';

export default function useFetchData(year) {
    const [profileData, setProfileData] = useState([]);
    const [sessionsData, setSessionsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", process.env.REACT_APP_FOCUSMATE_API_KEY);

        const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
        };

        fetch(`https://api.focusmate.com/v1/me`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setProfileData(result.user);
            })
            .catch(error => console.log('error', error));
        
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
        .then(response => response.json())
        .then((result) => {
            setSessionsData(result.sessions);
            setLoading(false);     
        })
        .catch(error => console.log('error', error));

    }, [year]);

    return [loading, profileData, sessionsData];
}
