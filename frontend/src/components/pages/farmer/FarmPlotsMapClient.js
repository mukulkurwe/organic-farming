// "use client";

// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Polygon, FeatureGroup } from "react-leaflet";
// import { EditControl } from "react-leaflet-draw";
// import "leaflet/dist/leaflet.css";
// import "leaflet-draw/dist/leaflet.draw.css";
// import api from "../../../../services/api.js"; // adjust path
// import * as turf from "@turf/turf";

// export default function FarmPlotsMapClient({ farmId }) {
//   const [farmBoundary, setFarmBoundary] = useState([]);
//   const [plots, setPlots] = useState([]);

//   // 1️⃣ Load boundary + existing plots from backend
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [bRes, pRes] = await Promise.all([
//           api.get(`/farms/${farmId}/boundary`),
//           api.get(`/farms/${farmId}/plots`),
//         ]);

//         setFarmBoundary(bRes.data.boundary || []);
//         setPlots(pRes.data || []);
//       } catch (err) {
//         console.error("LOAD PLOTS PAGE ERROR:", err);
//       }
//     };

//     load();
//   }, [farmId]);

 
// const handleCreatePlot = async (e) => {
//   const latlngs = e.layer.getLatLngs()[0];

//   const polygon = latlngs.map(p => ({
//     lat: p.lat,
//     lng: p.lng,
//   }));

//   // Build turf polygons for farm and plot
//   if (farmBoundary.length > 0) {
//     const farmCoords = farmBoundary.map(p => [p.lng, p.lat]);
//     farmCoords.push(farmCoords[0]);

//     const plotCoords = polygon.map(p => [p.lng, p.lat]);
//     plotCoords.push(plotCoords[0]);

//     const farmPoly = turf.polygon([farmCoords]);
//     const plotPoly = turf.polygon([plotCoords]);

//     if (!turf.booleanWithin(plotPoly, farmPoly)) {
//       alert("Plot must be inside the farm boundary ❌");
//       return;
//     }
//   }

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

//   const defaultCenter =
//     farmBoundary.length > 0
//       ? [farmBoundary[0].lat, farmBoundary[0].lng]
//       // : [21.25, 81.63];
//       : [20.5937, 78.9629]

//   return (
//     <div className="bg-white p-4 rounded-xl shadow bg-gradient-to-br from-green-100 via-green-200 to-green-300">
//       <p className="text-gray-600 mb-4">
//         Draw plots inside your farm boundary and assign crops.
//       </p>

//       <div className="relative h-[450px] w-full">
//         <MapContainer
//           center={defaultCenter}
//           zoom={15}
//           className="h-full w-full"
//         >
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//           {/* 🔵 Farm boundary, READ-ONLY, NOT inside FeatureGroup */}
//           {farmBoundary.length > 0 && (
//             <Polygon
//               positions={farmBoundary.map(p => [p.lat, p.lng])}
//               pathOptions={{
//                 color: "blue",
//                 weight: 2,
//                 fillOpacity: 0.15,
//               }}
//             />
//           )}

//           {/* 🟢 Saved plots */}
//           {plots.map(plot => (
//             <Polygon
//               key={plot.id}
//               positions={plot.polygon.map(p => [p.lat, p.lng])}
//               pathOptions={{
//                 color: "green",
//                 weight: 2,
//                 fillOpacity: 0.3,
//               }}
//             />
//           ))}

//           {/* ✏️ New plots – ONLY these are handled by EditControl */}
//           <FeatureGroup>
//             <EditControl
//               position="topright"
//               draw={{
//                 rectangle: false,
//                 circle: false,
//                 polyline: false,
//                 marker: false,
//                 circlemarker: false,
//                 polygon: {
//                   shapeOptions: {
//                     color: "green",
//                     fillOpacity: 0.3,
//                   },
//                 },
//               }}
//               edit={{
//                 edit: false,   // optional: disable editing existing drawings
//                 remove: false,
//               }}
//               onCreated={handleCreatePlot}
//             />
//           </FeatureGroup>
//         </MapContainer>
//       </div>
//     </div>
//   );
// }


// src/components/pages/farmer/FarmPlotsMapClient.js
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import api from "@/services/api"; // ✅ shared client
import * as turf from "@turf/turf";

export default function FarmPlotsMapClient({ farmId }) {
  const [farmBoundary, setFarmBoundary] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Load boundary + existing plots from backend
  useEffect(() => {
    if (!farmId) return;

    const load = async () => {
      try {
        setLoading(true);

        const [bRes, pRes] = await Promise.all([
          api.get(`/farms/${farmId}/boundary`),
          api.get(`/farms/${farmId}/plots`),
        ]);

        // backend getFarmBoundary returns { id, name, location, total_area, boundary }
        setFarmBoundary(bRes.data.boundary || []);

        // backend getPlotsByFarm returns [{ id, farm_id, polygon, crop, area, ... }]
        setPlots(pRes.data || []);
      } catch (err) {
        console.error("LOAD PLOTS PAGE ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [farmId]);

  // 2️⃣ Handle new plot creation from draw tool
  const handleCreatePlot = async (e) => {
    const latlngs = e.layer.getLatLngs()[0]; // simple polygon

    const polygon = latlngs.map((p) => ({
      lat: p.lat,
      lng: p.lng,
    }));

    // Build turf polygons for farm and plot, to ensure plot is inside farm
    if (farmBoundary.length > 0) {
      const farmCoords = farmBoundary.map((p) => [p.lng, p.lat]);
      farmCoords.push(farmCoords[0]); // close ring

      const plotCoords = polygon.map((p) => [p.lng, p.lat]);
      plotCoords.push(plotCoords[0]);

      const farmPoly = turf.polygon([farmCoords]);
      const plotPoly = turf.polygon([plotCoords]);

      if (!turf.booleanWithin(plotPoly, farmPoly)) {
        alert("Plot must be inside the farm boundary ❌");
        return;
      }
    }

    // Compute area in acres (approx)
    const plotCoordsForArea = polygon.map((p) => [p.lng, p.lat]);
    plotCoordsForArea.push(plotCoordsForArea[0]);
    const plotPolyForArea = turf.polygon([plotCoordsForArea]);
    const areaSqMeters = turf.area(plotPolyForArea);
    const areaAcres = areaSqMeters * 0.000247105; // 1 m² = 0.000247105 acres

    const crop = window.prompt(
      `Enter crop for this plot (e.g. Wheat).\nApprox area: ${areaAcres.toFixed(
        2
      )} acres`
    );
    if (!crop) return;

    try {
      const res = await api.post(`/farms/${farmId}/plots`, {
        // backend expects polygon column; also accepts "boundary" fallback
        polygon,
        crop,
        area: areaAcres,
        // slope_percent & risk_level are optional; can be added later
      });

      setPlots((prev) => [...prev, res.data]);
      alert("Plot saved ✅");
    } catch (err) {
      console.error("SAVE PLOT ERROR:", err);
      alert("Failed to save plot");
    }
  };

  const defaultCenter =
    farmBoundary.length > 0
      ? [farmBoundary[0].lat, farmBoundary[0].lng]
      : [20.5937, 78.9629]; // India center fallback

  return (
    <div className="bg-white p-4 rounded-xl shadow bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      <p className="text-gray-600 mb-4">
        Draw plots inside your farm boundary and assign crops.
      </p>

      {loading && (
        <div className="mb-2 text-sm text-gray-500">Loading map data...</div>
      )}

      <div className="relative h-[450px] w-full">
        <MapContainer center={defaultCenter} zoom={15} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 🔵 Farm boundary (read-only) */}
          {farmBoundary.length > 0 && (
            <Polygon
              positions={farmBoundary.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: "blue",
                weight: 2,
                fillOpacity: 0.15,
              }}
            />
          )}

          {/* 🟢 Saved plots from DB */}
          {plots.map((plot) => {
            const polyPoints =
              plot.polygon || plot.boundary || []; // defensive

            return (
              <Polygon
                key={plot.id}
                positions={polyPoints.map((p) => [p.lat, p.lng])}
                pathOptions={{
                  color: "green",
                  weight: 2,
                  fillOpacity: 0.3,
                }}
              />
            );
          })}

          {/* ✏️ New plots – handled by EditControl */}
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
                edit: false, // we’re not editing existing plots yet
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