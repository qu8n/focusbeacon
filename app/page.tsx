"use client";

import React from 'react';

export default function Home() {

  const fetchData = async (url: string, headers: Record<string, string> = {}) => {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSecureButtonClick = () => {
    fetchData('/api/secure-data', { 'CORS-API-Key': "123" });
  };

  const handleInsecureButtonClick = () => {
    fetchData('/api/secure-data', {});
  };

  const handleUnsecureButtonClick = () => {
    fetchData('/api/unsecure-data', {});
  };

  return (
    <div>
      <button onClick={handleSecureButtonClick}>Get Secure Data with API Key</button>
      <br />
      <button onClick={handleInsecureButtonClick}>Get Secure Data without API Key</button>
      <br />
      <button onClick={handleUnsecureButtonClick}>Get Unsecure Data</button>
    </div>
  );
};
