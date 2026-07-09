import { regionsData } from "./regions-data";

// Strict bounds for Ethiopia [minLng, minLat, maxLng, maxLat]
export const ETHIOPIA_BOUNDS: [number, number, number, number] = [32.9, 3.3, 48.0, 15.0];

// Hardcoded region bounding boxes
export const REGION_BOUNDS: Record<string, [number, number, number, number]> = {
  "አፋር ክልል": [39.8, 8.8, 42.4, 14.6],
  "አማራ ክልል": [35.2, 9.7, 40.2, 13.7],
  "ቤኒሻንጉል-ጉሙዝ ክልል": [34.1, 9.0, 36.8, 12.0],
  "ማዕከላዊ ኢትዮጵያ ክልል": [37.0, 7.5, 38.5, 8.5],
  "ጋምቤላ ክልል": [33.0, 6.5, 35.5, 8.5],
  "ሐረሪ ክልል": [42.0, 9.2, 42.3, 9.4],
  "ኦሮሚያ ክልል": [34.5, 3.4, 43.0, 10.5],
  "ሲዳማ ክልል": [38.2, 6.2, 39.0, 7.0],
  "ሶማሌ ክልል": [40.5, 4.0, 48.0, 11.5],
  "ደቡብ ኢትዮጵያ ክልል": [35.5, 4.5, 38.5, 6.5],
  "ደቡብ ምዕራብ ኢትዮጵያ ሕዝቦች ክልል": [34.5, 5.5, 37.5, 7.5],
  "ትግራይ ክልል": [36.5, 12.2, 40.0, 14.8],
  "አዲስ አበባ": [38.6, 8.9, 38.9, 9.1],
  "ድሬዳዋ": [41.7, 9.5, 42.0, 9.7],
};

