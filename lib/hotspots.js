// Cities in regions the WHO flags for high rates of substandard and falsified
// medicines. `w` scales the marker: larger = denser counterfeit activity.
export const HOTSPOTS = [
  // South Asia
  { name: "Delhi", lat: 28.61, lon: 77.21, w: 1.4 },
  { name: "Mumbai", lat: 19.08, lon: 72.88, w: 1.3 },
  { name: "Kolkata", lat: 22.57, lon: 88.36, w: 1.1 },
  { name: "Hyderabad", lat: 17.39, lon: 78.49, w: 1 },
  { name: "Chennai", lat: 13.08, lon: 80.27, w: 1 },
  { name: "Ahmedabad", lat: 23.02, lon: 72.57, w: 0.9 },
  { name: "Lucknow", lat: 26.85, lon: 80.95, w: 0.9 },
  { name: "Patna", lat: 25.59, lon: 85.14, w: 0.8 },
  { name: "Bengaluru", lat: 12.97, lon: 77.59, w: 0.9 },
  { name: "Karachi", lat: 24.86, lon: 67.0, w: 1 },
  { name: "Lahore", lat: 31.55, lon: 74.34, w: 0.9 },
  { name: "Dhaka", lat: 23.81, lon: 90.41, w: 1.1 },
  // Africa
  { name: "Lagos", lat: 6.52, lon: 3.38, w: 1.4 },
  { name: "Kano", lat: 12.0, lon: 8.52, w: 1 },
  { name: "Abuja", lat: 9.08, lon: 7.4, w: 0.9 },
  { name: "Accra", lat: 5.6, lon: -0.19, w: 1 },
  { name: "Abidjan", lat: 5.36, lon: -4.01, w: 0.9 },
  { name: "Dakar", lat: 14.72, lon: -17.47, w: 0.8 },
  { name: "Douala", lat: 4.05, lon: 9.7, w: 0.9 },
  { name: "Kinshasa", lat: -4.44, lon: 15.27, w: 1.1 },
  { name: "Nairobi", lat: -1.29, lon: 36.82, w: 1.1 },
  { name: "Kampala", lat: 0.35, lon: 32.58, w: 0.9 },
  { name: "Dar es Salaam", lat: -6.79, lon: 39.21, w: 0.9 },
  { name: "Addis Ababa", lat: 9.03, lon: 38.74, w: 0.9 },
  { name: "Cairo", lat: 30.04, lon: 31.24, w: 1 },
  { name: "Johannesburg", lat: -26.2, lon: 28.05, w: 0.8 },
  // South-East Asia
  { name: "Jakarta", lat: -6.2, lon: 106.85, w: 1 },
  { name: "Manila", lat: 14.6, lon: 120.98, w: 0.9 },
  { name: "Ho Chi Minh City", lat: 10.82, lon: 106.63, w: 0.8 },
  { name: "Yangon", lat: 16.84, lon: 96.17, w: 0.8 },
  { name: "Guangzhou", lat: 23.13, lon: 113.26, w: 0.9 },
  // Latin America
  { name: "São Paulo", lat: -23.55, lon: -46.63, w: 0.9 },
  { name: "Mexico City", lat: 19.43, lon: -99.13, w: 0.9 },
  { name: "Lima", lat: -12.05, lon: -77.04, w: 0.8 },
  { name: "Bogotá", lat: 4.71, lon: -74.07, w: 0.8 },
  // Online counterfeit trade reaches everywhere
  { name: "Moscow", lat: 55.76, lon: 37.62, w: 0.6 },
  { name: "London", lat: 51.5, lon: -0.13, w: 0.5 },
  { name: "Miami", lat: 25.76, lon: -80.19, w: 0.5 },
];

// The scroll zoom in Scene 1 lands between India and Africa.
export const FOCUS = { lat: 12, lon: 52 };

// Secure supply routes drawn in the final scene (pairs of HOTSPOTS names).
export const ROUTES = [
  ["Mumbai", "Lagos"],
  ["Delhi", "Nairobi"],
  ["Hyderabad", "Dhaka"],
  ["Chennai", "Jakarta"],
  ["Mumbai", "Cairo"],
  ["Lagos", "São Paulo"],
  ["Kolkata", "Guangzhou"],
  ["Nairobi", "Johannesburg"],
  ["Accra", "London"],
  ["Mexico City", "Bogotá"],
  ["Delhi", "Moscow"],
  ["Manila", "Ho Chi Minh City"],
];
