"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import api from "../../../../services/api.js"; // adjust path
import * as turf from "@turf/turf";

export default function FarmPlotsMapClient({ farmId }) {
  const [farmBoundary, setFarmBoundary] = useState([]);
  const [plots, setPlots] = useState([]);

  // 1️⃣ Load boundary + existing plots from backend
  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          api.get(`/farms/${farmId}/boundary`),
          api.get(`/farms/${farmId}/plots`),
        ]);

        setFarmBoundary(bRes.data.boundary || []);
        setPlots(pRes.data || []);
      } catch (err) {
        console.error("LOAD PLOTS PAGE ERROR:", err);
      }
    };

    load();
  }, [farmId]);

  // 2️⃣ When a new polygon is drawn → save as plot
  // const handleCreatePlot = async (e) => {
  //   const latlngs = e.layer.getLatLngs()[0];

  //   const polygon = latlngs.map(p => ({
  //     lat: p.lat,
  //     lng: p.lng,
  //   }));

  //   const crop = window.prompt("Enter crop for this plot (e.g. Wheat):");
  //   if (!crop) return;

  //   try {
  //     const res = await api.post(`/farms/${farmId}/plots`, {
  //       polygon,
  //       crop,
  //     });

  //     setPlots(prev => [...prev, res.data]);
  //     alert("Plot saved ✅");
  //   } catch (err) {
  //     console.error("SAVE PLOT ERROR:", err);
  //     alert("Failed to save plot");
  //   }
  // };
const handleCreatePlot = async (e) => {
  const latlngs = e.layer.getLatLngs()[0];

  const polygon = latlngs.map(p => ({
    lat: p.lat,
    lng: p.lng,
  }));

  // Build turf polygons for farm and plot
  if (farmBoundary.length > 0) {
    const farmCoords = farmBoundary.map(p => [p.lng, p.lat]);
    farmCoords.push(farmCoords[0]);

    const plotCoords = polygon.map(p => [p.lng, p.lat]);
    plotCoords.push(plotCoords[0]);

    const farmPoly = turf.polygon([farmCoords]);
    const plotPoly = turf.polygon([plotCoords]);

    if (!turf.booleanWithin(plotPoly, farmPoly)) {
      alert("Plot must be inside the farm boundary ❌");
      return;
    }
  }

  const crop = window.prompt("Enter crop for this plot (e.g. Wheat):");
  if (!crop) return;

  try {
    const res = await api.post(`/farms/${farmId}/plots`, {
      polygon,
      crop,
    });

    setPlots(prev => [...prev, res.data]);
    alert("Plot saved ✅");
  } catch (err) {
    console.error("SAVE PLOT ERROR:", err);
    alert("Failed to save plot");
  }
};

  const defaultCenter =
    farmBoundary.length > 0
      ? [farmBoundary[0].lat, farmBoundary[0].lng]
      // : [21.25, 81.63];
      : [20.5937, 78.9629]

  return (
    <div className="bg-white p-4 rounded-xl shadow bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      <p className="text-gray-600 mb-4">
        Draw plots inside your farm boundary and assign crops.
      </p>

      <div className="relative h-[450px] w-full">
        <MapContainer
          center={defaultCenter}
          zoom={15}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 🔵 Farm boundary, READ-ONLY, NOT inside FeatureGroup */}
          {farmBoundary.length > 0 && (
            <Polygon
              positions={farmBoundary.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: "blue",
                weight: 2,
                fillOpacity: 0.15,
              }}
            />
          )}

          {/* 🟢 Saved plots */}
          {plots.map(plot => (
            <Polygon
              key={plot.id}
              positions={plot.polygon.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: "green",
                weight: 2,
                fillOpacity: 0.3,
              }}
            />
          ))}

          {/* ✏️ New plots – ONLY these are handled by EditControl */}
          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{
                rectangle: false,
                circle: false,
                polyline: false,
                marker: false,
                circlemarker: false,
                polygon: {
                  shapeOptions: {
                    color: "green",
                    fillOpacity: 0.3,
                  },
                },
              }}
              edit={{
                edit: false,   // optional: disable editing existing drawings
                remove: false,
              }}
              onCreated={handleCreatePlot}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
}


