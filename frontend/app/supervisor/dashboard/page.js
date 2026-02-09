// app/supervisor/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const toIso = (d) => d.toISOString().slice(0, 10);
  return { from: toIso(start), to: toIso(end) };
}

export default function SupervisorDashboard() {
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayActivities, setDayActivities] = useState([]);
  const [loadingDay, setLoadingDay] = useState(false);

  const { from, to } = getMonthRange();
  const farmId = 1; // TODO: based on logged-in supervisor

  useEffect(() => {
    async function loadCalendar() {
      try {
        const data = await apiGet("/activities/calendar", {
          farm_id: farmId,
          from,
          to,
        });
        setCalendarData(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadCalendar();
  }, [farmId, from, to]);

  const handleSelectDate = async (date) => {
    setSelectedDate(date);
    setLoadingDay(true);
    try {
      const data = await apiGet("/activities", { farm_id: farmId, date });
      setDayActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDay(false);
    }
  };

  // Helper map: date -> summary
  const mapByDate = calendarData.reduce((acc, row) => {
    acc[row.date] = row;
    return acc;
  }, {});

  // Build array of days for grid
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const days = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Supervisor Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Month overview of field activities
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Farm: <span className="font-semibold">Farm 1</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[2fr,1.2fr] gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-lg">
              Calendar (This Month)
            </h2>
            <span className="text-xs text-gray-500">
              {from} → {to}
            </span>
          </div>

          <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {days.map((d) => {
              const iso = d.toISOString().slice(0, 10);
              const dayNum = d.getDate();
              const summary = mapByDate[iso];
              const total = summary ? Number(summary.total_activities) : 0;
              const isToday =
                iso === new Date().toISOString().slice(0, 10);
              const isSelected = iso === selectedDate;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleSelectDate(iso)}
                  className={`h-20 rounded-xl border flex flex-col items-start p-1.5 ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-400"
                  }`}
                >
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                      isToday ? "bg-green-500 text-white" : "text-gray-700"
                    }`}
                  >
                    {dayNum}
                  </span>
                  <span className="mt-auto text-[10px] text-gray-500">
                    {total > 0 ? `${total} activities` : "No data"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day details */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col">
          <h2 className="font-semibold text-gray-800 text-lg mb-1">
            Day Details
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            {selectedDate || "Select a date from the calendar"}
          </p>

          <div className="flex-1 overflow-y-auto">
            {loadingDay && (
              <p className="text-sm text-gray-500">Loading activities...</p>
            )}

            {!loadingDay && selectedDate && dayActivities.length === 0 && (
              <p className="text-sm text-gray-500">
                No activities recorded for this date.
              </p>
            )}

            <div className="space-y-3">
              {dayActivities.map((a) => (
                <div
                  key={a.id}
                  className="border border-gray-200 rounded-xl p-3 text-sm"
                >
                  <div className="flex justify-between mb-1">
                    <div className="font-semibold text-gray-800">
                      {a.zone_name || "Zone"} •{" "}
                      <span className="capitalize">
                        {a.activity_type.replace("_", " ")}
                      </span>
                    </div>
                    {a.crop_name && (
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        {a.crop_name}
                      </span>
                    )}
                  </div>
                  {a.remarks && (
                    <p className="text-xs text-gray-600">{a.remarks}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
