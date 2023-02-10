import useFetchData from '../hooks/useFetchData';

export default function TotalStats() {
    const [loading, data] = useFetchData('sessions?start=2022-01-01T12:00:00Z&end=2023-01-01T12:00:00Z', 'sessions');
    return loading ? 'Loading...' : `~${process(data)}`
};

function process(data) {
    let totalHours = 0; // metric
    const totalSessionsBooked = data.length; // metric
    let totalSessionsCompleted = 0; // metric
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

    const totalPartners = uniquePartners.size; // metric

    return null // placeholder
};

