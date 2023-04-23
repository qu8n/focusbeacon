import React from "react";
import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    async function fetchData() {
      await fetch("/api/request");
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
