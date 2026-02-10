// // app/supervisor/dashboard/page.js
// "use client";

// import { useEffect, useState } from "react";
// import { apiGet } from "../../../lib/api.js";

// function getMonthRange(date = new Date()) {
//   const start = new Date(date.getFullYear(), date.getMonth(), 1);
//   const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
//   const toIso = (d) => d.toISOString().slice(0, 10);
//   return { from: toIso(start), to: toIso(end) };
// }

// export default function SupervisorDashboard() {
//   const [calendarData, setCalendarData] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [dayActivities, setDayActivities] = useState([]);
//   const [loadingDay, setLoadingDay] = useState(false);

//   const { from, to } = getMonthRange();
//   const farmId = 1; // TODO: based on logged-in supervisor

//   useEffect(() => {
//     async function loadCalendar() {
//       try {
//         const data = await apiGet("/activities/calendar", {
//           farm_id: farmId,
//           from,
//           to,
//         });
//         setCalendarData(data);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     loadCalendar();
//   }, [farmId, from, to]);

//   const handleSelectDate = async (date) => {
//     setSelectedDate(date);
//     setLoadingDay(true);
//     try {
//       const data = await apiGet("/activities", { farm_id: farmId, date });
//       setDayActivities(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoadingDay(false);
//     }
//   };

//   // Helper map: date -> summary
//   const mapByDate = calendarData.reduce((acc, row) => {
//     acc[row.date] = row;
//     return acc;
//   }, {});

//   // Build array of days for grid
//   const today = new Date();
//   const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
//   const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//   const days = [];
//   for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
//     days.push(new Date(d));
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 px-6 py-6">
//       <header className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Supervisor Dashboard
//           </h1>
//           <p className="text-sm text-gray-500">
//             Month overview of field activities
//           </p>
//         </div>
//         <div className="text-sm text-gray-600">
//           Farm: <span className="font-semibold">Farm 1</span>
//         </div>
//       </header>

//       <div className="grid lg:grid-cols-[2fr,1.2fr] gap-6">
//         {/* Calendar */}
//         <div className="bg-white rounded-2xl shadow-sm p-4">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="font-semibold text-gray-800 text-lg">
//               Calendar (This Month)
//             </h2>
//             <span className="text-xs text-gray-500">
//               {from} → {to}
//             </span>
//           </div>

//           <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
//             {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
//               <div key={d} className="text-center">
//                 {d}
//               </div>
//             ))}
//           </div>

//           <div className="grid grid-cols-7 gap-1 text-xs">
//             {days.map((d) => {
//               const iso = d.toISOString().slice(0, 10);
//               const dayNum = d.getDate();
//               const summary = mapByDate[iso];
//               const total = summary ? Number(summary.total_activities) : 0;
//               const isToday =
//                 iso === new Date().toISOString().slice(0, 10);
//               const isSelected = iso === selectedDate;

//               return (
//                 <button
//                   key={iso}
//                   type="button"
//                   onClick={() => handleSelectDate(iso)}
//                   className={`h-20 rounded-xl border flex flex-col items-start p-1.5 ${
//                     isSelected
//                       ? "border-green-500 bg-green-50"
//                       : "border-gray-200 bg-white hover:border-green-400"
//                   }`}
//                 >
//                   <span
//                     className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
//                       isToday ? "bg-green-500 text-white" : "text-gray-700"
//                     }`}
//                   >
//                     {dayNum}
//                   </span>
//                   <span className="mt-auto text-[10px] text-gray-500">
//                     {total > 0 ? `${total} activities` : "No data"}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Day details */}
//         <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col">
//           <h2 className="font-semibold text-gray-800 text-lg mb-1">
//             Day Details
//           </h2>
//           <p className="text-xs text-gray-500 mb-3">
//             {selectedDate || "Select a date from the calendar"}
//           </p>

//           <div className="flex-1 overflow-y-auto">
//             {loadingDay && (
//               <p className="text-sm text-gray-500">Loading activities...</p>
//             )}

//             {!loadingDay && selectedDate && dayActivities.length === 0 && (
//               <p className="text-sm text-gray-500">
//                 No activities recorded for this date.
//               </p>
//             )}

//             <div className="space-y-3">
//               {dayActivities.map((a) => (
//                 <div
//                   key={a.id}
//                   className="border border-gray-200 rounded-xl p-3 text-sm"
//                 >
//                   <div className="flex justify-between mb-1">
//                     <div className="font-semibold text-gray-800">
//                       {a.zone_name || "Zone"} •{" "}
//                       <span className="capitalize">
//                         {a.activity_type.replace("_", " ")}
//                       </span>
//                     </div>
//                     {a.crop_name && (
//                       <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
//                         {a.crop_name}
//                       </span>
//                     )}
//                   </div>
//                   {a.remarks && (
//                     <p className="text-xs text-gray-600">{a.remarks}</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";

