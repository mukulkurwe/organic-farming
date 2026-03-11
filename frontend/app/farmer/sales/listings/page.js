"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  ChevronRight,
  Search,
  Filter,
  Wheat,
  Calendar,
  IndianRupee,
  Tag,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  available: { label: "Available",  icon: CheckCircle, bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  reserved:  { label: "Reserved",   icon: Clock,       bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"  },
  sold:      { label: "Sold Out",   icon: AlertCircle, bg: "bg-gray-100",    text: "text-gray-500",    border: "border-gray-200"   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function AddListingModal({ farms, crops, user, onClose, onCreated }) {
  const [form, setForm] = useState({
    farm_id: farms[0]?.id || "",
    crop_id: "",
    crop_name: "",
    quantity_kg: "",
    price_per_kg: "",
    unit: "kg",
    harvest_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.crop_name.trim()) return toast.error("Crop name is required");
    if (!form.quantity_kg || Number(form.quantity_kg) <= 0) return toast.error("Enter valid quantity");
    if (!form.price_per_kg || Number(form.price_per_kg) <= 0) return toast.error("Enter valid price");
    setSaving(true);
    try {
      const res = await api.post("/sales/listings", {
        ...form,
        quantity_kg: Number(form.quantity_kg),
        price_per_kg: Number(form.price_per_kg),
        crop_id: form.crop_id || null,
        created_by: user?.id,
      });
      toast.success("Produce listing created");
      onCreated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">New Produce Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm <span className="text-red-500">*</span></label>
              <select value={form.farm_id} onChange={e => set("farm_id", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name <span className="text-red-500">*</span></label>
              <input
                list="crop-datalist" value={form.crop_name}
                onChange={e => { set("crop_name", e.target.value); const match = crops.find(c => c.name === e.target.value); if (match) set("crop_id", match.id); }}
                placeholder="e.g. Wheat, Rice"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="crop-datalist">{crops.map(c => <option key={c.id} value={c.name} />)}</datalist>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="number" min="0.01" step="0.01" value={form.quantity_kg} onChange={e => set("quantity_kg", e.target.value)}
                    placeholder="0.00"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Price / {form.unit} (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="0.01" step="0.01" value={form.price_per_kg} onChange={e => set("price_per_kg", e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
              <input type="date" value={form.harvest_date} onChange={e => set("harvest_date", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input value={form.notes} onChange={e => set("notes", e.target.value)}
                placeholder="Optional notes"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition">
              {saving ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFarm, setFilterFarm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    try { setUser(JSON.parse(userData)); } catch { router.push("/login"); }
  }, [router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterFarm) params.set("farm_id", filterFarm);
      if (filterStatus) params.set("status", filterStatus);
      const [listRes, farmRes, cropRes] = await Promise.all([
        api.get(`/sales/listings?${params}`),
        api.get(`/farms?owner_id=${user.id}`),
        api.get("/crops"),
      ]);
      setListings(listRes.data || []);
      setFarms(farmRes.data || []);
      setCrops(cropRes.data || []);
    } catch (err) {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [user, filterFarm, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await api.delete(`/sales/listings/${id}`);
      toast.success("Listing deleted");
      setListings(p => p.filter(l => l.id !== id));
    } catch { toast.error("Failed to delete listing"); }
  };

  const filtered = listings.filter(l =>
    !search || l.crop_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/farmer/sales")} className="text-gray-400 hover:text-gray-600 transition">
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <Package size={18} className="text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">Produce Listings</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm">
            <Plus size={15} />
            Add Listing
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by crop..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={filterFarm} onChange={e => setFilterFarm(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Farms</option>
            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Filter size={14} />
            {filtered.length} results
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-48 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <Package size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-semibold text-lg">No listings found</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Create your first produce listing to start selling</p>
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
              Add Listing
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(listing => (
              <div key={listing.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition hover:border-gray-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{listing.crop_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{listing.farm_name}</p>
                  </div>
                  <StatusBadge status={listing.status} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package size={14} className="text-gray-400" />
                    <span><span className="font-semibold text-gray-800">{Number(listing.quantity_available).toFixed(0)}</span> / {Number(listing.quantity_kg).toFixed(0)} {listing.unit} available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IndianRupee size={14} className="text-gray-400" />
                    <span><span className="font-semibold text-gray-800">₹{listing.price_per_kg}</span> per {listing.unit}</span>
                  </div>
                  {listing.harvest_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>Harvested {new Date(listing.harvest_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  )}
                </div>

                {/* Stock bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Stock remaining</span>
                    <span>{listing.quantity_kg > 0 ? Math.round((listing.quantity_available / listing.quantity_kg) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${listing.quantity_kg > 0 ? (listing.quantity_available / listing.quantity_kg) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Total value: <span className="font-semibold text-gray-700">₹{(Number(listing.quantity_available) * Number(listing.price_per_kg)).toLocaleString("en-IN")}</span>
                  </p>
                  <div className="flex gap-1">
                    <button onClick={() => router.push(`/farmer/sales/transactions/new?listing_id=${listing.id}`)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">
                      <Tag size={12} />
                      Sell
                    </button>
                    <button onClick={() => handleDelete(listing.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddListingModal
          farms={farms} crops={crops} user={user}
          onClose={() => setShowModal(false)}
          onCreated={(listing) => { setListings(p => [listing, ...p]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
