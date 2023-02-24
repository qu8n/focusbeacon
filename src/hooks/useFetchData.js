import { useState, useEffect } from 'react';

export default function useFetchData() {
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState([]);
    const [sessionsData, setSessionsData] = useState([]);
    const [partnerData, setPartnerData] = useState([]);

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
            try {
                const response = await fetch(`https://api.focusmate.com/v1/me`, requestOptions());
                const result = await response.json();
                setProfileData(result.user);
            } catch (error) {
                console.log(`Error fetching profile data: ${error.message}`);
            };
            
            const currentYear = new Date().getFullYear();
            let rawSessionData = [];
            // One request for each year because each API call only returns one year of data max
            for (let year = currentYear; year >= 2016; year--) {
                try {
                    const response = await fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions());
                    const result = await response.json();
                    rawSessionData = [...rawSessionData, ...result.sessions];
                } catch (error) {
                   console.log(`Error fetching data for year ${year}: ${error.message}`);
                };
            };

            // Exclude incomplete sessions because they're not "counted"
            const filteredSessionData = rawSessionData.filter(
                session => session.users[0].completed === true
            );

            setSessionsData(filteredSessionData);
        };

        // const fetchPartnerData = async () => {
        //     const filteredSessionData = sessionsData.filter(
        //         session => session.users.length === 2
        //     );

        //     let rawPartnerData = [];
        //     for (let session of filteredSessionData) {
        //         try {
        //             const response = await fetch(`https://api.focusmate.com/v1/${session.users[1].userId}`, requestOptions());
        //             const result = await response.json();
        //             rawPartnerData = [...rawPartnerData, ...result.sessions];
        //         } catch (error) {
        //             console.log(`Error fetching data for session ${session.sessionId}: ${error.message}`);
        //         };
        //     };

        //     setPartnerData(rawPartnerData);
        // };

        const fetchAllData = async () => {
            await fetchProfileAndSessionsData();
            // await fetchPartnerData();
            
            setLoading(false);
        };

        fetchAllData();
    }, []);
    
    return [loading, profileData, sessionsData];
}