const monthName = "March 2025";

// Dummy data for calendar
const calendarDays = [
  { date: "2025-03-01", day: 1, label: "Z1: Sow×1" },
  { date: "2025-03-02", day: 2, label: "Z2: Irr×2" },
  { date: "2025-03-04", day: 4, label: "Z1: Fert×1" },
  { date: "2025-03-07", day: 7, label: "Z3: Irr×1" },
  { date: "2025-03-12", day: 12, label: "Z2: Pest×1\nZ2: Irr×2" },
  { date: "2025-03-13", day: 13, label: "Z1: Sow×1" },
  { date: "2025-03-18", day: 18, label: "Z1: Irr×3" },
];

// Dummy activities for selected day
const activitiesFor12th = [
  {
    id: 1,
    type: "Pest Control Spray",
    zone: "Zone 2",
    crop: "Tomato",
    time: "10:30 AM",
    inputs: "Organic pesticide 20L (Manual Spraying)",
    workers: ["Ram", "Sita"],
    remarks: "Pest spray only for tomato section",
  },
  {
    id: 2,
    type: "Irrigation - Drip System",
    zone: "Zone 2",
    crop: "Chilli",
    time: "7:00 AM",
    inputs: "Water 500L (Drip Irrigation)",
    workers: ["Raju"],
    remarks: "Good soil moisture level",
  },
  {
    id: 3,
    type: "Irrigation - Manual",
    zone: "Zone 2",
    crop: "Bitter Gourd",
    time: "3:00 PM",
    inputs: "Water 300L (Manual Watering)",
    workers: ["Ram"],
    remarks: "Evening watering session",
  },
];

const activityTypeFilters = [
  "All",
  "Sowing",
  "Irrigation",
  "Pest",
  "Fertilizer",
  "Pest Control Spray",
];

const zoneFilterOptions = ["All Zones", "Zone 1", "Zone 2", "Zone 3"];
const activityFilterOptions = ["All Activities", "Sowing", "Irrigation", "Pest"];
const workerFilterOptions = ["All Workers", "Ram", "Sita", "Raju"];

