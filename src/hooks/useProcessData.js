import useFetchData from './useFetchData';

export default function useProcessData() {
    const [loading, profileData, sessionsData] = useFetchData();

    let totalSessions = 0;
    let totalHours = 0;
    let uniquePartners = new Set();
    // let repeatPartners = {};

    sessionsData.sort((a, b) => {
        return new Date(a.startTime) - new Date(b.startTime);
    });

    let currentPartner = '';
    let currentDate = '';
    let currentHoursADay = 0;
    let maxHoursADay = 0;
    // TODO: Do `let session of sessionsData` instead
    for (let index in sessionsData) {
        totalSessions += 1;
        totalHours += sessionsData[index].duration / 3600000;

        if (currentDate === sessionsData[index].startTime.substring(0, 10)) {
            currentHoursADay += sessionsData[index].duration / 3600000;
        } else {
            if (currentHoursADay > maxHoursADay) {
                maxHoursADay = currentHoursADay;
            };
            currentHoursADay = sessionsData[index].duration / 3600000;
            currentDate = sessionsData[index].startTime.substring(0, 10);
        };

        if (typeof sessionsData[index].users[1] !== 'undefined') {
            currentPartner = sessionsData[index].users[1].userId;
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

    return [
        loading,
        [totalSessions.toLocaleString(),
        Math.round(totalHours).toLocaleString(),
        uniquePartners.size.toLocaleString(),
        sessionsData[0] ? new Date(sessionsData[0].startTime).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric" }) : 'N/A',
        Math.round(maxHoursADay).toLocaleString(),]
    ];
};