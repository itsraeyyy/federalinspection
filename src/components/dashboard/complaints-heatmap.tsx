"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Map, { Source, Layer, MapRef, Popup, NavigationControl, Marker } from "react-map-gl/mapbox";
import type { HeatmapLayer, CircleLayer, SymbolLayer } from "react-map-gl";
import { ETHIOPIA_BOUNDS, REGION_BOUNDS, ZONE_CAPITALS } from "@/lib/geojson-utils";
import { regionsData } from "@/lib/regions-data";
import { IconMapPin, IconX, IconFilter, IconShieldLock, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

const tokenP1 = "pk.eyJ1IjoiaXRzcmFleXkiLCJhIjoiY2";
const tokenP2 = "1yZDZvOHduMGNlcDJ6cnoxbjlwcjZ6bCJ9.OPTiW41ivKzZIirjT14XBw";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || (tokenP1 + tokenP2);



const heatmapLayer: HeatmapLayer = {
  id: "complaints-heat",
  type: "heatmap",
  source: "complaints",
  maxzoom: 9,
  paint: {
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "complaint_count"],
      10, 0.1,
      500, 1
    ],
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0, 1,
      9, 3
    ],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(34, 197, 94, 0)",
      0.2, "rgba(34, 197, 94, 0.5)",
      0.5, "rgba(234, 179, 8, 0.8)",
      0.8, "rgba(249, 115, 22, 0.9)",
      1, "rgba(239, 68, 68, 1)"
    ],
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0, 10,
      9, 35
    ],
    "heatmap-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      6, 1,
      9, 0
    ],
  },
};

const hitboxLayer: CircleLayer = {
  id: "city-hitbox",
  type: "circle",
  source: "complaints",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0, 10,
      9, 30
    ],
    "circle-color": "transparent",
    "circle-stroke-width": 0,
  },
};

