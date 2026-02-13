

"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";

function FilterPill({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        isActive
          ? "bg-blue-500 text-white shadow-md"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, subLabel, color = "green" }) {
  const colorClasses = {
    green: "border-l-green-500",
    blue: "border-l-blue-500",
    red: "border-l-red-500",
    orange: "border-l-orange-500",
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${colorClasses[color]} p-5`}>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      <div className="mt-2 text-3xl font-bold text-gray-800">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{subLabel}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
        <span className="text-blue-500">📊</span>
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SupervisorDashboardPage() {
  const farmId = 1;

  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState("2025-03");

  const [zoneFilter, setZoneFilter] = useState("All Zones");
  const [activityTypeFilter, setActivityTypeFilter] = useState("All");

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const activityTypeFilters = [
    "All",
    "Sowing",
    "Irrigation",
    "Pest",
    "Fertilizer",
  ];

  // Fetch month data
  useEffect(() => {
    async function loadMonth() {
      try {
        setLoading(true);
        const data = await apiGet("/supervisor/activities/month", {
          farm_id: farmId,
          month: currentMonth,
        });

        setActivities(data || []);

        if (data && data.length > 0) {
          const first = new Date(data[0].date).toISOString().slice(0, 10);
          setSelectedDate((prev) => prev || first);
        } else {
          setSelectedDate("");
        }
      } catch (err) {
        console.error("loadMonth error", err);
      } finally {
        setLoading(false);
      }
    }

    loadMonth();
  }, [currentMonth]);

  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const map = {};
    for (const a of activities) {
      const key = new Date(a.date).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [activities]);

  // Build labels for calendar
  const dayLabels = useMemo(() => {
    const labels = {};

    Object.entries(activitiesByDate).forEach(([dateKey, list]) => {
      const summary = {};

      for (const a of list) {
        const zone = a.zone_name || "Z?";
        const type = a.activity_type || "other";

        const short =
          type === "sowing"
            ? "Sow"
            : type === "irrigation"
            ? "Irr"
            : type === "pest_spray"
            ? "Pest"
            : type === "biofertilizer"
            ? "Bio"
            : type === "weeding"
            ? "Weed"
            : type === "harvest"
            ? "Hrv"
            : "Act";

        const key = `${zone}-${short}`;
        if (!summary[key]) summary[key] = { zone, short, count: 0, type };
        summary[key].count++;
      }

      labels[dateKey] = Object.values(summary);
    });

    return labels;
  }, [activitiesByDate]);

  // Calendar calculations
  const [year, monthIndex] = useMemo(() => {
    const [y, m] = currentMonth.split("-").map(Number);
    return [y, m - 1];
  }, [currentMonth]);

  const monthName = useMemo(() => {
    return new Date(year, monthIndex, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [year, monthIndex]);

  const daysInMonth = useMemo(() => {
    return new Date(year, monthIndex + 1, 0).getDate();
  }, [year, monthIndex]);

  const firstWeekdayOffset = useMemo(() => {
    const jsDay = new Date(year, monthIndex, 1).getDay();
    return (jsDay + 6) % 7;
  }, [year, monthIndex]);

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekdayOffset; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;

      cells.push({
        date: dateKey,
        day: d,
        labels: dayLabels[dateKey] || [],
      });
    }

    return cells;
  }, [year, monthIndex, daysInMonth, firstWeekdayOffset, dayLabels]);

  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
      w.push(calendarCells.slice(i, i + 7));
    }
    return w;
  }, [calendarCells]);

  // Filtered activities for selected day
  const visibleActivities = useMemo(() => {
    const list = activitiesByDate[selectedDate] || [];

    return list.filter((a) => {
      if (zoneFilter !== "All Zones" && a.zone_name !== zoneFilter) return false;

      if (activityTypeFilter !== "All") {
        const label = activityTypeFilter.toLowerCase();
        const t = (a.activity_type || "").toLowerCase();

        if (label === "pest") {
          if (!t.includes("pest")) return false;
        } else if (label === "fertilizer") {
          if (!t.includes("fert")) return false;
        } else if (!t.includes(label)) {
          return false;
        }
      }

      return true;
    });
  }, [activitiesByDate, selectedDate, zoneFilter, activityTypeFilter]);

  // Build zone dropdown from data
  const zoneOptions = useMemo(() => {
    const set = new Set();
    for (const a of activities) {
      if (a.zone_name) set.add(a.zone_name);
    }
    return ["All Zones", ...Array.from(set).sort()];
  }, [activities]);

  // Month navigation
  const goPrevMonth = () => {
    const d = new Date(year, monthIndex - 1, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    setCurrentMonth(`${y}-${m}`);
    setSelectedDate("");
  };

  const goNextMonth = () => {
    const d = new Date(year, monthIndex + 1, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    setCurrentMonth(`${y}-${m}`);
    setSelectedDate("");
  };

  const monthActivityCount = activities.length;

  // Helper to get activity chip color
  const getActivityColor = (type) => {
    const t = type.toLowerCase();
    if (t.includes("sow")) return "bg-green-100 text-green-800 border-green-300";
    if (t.includes("irr")) return "bg-blue-100 text-blue-800 border-blue-300";
    if (t.includes("pest")) return "bg-red-100 text-red-800 border-red-300";
    if (t.includes("fert")) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header - Dark blue/slate background */}
      <div className="bg-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌾</span>
            <div>
              <h1 className="text-xl font-bold text-white">FarmOps Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Farm selector */}
            <select className="bg-slate-600 text-white border border-slate-500 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>🏡 Green Farm</option>
              <option>Valley Farm</option>
              <option>Hilltop Farm</option>
            </select>

            {/* Month selector */}
            <div className="flex items-center bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-sm">
              <button
                onClick={goPrevMonth}
                className="px-2 text-white hover:text-blue-300 font-bold"
              >
                ←
              </button>
              <span className="px-3 font-medium text-white">📅 {monthName}</span>
              <button
                onClick={goNextMonth}
                className="px-2 text-white hover:text-blue-300 font-bold"
              >
                →
              </button>
            </div>

            {/* Supervisor info */}
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="font-semibold text-white">Supervisor Rajesh</div>
                <div className="text-xs text-slate-300">This Month</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                RS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats row with colored borders */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* <StatCard
            label="Today's Activities"
            value="23"
            subLabel="Activities logged"
            color="green"
          /> */}
           <StatCard label="Month Activities" 
             value={monthActivityCount}
             subLabel="Total logged"
             color="green" />
          <StatCard
            label="Workers Present"
            value="3/3"
            subLabel="Attendance today"
            color="blue"
          />
         <StatCard label="Zones" 
            value={Math.max(0, zoneOptions.length - 1)} 
            subLabel="Active zones"
            color="red" />
          <StatCard
            label="Upcoming Tasks"
            value="7"
            subLabel="Next 7 days"
            color="orange"
          />
        </div>

        {/* Filters row */}
       <div className="flex flex-wrap items-center gap-3">
  {/* Zone */}
  <select
    value={zoneFilter}
    onChange={(e) => setZoneFilter(e.target.value)}
    className="border border-gray-400 bg-white text-gray-800 rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    {zoneOptions.map((z) => (
      <option key={z} value={z} className="text-gray-800">
        {z}
      </option>
    ))}
  </select>

  {/* Activity Type */}
  <select
    value={activityTypeFilter}
    onChange={(e) => setActivityTypeFilter(e.target.value)}
    className="border border-gray-400 bg-white text-gray-800 rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="All">All Activities</option>
    {activityTypeFilters.slice(1).map((t) => (
      <option key={t} value={t} className="text-gray-800">
        {t}
      </option>
    ))}
  </select>

  {/* Workers */}
  <select
    className="border border-gray-400 bg-white text-gray-800 rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option className="text-gray-800">All Workers</option>
    <option className="text-gray-800">Ram</option>
    <option className="text-gray-800">Sita</option>
    <option className="text-gray-800">Raju</option>
  </select>
</div>


        {/* Calendar + Activity detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
  <button
    onClick={goPrevMonth}
    className="w-9 h-9 flex items-center justify-center 
               border border-gray-400 
               bg-white text-gray-800 
               rounded-lg shadow-sm
               hover:bg-gray-100 
               transition"
  >
    <span className="text-lg font-bold">‹</span>
  </button>

  <div className="font-bold text-gray-800 text-lg">
    {monthName}
  </div>

  <button
    onClick={goNextMonth}
    className="w-9 h-9 flex items-center justify-center 
               border border-gray-400 
               bg-white text-gray-800 
               rounded-lg shadow-sm
               hover:bg-gray-100 
               transition"
  >
    <span className="text-lg font-bold">›</span>
  </button>
</div>

            </div>

            {/* Calendar grid */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-slate-700 text-white text-xs font-semibold">
                <div className="text-center py-3 border-r border-slate-600">Mon</div>
                <div className="text-center py-3 border-r border-slate-600">Tue</div>
                <div className="text-center py-3 border-r border-slate-600">Wed</div>
                <div className="text-center py-3 border-r border-slate-600">Thu</div>
                <div className="text-center py-3 border-r border-slate-600">Fri</div>
                <div className="text-center py-3 border-r border-slate-600">Sat</div>
                <div className="text-center py-3">Sun</div>
              </div>

              <div>
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 border-t border-gray-300 bg-white ">
                    {week.map((cell, ci) => {
                      if (!cell) {
                        return (
                          // <div
                          //   key={ci}
                          //   className="h-24 bg-gray-50 border-r border-gray-200 last:border-r-0 hover:border-green-400"
                          // />
                          <div
                             key={ci}
                             className="h-24 bg-gray-50 border border-gray-200 hover:border-green-500 hover:bg-green-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                                 />
                        );
                      }

                      const isSelected = selectedDate === cell.date;
                      const hasActivity = cell.labels.length > 0;

                      return (
                        <button
                          key={ci}
                          type="button"
                          onClick={() => setSelectedDate(cell.date)}
                          // className={`h-24 text-left p-2 border-r border-gray-200 last:border-r-0 transition-colors ${
                          //   isSelected
                          //     ? "bg-blue-100 border-2 border-blue-500"
                          //     : hasActivity
                          //     ? "bg-white hover:bg-gray-50"
                          //     : "bg-white hover:border-green-500  hover:shadow-md transition-all duration-200 cursor-pointer"
                          // }`}
                          className={`h-24 text-left p-2 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected
                                    ? "bg-green-50 border-green-500 shadow"
                                 : "bg-white border-gray-300 hover:border-green-500 hover:shadow hover:-translate-y-0.5 cursor-pointer"
                                     }`}

                        >
                          <div className="text-sm font-bold text-gray-800 mb-1">
                            {cell.day}
                          </div>

                          <div className="space-y-1">
                            {cell.labels.map((label, idx) => (
                              <div
                                key={idx}
                                className={`text-[9px] px-1.5 py-0.5 rounded border ${getActivityColor(
                                  label.type
                                )}`}
                              >
                                {label.zone}: {label.short}×{label.count}
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity detail panel */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 flex flex-col">
            <div className="mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2 text-base font-bold text-gray-800">
                <span className="text-red-500">📅</span>
                {selectedDate
                  ? `Activities on ${new Date(selectedDate).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}`
                  : "Select a date"}
              </div>
            </div>

            {/* Type filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {activityTypeFilters.map((label) => (
                <FilterPill
                  key={label}
                  label={label}
                  isActive={activityTypeFilter === label}
                  onClick={() => setActivityTypeFilter(label)}
                />
              ))}
            </div>

            {/* Activities list */}
            <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
              {loading && (
                <div className="text-sm text-gray-600 font-medium">
                  Loading activities...
                </div>
              )}

              {!loading && selectedDate && visibleActivities.length === 0 && (
                <div className="text-sm text-gray-600">
                  No activities for this date.
                </div>
              )}

              {!loading &&
                visibleActivities.map((act) => (
                  <div
                    key={act.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800">
                          {act.activity_type}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                            {act.zone_name || "Unknown"}
                          </span>
                          {act.crop_name && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 font-medium">
                              {act.crop_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        10:30 AM
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-700">
                      <div>
                        <span className="font-bold text-gray-800">Inputs:</span>{" "}
                        {act.remarks || "Not specified"}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">Workers:</span>{" "}
                        Ram, Sita
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">Remarks:</span>{" "}
                        <span className="italic">{act.remarks || "—"}</span>
                      </div>
                    </div>

                    {/* Photo placeholders */}
                    <div className="flex gap-2 mt-3">
                      <div className="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-gray-400">
                        📷
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-gray-400">
                        📷
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
      
        </div>

        {/* Charts placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ChartCard title="Activity Type Distribution (This Month)">
            <p className="text-xs text-gray-600 mb-3">
              Pie Chart: Sowing 10% | Irrigation 40% | Pest 20% | Fertilizer 15% | Others 15%
            </p>
            <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500 bg-gray-50">
              Pie chart placeholder – connect Recharts
            </div>
          </ChartCard>

          <ChartCard title="Zone-wise Activity Heat (This Month)">
            <p className="text-xs text-gray-600 mb-3">
              Bar Chart: Zone 1: 35 | Zone 2: 28 | Zone 3: 22
            </p>
            <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500 bg-gray-50">
              Bar chart placeholder
            </div>
          </ChartCard>

          <ChartCard title="Input Usage Trend (Weekly)">
            <p className="text-xs text-gray-600 mb-3">
              Stacked Bar: Water, Biofertilizer, Pesticide, Seeds by week
            </p>
            <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500 bg-gray-50">
              Stacked bar chart placeholder
            </div>
          </ChartCard>

          <ChartCard title="Worker Attendance Summary">
            <p className="text-xs text-gray-600 mb-3">
              Bar Chart: Worker vs Days Present this month
            </p>
            <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500 bg-gray-50">
              Attendance chart placeholder
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}