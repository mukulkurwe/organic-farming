"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Users,
  Plus,
  Search,
  User,
  Phone,
  MapPin,
  Briefcase,
  Trash2,
  X,
  Building2,
  ShoppingBasket,
  Store,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

const BUYER_TYPE_CONFIG = {
  individual:  { label: "Individual",  icon: User,         bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200" },
  wholesaler:  { label: "Wholesaler",  icon: Store,        bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"   },
  retailer:    { label: "Retailer",    icon: ShoppingBasket,bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  cooperative: { label: "Cooperative", icon: Building2,    bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200" },
  exporter:    { label: "Exporter",    icon: Briefcase,    bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200"    },
};

function BuyerTypeBadge({ type }) {
  const cfg = BUYER_TYPE_CONFIG[type] || { label: type || "Other", icon: User, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function AddBuyerPanel({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", phone: "", location: "", buyer_type: "individual", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const res = await api.post("/sales/buyers", form);
      toast.success("Buyer added");
      onCreated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add buyer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Add New Buyer</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={16} /></button>
      </div>
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Buyer name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 XXXXX XXXXX"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Type</label>
            <select value={form.buyer_type} onChange={e => set("buyer_type", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="individual">Individual</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="retailer">Retailer</option>
              <option value="cooperative">Cooperative</option>
              <option value="exporter">Exporter</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="City, State"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition">
            {saving ? "Adding..." : "Add Buyer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BuyersPage() {
  const router = useRouter();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sales/buyers");
      setBuyers(res.data || []);
    } catch {
      toast.error("Failed to load buyers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete buyer "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/sales/buyers/${id}`);
      toast.success("Buyer removed");
      setBuyers(p => p.filter(b => b.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete buyer");
    }
  };

  const filtered = buyers.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.name.toLowerCase().includes(q) || (b.location || "").toLowerCase().includes(q);
    const matchT = !filterType || b.buyer_type === filterType;
    return matchQ && matchT;
  });

  const typeStats = Object.keys(BUYER_TYPE_CONFIG).reduce((acc, t) => {
    acc[t] = buyers.filter(b => b.buyer_type === t).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/farmer/sales")} className="text-gray-400 hover:text-gray-600 transition">
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <Users size={18} className="text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">Buyers Directory</h1>
          </div>
          <button onClick={() => setShowAdd(p => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm">
            <Plus size={15} />
            Add Buyer
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Type Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(BUYER_TYPE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={key} onClick={() => setFilterType(f => f === key ? "" : key)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition ${filterType === key ? `${cfg.bg} ${cfg.border} ring-2 ring-offset-1 ring-emerald-500` : "bg-white border-gray-200 hover:border-gray-300"}`}>
                <div className={`p-2 rounded-lg ${cfg.bg}`}><Icon size={16} className={cfg.text} /></div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{typeStats[key] || 0}</p>
                  <p className="text-xs text-gray-500">{cfg.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add Buyer Panel */}
        {showAdd && (
          <AddBuyerPanel
            onClose={() => setShowAdd(false)}
            onCreated={(b) => { setBuyers(p => [b, ...p]); setShowAdd(false); }}
          />
        )}

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or location..."
            className="flex-1 text-sm text-gray-900 focus:outline-none" />
          <span className="text-xs text-gray-400">{filtered.length} buyers</span>
        </div>

        {/* Buyers Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-36 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="font-semibold text-gray-700 text-lg">No buyers found</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Add buyers to track your repeat customers and sales history</p>
            <button onClick={() => setShowAdd(true)}
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
              Add First Buyer
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(buyer => (
              <div key={buyer.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition hover:border-gray-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <User size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{buyer.name}</h3>
                      <BuyerTypeBadge type={buyer.buyer_type} />
                    </div>
                  </div>
                  <button onClick={() => handleDelete(buyer.id, buyer.name)}
                    className="text-gray-300 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-1.5 mt-2">
                  {buyer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <span>{buyer.phone}</span>
                    </div>
                  )}
                  {buyer.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <span>{buyer.location}</span>
                    </div>
                  )}
                  {buyer.notes && (
                    <p className="text-xs text-gray-400 italic mt-2 border-t border-gray-50 pt-2">{buyer.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
