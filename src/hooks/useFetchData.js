import { useState, useEffect } from 'react';

export default function useFetchData() {
    const [profileData, setProfileData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionsData, setSessionsData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
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
            
            // Multiple requests are needed because the API only returns one year of data per request
            const currentYear = new Date().getFullYear();
            let data = [];
            for (let year = currentYear; year >= 2016; year--) {
                try {
                    const response = await fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions);
                    const result = await response.json();
                    data = [...data, ...result.sessions];
                } catch (error) {
                   console.log(`Error fetching data for year ${year}: ${error.message}`);
                };
            };
    
            setSessionsData(data);
            setLoading(false);
        };

        fetchData();
    }, []);

    return [loading, profileData, sessionsData];
}
