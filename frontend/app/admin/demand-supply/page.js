"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wheat,
  Package,
  Users,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Handshake,
  RefreshCw,
  ChevronRight,
  IndianRupee,
  Calendar,
  MapPin,
  Zap,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

/* ─── Stat card ─── */
function StatCard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={17} className={color} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Bar row for supply-demand chart ─── */
function GapBar({ row, maxVal }) {
  const supplyPct = maxVal > 0 ? Math.min((row.total_supply / maxVal) * 100, 100) : 0;
  const demandPct = maxVal > 0 ? Math.min((row.total_demand / maxVal) * 100, 100) : 0;
  const gap = row.gap; // positive = more demand than supply (shortage), negative = surplus
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700 truncate max-w-[50%]" title={row.crop_name}>{row.crop_name}</span>
        <div className="flex items-center gap-2 shrink-0">
          {gap > 0 ? (
            <span className="text-xs font-semibold text-red-600 flex items-center gap-0.5">
              <TrendingDown size={11} /> Shortage {Number(gap).toLocaleString("en-IN")}
            </span>
          ) : gap < 0 ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={11} /> Surplus {Number(Math.abs(gap)).toLocaleString("en-IN")}
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-400">Balanced</span>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-600 w-12 text-right shrink-0">Supply</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${supplyPct}%` }} />
          </div>
          <span className="text-xs text-gray-500 w-14 shrink-0">{Number(row.total_supply).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 w-12 text-right shrink-0">Demand</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${demandPct}%` }} />
          </div>
          <span className="text-xs text-gray-500 w-14 shrink-0">{Number(row.total_demand).toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Match status badge ─── */
const MATCH_STATUS = {
  pending:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  confirmed: { label: "Confirmed", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  rejected:  { label: "Rejected",  bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200" },
  fulfilled: { label: "Fulfilled", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

function MatchBadge({ status }) {
  const cfg = MATCH_STATUS[status] || MATCH_STATUS.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

/* ─── Main Page ─── */
export default function AdminDemandSupplyPage() {
  const router  = useRouter();
  const [user, setUser]       = useState(null);
  const [report, setReport]   = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoMatching, setAutoMatching] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | demands | matches

  // Auth
  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    try {
      const u = JSON.parse(userData);
      if (u.role !== "admin") { router.push("/login"); return; }
      setUser(u);
    } catch { router.push("/login"); }
  }, [router]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [reportRes, matchRes] = await Promise.all([
        api.get("/ds/report"),
        api.get("/ds/matches"),
      ]);
      setReport(reportRes.data);
      setMatches(matchRes.data || []);
    } catch {
      toast.error("Failed to load demand-supply data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleAutoMatch = async () => {
    setAutoMatching(true);
    try {
      const res = await api.post("/ds/matches/auto");
      toast.success(`Auto-match complete: ${res.data.matches_created} new match${res.data.matches_created !== 1 ? "es" : ""} created`);
      load();
    } catch {
      toast.error("Auto-match failed");
    } finally {
      setAutoMatching(false);
    }
  };

  const handleMatchStatus = async (id, status) => {
    try {
      const res = await api.patch(`/ds/matches/${id}/status`, { status });
      setMatches(p => p.map(m => m.id === id ? { ...m, status: res.data.status } : m));
      toast.success("Match status updated");
    } catch {
      toast.error("Failed to update match");
    }
  };

  const maxGapVal = report
    ? Math.max(...report.gap_analysis.map(r => Math.max(r.total_supply, r.total_demand)), 1)
    : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white border border-gray-100 rounded-xl animate-pulse" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl h-64 animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  const ms = report?.match_stats || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/dashboard")}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-50 rounded-xl">
                <BarChart3 size={18} className="text-violet-600" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-none">Demand & Supply</h1>
                <p className="text-xs text-gray-400 mt-0.5">Market gap analysis & matching</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
              <RefreshCw size={16} />
            </button>
            <button onClick={handleAutoMatch} disabled={autoMatching}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold rounded-lg transition">
              <Zap size={15} />
              {autoMatching ? "Matching…" : "Auto-Match"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Open Demands"      value={report?.open_demands?.length ?? 0}   icon={Package}     color="text-blue-600"    bg="bg-blue-50"    sub="Awaiting supply" />
          <StatCard label="Supply Forecasts"  value={report?.supply_by_crop?.reduce((s, r) => s + Number(r.forecast_count), 0) ?? 0} icon={Wheat} color="text-emerald-600" bg="bg-emerald-50" sub="Across all crops" />
          <StatCard label="Total Matches"     value={ms.total_matches ?? 0}                icon={Handshake}   color="text-violet-600"  bg="bg-violet-50"  sub={`Avg score ${ms.avg_score ?? 0}`} />
          <StatCard label="Unmet Demand"      value={report?.unmet_demand?.length ?? 0}    icon={AlertTriangle} color="text-red-600"  bg="bg-red-50"     sub="No supply yet" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: "overview", label: "Overview" },
            { key: "demands",  label: `Demands (${report?.open_demands?.length ?? 0})` },
            { key: "matches",  label: `Matches (${matches.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Match funnel */}
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { label: "Pending",   value: ms.pending   ?? 0, color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
                { label: "Confirmed", value: ms.confirmed ?? 0, color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
                { label: "Fulfilled", value: ms.fulfilled ?? 0, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                { label: "Rejected",  value: ms.rejected  ?? 0, color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
              ].map(({ label, value, color, bg, border }) => (
                <div key={label} className={`bg-white border ${border} rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label} Matches</p>
                </div>
              ))}
            </div>

            {/* Gap analysis chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-violet-600" />
                  <h2 className="text-base font-semibold text-gray-800">Supply vs Demand by Crop</h2>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-emerald-500 rounded-full inline-block" />Supply</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-blue-500 rounded-full inline-block" />Demand</span>
                </div>
              </div>
              {report?.gap_analysis?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-5 overflow-y-auto max-h-[400px] pr-1">
                  {report.gap_analysis.map(row => (
                    <GapBar key={row.crop_name} row={row} maxVal={maxGapVal} />
                  ))}
                </div>
              )}
            </div>

            {/* Unmet demand + surplus supply side by side */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Unmet demand */}
              <div className="bg-white border border-red-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-red-500" />
                  <h2 className="text-sm font-semibold text-gray-800">Unmet Demand</h2>
                  <span className="ml-auto text-xs text-red-500 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    {report?.unmet_demand?.length ?? 0} crop{report?.unmet_demand?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {report?.unmet_demand?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">All demands have supply coverage</p>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                    {report.unmet_demand.map(row => (
                      <div key={row.crop_name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{row.crop_name}</span>
                          <p className="text-xs text-gray-400">{row.demand_count} request{row.demand_count !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">{Number(row.total_demand).toLocaleString("en-IN")} {row.unit}</p>
                          <p className="text-xs text-gray-400">needed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Surplus supply */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <h2 className="text-sm font-semibold text-gray-800">Surplus Supply</h2>
                  <span className="ml-auto text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {report?.surplus_supply?.length ?? 0} crop{report?.surplus_supply?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {report?.surplus_supply?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No surplus forecasts</p>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                    {report.surplus_supply.map(row => (
                      <div key={row.crop_name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{row.crop_name}</span>
                          <p className="text-xs text-gray-400">{row.forecast_count} forecast{row.forecast_count !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">{Number(row.total_supply).toLocaleString("en-IN")} {row.unit}</p>
                          <p className="text-xs text-gray-400">available</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent forecasts */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wheat size={16} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-800">Recent Supply Forecasts</h2>
              </div>
              {report?.recent_forecasts?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No forecasts yet</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {report.recent_forecasts.map(fc => (
                    <div key={fc.id} className="py-3 flex items-center gap-4">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                        <Wheat size={14} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{fc.crop_name}</p>
                        <p className="text-xs text-gray-400">{fc.farm_name || "—"} · {fc.farmer_name || "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{Number(fc.estimated_qty).toLocaleString("en-IN")} {fc.unit}</p>
                        <p className="text-xs text-gray-400">
                          {fc.expected_date ? new Date(fc.expected_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "No date"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DEMANDS TAB ── */}
        {activeTab === "demands" && (
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">All Open Demand Requests</h2>
              <span className="text-xs text-gray-400">{report?.open_demands?.length ?? 0} requests</span>
            </div>
            {report?.open_demands?.length === 0 ? (
              <div className="py-16 text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No open demand requests</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {report.open_demands.map(d => (
                  <div key={d.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{d.crop_name}</span>
                        {d.deadline_date && new Date(d.deadline_date) <= new Date(Date.now() + 7 * 86400000) && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Urgent</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                        <span>{d.buyer_name} · {d.buyer_type}</span>
                        {d.delivery_location && <span className="flex items-center gap-1"><MapPin size={10} />{d.delivery_location}</span>}
                        {d.deadline_date && <span className="flex items-center gap-1"><Calendar size={10} />By {new Date(d.deadline_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{Number(d.quantity_needed).toLocaleString("en-IN")} {d.unit}</p>
                      {d.price_offered && <p className="text-xs text-gray-400">₹{Number(d.price_offered).toLocaleString("en-IN")}/{d.unit}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MATCHES TAB ── */}
        {activeTab === "matches" && (
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Demand-Supply Matches</h2>
              <button onClick={handleAutoMatch} disabled={autoMatching}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-lg transition">
                <Zap size={12} />
                {autoMatching ? "Running…" : "Run Auto-Match"}
              </button>
            </div>
            {matches.length === 0 ? (
              <div className="py-16 text-center">
                <Handshake size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">No matches yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Run Auto-Match" to find supply-demand overlaps</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {matches.map(m => (
                  <div key={m.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition">
                    {/* Score badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                      m.match_score >= 80 ? "bg-emerald-100 text-emerald-700" :
                      m.match_score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                    }`}>
                      {m.match_score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-gray-900">{m.demand_crop}</span>
                        <MatchBadge status={m.status} />
                      </div>
                      <div className="text-xs text-gray-400 space-y-0.5">
                        <p>Buyer: <span className="text-gray-600 font-medium">{m.buyer_name}</span> · Needs {Number(m.quantity_needed).toLocaleString("en-IN")} {m.demand_unit}
                          {m.price_offered ? ` · ₹${Number(m.price_offered).toLocaleString("en-IN")}/${m.demand_unit}` : ""}
                        </p>
                        <p>Farmer: <span className="text-gray-600 font-medium">{m.farmer_name || "—"}</span> ({m.farm_name || "—"}) · Supply {Number(m.estimated_qty || 0).toLocaleString("en-IN")} {m.forecast_unit}
                          {m.expected_date ? ` · Ready ${new Date(m.expected_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {m.status === "pending" && (
                        <>
                          <button onClick={() => handleMatchStatus(m.id, "confirmed")}
                            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">
                            Confirm
                          </button>
                          <button onClick={() => handleMatchStatus(m.id, "rejected")}
                            className="px-2.5 py-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition">
                            Reject
                          </button>
                        </>
                      )}
                      {m.status === "confirmed" && (
                        <button onClick={() => handleMatchStatus(m.id, "fulfilled")}
                          className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                          Mark Fulfilled
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
