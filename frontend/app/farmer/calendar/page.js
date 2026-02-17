"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import CropRecommendations from "../../../src/components/AgriCalendar/CropRecommendations";

// Dynamic import for calendar (needs window/document)
const AgriCalendar = dynamic(
  () => import("../../../src/components/AgriCalendar/AgriCalendar"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center text-gray-400">
        Loading calendar...
      </div>
    ),
  },
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function FarmerCalendarPage() {
  const router = useRouter();
  const [farmer, setFarmer] = useState(null);
  const [events, setEvents] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM"),
  );
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' | 'recommend'

  // Load farmer profile
  useEffect(() => {
    async function loadFarmer() {
      try {
        const res = await fetch(`${API_BASE}/calendar/farmer/profile`);
        if (!res.ok) throw new Error("Failed to load farmer profile");
        const data = await res.json();
        setFarmer(data);
      } catch (err) {
        console.error("Load farmer error:", err);
        toast.error("Could not load farmer profile");
      }
    }
    loadFarmer();
  }, []);

  // Load calendar events for current month
  const loadEvents = useCallback(
    async (monthOverride) => {
      if (!farmer) return;
      const month = monthOverride || currentMonth;
      try {
        const res = await fetch(
          `${API_BASE}/calendar/events?farmer_id=${farmer.id}&month=${month}`,
        );
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Load events error:", err);
      } finally {
        setLoading(false);
      }
    },
    [farmer, currentMonth],
  );

  // On first farmer load, find the earliest event month and jump there
  useEffect(() => {
    if (!farmer) return;

    async function jumpToFirstEvent() {
      try {
        const res = await fetch(
          `${API_BASE}/calendar/events?farmer_id=${farmer.id}`,
        );
        if (!res.ok) throw new Error("Failed");
        const allEvents = await res.json();
        if (allEvents.length > 0) {
          const firstDate = new Date(allEvents[0].event_date);
          const firstMonth = format(firstDate, "yyyy-MM");
          setCurrentMonth(firstMonth);
          loadEvents(firstMonth);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }
    jumpToFirstEvent();
  }, [farmer]);

  // Load crop recommendations
  const loadRecommendations = useCallback(async () => {
    if (!farmer) return;
    try {
      const params = new URLSearchParams({
        soil_type: farmer.soil_type || "",
        irrigation_type: farmer.irrigation_type || "",
        state: farmer.state || "",
      });
      const res = await fetch(`${API_BASE}/calendar/crops/recommend?${params}`);
      if (!res.ok) throw new Error("Failed to load recommendations");
      const data = await res.json();
      setCrops(data);
    } catch (err) {
      console.error("Load recommendations error:", err);
    }
  }, [farmer]);

  useEffect(() => {
    if (farmer && activeTab === "recommend") {
      loadRecommendations();
    }
  }, [farmer, activeTab, loadRecommendations]);

  // Handle month navigation
  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    loadEvents(month);
  };

  // Handle mark event complete
  const handleEventComplete = async (eventId) => {
    try {
      const res = await fetch(
        `${API_BASE}/calendar/events/${eventId}/complete`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error("Failed to complete event");
      toast.success("Task marked as completed!");
      loadEvents(); // refresh
    } catch (err) {
      console.error("Complete event error:", err);
      toast.error("Failed to mark complete");
    }
  };

  // Handle add crop to plan
  const handleAddToPlan = async (cropId, sowingDate) => {
    if (!farmer) return;
    try {
      const res = await fetch(`${API_BASE}/calendar/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_id: farmer.id,
          crop_id: cropId,
          sowing_date: sowingDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate calendar");
      const data = await res.json();
      toast.success(
        `Calendar generated! ${data.events.length} events created.`,
      );
      setActiveTab("calendar");
      loadEvents(); // refresh calendar
    } catch (err) {
      console.error("Generate calendar error:", err);
      toast.error("Failed to generate calendar");
    }
  };

  if (loading && !farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Agri Calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                📅 Agri Calendar
              </h1>
              {farmer && (
                <p className="text-sm text-gray-500">
                  {farmer.name} · {farmer.district}, {farmer.state} ·{" "}
                  {farmer.farm_size_acres} acres · {farmer.soil_type} soil ·{" "}
                  {farmer.irrigation_type} irrigation
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/farmer/dashboard")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition ${
              activeTab === "calendar"
                ? "bg-green-600 text-white shadow"
                : "bg-white text-gray-600 hover:bg-gray-50 border"
            }`}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setActiveTab("recommend")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition ${
              activeTab === "recommend"
                ? "bg-green-600 text-white shadow"
                : "bg-white text-gray-600 hover:bg-gray-50 border"
            }`}
          >
            🌾 Crop Recommendations
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "calendar" && (
          <AgriCalendar
            farmerId={farmer?.id}
            events={events}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            onEventComplete={handleEventComplete}
          />
        )}

        {activeTab === "recommend" && (
          <CropRecommendations crops={crops} onAddToPlan={handleAddToPlan} />
        )}
      </main>
    </div>
  );
}
