
"use client";

import { useState } from "react";
import api from "@/services/api";

export default function CreateFarm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [boundary, setBoundary] = useState([]);
 


  const handleBoundary = (data) => {
  setBoundary(data.coordinates);
  setArea(data.area);
};

  const submitFarm = async () => {
    if (!name || !location || !area) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/farms", {
        name,
        location,
        total_area: Number(area),
      });

      const farmId = res.data.id; // VERY IMPORTANT

      // Redirect to map page
      window.location.href = `/farm/${farmId}/map`;
    } catch (err) {
      console.error(err);
      alert("Failed to create farm");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
       
         <h1 className="text-center text-2xl font-bold text-gray-800">
          Create Organic Farming 
        </h1>
        <div className="h-1 w-16 bg-green-500 mx-auto mt-2 rounded-full"></div>

        {/* Form */}
        <div className="space-y-6 mt-8">

          {/* Farm Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Farm Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Green Farm"
              className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2
                         text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2
                         text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Total Area (Acres)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-2
                         text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submitFarm}
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium
                         hover:bg-green-700 shadow-md hover:shadow-lg
                         active:scale-95 transition"
            >
              Create Farm
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
