import './App.css';

import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("X-API-KEY", process.env.REACT_APP_FOCUSMATE_API_KEY);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch("https://api.focusmate.com/v1/me", requestOptions)
      .then(response => response.text())
      .then(result => setData(result))
      .catch(error => console.log('error', error));
  }, []);

  return (
    <div>
      {data ? <p>{data}</p> : <p>Loading...</p>}
    </div>
  );
}

export default App;

