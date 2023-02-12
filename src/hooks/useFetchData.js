import { useState, useEffect } from 'react';

export default function useFetchData() {
    const [profileData, setProfileData] = useState([]);
    const [loading, setLoading] = useState(true);
    // TODO: Refactor this to use a single useState for years 2016-present
    const [sessionsData2023, setSessionsData2023] = useState([]);
    const [sessionsData2022, setSessionsData2022] = useState([]);
    const [sessionsData2021, setSessionsData2021] = useState([]);
    const [sessionsData2020, setSessionsData2020] = useState([]);
    const [sessionsData2019, setSessionsData2019] = useState([]);
    const [sessionsData2018, setSessionsData2018] = useState([]);
    const [sessionsData2017, setSessionsData2017] = useState([]);
    const [sessionsData2016, setSessionsData2016] = useState([]);

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
        
        let year = 2023;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2023(result.sessions);  
            })
            .catch(error => console.log('error', error));

        year = 2022;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2022(result.sessions);
            })
            .catch(error => console.log('error', error));

        year = 2021;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2021(result.sessions);  
            })
            .catch(error => console.log('error', error));

        year = 2020;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2020(result.sessions);  
            })
            .catch(error => console.log('error', error));

        year = 2019;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2019(result.sessions);  
            })
            .catch(error => console.log('error', error));

        year = 2018;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2018(result.sessions);  
            })
            .catch(error => console.log('error', error));

        year = 2017;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2017(result.sessions);  
            })
            .catch(error => console.log('error', error));

        year = 2016;
        fetch(`https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                setSessionsData2016(result.sessions);  
            })
            .catch(error => console.log('error', error));

        setLoading(false);
    }, []);

    return [loading, profileData, [
        ...sessionsData2023, 
        ...sessionsData2022, 
        ...sessionsData2021, 
        ...sessionsData2020,
        ...sessionsData2019,
        ...sessionsData2018,
        ...sessionsData2017,
        ...sessionsData2016
    ]];
}
