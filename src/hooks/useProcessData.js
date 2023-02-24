import useFetchData from './useFetchData';

export default function useProcessData() {
    const [loading, profileData, sessionsData] = useFetchData();

    let totalSessions = 0;
    let totalHours = 0;
    let uniquePartners = new Set();

    let currentPartner = '';
    let currentDate = '';
    
    let currentHoursADay = 0;
    let maxHoursADay = 0;
    
    let sessionsByDurationArr = [];
    let sessionsByDurationObj = {
        '25 minutes': 0,
        '50 minutes': 0,
        '75 minutes': 0,
    };

    // let repeatPartners = {};

    sessionsData.sort((a, b) => {
        return new Date(a.startTime) - new Date(b.startTime);
    });

    for (let session of sessionsData) {
        totalSessions += 1;
        totalHours += session.duration / 3600000;
        sessionsByDurationObj[`${session.duration / 60000} minutes`] += 1;

        // `Most Session Time in a Day` calculation
        if (currentDate === session.startTime.substring(0, 10)) {
            currentHoursADay += session.duration / 3600000;
        } else {
            if (currentHoursADay > maxHoursADay) {
                maxHoursADay = currentHoursADay;
            };
            currentHoursADay = session.duration / 3600000;
            currentDate = session.startTime.substring(0, 10);
        };

        // `Total Unique Partners` calculation
        if (session.users[1] !== undefined) {
            currentPartner = session.users[1].userId;
            if (!uniquePartners.has(currentPartner)) {
                uniquePartners.add(currentPartner)       
            // } else {
            //     repeatPartners[currentPartner] = (repeatPartners[currentPartner] || 1) + 1;
            };
        };

        // const repeatPartnersCount = {};
        // Object.values(repeatPartners).forEach((value) => {
        //     repeatPartnersCount[value] = (repeatPartnersCount[value] || 0) + 1;
        // });
        // let repeatPartnersSum = 0;
        // Object.entries(repeatPartnersCount).forEach(([key, value]) => {
        //     repeatPartnersSum += (key * value);
        // });
        // console.log(repeatPartnersCount, repeatPartnersSum);
    };

    // `Sessions by Duration` calculation
    for (const [key, value] of Object.entries(sessionsByDurationObj)) {
        sessionsByDurationArr.push({
            duration: key,
            sessions: value
        });
    };

    return [
        loading,
        [
            totalSessions,
            Math.round(totalHours).toLocaleString(),
            uniquePartners.size.toLocaleString(),
            sessionsData[0] ? new Date(sessionsData[0].startTime).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric" }) : 'N/A',
            Math.round(maxHoursADay).toLocaleString(),
            sessionsByDurationArr,
        ]
    ];
};