export const ZONE_CAPITALS: Record<string, { city: string; lng: number; lat: number; region: string }> = {
  // Amhara
  "ሰሜን ጎንደር": { city: "Gondar", lat: 12.6, lng: 37.4667, region: "አማራ ክልል" },
  "ማዕከላዊ ጎንደር": { city: "Gondar", lat: 12.6, lng: 37.4667, region: "አማራ ክልል" },
  "ደቡብ ጎንደር": { city: "Debre Tabor", lat: 11.85, lng: 38.0167, region: "አማራ ክልል" },
  "ሰሜን ወሎ": { city: "Woldiya", lat: 11.8333, lng: 39.6, region: "አማራ ክልል" },
  "ደቡብ ወሎ": { city: "Dessie", lat: 11.1333, lng: 39.6333, region: "አማራ ክልል" },
  "ሰሜን ሸዋ": { city: "Debre Berhan", lat: 9.6833, lng: 39.5333, region: "አማራ ክልል" },
  "ምስራቅ ጎጃም": { city: "Debre Markos", lat: 10.3333, lng: 37.7333, region: "አማራ ክልል" },
  "ምዕራብ ጎጃም": { city: "Finote Selam", lat: 10.7, lng: 37.2667, region: "አማራ ክልል" },
  "ዋግ ኽምራ": { city: "Sekota", lat: 12.6333, lng: 39.0333, region: "አማራ ክልል" },
  "አገው አዊ": { city: "Injibara", lat: 10.95, lng: 36.9333, region: "አማራ ክልል" },
  "ባህር ዳር (ልዩ ዞን)": { city: "Bahir Dar", lat: 11.6, lng: 37.3833, region: "አማራ ክልል" },

  // Oromia
  "ሰሜን ሸዋ (ኦሮሚያ)": { city: "Fitche", lat: 9.8, lng: 38.7333, region: "ኦሮሚያ ክልል" },
  "ምስራቅ ሸዋ": { city: "Adama", lat: 8.54, lng: 39.27, region: "ኦሮሚያ ክልል" },
  "ምዕራብ ሸዋ": { city: "Ambo", lat: 8.9833, lng: 37.85, region: "ኦሮሚያ ክልል" },
  "ደቡብ ምዕራብ ሸዋ": { city: "Woliso", lat: 8.5333, lng: 37.9833, region: "ኦሮሚያ ክልል" },
  "አርሲ": { city: "Asella", lat: 7.95, lng: 39.1167, region: "ኦሮሚያ ክልል" },
  "ምዕራብ አርሲ": { city: "Shashemene", lat: 7.2, lng: 38.6, region: "ኦሮሚያ ክልል" },
  "ባሌ": { city: "Robe", lat: 7.1167, lng: 40.0, region: "ኦሮሚያ ክልል" },
  "ቦረና": { city: "Yabelo", lat: 4.8833, lng: 38.0833, region: "ኦሮሚያ ክልል" },
  "ጉጂ": { city: "Negele Borana", lat: 5.3333, lng: 39.5833, region: "ኦሮሚያ ክልል" },
  "ምዕራብ ጉጂ": { city: "Bule Hora", lat: 5.6333, lng: 38.2167, region: "ኦሮሚያ ክልል" },
  "ጅማ": { city: "Jimma", lat: 7.6667, lng: 36.8333, region: "ኦሮሚያ ክልል" },
  "ኢሉባቦር": { city: "Mettu", lat: 8.3, lng: 35.5833, region: "ኦሮሚያ ክልል" },
  "ምስራቅ ወለጋ": { city: "Nekemte", lat: 9.0833, lng: 36.55, region: "ኦሮሚያ ክልል" },
  "ምዕራብ ወለጋ": { city: "Gimbi", lat: 9.1667, lng: 35.8333, region: "ኦሮሚያ ክልል" },
  "ቄለም ወለጋ": { city: "Dembi Dolo", lat: 8.5333, lng: 34.8, region: "ኦሮሚያ ክልል" },
  "ምዕራብ ሐረርጌ": { city: "Chiro", lat: 8.0833, lng: 40.8167, region: "ኦሮሚያ ክልል" },
  "ምስራቅ ሐረርጌ": { city: "Harar", lat: 9.3167, lng: 42.1333, region: "ኦሮሚያ ክልል" },

  // South Ethiopia & Southwest
  "ወላይታ": { city: "Sodo", lat: 6.8667, lng: 37.7667, region: "ደቡብ ኢትዮጵያ ክልል" },
  "ጋሞ": { city: "Arba Minch", lat: 6.0333, lng: 37.55, region: "ደቡብ ኢትዮጵያ ክልል" },
  "ጎፋ": { city: "Sawla", lat: 6.3167, lng: 36.8833, region: "ደቡብ ኢትዮጵያ ክልል" },
  "ጌዴኦ": { city: "Dilla", lat: 6.4167, lng: 38.3167, region: "ደቡብ ኢትዮጵያ ክልል" },
  "ደቡብ ኦሞ": { city: "Jinka", lat: 5.7833, lng: 36.55, region: "ደቡብ ኢትዮጵያ ክልል" },
  "ኬፋ": { city: "Bonga", lat: 7.2667, lng: 36.2333, region: "ደቡብ ምዕራብ ኢትዮጵያ ሕዝቦች ክልል" },
  "ቤንች ሸኮ": { city: "Mizan Teferi", lat: 7.0, lng: 35.5833, region: "ደቡብ ምዕራብ ኢትዮጵያ ሕዝቦች ክልል" },

  // Tigray
  "መቀሌ (ልዩ ዞን)": { city: "Mekelle", lat: 13.4833, lng: 39.4667, region: "ትግራይ ክልል" },
  "ምስራቅ ትግራይ": { city: "Adigrat", lat: 14.2667, lng: 39.4667, region: "ትግራይ ክልል" },
  "ማዕከላዊ ትግራይ": { city: "Axum", lat: 14.1167, lng: 38.7167, region: "ትግራይ ክልል" },
  "ደቡብ ትግራይ": { city: "Maychew", lat: 12.7833, lng: 39.5333, region: "ትግራይ ክልል" },
  "ሰሜን ምዕራብ ትግራይ": { city: "Shire (Inda Selassie)", lat: 14.1, lng: 38.2833, region: "ትግራይ ክልል" },

  // Somali
  "ፋፋን": { city: "Jijiga", lat: 9.35, lng: 42.8, region: "ሶማሌ ክልል" },
  "ሲቲ (ሺኒሌ)": { city: "Shinile", lat: 9.6833, lng: 41.85, region: "ሶማሌ ክልል" },
  "ጃራር (ደገሐቡር)": { city: "Degehabur", lat: 8.2167, lng: 43.5667, region: "ሶማሌ ክልል" },
  "ሻበሌ (ጎዴ)": { city: "Gode", lat: 5.95, lng: 43.55, region: "ሶማሌ ክልል" }
};

