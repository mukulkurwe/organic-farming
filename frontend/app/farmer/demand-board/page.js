"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Wheat,
  Calendar,
  MapPin,
  Package,
  IndianRupee,
  Users,
  X,
  Tag,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Handshake,
  TrendingUp,
  User,
  Phone,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

/* ─── Status config ─── */
const DEMAND_STATUS = {
  open:      { label: "Open",      bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: Clock3 },
  matched:   { label: "Matched",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Handshake },
  fulfilled: { label: "Fulfilled", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  closed:    { label: "Closed",    bg: "bg-gray-100",   text: "text-gray-500",    border: "border-gray-200",    icon: X },
};

const BUYER_TYPES = ["individual", "retailer", "wholesaler", "mandi", "exporter"];

function StatusBadge({ status }) {
  const cfg = DEMAND_STATUS[status] || DEMAND_STATUS.open;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/* ─── Post Demand Modal ─── */
function PostDemandModal({ crops, user, onClose, onCreated }) {
  const [form, setForm] = useState({
    buyer_name: user?.name || "",
    buyer_phone: user?.phone || "",
    buyer_type: "individual",
    crop_id: "",
    crop_name: "",
    quantity_needed: "",
    unit: "kg",
    price_offered: "",
    deadline_date: "",
    delivery_location: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.buyer_name.trim()) return toast.error("Buyer name is required");
    if (!form.crop_name.trim())  return toast.error("Crop name is required");
    if (!form.quantity_needed || Number(form.quantity_needed) <= 0) return toast.error("Enter valid quantity");
    setSaving(true);
    try {
      const res = await api.post("/ds/demands", {
        ...form,
        quantity_needed: Number(form.quantity_needed),
        price_offered: form.price_offered ? Number(form.price_offered) : null,
        crop_id: form.crop_id || null,
        created_by: user?.id,
      });
      toast.success("Demand request posted");
      onCreated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post demand");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Post Demand Request</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
              <input value={form.buyer_name} onChange={e => set("buyer_name", e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.buyer_phone} onChange={e => set("buyer_phone", e.target.value)}
                placeholder="Contact number"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Type</label>
            <select value={form.buyer_type} onChange={e => set("buyer_type", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {BUYER_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Needed <span className="text-red-500">*</span></label>
            <input
              list="crop-demand-list"
              value={form.crop_name}
              onChange={e => { set("crop_name", e.target.value); const m = crops.find(c => c.name === e.target.value); if (m) set("crop_id", m.id); }}
              placeholder="e.g. Wheat, Rice, Groundnut"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="crop-demand-list">{crops.map(c => <option key={c.id} value={c.name} />)}</datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="number" min="0.01" step="0.01" value={form.quantity_needed}
                  onChange={e => set("quantity_needed", e.target.value)} placeholder="0.00"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={form.unit} onChange={e => set("unit", e.target.value)}
                  className="w-20 shrink-0 border border-gray-200 rounded-xl px-2 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                  <option value="unit">unit</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Offered (₹/{form.unit})</label>
              <input type="number" min="0.01" step="0.01" value={form.price_offered}
                onChange={e => set("price_offered", e.target.value)} placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Date</label>
              <input type="date" value={form.deadline_date} onChange={e => set("deadline_date", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
              <input value={form.delivery_location} onChange={e => set("delivery_location", e.target.value)}
                placeholder="City / district"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Quality grade, packaging, other requirements…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition">
              {saving ? "Posting…" : "Post Demand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Demand Card ─── */
function DemandCard({ demand }) {
  const isUrgent = demand.deadline_date && new Date(demand.deadline_date) <= new Date(Date.now() + 7 * 86400000);
  return (
    <div className={`bg-white border rounded-2xl p-5 hover:shadow-md transition ${isUrgent && demand.status === "open" ? "border-amber-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900">{demand.crop_name}</h3>
          <StatusBadge status={demand.status} />
          {isUrgent && demand.status === "open" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle size={10} /> Urgent
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">#{demand.id}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Package size={12} className="text-gray-400 shrink-0" />
          <span className="font-medium">{Number(demand.quantity_needed).toLocaleString("en-IN")} {demand.unit}</span>
        </div>
        {demand.price_offered && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <IndianRupee size={12} className="text-gray-400 shrink-0" />
            <span className="font-medium">₹{Number(demand.price_offered).toLocaleString("en-IN")} / {demand.unit}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <User size={12} className="text-gray-400 shrink-0" />
          <span>{demand.buyer_name}</span>
          {demand.buyer_type && (
            <span className="capitalize text-gray-400">({demand.buyer_type})</span>
          )}
        </div>
        {demand.buyer_phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Phone size={12} className="text-gray-400 shrink-0" />
            <span>{demand.buyer_phone}</span>
          </div>
        )}
        {demand.deadline_date && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar size={12} className="text-gray-400 shrink-0" />
            <span>By {new Date(demand.deadline_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        )}
        {demand.delivery_location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <span className="truncate">{demand.delivery_location}</span>
          </div>
        )}
      </div>

      {demand.notes && (
        <p className="text-xs text-gray-400 border-t border-gray-50 pt-2 mt-2 line-clamp-2">{demand.notes}</p>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function DemandBoardPage() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [crops, setCrops]     = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("open");

  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    try { setUser(JSON.parse(userData)); } catch { router.push("/login"); }
  }, [router]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cropRes, demandRes] = await Promise.all([
        api.get("/crops"),
        api.get("/ds/demands"),
      ]);
      setCrops(cropRes.data || []);
      setDemands(demandRes.data || []);
    } catch {
      toast.error("Failed to load demand board");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = demands.filter(d => {
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    const matchSearch = !search.trim() || d.crop_name.toLowerCase().includes(search.toLowerCase()) ||
      d.buyer_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    open:      demands.filter(d => d.status === "open").length,
    matched:   demands.filter(d => d.status === "matched").length,
    fulfilled: demands.filter(d => d.status === "fulfilled").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Package size={18} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-none">Demand Board</h1>
                <p className="text-xs text-gray-400 mt-0.5">Live buyer requests</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/farmer/supply")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <TrendingUp size={15} />
              <span className="hidden sm:inline">My Supply</span>
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
              <Plus size={15} />
              Post Demand
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stat row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Open Requests",  value: stats.open,      color: "text-blue-600",    bg: "bg-blue-50",    icon: Clock3 },
            { label: "Matched",        value: stats.matched,   color: "text-amber-600",   bg: "bg-amber-50",   icon: Handshake },
            { label: "Fulfilled",      value: stats.fulfilled, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by crop or buyer name…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "open", "matched", "fulfilled", "closed"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  filterStatus === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded-full w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700">No demand requests found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filterStatus !== "all" ? `No "${filterStatus}" requests` : "Be the first to post a requirement"}
            </p>
            <button onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
              Post a Demand Request
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(demand => <DemandCard key={demand.id} demand={demand} />)}
          </div>
        )}
      </main>

      {showModal && (
        <PostDemandModal
          crops={crops}
          user={user}
          onClose={() => setShowModal(false)}
          onCreated={(d) => { setDemands(p => [d, ...p]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
