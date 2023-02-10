import useFetchData from '../hooks/useFetchData';

export default function TotalHours() {
    const [loading, data] = useFetchData('sessions?start=2022-01-01T12:00:00Z&end=2023-01-01T12:00:00Z', 'sessions');
    return loading ? 'Loading...' : `~${process(data)} total hours on FocusMate`
};

function process(data) {
    let totalHours = 0;
    
    for (let index in data) {
        totalHours += Math.round(data[index].duration / 3600000)
    };

    return totalHours.toLocaleString();
};

