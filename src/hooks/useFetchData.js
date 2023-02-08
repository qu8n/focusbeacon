import { useState, useEffect } from 'react';

export default function useFetchData(urlPath, apiEndpointType) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", process.env.REACT_APP_FOCUSMATE_API_KEY);

        const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
        };

        fetch(`https://api.focusmate.com/v1/${urlPath}`, requestOptions)
            .then(response => response.json())
            .then((result) => {
                if (apiEndpointType === "profile") {
                    setData(result.user)
                } else if (apiEndpointType === "sessions") {
                    setData(result.sessions)
                };
                setLoading(false)})
            .catch(error => console.log('error', error));
    }, [urlPath, apiEndpointType]);

    return [loading, data];
}
