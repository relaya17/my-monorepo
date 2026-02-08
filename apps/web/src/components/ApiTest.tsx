import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ApiResponse {
  message?: string;
  data?: unknown;
}

const ApiTest = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/some-endpoint`)
      .then(response => {
        setData(response.data);
        setError(null);
      })
      .catch(err => {
        setError('Error fetching data');
        // Error fetching data
      });
  }, []);

  if (error) return <div>{error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>API Response:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default ApiTest;