const pointLayer: CircleLayer = {
  id: "city-points",
  type: "circle",
  source: "complaints",
  minzoom: 7,
  paint: {
    "circle-radius": 5,
    "circle-color": [
      "step",
      ["get", "complaint_count"],
      "#22c55e",
      20, "#eab308",
      50, "#ef4444"
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
    "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
    "circle-stroke-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
  },
};

const labelLayer: SymbolLayer = {
  id: "city-labels",
  type: "symbol",
  source: "complaints",
  minzoom: 7,
  layout: {
    "text-field": ["format",
      ["get", "zone"], { "font-scale": 1 },
      "\n", {},
      ["get", "city"], { "font-scale": 0.8 }
    ],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
    "text-anchor": "top",
    "text-offset": [0, 0.6],
  },
  paint: {
    "text-color": "#ffffff",
    "text-halo-color": "rgba(0, 0, 0, 0.8)",
    "text-halo-width": 1.5,
    "text-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
  },
};

export function ComplaintsHeatmap({ initialData }: { initialData: GeoJSON.FeatureCollection }) {
  const mapRef = useRef<MapRef>(null);
  const data = initialData;
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedZone("");

    if (region && REGION_BOUNDS[region]) {
      const [minLng, minLat, maxLng, maxLat] = REGION_BOUNDS[region];
      mapRef.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 1500 }
      );
    } else {
      // Reset to Ethiopia
      mapRef.current?.fitBounds(
        [
          [ETHIOPIA_BOUNDS[0], ETHIOPIA_BOUNDS[1]],
          [ETHIOPIA_BOUNDS[2], ETHIOPIA_BOUNDS[3]],
        ],
        { padding: 20, duration: 1500 }
      );
    }
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zone = e.target.value;
    setSelectedZone(zone);

    if (zone && ZONE_CAPITALS[zone]) {
      const capital = ZONE_CAPITALS[zone];
      mapRef.current?.easeTo({
        center: [capital.lng, capital.lat],
        zoom: 9.5,
        duration: 1500,
        pitch: 45,
      });
    } else if (!zone && selectedRegion && REGION_BOUNDS[selectedRegion]) {
      // Zoom back out to Region if Zone is cleared
      const [minLng, minLat, maxLng, maxLat] = REGION_BOUNDS[selectedRegion];
      mapRef.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 1500, pitch: 0 }
      );
    }
  };

  const onClick = useCallback((event: any) => {
    const feature = event.features[0];
    if (!feature) return;

    if (feature.layer.id === "city-hitbox" || feature.layer.id === "city-points") {
      mapRef.current?.easeTo({
        center: feature.geometry.coordinates,
        zoom: 9.5,
        pitch: 45,
        duration: 1000,
      });
      if (feature.properties.region) setSelectedRegion(feature.properties.region);
      if (feature.properties.zone) setSelectedZone(feature.properties.zone);
    }
  }, []);

  const onHover = useCallback((event: any) => {
    const feature = event.features[0];
    if (feature && (feature.layer.id === "city-hitbox" || feature.layer.id === "city-points")) {
      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        properties: feature.properties,
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  const filteredData = useMemo(() => {
    if (!selectedType) return data;
    const features = data.features.filter((f: any) => {
      let match = true;
      if (selectedType && f.properties?.category !== selectedType) match = false;
      return match;
    });
    return { ...data, features };
  }, [data, selectedType]);

  const activePopupInfo = useMemo(() => {
    if (hoverInfo) return hoverInfo;
    if (selectedZone) {
      const f = data.features.find((f: any) => f.properties.zone === selectedZone);
      if (f) {
        return {
          longitude: f.geometry.coordinates[0],
          latitude: f.geometry.coordinates[1],
          properties: f.properties
        };
      }
    }
    return null;
  }, [hoverInfo, selectedZone, data]);

  const criticalFeatures = useMemo(() => {
    return filteredData.features.filter((f: any) => f.properties.complaint_count >= 50);
  }, [filteredData]);

  const regionTotals = useMemo(() => {
    if (!selectedRegion) return null;
    let total = 0;
    let thisWeek = 0;
    let critical = 0;
    let resolved = 0;
    
    data.features.forEach((f: any) => {
      if (f.properties.region === selectedRegion && (!selectedType || f.properties.category === selectedType)) {
        total += f.properties.complaint_count || 0;
        thisWeek += f.properties.this_week_count || 0;
        critical += f.properties.critical_count || 0;
        resolved += f.properties.resolved_count || 0;
      }
    });

    return { total, thisWeek, critical, resolved };
  }, [selectedRegion, data, selectedType]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-surface-secondary rounded-[2rem] border border-border/20">
        <p className="text-text-secondary text-sm">Mapbox Token is missing.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#101010] overflow-hidden rounded-xl z-0">
      {/* Floating Control Panel */}
      <div className="absolute top-4 left-4 z-10 w-80 pointer-events-auto">
        <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <IconFilter className="text-slate-800 dark:text-white" size={20} />
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm tracking-wide uppercase">ማጣሪያ (Filters)</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-white/70">የጥቆማ ዓይነት (Type)</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/20 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/50 outline-none transition-all shadow-sm"
              >
                <option value="">ሁሉም (All)</option>
                <option value="Complaint">አቤቱታ (Complaint)</option>
                <option value="Suggestion">ጥቆማ (Suggestion)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-white/70">ክልል (Region)</label>
              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/20 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/50 outline-none transition-all shadow-sm"
              >
                <option value="">ሁሉም ክልሎች (All Regions)</option>
                {Object.keys(regionsData).map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-white/70">ዞን/ክፍለ ከተማ (Zone)</label>
              <select
                value={selectedZone}
                onChange={handleZoneChange}
                disabled={!selectedRegion}
                className={cn(
                  "w-full border border-slate-200 dark:border-white/20 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/50 outline-none transition-all shadow-sm text-slate-900 dark:text-white",
                  !selectedRegion ? "bg-slate-100 dark:bg-black/20 opacity-50 cursor-not-allowed" : "bg-white dark:bg-black/50"
                )}
              >
                <option value="">ሁሉም ዞኖች (All Zones)</option>
                {selectedRegion &&
                  regionsData[selectedRegion]?.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Live Node Overlay */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-w-[200px]">
             <div className="flex items-center gap-3 mb-2">
                <div className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400/50"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500/80"></span>
                </div>
                <h2 className="text-slate-900 dark:text-[#fafafa] font-mono text-xs tracking-widest uppercase">የቀጥታ ክትትል ማዕከል</h2>
             </div>
             <div>
                <div className="text-slate-500 dark:text-white/40 text-[10px] font-mono uppercase tracking-wider mb-1">ሁኔታ (Status)</div>
                <div className="text-green-600 dark:text-green-400/70 text-xs font-mono flex items-center gap-2">
                  <IconShieldLock size={14} /> Active Node
                </div>
             </div>
          </div>
      </div>

      {/* Region Summary HUD */}
      {selectedRegion && regionTotals && (
        <div className="absolute bottom-6 left-6 z-10 animate-in slide-in-from-bottom-4 fade-in duration-500 pointer-events-auto">
          <div className="bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-2xl min-w-[300px]">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <IconMapPin className="text-indigo-500" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#fafafa] tracking-tight">{selectedRegion}</h3>
                <div className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-widest font-mono mt-0.5">የክልል ማጠቃለያ (Region Summary)</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">አጠቃላይ (Total)</span>
                <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{regionTotals.total}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">አፋጣኝ (Critical)</span>
                <span className="text-2xl font-bold text-red-500 dark:text-red-400">{regionTotals.critical}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">በዚህ ሳምንት (This Wk)</span>
                <span className="text-2xl font-bold text-slate-700 dark:text-white">{regionTotals.thisWeek}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">የተፈቱ (Resolved)</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{regionTotals.resolved}</span>
              </div>
            </div>
            
            <Link 
              href={`/dashboard/complaints?search=${encodeURIComponent(selectedRegion)}`}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 py-3 rounded-xl text-sm font-semibold transition-all border border-indigo-500/20 hover:border-indigo-500/40"
            >
              ወደ ጥቆማዎች ሂድ (View Region Data)
              <IconExternalLink size={16} />
            </Link>
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: 39.5,
          latitude: 9.0,
          zoom: 5.5,
          pitch: 0,
          bearing: 0,
        }}
        maxBounds={[[32.9, 3.3], [48.0, 15.0]]}
        mapStyle="mapbox://styles/mapbox/navigation-night-v1"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={["city-hitbox", "city-points"]}
        scrollZoom={false}
        onClick={onClick}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
      >
        <NavigationControl position="bottom-right" />
        
        <Source
          id="complaints"
          type="geojson"
          data={filteredData}
        >
          <Layer {...heatmapLayer} />
          <Layer {...hitboxLayer} />
          <Layer {...pointLayer} />
          <Layer {...labelLayer} />
        </Source>

        {/* Blinking red markers for critical zones with >= 50 complaints */}
        {criticalFeatures.map((f: any, i: number) => {
          const [lng, lat] = f.geometry.coordinates;
          return (
            <Marker key={i} longitude={lng} latitude={lat} anchor="center">
              <div className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white dark:border-black/50 shadow-lg"></span>
              </div>
            </Marker>
          );
        })}

        {activePopupInfo && (
          <Popup
            longitude={activePopupInfo.longitude}
            latitude={activePopupInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            className="z-50"
            offset={20}
          >
            <div className="group relative bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_0_40px_rgba(0,100,255,0.1)] min-w-[280px] border border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-300">
              {/* Premium Top Glow Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
              
              <div className="mb-5 pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-[#fafafa] tracking-tight">{activePopupInfo.properties.city}</h3>
                  <div className="text-xs text-slate-500 dark:text-white/40 font-mono mt-0.5 uppercase tracking-wider">{activePopupInfo.properties.zone}, {activePopupInfo.properties.region}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                   <IconMapPin size={18} className="text-cyan-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col">
                  <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">አጠቃላይ (Total)</div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{activePopupInfo.properties.complaint_count}</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">አፋጣኝ (Critical)</div>
                  <div className="text-2xl font-bold text-red-500 dark:text-red-400">{activePopupInfo.properties.critical_count}</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">በዚህ ሳምንት (This Wk)</div>
                  <div className="text-2xl font-bold text-slate-700 dark:text-white">{activePopupInfo.properties.this_week_count}</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase font-mono tracking-wider mb-1">የተፈቱ (Resolved)</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activePopupInfo.properties.resolved_count}</div>
                </div>
              </div>

              <Link 
                href={`/dashboard/complaints?search=${encodeURIComponent(activePopupInfo.properties.zone)}`}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                ወደ ጥቆማዎች ሂድ (View Data)
                <IconExternalLink size={16} className="opacity-70" />
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
