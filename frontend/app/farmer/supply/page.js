"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Wheat,
  Calendar,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronRight,
  Trash2,
  X,
  Sprout,
  BarChart3,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

/* ─── Status config ─── */
const FORECAST_STATUS = {
  forecast:  { label: "Forecast",  bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: Clock3 },
  available: { label: "Available", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  sold:      { label: "Sold",      bg: "bg-gray-100",   text: "text-gray-500",    border: "border-gray-200",    icon: Package },
  cancelled: { label: "Cancelled", bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = FORECAST_STATUS[status] || FORECAST_STATUS.forecast;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/* ─── Add Forecast Modal ─── */
function AddForecastModal({ farms, crops, user, onClose, onCreated }) {
  const [form, setForm] = useState({
    farm_id: farms[0]?.id || "",
    crop_id: "",
    crop_name: "",
    estimated_qty: "",
    unit: "kg",
    expected_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.crop_name.trim()) return toast.error("Crop name is required");
    if (!form.estimated_qty || Number(form.estimated_qty) <= 0) return toast.error("Enter valid quantity");
    setSaving(true);
    try {
      const res = await api.post("/ds/forecasts", {
        ...form,
        estimated_qty: Number(form.estimated_qty),
        crop_id: form.crop_id || null,
        farmer_id: user?.id,
      });
      toast.success("Supply forecast added");
      onCreated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add forecast");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sprout size={18} className="text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">New Supply Forecast</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm <span className="text-red-500">*</span></label>
            <select value={form.farm_id} onChange={e => set("farm_id", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name <span className="text-red-500">*</span></label>
            <input
              list="crop-list"
              value={form.crop_name}
              onChange={e => { set("crop_name", e.target.value); const m = crops.find(c => c.name === e.target.value); if (m) set("crop_id", m.id); }}
              placeholder="e.g. Wheat, Rice, Groundnut"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="crop-list">{crops.map(c => <option key={c.id} value={c.name} />)}</datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Quantity <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="number" min="0.01" step="0.01" value={form.estimated_qty}
                  onChange={e => set("estimated_qty", e.target.value)} placeholder="0.00"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <select value={form.unit} onChange={e => set("unit", e.target.value)}
                  className="w-20 shrink-0 border border-gray-200 rounded-xl px-2 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                  <option value="unit">unit</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Ready Date</label>
              <input type="date" value={form.expected_date} onChange={e => set("expected_date", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Optional notes"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition">
              {saving ? "Saving…" : "Add Forecast"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SupplyForecastsPage() {
  const router = useRouter();
  const [user, setUser]           = useState(null);
  const [farms, setFarms]         = useState([]);
  const [crops, setCrops]         = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Auth
  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    try { setUser(JSON.parse(userData)); } catch { router.push("/login"); }
  }, [router]);

  // Load data
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [farmRes, cropRes, fRes] = await Promise.all([
        api.get(`/farms?owner_id=${user.id}`),
        api.get("/crops"),
        api.get(`/ds/forecasts?farmer_id=${user.id}`),
      ]);
      setFarms(farmRes.data || []);
      setCrops(cropRes.data || []);
      setForecasts(fRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this forecast?")) return;
    try {
      await api.delete(`/ds/forecasts/${id}`);
      setForecasts(p => p.filter(f => f.id !== id));
      toast.success("Forecast deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.patch(`/ds/forecasts/${id}/status`, { status });
      setForecasts(p => p.map(f => f.id === id ? { ...f, status: res.data.status } : f));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filtered = filterStatus === "all" ? forecasts : forecasts.filter(f => f.status === filterStatus);

  // Stats
  const stats = {
    total:     forecasts.length,
    forecast:  forecasts.filter(f => f.status === "forecast").length,
    available: forecasts.filter(f => f.status === "available").length,
    sold:      forecasts.filter(f => f.status === "sold").length,
    totalQty:  forecasts.filter(f => f.status !== "cancelled").reduce((s, f) => s + Number(f.estimated_qty), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/farmer/dashboard")}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-none">Supply Forecasts</h1>
                <p className="text-xs text-gray-400 mt-0.5">Declare upcoming harvests</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/farmer/demand-board")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Package size={15} />
              <span className="hidden sm:inline">Demand Board</span>
            </button>
            {farms.length > 0 && (
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
                <Plus size={15} />
                Add Forecast
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Forecasts", value: stats.total,    icon: Sprout,       color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Forecast",        value: stats.forecast,  icon: Clock3,       color: "text-blue-600",    bg: "bg-blue-50" },
            { label: "Available",       value: stats.available, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Qty (est)", value: `${stats.totalQty.toLocaleString("en-IN")} kg`, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Filter + list */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">My Forecasts</h2>
            <div className="flex gap-1.5">
              {["all", "forecast", "available", "sold", "cancelled"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filterStatus === s ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-full w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sprout size={24} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700">No forecasts{filterStatus !== "all" ? ` with status "${filterStatus}"` : " yet"}</p>
              <p className="text-sm text-gray-400 mt-1">
                {farms.length === 0 ? "Create a farm first to add forecasts" : "Declare upcoming harvests to attract buyers"}
              </p>
              {farms.length > 0 && (
                <button onClick={() => setShowModal(true)}
                  className="mt-4 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
                  Add Your First Forecast
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(fc => (
                <div key={fc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition group">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Wheat size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{fc.crop_name}</span>
                      <StatusBadge status={fc.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Package size={11} />
                        {Number(fc.estimated_qty).toLocaleString("en-IN")} {fc.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {fc.expected_date ? new Date(fc.expected_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date not set"}
                      </span>
                      {fc.farm_name && <span>{fc.farm_name}</span>}
                    </div>
                    {fc.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{fc.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {fc.status === "forecast" && (
                      <button onClick={() => handleStatusChange(fc.id, "available")}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition">
                        Mark Available
                      </button>
                    )}
                    {fc.status === "available" && (
                      <button onClick={() => handleStatusChange(fc.id, "sold")}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                        Mark Sold
                      </button>
                    )}
                    <button onClick={() => handleDelete(fc.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <AddForecastModal
          farms={farms}
          crops={crops}
          user={user}
          onClose={() => setShowModal(false)}
          onCreated={(fc) => { setForecasts(p => [fc, ...p]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
