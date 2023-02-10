import React, { useEffect, useState } from 'react';
import useFetchData from '../hooks/useFetchData';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function TotalStats() {
    const [loading, data] = useFetchData('sessions?start=2022-01-01T12:00:00Z&end=2023-01-01T12:00:00Z', 'sessions');
    const [rowData, setRowData] = useState();
    const [columnDefs] = useState([
        { field: 'metric', width: 250, suppressMovable:true },
        { field: 'value', width: 140, suppressMovable:true, type: 'numericColumn' }
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
            <div className="ag-theme-alpine" style={{ height: 270, width: 400 }}>
                <AgGridReact 
                    rowData={rowData} 
                    columnDefs={columnDefs} 
                ></AgGridReact>
            </div>
        );
    };
};

function process(data) {
    const totalSessionsBooked = data.length;
    let totalSessionsCompleted = 0;
    let totalHours = 0;
    let uniquePartners = new Set();
    let currentPartner = '';
    
    for (let index in data) {
        totalHours += Math.round(data[index].duration / 3600000);
        totalSessionsCompleted += data[index].users[0].completed ? 1 : 0;

        if (typeof data[index].users[1] !== 'undefined') {
            currentPartner = data[index].users[1].userId;
            if (!uniquePartners.has(currentPartner)) {
                uniquePartners.add(currentPartner)       
            }
        }
    };

    let table = {
        'Total Sessions Booked': totalSessionsBooked,
        'Total Sessions Completed': totalSessionsCompleted,
        '% Booked Sessions Completed': Math.round(totalSessionsCompleted / totalSessionsBooked * 100) + '%',
        'Total Hours of Sessions': totalHours,
        'Total Partners': uniquePartners.size
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

