"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

// Simple bar component (no chart library needed)
function Bar({ label, value, max, color = "bg-green-500" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 text-gray-700 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%`, minWidth: value > 0 ? "1.5rem" : 0 }}
        />
      </div>
      <span className="w-8 text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}

const ACTIVITY_EMOJI = {
  sowing: "🌱",
  transplanting: "🌾",
  irrigation: "💧",
  pest_spray: "🐛",
  biofertilizer: "🌿",
  weeding: "✂️",
  harvest: "🌾",
  other: "📋",
};

const TYPE_COLORS = {
  sowing: "bg-green-500",
  transplanting: "bg-green-600",
  irrigation: "bg-blue-500",
  pest_spray: "bg-red-500",
  biofertilizer: "bg-amber-700",
  weeding: "bg-yellow-500",
  harvest: "bg-orange-500",
  other: "bg-gray-500",
};

export default function ReportsPage() {
  const router = useRouter();

  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load farms list
  useEffect(() => {
    async function loadFarms() {
      try {
        const res = await apiGet("/farms");
        setFarms(res || []);
      } catch (err) {
        console.error("loadFarms error", err);
      }
    }
    loadFarms();
  }, []);

  // Fetch report
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (farmId) params.farm_id = farmId;
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await apiGet("/activities/report", params);
      setReport(data);
    } catch (err) {
      console.error("fetchReport error", err);
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [farmId, from, to]);

  // Auto-load on mount
  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                📊 Farm Reports & Analytics
              </h1>
              <p className="text-sm text-gray-500">
                Analyze your farm activity data
              </p>
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

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Farm
            </label>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        </div>
      )}

      {/* Report Content */}
      {report && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
              <p className="text-3xl font-bold text-green-600">
                {report.total}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total Activities</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {report.by_type?.length || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Activity Types</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {report.inputs_used?.length || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Inputs Used</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {report.worker_participation?.length || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Workers Involved</p>
            </div>
          </div>

          {report.total === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-lg font-medium text-gray-700">
                No activities found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting the filters or log some activities first
              </p>
              <button
                onClick={() => router.push("/farmer/activity/new")}
                className="mt-4 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
              >
                Log Activity
              </button>
            </div>
          ) : (
            <>
              {/* Two-column layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Activities by Type */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Activities by Type
                  </h2>
                  <div className="space-y-3">
                    {report.by_type.map((row) => {
                      const maxCount = report.by_type[0]?.count || 1;
                      return (
                        <div key={row.activity_type} className="flex items-center gap-3 text-sm">
                          <span className="text-xl w-8 text-center">
                            {ACTIVITY_EMOJI[row.activity_type] || "📋"}
                          </span>
                          <span className="w-28 text-gray-700 capitalize truncate">
                            {row.activity_type.replace(/_/g, " ")}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${TYPE_COLORS[row.activity_type] || "bg-gray-500"}`}
                              style={{
                                width: `${(row.count / maxCount) * 100}%`,
                                minWidth: "1.5rem",
                              }}
                            />
                          </div>
                          <span className="w-8 text-right font-medium text-gray-800">
                            {row.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activities by Zone */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Activities by Zone
                  </h2>
                  <div className="space-y-3">
                    {report.by_zone.map((row) => {
                      const maxCount = report.by_zone[0]?.count || 1;
                      return (
                        <Bar
                          key={row.zone_name}
                          label={row.zone_name}
                          value={row.count}
                          max={maxCount}
                          color="bg-emerald-500"
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Activities by Crop */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Activities by Crop
                  </h2>
                  <div className="space-y-3">
                    {report.by_crop.map((row) => {
                      const maxCount = report.by_crop[0]?.count || 1;
                      return (
                        <Bar
                          key={row.crop_name}
                          label={row.crop_name}
                          value={row.count}
                          max={maxCount}
                          color="bg-amber-500"
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Monthly Trend
                  </h2>
                  <div className="space-y-3">
                    {report.by_month.map((row) => {
                      const maxCount = Math.max(
                        ...report.by_month.map((r) => r.count)
                      );
                      return (
                        <Bar
                          key={row.month}
                          label={row.month}
                          value={row.count}
                          max={maxCount}
                          color="bg-blue-500"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inputs Used */}
              {report.inputs_used.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    🧪 Inputs Used
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="py-2 pr-4 font-medium">Input</th>
                          <th className="py-2 pr-4 font-medium">Type</th>
                          <th className="py-2 pr-4 font-medium text-right">
                            Times Used
                          </th>
                          <th className="py-2 pr-4 font-medium text-right">
                            Total Qty
                          </th>
                          <th className="py-2 font-medium">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.inputs_used.map((row, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-100 text-gray-700"
                          >
                            <td className="py-2 pr-4 font-medium">
                              {row.input_name}
                            </td>
                            <td className="py-2 pr-4 capitalize">
                              {row.input_type}
                            </td>
                            <td className="py-2 pr-4 text-right">
                              {row.times_used}
                            </td>
                            <td className="py-2 pr-4 text-right">
                              {Number(row.total_quantity) || "—"}
                            </td>
                            <td className="py-2">{row.unit || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Worker Participation */}
              {report.worker_participation.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    👷 Worker Participation
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="py-2 pr-4 font-medium">Worker</th>
                          <th className="py-2 pr-4 font-medium text-right">
                            Tasks Assigned
                          </th>
                          <th className="py-2 font-medium text-right">
                            Total Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.worker_participation.map((row, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-100 text-gray-700"
                          >
                            <td className="py-2 pr-4 font-medium">
                              {row.worker_name}
                            </td>
                            <td className="py-2 pr-4 text-right">
                              {row.tasks_assigned}
                            </td>
                            <td className="py-2 text-right">
                              {Number(row.total_hours) || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  🕐 Recent Activities
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2 pr-4 font-medium">Date</th>
                        <th className="py-2 pr-4 font-medium">Type</th>
                        <th className="py-2 pr-4 font-medium">Farm</th>
                        <th className="py-2 pr-4 font-medium">Zone</th>
                        <th className="py-2 pr-4 font-medium">Crop</th>
                        <th className="py-2 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recent_activities.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-100 text-gray-700"
                        >
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {new Date(row.date).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-2 pr-4 capitalize">
                            <span className="mr-1">
                              {ACTIVITY_EMOJI[row.activity_type] || "📋"}
                            </span>
                            {row.activity_type.replace(/_/g, " ")}
                          </td>
                          <td className="py-2 pr-4">{row.farm_name || "—"}</td>
                          <td className="py-2 pr-4">{row.zone_name || "—"}</td>
                          <td className="py-2 pr-4">{row.crop_name || "—"}</td>
                          <td className="py-2 text-gray-500">
                            {row.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {/* Loading state when no report yet */}
      {loading && !report && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Generating report...</p>
        </div>
      )}
    </div>
  );
}
