/* eslint-disable no-unused-vars */
import React from "react";
import { useQuery } from "react-query";

export default function Dashboard() {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["focusmateData"],
    queryFn: async () => {
      const response = await fetch("/api/request");
      const data = await response.json();
      return data;
    }
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  console.log("data: ", data);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
