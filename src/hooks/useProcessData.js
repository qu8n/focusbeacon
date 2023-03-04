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
    sessionsData.sort((a, b) => { // Also for `First Session Date` metric
        return new Date(a.startTime) - new Date(b.startTime);
    });

    // For RepeatPartners component
    let repeatPartners = {};
    let repeatPartnersCount = {}; 
    let repeatPartnersSum = 0; 
    let repeatPartnersArr = [];

    // For LTM components
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const lTMSessionsObj = {};
    const lTMSessionsArr = [];
    for (let i = 0; i < 12; i++) {
        const pastMonth = new Date(currentYear, currentMonth - 2 - i, 1);
        const year = pastMonth.getFullYear();
        const month = String(pastMonth.getMonth() + 1).padStart(2, '0');
        lTMSessionsObj[`${year}-${month}`] = 0;
    };
    const lTMHoursObj = structuredClone(lTMSessionsObj);
    const lTMHoursArr = [];

    // For LTW components
    const lTWSessionsObj = {};
    const lTWSessionsArr = [];
    const weeksAgo = 12;
    const startDate = new Date(
        today.getFullYear(), 
        today.getMonth(), 
        today.getDate() - today.getDay() - (weeksAgo * 7)
    );
    const startDate2 = structuredClone(startDate);
    for (let i = 0; i < (weeksAgo * 7); i++) {
        lTWSessionsObj[new Date(startDate).toLocaleDateString()] = 0;
        startDate.setDate(startDate.getDate() + 1);
    };
    const lTWHoursObj = structuredClone(lTWSessionsObj);
    const lTWHoursArr = [];
    const lTWSessionsWeekOfDates = {};
    for (let i = 0; i < weeksAgo; i++) {
        lTWSessionsWeekOfDates[new Date(startDate2).toLocaleDateString()] = 0;
        startDate2.setDate(startDate2.getDate() + 7);
    };
    const lTWHoursWeekOfDates = structuredClone(lTWSessionsWeekOfDates);

    // ----------------- LOOP THROUGH EACH SESSION OBJ AND PERFORM CALCS -----------------

    for (let session of sessionsData) {
        sessionsCounter += 1;
        totalHours += session.duration / 3600000;
        sessionsByDurationObj[`${session.duration / 60000} minutes`] += 1;

        // For LTM components
        const currentMonth = session.startTime.substring(0, 7);
        if (currentMonth in lTMSessionsObj) {
            lTMSessionsObj[currentMonth] += 1;
            lTMHoursObj[currentMonth] += session.duration / 3600000;
        };

        // For LTW components
        const startDate = new Date(session.startTime).toLocaleDateString();
        if (startDate in lTWSessionsObj) {
            lTWSessionsObj[startDate] += 1;
            lTWHoursObj[startDate] += session.duration / 3600000;
        };

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

    // For LTM components
    for (const [key, value] of Object.entries(lTMSessionsObj)) {
        lTMSessionsArr.push({
            "Month": new Date(key).toLocaleString('en-us', { month: 'short', year: '2-digit' }),
            "Number of Sessions": value
        })
    };
    for (const [key, value] of Object.entries(lTMHoursObj)) {
        lTMHoursArr.push({
            "Month": new Date(key).toLocaleString('en-us', { month: 'short', year: '2-digit' }),
            "Hours of Sessions": Math.round(value)
        })
    };

    // For LTW components
    for (const [key, value] of Object.entries(lTWSessionsObj)) {
        Object.keys(lTWSessionsWeekOfDates).forEach((date) => {
            const diffInDays = (new Date(key) - new Date(date)) / 86400000; // ms to days
            if (diffInDays < 7 && diffInDays > 0) {
                lTWSessionsWeekOfDates[date] += value;
            };
        });
    };
    for (const [key, value] of Object.entries(lTWSessionsWeekOfDates)) {
        lTWSessionsArr.push({
            "Week of": new Date(key).toLocaleString("en-US", { month: "short", day: "numeric" }),
            "Number of Sessions": value
        })
    };
    for (const [key, value] of Object.entries(lTWHoursObj)) {
        Object.keys(lTWHoursWeekOfDates).forEach((date) => {
            const diffInDays = (new Date(key) - new Date(date)) / 86400000; // ms to days
            if (diffInDays < 7 && diffInDays > 0) {
                lTWHoursWeekOfDates[date] += value;
            };
        });
    };
    for (const [key, value] of Object.entries(lTWHoursWeekOfDates)) {
        lTWHoursArr.push({
            "Week of": new Date(key).toLocaleString("en-US", { month: "short", day: "numeric" }),
            "Hours of Sessions": Math.round(value)
        })
    };

    // `First Session Date` metric
    const firstSessionDate = sessionsData[0] 
        ? new Date(sessionsData[0].startTime).toLocaleString(
            "en-US", { day: "numeric", month: "short", year: "numeric" }) 
        : 'N/A';
    
    // 'Last Refreshed' badge
    const updateTime = new Date().toLocaleString(
        "en-US", { 
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true 
    });

    return [
        loading,
        profileData,
        totalSessions,
        totalHours,
        uniquePartners.size,
        firstSessionDate,
        maxHoursADay,
        sessionsByDurationArr,
        milestonesArr.reverse(),
        repeatPartnersArr,
        lTMSessionsArr.reverse(),
        lTMHoursArr.reverse(),
        updateTime,
        lTWSessionsArr,
        lTWHoursArr,
    ];
};