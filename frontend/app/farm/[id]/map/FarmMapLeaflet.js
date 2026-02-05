"use client";

import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
// import { useParams } from "next/navigation";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

export default function FarmMapLeaflet() {
  // const params = useParams();
  // const farmId = params.id;
   const router = useRouter();
  const params = useParams();
  const farmId = params.id;   

  const onCreated = async (e) => {
    // 1) Get LatLngs from drawn polygon
    const latlngs = e.layer.getLatLngs()[0];

    // 2) Convert to [{lat,lng}, ...]
    const boundary = latlngs.map((p) => ({
      lat: p.lat,
      lng: p.lng,
    }));

    // 3) Save boundary to backend
    await api.put(`/farms/${farmId}/boundary`, {
      boundary,
    });

    // 4) Show popup
    alert("Boundary saved ✅");

    // 5) Redirect to plots page for THIS farm
    router.push(`/farm/${farmId}/plots`);
  };

 return (
    <div className="bg-white p-4 rounded-xl shadow bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      <p className="text-gray-600 mb-4 text-3xl">
        Draw your farm boundary. After saving, you’ll assign plots inside it.
      </p>

      <div className="relative h-[450px] w-full">
        <MapContainer
          // center={[21.25, 81.63]} // default; doesn’t matter too much here
          // zoom={14}
          // className="h-full w-full"
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
                edit:true,
                remove:true,
              }}
              onCreated={onCreated}   // 👈 IMPORTANT: use this handler
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
}

// http://localhost:3000/farm/9/map