export function generateMockHeatmapData(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  
  Object.entries(ZONE_CAPITALS).forEach(([zone, data], index) => {
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [data.lng, data.lat],
      },
      properties: {
        id: `mock-${index}`,
        region: data.region,
        zone: zone,
        city: data.city,
        complaint_count: Math.floor(Math.random() * (500 - 10 + 1)) + 10,
        this_week_count: Math.floor(Math.random() * 50) + 5,
        resolved_count: Math.floor(Math.random() * 200),
        critical_count: Math.floor(Math.random() * 30),
        category: "Complaint",
      },
    });
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

// Simple string hash function to get a deterministic number between 0 and 1
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return Math.abs(hash) / 2147483647;
}

export function generateComplaintsGeoJSON(complaints: any[]): GeoJSON.FeatureCollection {
  const grouped: Record<string, any> = {};

  complaints.forEach(complaint => {
    const region = complaint.target_region || "Unknown";
    const zone = complaint.target_zone || "Unknown";
    const key = `${region}-${zone}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        region,
        zone,
        count: 0,
        this_week_count: 0,
        critical_count: 0,
        resolved_count: 0,
      };
    }
    
    grouped[key].count += 1;
    
    if (complaint.created_at) {
      const date = new Date(complaint.created_at);
      const now = new Date();
      const isThisWeek = (now.getTime() - date.getTime()) / (1000 * 3600 * 24) <= 7;
      if (isThisWeek) grouped[key].this_week_count += 1;
    }
    
    if (complaint.status?.toLowerCase() === 'resolved') {
      grouped[key].resolved_count += 1;
    }
    
    if (complaint.type?.toLowerCase().includes('critical') || complaint.status?.toLowerCase() === 'urgent') {
      grouped[key].critical_count += 1;
    }
  });

  const features: GeoJSON.Feature[] = Object.values(grouped).map((data, index) => {
    const capital = ZONE_CAPITALS[data.zone];
    
    let lng, lat, city;
    
    if (capital) {
      lng = capital.lng;
      lat = capital.lat;
      city = capital.city;
    } else {
      const bounds = REGION_BOUNDS[data.region] || ETHIOPIA_BOUNDS;
      const lngHash = hashString(data.zone + "_lng");
      const latHash = hashString(data.zone + "_lat");
      const lngRange = bounds[2] - bounds[0];
      const latRange = bounds[3] - bounds[1];
      lng = bounds[0] + (lngRange * 0.2) + (lngHash * lngRange * 0.6); 
      lat = bounds[1] + (latRange * 0.2) + (latHash * latRange * 0.6);
      city = data.zone;
    }

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        id: `db-${index}`,
        region: data.region,
        zone: data.zone,
        city: city,
        complaint_count: data.count,
        this_week_count: data.this_week_count,
        resolved_count: data.resolved_count,
        critical_count: data.critical_count,
        category: "Complaint",
      },
    };
  });

  return {
    type: "FeatureCollection",
    features,
  };
}
