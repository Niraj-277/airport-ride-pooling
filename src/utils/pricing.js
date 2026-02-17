const { getDistance } = require('./geoUtils');

const BASE_FARE = 50;
const PER_KM_RATE = 12;

exports.calculateFare = (source, destination) => {
    const distance = getDistance(source, destination);
    // Simple formula: Base + (Distance * Rate)
    return Math.round(BASE_FARE + (distance * PER_KM_RATE));
};