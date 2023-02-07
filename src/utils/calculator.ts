const calculateValue = (arg: any) => {
    const ratesCorrection = 0.7;
    let result = 0;
    let zoneRate = arg.zoneData.rate
    let time = arg.time;
    let timeUse = arg.timeUse;
    let timeRate = time === 1 ? 0.9 : time === 2 ? 0.95 : time === 3 ? 1 : time === 4 ? 1.035 : time === 5 ? 1.050 : time === 6 ? 1.075 : 1.1;
    let timeUseRate = timeUse === -1 ? 1 : timeUse === 1 ? 1.1 : timeUse === 2 ? 1.075 : timeUse === 3 ? 1.05 : timeUse === 4 ? 1.025 : timeUse === 5 ? 1 : timeUse === 6 ? 0.975 : 0.9;
    let location = arg.locationData;
    let parsedMeters = parseInt(location.squareMeters);
    let average = parseInt(arg.zoneData.averageValue) * parsedMeters;
    // let roomsRate = location.rooms === 0 ? 1 : location.rooms === 1 ? 0.95 : location.rooms === 2 ? 1 : location.rooms === 3 ? 1.05 : location.rooms === 4 ? 1.1 : 1.2;
    let roomsRate = location.rooms === 0 ? 1 : (location.rooms > 0 && location.rooms < 5) ? 0.95 : (location.rooms >= 5 && location.rooms < 10) ? 1 : (location.rooms >= 10 && location.rooms < 20) ? 1.05 : (location.rooms >= 20 && location.rooms < 30) ? 1.1 : 1.2;
    let bathroomsRate = location.bathrooms === -1 ? 1 : location.bathrooms === 0 ? 0.95 : location.bathrooms === 1 ? 1 : location.bathrooms === 2 ? 1.025 : location.bathrooms === 3 ? 1.05 : location.bathrooms === 4 ? 1.10 : 1.15;
    let paintRate = location.painting === 1 ? 0.85 : location.painting === 2 ? 0.90 : location.painting === 3 ? 0.95 : location.painting === 4 ? 1 : 1.05;
    let floorRate = location.floor === 1 ? 0.85 : location.floor === 2 ? 0.9 : location.floor === 3 ? 0.95 : location.floor === 4 ? 1 : 1.05;
    let garageRate = location.garage === -1 ? 1 : location.garage === 0 ? 0.95 : location.garage === 1 ? 1 : location.garage === 2 ? 1.025 : location.garage === 3 ? 1.05 : location.garage === 4 ? 1.10 : 1.15;

    let userValue = parseFloat(arg.expectedValue);

    // let difference = userValue - average;
    // let baseValue;
    // if (difference < 0) {
    //     baseValue = average;
    // } else {
    //     let limit = average * 0.4 + average;
    //     baseValue = difference > limit ? average : (average + (difference / 4)); 
    // }

    let baseValue = parsedMeters < 100 ? average : parsedMeters < 200 ? (average * 0.9) : parsedMeters < 300 ? (average * 0.8) : parsedMeters < 400 ? (average * 0.7) : parsedMeters < 500 ? (average * 0.6) : parsedMeters < 600 ? (average * 0.5) : parsedMeters < 600 ? (average * 0.4) : (average * 0.35);

    result = baseValue * timeRate * timeUseRate * roomsRate * bathroomsRate * paintRate * floorRate * garageRate * ratesCorrection;

    if (location.landUse === 'housing') result = result * 0.8;

    let min = Math.round(result - (result * 8 / 100));
    let max = Math.round(result + (result * 8 / 100));

    return {
        min: min,
        max: max
    };
}

export default calculateValue;