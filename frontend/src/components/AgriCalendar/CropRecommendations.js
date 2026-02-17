"use client";

import { useState } from "react";

export default function CropRecommendations({ crops, onAddToPlan }) {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [sowingDate, setSowingDate] = useState("");

  const waterBadge = {
    low: { bg: "bg-green-100 text-green-800", label: "💧 Low" },
    medium: { bg: "bg-yellow-100 text-yellow-800", label: "💧💧 Medium" },
    high: { bg: "bg-blue-100 text-blue-800", label: "💧💧💧 High" },
  };

  const seasonBadge = {
    Kharif: "bg-orange-100 text-orange-800",
    Rabi: "bg-cyan-100 text-cyan-800",
    Zaid: "bg-purple-100 text-purple-800",
  };

  const handleAddClick = (crop) => {
    setSelectedCrop(crop);
    // Default sowing dates by season
    const year = new Date().getFullYear();
    if (crop.season === "Kharif") setSowingDate(`${year}-06-15`);
    else if (crop.season === "Rabi") setSowingDate(`${year}-10-15`);
    else setSowingDate(`${year}-02-15`);
  };

  const handleConfirmAdd = () => {
    if (!selectedCrop || !sowingDate) return;
    onAddToPlan(selectedCrop.id, sowingDate);
    setSelectedCrop(null);
    setSowingDate("");
  };

  if (!crops || crops.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🌾 Recommended Crops
        </h2>
        <p className="text-gray-500">
          No crop recommendations available for your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🌾 Recommended Crops
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Based on your soil type, irrigation, and location
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {crops.map((crop) => (
          <div
            key={crop.id}
            className="border rounded-lg p-4 hover:shadow-lg transition bg-gradient-to-br from-white to-green-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{crop.name}</h3>
                {crop.local_name && (
                  <p className="text-xs text-gray-500">{crop.local_name}</p>
                )}
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  seasonBadge[crop.season] || "bg-gray-100 text-gray-800"
                }`}
              >
                {crop.season}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <p>
                ⏱ Duration:{" "}
                <span className="font-medium">{crop.duration_days} days</span>
              </p>
              <p>
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                    waterBadge[crop.water_requirement]?.bg || ""
                  }`}
                >
                  {waterBadge[crop.water_requirement]?.label ||
                    crop.water_requirement}
                </span>
              </p>
              {crop.description && (
                <p className="text-xs text-gray-400 line-clamp-2">
                  {crop.description}
                </p>
              )}
            </div>

            <button
              onClick={() => handleAddClick(crop)}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
            >
              📅 Add to Calendar
            </button>
          </div>
        ))}
      </div>

      {/* Sowing Date Picker Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              📅 Set Sowing Date for {selectedCrop.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Season: {selectedCrop.season} · Duration:{" "}
              {selectedCrop.duration_days} days
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sowing Date
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />

            {sowingDate && (
              <p className="text-xs text-gray-500 mb-4">
                Expected harvest:{" "}
                <span className="font-medium">
                  {new Date(
                    new Date(sowingDate).getTime() +
                      selectedCrop.duration_days * 86400000,
                  ).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirmAdd}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Generate Calendar
              </button>
              <button
                onClick={() => setSelectedCrop(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