function FilterPill({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        isActive
          ? "bg-green-600 text-white border-green-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
      }`}
    >
      {label}
    </button>
  );
}

export default function SupervisorDashboardPage() {
  const [selectedDate, setSelectedDate] = useState("2025-03-12");
  const [zoneFilter, setZoneFilter] = useState("All Zones");
  const [activityFilter, setActivityFilter] = useState("All Activities");
  const [workerFilter, setWorkerFilter] = useState("All Workers");
  const [activityTypeFilter, setActivityTypeFilter] = useState("All");

  // In future, filter based on selectedDate & filters. For now, we always show activitiesFor12th
  const visibleActivities = activitiesFor12th.filter((act) => {
    if (
      activityTypeFilter !== "All" &&
      !act.type.toLowerCase().includes(activityTypeFilter.toLowerCase())
    ) {
      return false;
    }
    if (zoneFilter !== "All Zones" && act.zone !== zoneFilter) return false;
    if (workerFilter !== "All Workers") {
      if (!act.workers.includes(workerFilter)) return false;
    }
    // activityFilter (broad category) can be wired later
    return true;
  });

  // Build a simple 5-week matrix for calendar (not a real calendar calculation)
  const daysInMonth = 31;
  const firstWeekdayOffset = 5; // pretend 1st March is Saturday (0=Mon,...6=Sun)

  const calendarCells = [];
  for (let i = 0; i < firstWeekdayOffset; i++) {
    calendarCells.push(null); // empty cells before 1st
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayInfo = calendarDays.find((c) => c.day === d) || {
      day: d,
      label: "",
    };
    calendarCells.push(dayInfo);
  }

  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              FarmOps Dashboard
            </h1>
            <p className="text-sm text-gray-500">Green Farm</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Month selector */}
            <div className="flex items-center rounded-full border border-gray-300 px-3 py-1 bg-white shadow-sm text-sm">
              <button className="px-2 text-gray-500 hover:text-gray-700">
                ←
              </button>
              <span className="px-2 font-medium text-gray-700">
                {monthName}
              </span>
              <button className="px-2 text-gray-500 hover:text-gray-700">
                →
              </button>
            </div>
            {/* Supervisor info */}
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="font-medium text-gray-700">
                  Supervisor Rajesh
                </div>
                <div className="text-xs text-gray-500">This Month</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold shadow">
                RS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Today's Activities"
            value="23"
            subLabel="Activities logged"
          />
          <StatCard
            label="Workers Present"
            value="14/18"
            subLabel="Attendance today"
          />
          <StatCard
            label="Zones Need Attention"
            value="3"
            subLabel="Pest / Disease alerts"
          />
          <StatCard
            label="Upcoming Tasks"
            value="7"
            subLabel="Next 7 days"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label={zoneFilter}
              isActive
              onClick={() => {}}
            />
            <FilterPill
              label={activityFilter}
              isActive
              onClick={() => {}}
            />
            <FilterPill
              label={workerFilter}
              isActive
              onClick={() => {}}
            />
          </div>
          <div className="text-xs text-gray-500">
            Filters are placeholders – real dropdowns can come later.
          </div>
        </div>

        {/* Calendar + Activity detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-gray-800">
                Monthly Activity Calendar
              </div>
              <div className="text-xs text-gray-500">
                Tap a date to see details
              </div>
            </div>

            <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
              <div className="text-center">Mon</div>
              <div className="text-center">Tue</div>
              <div className="text-center">Wed</div>
              <div className="text-center">Thu</div>
              <div className="text-center">Fri</div>
              <div className="text-center">Sat</div>
              <div className="text-center">Sun</div>
            </div>

            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className="grid grid-cols-7 gap-1"
                >
                  {week.map((cell, ci) => {
                    if (!cell) {
                      return (
                        <div
                          key={ci}
                          className="h-16 rounded-xl bg-transparent"
                        />
                      );
                    }
                    const isSelected =
                      selectedDate === cell.date;
                    const isToday = cell.day === 12; // static highlight
                    return (
                      <button
                        key={ci}
                        type="button"
                        onClick={() =>
                          setSelectedDate(cell.date || "")
                        }
                        className={`h-20 rounded-xl border text-left p-1.5 flex flex-col justify-between ${
                          isSelected
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              isSelected
                                ? "text-green-700"
                                : "text-gray-700"
                            }`}
                          >
                            {cell.day}
                          </span>
                          {isToday && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[10px] text-gray-600 whitespace-pre-line leading-tight">
                          {cell.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Activity detail panel */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col">
            <div className="mb-2">
              <div className="text-sm font-semibold text-gray-800">
                Activities on 12 March 2025
              </div>
              <div className="text-xs text-gray-500">
                Filter by type / worker / zone
              </div>
            </div>

            {/* Type filter pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
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
            <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
              {visibleActivities.length === 0 && (
                <div className="text-xs text-gray-500">
                  No activities match the selected filters.
                </div>
              )}

              {visibleActivities.map((act) => (
                <div
                  key={act.id}
                  className="border border-gray-200 rounded-xl p-3 bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-gray-800">
                        {act.type}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {act.zone} • {act.crop}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {act.time}
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-gray-700">
                    <span className="font-medium">
                      Inputs:
                    </span>{" "}
                    {act.inputs}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-700">
                    <span className="font-medium">
                      Workers:
                    </span>{" "}
                    {act.workers.join(", ")}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500 italic">
                    {act.remarks}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row (placeholders for now) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Activity Type Distribution (This Month)">
            <p className="text-xs text-gray-500 mb-1">
              Example:
              Sowing 10% | Irrigation 40% | Pest 20% | Fertilizer 15% | Others 15%
            </p>
            <div className="mt-2 h-32 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-dashed border-green-200 flex items-center justify-center text-xs text-gray-500">
              Pie chart placeholder – plug Recharts here
            </div>
          </ChartCard>

          <ChartCard title="Zone-wise Activity Heat (This Month)">
            <p className="text-xs text-gray-500 mb-1">
              Example: Zone 1: 35 | Zone 2: 28 | Zone 3: 22
            </p>
            <div className="mt-2 h-32 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-dashed border-green-200 flex items-center justify-center text-xs text-gray-500">
              Bar chart placeholder
            </div>
          </ChartCard>

          <ChartCard title="Input Usage Trend (Weekly)">
            <p className="text-xs text-gray-500 mb-1">
              Water, Biofertilizer, Pesticide, Seeds by week
            </p>
            <div className="mt-2 h-32 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-dashed border-green-200 flex items-center justify-center text-xs text-gray-500">
              Stacked bar chart placeholder
            </div>
          </ChartCard>

          <ChartCard title="Worker Attendance Summary">
            <p className="text-xs text-gray-500 mb-1">
              Worker vs days present this month
            </p>
            <div className="mt-2 h-32 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-dashed border-green-200 flex items-center justify-center text-xs text-gray-500">
              Bar chart placeholder
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subLabel }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-gray-500">
        {subLabel}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="text-sm font-semibold text-gray-800">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
