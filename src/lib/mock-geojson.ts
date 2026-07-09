import { regionsData } from "./regions-data";

// Helper to generate a random number within a range
function getRandomInRange(from: number, to: number, fixed: number) {
  return parseFloat((Math.random() * (to - from) + from).toFixed(fixed));
}

// Bounding boxes for a few major regions to cluster some data
const ethBoxes = [
  // Addis Ababa area (high density)
  { minLng: 38.6, maxLng: 38.9, minLat: 8.9, maxLat: 9.1, weight: 40 },
  // Oromia area (broad)
  { minLng: 36.0, maxLng: 42.0, minLat: 4.0, maxLat: 10.0, weight: 20 },
  // Amhara area (broad)
  { minLng: 36.0, maxLng: 40.0, minLat: 10.0, maxLat: 14.0, weight: 15 },
  // General Ethiopia (scattered)
  { minLng: 33.0, maxLng: 47.0, minLat: 3.5, maxLat: 14.5, weight: 25 },
];

const categories = ["Infrastructure", "Administration", "Water", "Electricity", "Healthcare", "Education"];
const urgencies = ["Low", "Medium", "High", "Critical"];

export const generateMockComplaintsGeoJSON = (count: number = 300): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = [];

  for (let i = 0; i < count; i++) {
    // Determine which box to use based on weight
    const rand = Math.random() * 100;
    let box = ethBoxes[3];
    let cumulative = 0;
    for (const b of ethBoxes) {
      cumulative += b.weight;
      if (rand <= cumulative) {
        box = b;
        break;
      }
    }

    const lng = getRandomInRange(box.minLng, box.maxLng, 4);
    const lat = getRandomInRange(box.minLat, box.maxLat, 4);

    const regions = Object.keys(regionsData);
    const region = regions[Math.floor(Math.random() * regions.length)];
    const zones = regionsData[region];
    const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : "Unknown";

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        id: `comp-${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        region,
        zone,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        description: "ይህ የሙከራ ጥቆማ ማብራሪያ ነው።",
        cluster: false, // Will be managed by mapbox
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
};
