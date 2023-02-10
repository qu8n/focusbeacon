import React, { useEffect, useState } from 'react';
import useFetchData from '../hooks/useFetchData';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function SessionsByDuration() {
    const [loading, data] = useFetchData('sessions?start=2022-01-01T12:00:00Z&end=2023-01-01T12:00:00Z', 'sessions');
    const [rowData, setRowData] = useState();
    const [columnDefs] = useState([
        { field: 'duration', width: 130, suppressMovable:true },
        { field: 'sessions', width: 130, suppressMovable:true, type: 'numericColumn' },
        { field: 'percentage', width: 130, suppressMovable:true, type: 'numericColumn' }
    ]);

    useEffect(() => {
        if (!loading && data) {
            setRowData(process(data))
        }
    }, [loading, data]);

    // Total row styling
    const gridOptions = {
        getRowStyle: params => {
            if (params.node.lastChild) {
                return { 'font-weight': 'bold', 'border-top': 'solid lightgray' };
            }
        },
    };

    if (loading) {
        return 'Loading...'
    } else {
        return (
            <div className="ag-theme-alpine" style={{ height: 230, width: 400 }}>
                <AgGridReact 
                    rowData={rowData} 
                    columnDefs={columnDefs} 
                    gridOptions={gridOptions}
                ></AgGridReact>
            </div>
        );
    };
};

function process(data) {
    let table = {
        '25 minutes': 0,
        '50 minutes': 0,
        '75 minutes': 0,
        'Total': data.length
    };

    for (let index in data) {
        table[`${data[index].duration / 60000} minutes`] += 1;
    };

    const agTableData = [];

    for (const [key, value] of Object.entries(table)) {
        agTableData.push({
            duration: key,
            sessions: value.toLocaleString(),
            percentage: Math.round(value / table.Total * 100) + '%'
        });
    };

    return agTableData;
};

