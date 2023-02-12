import { useState, useEffect } from 'react';

export default function useFetchData() {
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
        
        let currentYear = new Date().getFullYear();
        fetch(`https://api.focusmate.com/v1/sessions?start=${currentYear-1}-01-01T12:00:00Z&end=${currentYear}-01-01T12:00:00Z`, requestOptions)
        .then(response => response.json())
        .then((result) => {
            setSessionsData(result.sessions);
            setLoading(false);          
        })
        .catch(error => console.log('error', error));

    }, []);

    return [loading, profileData, sessionsData];
}
