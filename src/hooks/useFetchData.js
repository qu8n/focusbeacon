import { useState, useEffect } from 'react';

export default function useFetchData() {
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState([]);
    const [sessionsData, setSessionsData] = useState([]);

    function requestOptions() {
        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", process.env.REACT_APP_FOCUSMATE_API_KEY);
        return {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
    }

    useEffect(() => {
        const fetchProfileAndSessionsData = async () => {
            fetch(`https://api.focusmate.com/v1/me`, requestOptions())
                .then(response => response.json())
                .then((result) => {
                    setProfileData(result.user);
                })
                .catch(error => console.log('error', error));
            
            // Multiple requests are needed because the API only returns one year of data per request
            const currentYear = new Date().getFullYear();
            let sessionData = [];
            for (let year = currentYear; year >= 2016; year--) {
                try {
                    const response = await fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions());
                    const result = await response.json();
                    sessionData = [...sessionData, ...result.sessions];
                } catch (error) {
                   console.log(`Error fetching data for year ${year}: ${error.message}`);
                };
            };

            const filteredSessionData = sessionData.filter(session =>
                session.users[0].completed === true
            );

            setSessionsData(filteredSessionData);
            setLoading(false);
        };

        const fetchPartnerProfileData = async () => {
            const profileAndSessionsResponse = await fetchProfileAndSessionsData();
        };

        fetchPartnerProfileData();
    }, []);

    return [loading, profileData, sessionsData];
}
