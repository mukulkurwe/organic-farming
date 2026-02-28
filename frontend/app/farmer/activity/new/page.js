// frontend/app/farmer/activity/new/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";

export default function NewActivityPage() {
  const router = useRouter();

  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [farmId, setFarmId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [activityType, setActivityType] = useState("");
  const [cropId, setCropId] = useState("");
  const [remarks, setRemarks] = useState("");

  const [inputs, setInputs] = useState([
    { input_id: "", quantity: "", unit: "", method: "" },
  ]);

  const [selectedWorkers, setSelectedWorkers] = useState([]);

  const [workers, setWorkers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [zones, setZones] = useState([]);
  const [crops, setCrops] = useState([]);
  const [availableInputs, setAvailableInputs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Get logged-in user id
  const getCreatedBy = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || null;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  };

  // Load master data once (farms filtered by owner, inputs, crops)
  useEffect(() => {
    async function loadMaster() {
      try {
        const userId = getCreatedBy();
        const [farmsRes, inputsRes, cropsRes] = await Promise.all([
          apiGet("/farms", userId ? { owner_id: userId } : {}),
          apiGet("/inputs"),
          apiGet("/crops"),
        ]);
        setFarms(farmsRes || []);
        setAvailableInputs(inputsRes || []);
        setCrops(cropsRes || []);
      } catch (err) {
        console.error("loadMaster error", err);
      }
    }
    loadMaster();
  }, []);

  // Load zones when farm changes
  useEffect(() => {
    setZoneId("");
    setZones([]);

    if (!farmId) return;

    async function loadZones() {
      try {
        const res = await apiGet(`/farms/${farmId}/zones`);
        setZones(res || []);
      } catch (err) {
        console.error("loadZones error", err);
      }
    }
    loadZones();
  }, [farmId]);

  // Load workers when farm changes
  useEffect(() => {
    setSelectedWorkers([]);
    setWorkers([]);

    if (!farmId) return;

    async function loadWorkers() {
      try {
        const res = await apiGet("/workers", { farm_id: farmId });
        setWorkers(res || []);
      } catch (err) {
        console.error("loadWorkers error", err);
      }
    }
    loadWorkers();
  }, [farmId]);

  const activityTypes = [
    "sowing",
    "transplanting",
    "irrigation",
    "pest_spray",
    "biofertilizer",
    "weeding",
    "harvest",
    "other",
  ];

  const handleInputChange = (index, field, value) => {
    setInputs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addInputRow = () => {
    setInputs((prev) => [
      ...prev,
      { input_id: "", quantity: "", unit: "", method: "" },
    ]);
  };

  const removeInputRow = (index) => {
    setInputs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleWorker = (workerId) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Validation
    if (!farmId) {
      setMessage({ text: "Please select a farm.", type: "error" });
      return;
    }
    if (!activityType) {
      setMessage({ text: "Please select an activity type.", type: "error" });
      return;
    }
    if (!date) {
      setMessage({ text: "Please select a date.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const body = {
        farm_id: Number(farmId),
        zone_id: zoneId ? Number(zoneId) : null,
        date,
        activity_type: activityType,
        crop_id: cropId ? Number(cropId) : null,
        remarks,
        created_by: getCreatedBy(),
        inputs: inputs
          .filter((i) => i.input_id)
          .map((i) => ({
            input_id: Number(i.input_id),
            quantity: i.quantity ? Number(i.quantity) : null,
            unit: i.unit || null,
            method: i.method || null,
          })),
        workers: selectedWorkers.map((id) => ({ worker_id: id })),
      };

      await apiPost("/activities", body);
      setMessage({ text: "Activity saved successfully!", type: "success" });

      // Reset form fields (keep farm selection)
      setActivityType("");
      setCropId("");
      setRemarks("");
      setInputs([{ input_id: "", quantity: "", unit: "", method: "" }]);
      setSelectedWorkers([]);
    } catch (err) {
      console.error("submit error", err);
      setMessage({
        text: err.message || "Failed to save activity.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-200 to-green-300 flex justify-center py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push("/farmer/dashboard")}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <span>←</span> Back
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Add Field Activity
        </h1>
        <div className="h-1 w-16 bg-green-500 mx-auto mt-2 rounded-full" />

        {/* Message Banner */}
        {message.text && (
          <div
            className={`mt-4 text-sm text-center rounded-lg px-3 py-2 ${
              message.type === "success"
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Basic info */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Farm */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Farm <span className="text-red-500">*</span>
              </label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select farm</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone / Plot */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Zone / Plot
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                disabled={!farmId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500
                           disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {farmId ? "Select zone" : "Select a farm first"}
                </option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Crop (optional)
              </label>
              <select
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select crop</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Activity type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Activity Type <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {activityTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivityType(type)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    activityType === type
                      ? "bg-green-50 border-green-500"
                      : "bg-white border-gray-300 hover:border-green-500"
                  }`}
                >
                  <span className="text-3xl mb-2">
                    {type === "sowing" && "🌱"}
                    {type === "transplanting" && "🌾"}
                    {type === "irrigation" && "💧"}
                    {type === "pest_spray" && "🐛"}
                    {type === "biofertilizer" && "🌿"}
                    {type === "weeding" && "✂️"}
                    {type === "harvest" && "🌾"}
                    {type === "other" && "📋"}
                  </span>
                  <span className="text-xs font-medium text-gray-700 capitalize">
                    {type.replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-600">
                Inputs Used
              </label>
              <button
                type="button"
                onClick={addInputRow}
                className="text-xs text-green-600 hover:text-green-800"
              >
                + Add another input
              </button>
            </div>
            <div className="space-y-4">
              {inputs.map((row, idx) => (
                <div
                  key={idx}
                  className="grid md:grid-cols-4 gap-3 bg-gray-50 rounded-xl p-3 relative"
                >
                  {/* Remove button */}
                  {inputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInputRow(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs
                                 flex items-center justify-center hover:bg-red-200 transition"
                      title="Remove input"
                    >
                      ✕
                    </button>
                  )}

                  {/* Input used */}
                  <select
                    value={row.input_id}
                    onChange={(e) =>
                      handleInputChange(idx, "input_id", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                               text-gray-900 bg-white"
                  >
                    <option value="">Input used</option>
                    {availableInputs.map((inp) => (
                      <option key={inp.id} value={inp.id}>
                        {inp.name}
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) =>
                      handleInputChange(idx, "quantity", e.target.value)
                    }
                    placeholder="Qty"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                               text-gray-900 placeholder:text-gray-400 bg-white"
                  />

                  {/* Unit */}
                  <input
                    value={row.unit}
                    onChange={(e) =>
                      handleInputChange(idx, "unit", e.target.value)
                    }
                    placeholder="Unit (kg/L)"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                               text-gray-900 placeholder:text-gray-400 bg-white"
                  />

                  {/* Method */}
                  <div>
                    <select
                      value={row.method}
                      onChange={(e) =>
                        handleInputChange(idx, "method", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Method</option>
                      <option value="manual_spraying">Manual Spraying</option>
                      <option value="drip_irrigation">Drip Irrigation</option>
                      <option value="broadcasting">Broadcasting</option>
                      <option value="manual_sowing">Manual Sowing</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workers */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Workers involved
            </label>
            {!farmId ? (
              <p className="text-sm text-gray-400 italic">
                Select a farm to see available workers
              </p>
            ) : workers.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No workers found for this farm
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {workers.map((w) => {
                  const active = selectedWorkers.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleWorker(w.id)}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        active
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-gray-50 text-gray-700 border-gray-300"
                      }`}
                    >
                      {w.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Soil moisture, uniform emergence, pest spray only for tomato..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         text-gray-900 placeholder:text-gray-400 bg-white
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/farmer/dashboard")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
