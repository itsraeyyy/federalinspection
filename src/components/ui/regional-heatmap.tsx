'use client';

import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantize } from "d3-scale";

const geoUrl = "https://code.highcharts.com/mapdata/countries/et/et-all.topo.json";

interface RegionData {
  name: string;
  members: number;
}

interface RegionalHeatmapProps {
  data: RegionData[];
}

export function RegionalHeatmap({ data }: RegionalHeatmapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Normalize data names to handle slight variations in Highcharts TopoJSON (e.g., Oromiya vs Oromia)
  const normalizedData = data.reduce((acc, curr) => {
    let key = curr.name.toLowerCase();
    if (key === 'oromia') key = 'oromiya';
    if (key === 'snnpr') key = 'southern nations, nationalities and peoples';
    acc[key] = curr.members;
    return acc;
  }, {} as Record<string, number>);

  // Generate color scale based on data
  const values = data.map(d => d.members);
  const colorScale = scaleQuantize<string>()
    .domain([Math.min(...values), Math.max(...values)])
    .range([
      "#E0E7FF", // light blue
      "#C7D2FE",
      "#A5B4FC",
      "#818CF8",
      "#6366F1",
      "#4F46E5",
      "#4338CA",
      "#3730A3", // dark blue
    ]);

  if (!isClient) {
    return <div className="w-full h-full flex items-center justify-center text-text-muted">Loading map...</div>;
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 2200,
          center: [39.5, 9.0] // Center of Ethiopia
        }}
        className="w-full h-full max-h-[400px] outline-none drop-shadow-md"
      >
        <ZoomableGroup center={[39.5, 9.0]} zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.name || "";
                const matchedMembers = normalizedData[geoName.toLowerCase()] || 0;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={matchedMembers ? colorScale(matchedMembers) : "#F3F4F6"}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: "none",
                        transition: "all 0.3s ease",
                      },
                      hover: {
                        fill: "#F59E0B", // brand-yellow highlight on hover
                        outline: "none",
                        cursor: "pointer",
                        transition: "all 0.1s ease",
                        transform: "translateY(-1px) scale(1.002)",
                        filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))"
                      },
                      pressed: {
                        fill: "#D97706",
                        outline: "none",
                      },
                    }}
                    onMouseEnter={() => {
                      setTooltipContent(`${geoName}: ${matchedMembers > 0 ? matchedMembers.toLocaleString() + ' Members' : 'No Data'}`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {tooltipContent && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface-primary border border-border/50 text-text-primary px-4 py-2 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 pointer-events-none z-10">
          {tooltipContent}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-surface-primary/80 p-3 rounded-xl border border-border/20 backdrop-blur-md pointer-events-none">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Density</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-sm bg-[#E0E7FF]"></div>
          <div className="w-4 h-4 rounded-sm bg-[#A5B4FC]"></div>
          <div className="w-4 h-4 rounded-sm bg-[#6366F1]"></div>
          <div className="w-4 h-4 rounded-sm bg-[#3730A3]"></div>
        </div>
        <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
