"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

// Color legend for event types
const EVENT_LEGEND = [
  { type: "crop_task", label: "Crop Tasks", color: "#22c55e", emoji: "🟢" },
  { type: "soil_task", label: "Soil Tasks", color: "#a16207", emoji: "🟤" },
  {
    type: "weather_alert",
    label: "Irrigation / Weather",
    color: "#3b82f6",
    emoji: "🔵",
  },
  {
    type: "resource_task",
    label: "Resource Tasks",
    color: "#eab308",
    emoji: "🟡",
  },
  { type: "risk_alert", label: "Risk Alerts", color: "#ef4444", emoji: "🔴" },
];

export default function AgriCalendar({
  farmerId,
  events,
  currentMonth,
  onMonthChange,
  onEventComplete,
}) {
  // Parse currentMonth (YYYY-MM) into a Date for the calendar
  const initialDate = currentMonth
    ? new Date(currentMonth + "-15")
    : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("month");

  // Sync when parent changes currentMonth
  useEffect(() => {
    if (currentMonth) {
      setCurrentDate(new Date(currentMonth + "-15"));
    }
  }, [currentMonth]);

  // Convert raw events to react-big-calendar format
  const calendarEvents = events.map((ev) => ({
    id: ev.id,
    title: ev.event_title,
    start: new Date(ev.event_date),
    end: new Date(ev.event_date),
    allDay: true,
    resource: ev, // store full event data
  }));

  const eventStyleGetter = (event) => {
    const raw = event.resource;
    return {
      style: {
        backgroundColor: raw.event_color || "#22c55e",
        borderRadius: "6px",
        opacity: raw.is_completed ? 0.5 : 1,
        color: "#fff",
        border: "none",
        fontSize: "0.75rem",
        padding: "2px 6px",
        textDecoration: raw.is_completed ? "line-through" : "none",
      },
    };
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
    const month = format(newDate, "yyyy-MM");
    onMonthChange && onMonthChange(month);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  const handleMarkComplete = async () => {
    if (!selectedEvent) return;
    await onEventComplete(selectedEvent.id);
    setSelectedEvent(null);
  };

  return (
    <div className="w-full">
      {/* Legend Bar */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-white rounded-lg shadow-sm border">
        {EVENT_LEGEND.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div
        className="bg-white rounded-xl shadow-md p-4 border"
        style={{ minHeight: 600 }}
      >
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={handleNavigate}
          view={view}
          onView={setView}
          views={["month", "week", "agenda"]}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          popup
          style={{ height: 560 }}
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedEvent.event_color }}
              ></span>
              <h3 className="text-lg font-bold text-gray-800">
                {selectedEvent.event_title}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Date:</span>{" "}
                {new Date(selectedEvent.event_date).toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
              <p>
                <span className="font-medium text-gray-800">Type:</span>{" "}
                <span className="capitalize">
                  {selectedEvent.event_type?.replace(/_/g, " ")}
                </span>
              </p>
              {selectedEvent.crop_name && (
                <p>
                  <span className="font-medium text-gray-800">Crop:</span>{" "}
                  {selectedEvent.crop_name}
                  {selectedEvent.local_name && ` (${selectedEvent.local_name})`}
                </p>
              )}
              {selectedEvent.input_required && (
                <p>
                  <span className="font-medium text-gray-800">
                    Input Required:
                  </span>{" "}
                  {selectedEvent.input_required}
                </p>
              )}
              {selectedEvent.quantity_per_acre && (
                <p>
                  <span className="font-medium text-gray-800">
                    Quantity/Acre:
                  </span>{" "}
                  {selectedEvent.quantity_per_acre}
                </p>
              )}
              {selectedEvent.priority && (
                <p>
                  <span className="font-medium text-gray-800">Priority:</span>{" "}
                  <span
                    className={`capitalize font-semibold ${
                      selectedEvent.priority === "critical"
                        ? "text-red-600"
                        : selectedEvent.priority === "high"
                          ? "text-orange-600"
                          : selectedEvent.priority === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                    }`}
                  >
                    {selectedEvent.priority}
                  </span>
                </p>
              )}
              {selectedEvent.notes && (
                <p>
                  <span className="font-medium text-gray-800">Notes:</span>{" "}
                  {selectedEvent.notes}
                </p>
              )}
              {selectedEvent.is_completed && (
                <p className="text-green-600 font-semibold">✅ Completed</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {!selectedEvent.is_completed && (
                <button
                  onClick={handleMarkComplete}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  ✓ Mark Complete
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
