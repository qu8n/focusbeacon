import React, { useEffect, useState } from 'react';
import useFetchData from '../hooks/useFetchData';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function TotalStats() {
    const [loading, data] = useFetchData('sessions?start=2022-01-01T12:00:00Z&end=2023-01-01T12:00:00Z', 'sessions');
    const [rowData, setRowData] = useState();
    const [columnDefs] = useState([
        { headerName: 'Lifetime Metric', field: 'metric', width: 270, suppressMovable:true },
        { field: 'value', width: 120, suppressMovable:true, type: 'numericColumn' }
    ]);

    useEffect(() => {
        if (!loading && data) {
            setRowData(process(data))
        }
    }, [loading, data]);

    if (loading) {
        return 'Loading...'
    } else {
        return (
            <div className="ag-theme-alpine" style={{ height: 230, width: 400 }}>
                <AgGridReact 
                    rowData={rowData} 
                    columnDefs={columnDefs} 
                ></AgGridReact>
            </div>
        );
    };
};

function process(data) {
    let totalSessions = 0;
    let totalHours = 0;
    let uniquePartners = new Set();

    let currentPartner = '';    
    for (let index in data) {
        if (data[index].users[0].completed === true) {
            totalSessions += 1;
            totalHours += Math.round(data[index].duration / 3600000);

            if (typeof data[index].users[1] !== 'undefined') {
                currentPartner = data[index].users[1].userId;
                if (!uniquePartners.has(currentPartner)) {
                    uniquePartners.add(currentPartner)       
                }
            }
        }
    };

    let table = {
        'Total Sessions': totalSessions,
        'Total Hours of Sessions': totalHours,
        'Average Session Duration (Minutes)': Math.round(totalHours * 60 / totalSessions),
        'Total Unique Partners': uniquePartners.size
    };

    const agTableData = [];

    for (const [key, value] of Object.entries(table)) {
        agTableData.push({
            metric: key,
            value: value.toLocaleString(),
        });
    };

    return agTableData;
};

