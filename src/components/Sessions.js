import React, { useEffect, useState } from 'react';
import useFetchData from '../hooks/useFetchData';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

function displaySessions(data) {
    let table = {
        '25 minutes': 0,
        '50 minutes': 0,
        '75 minutes': 0
    };
    for (let index in data) {
        table[`${data[index].duration / 60000} minutes`] += 1;
    };

    const agTableData = [];

    for (const [key, value] of Object.entries(table)) {
        agTableData.push({
            duration: key,
            sessions: value
        });
    }
    return agTableData;
};

export default function Sessions() {
    // TODO make dates dynamic
    const [loading, data] = useFetchData('sessions?start=2022-12-20T12:00:00Z&end=2022-12-29T12:00:00Z', 'sessions');
    const [rowData, setRowData] = useState();
    const [columnDefs] = useState([
        { field: 'duration' },
        { field: 'sessions' },
    ]);

    useEffect(() => {
        if (!loading && data) {
            setRowData(displaySessions(data))
        }
    }, [loading, data]);

    if (loading) {
        return 'Loading...'
    } else {
        return (
            <div className="ag-theme-alpine" style={{ height: 173, width: 402 }}>
              <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
            </div>
        );
    }
}
