import useFetchData from './useFetchData';

export default function useProcessData() {
    const [loading, profileData, sessionsData] = useFetchData();

    // ----------------- INITIALIZE VARIABLES -----------------
    
    // For LifetimeMetrics component
    const totalSessions = sessionsData.length;
    let totalHours = 0;
    let uniquePartners = new Set();
    let currentPartner = '';
    let currentDate = '';
    let currentHoursADay = 0;
    let maxHoursADay = 0;
    
    // For SessionsByDuration component
    let sessionsByDurationArr = [];
    let sessionsByDurationObj = {
        '25 minutes': 0,
        '50 minutes': 0,
        '75 minutes': 0,
    };
    
    // For Milestones component
    let sessionsCounter = 0;
    let milestoneSessions = [];
    let currentMilestone = 0;
    let milestonesArr = [];
    const milestoneLevelsAndUnits = {
        25: 1,
        50: 5,
        125: 10,
        250: 25,
        500: 50,
        1250: 100,
        2500: 250,
        100000: 500,
    };
    const milestoneUpperLevel = Object.keys(milestoneLevelsAndUnits).find(key => key > totalSessions);
    const unit = milestoneLevelsAndUnits[milestoneUpperLevel];
    currentMilestone = Math.floor(totalSessions / unit) * unit;
    for (let i = 0; i < Math.min((Math.floor(totalSessions / unit)), 5); i++) {
        milestoneSessions.push(currentMilestone);
        currentMilestone -= unit;
    };
    sessionsData.sort((a, b) => {
        return new Date(a.startTime) - new Date(b.startTime);
    });

    // For RepeatPartners component
    let repeatPartners = {};
    let repeatPartnersCount = {}; 
    let repeatPartnersSum = 0; 
    let repeatPartnersArr = [];

    // ----------------- LOOP THROUGH EACH SESSION OBJ AND PERFORM CALCS -----------------

    for (let session of sessionsData) {
        sessionsCounter += 1;
        totalHours += session.duration / 3600000;
        sessionsByDurationObj[`${session.duration / 60000} minutes`] += 1;

        // For `Most Session Time in a Day` metric
        if (currentDate === session.startTime.substring(0, 10)) {
            currentHoursADay += session.duration / 3600000;
        } else {
            if (currentHoursADay > maxHoursADay) {
                maxHoursADay = currentHoursADay;
            };
            currentHoursADay = session.duration / 3600000;
            currentDate = session.startTime.substring(0, 10);
        };

        // For `Total Unique Partners` metric and RepeatPartners component
        if (session.users[1] !== undefined) {
            currentPartner = session.users[1].userId;
            if (!uniquePartners.has(currentPartner)) {
                uniquePartners.add(currentPartner)
            } else {
                repeatPartners[currentPartner] = (repeatPartners[currentPartner] || 1) + 1;
            };
        };

        // For Milestones component
        if (milestoneSessions.includes(sessionsCounter)) {
            let obj = { milestone: sessionsCounter, date: session.startTime };
            milestonesArr.push(obj);
        };
    };

    // ----------------- POST-LOOP CALCULATIONS -----------------

    // For RepeatPartners component
    Object.values(repeatPartners).forEach((value) => {
        repeatPartnersCount[value] = (repeatPartnersCount[value] || 0) + 1;
    });
    Object.entries(repeatPartnersCount).forEach(([key, value]) => {
        repeatPartnersSum += (key * value);
    });
    for (const [key, value] of Object.entries(repeatPartnersCount)) {
        repeatPartnersArr.push({
            sharedSessions: key,
            partners: value
        });
    };
    repeatPartnersArr.push({
        sharedSessions: 1,
        partners: totalSessions - repeatPartnersSum,
    });
    repeatPartnersArr.sort((a, b) => {
        return (b.sharedSessions - a.sharedSessions);
    });
    if (repeatPartnersArr.length > 5) {
        repeatPartnersArr = repeatPartnersArr.slice(0, 5);
    };

    // For SessionsByDuration component
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
            sessionsData[0] ? 
                new Date(sessionsData[0].startTime).toLocaleString(
                    "en-US", { day: "numeric", month: "short", year: "numeric" }
                ) : 'N/A',
            Math.round(maxHoursADay).toLocaleString(),
            sessionsByDurationArr,
            milestonesArr.reverse(),
            repeatPartnersArr
        ]
    ];
};