"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

/* ─────────────────────────────────────────────
   Helper: fly to the user's GPS position once
───────────────────────────────────────────── */
function LocateUser() {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: false, enableHighAccuracy: true });

    function onFound(e) {
      map.flyTo(e.latlng, 17, { animate: true, duration: 1.2 });
    }

    function onError() {
      // GPS denied or unavailable — stay on the fallback center
      console.warn("Geolocation unavailable, using default center.");
    }

    map.on("locationfound", onFound);
    map.on("locationerror", onError);

    return () => {
      map.off("locationfound", onFound);
      map.off("locationerror", onError);
    };
  }, [map]);

  return null;
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function FarmMapLeaflet() {
  const router = useRouter();
  const params = useParams();
  const farmId = params.id;

  const onCreated = async (e) => {
    // 1) Get LatLngs from drawn polygon
    const latlngs = e.layer.getLatLngs()[0];

    // 2) Convert to [{lat, lng}, ...]
    const boundary = latlngs.map((p) => ({ lat: p.lat, lng: p.lng }));

    // 3) Save boundary to backend
    await api.put(`/farms/${farmId}/boundary`, { boundary });

    // 4) Notify & redirect
    alert("Boundary saved ✅");
    router.push(`/farm/${farmId}/plots`);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      <p className="text-gray-600 mb-4 text-3xl">
        Draw your farm boundary. After saving, you&apos;ll assign plots inside it.
      </p>

      <div className="relative w-full" style={{ height: "100vh" }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          minZoom={15}
          maxZoom={20}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={20}
          />

          {/* Auto-fly to GPS location on mount */}
          <LocateUser />

          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{
                polygon: true,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
                polyline: false,
              }}
              edit={{
                edit: true,
                remove: true,
              }}
              onCreated={onCreated}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
}

// http://localhost:3000/farm/9/map
