"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Receipt,
  IndianRupee,
  User,
  Package,
  CreditCard,
  Calendar,
  MessageSquare,
  Check,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

function NewTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetListingId = searchParams.get("listing_id");

  const [user, setUser] = useState(null);
  const [farms, setFarms] = useState([]);
  const [listings, setListings] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    listing_id: presetListingId || "",
    farm_id: "",
    buyer_id: "",
    buyer_name: "",
    quantity_sold: "",
    price_per_unit: "",
    payment_mode: "cash",
    payment_status: "paid",
    sale_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    try { setUser(JSON.parse(userData)); } catch { router.push("/login"); }
  }, [router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [farmRes, buyerRes] = await Promise.all([
        api.get(`/farms?owner_id=${user.id}`),
        api.get("/sales/buyers"),
      ]);
      const farmList = farmRes.data || [];
      const buyerList = buyerRes.data || [];
      setFarms(farmList);
      setBuyers(buyerList);
      if (!form.farm_id && farmList.length > 0) {
        set("farm_id", farmList[0].id);
      }
    } catch {
      toast.error("Failed to load data");
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!form.farm_id) return;
    api.get(`/sales/listings?farm_id=${form.farm_id}&status=available`)
      .then(r => setListings(r.data || []))
      .catch(() => setListings([]));
  }, [form.farm_id]);

  const selectedListing = listings.find(l => String(l.id) === String(form.listing_id));

  useEffect(() => {
    if (selectedListing) {
      set("price_per_unit", selectedListing.price_per_kg);
    }
  }, [selectedListing?.id]);

  const totalAmount = form.quantity_sold && form.price_per_unit
    ? (Number(form.quantity_sold) * Number(form.price_per_unit)).toFixed(2)
    : null;

  const handleBuyerSelect = (e) => {
    const bid = e.target.value;
    set("buyer_id", bid);
    if (bid) {
      const b = buyers.find(x => String(x.id) === bid);
      if (b) set("buyer_name", b.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.buyer_name.trim()) return toast.error("Buyer name is required");
    if (!form.quantity_sold || Number(form.quantity_sold) <= 0) return toast.error("Enter valid quantity");
    if (!form.price_per_unit || Number(form.price_per_unit) <= 0) return toast.error("Enter valid price");

    if (selectedListing && Number(form.quantity_sold) > Number(selectedListing.quantity_available)) {
      return toast.error(`Only ${selectedListing.quantity_available} ${selectedListing.unit} available`);
    }

    setSaving(true);
    try {
      await api.post("/sales/transactions", {
        ...form,
        quantity_sold: Number(form.quantity_sold),
        price_per_unit: Number(form.price_per_unit),
        listing_id: form.listing_id || null,
        buyer_id: form.buyer_id || null,
        created_by: user?.id,
      });
      toast.success("Sale recorded successfully");
      router.push("/farmer/sales/transactions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition">
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <Receipt size={18} className="text-emerald-600" />
          <h1 className="text-lg font-semibold text-gray-900">Record New Sale</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Farm + Listing */}
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package size={14} /> Produce Details
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Farm <span className="text-red-500">*</span></label>
                  <select value={form.farm_id} onChange={e => set("farm_id", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select farm</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Produce Listing</label>
                  <select value={form.listing_id} onChange={e => set("listing_id", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Manual / No listing</option>
                    {listings.map(l => (
                      <option key={l.id} value={l.id}>{l.crop_name} — {l.quantity_available} {l.unit} @ ₹{l.price_per_kg}/{l.unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedListing && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-sm text-emerald-700">
                  <Check size={14} />
                  <span>{selectedListing.quantity_available} {selectedListing.unit} available · Listing price ₹{selectedListing.price_per_kg}/{selectedListing.unit}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity + Price */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <IndianRupee size={14} /> Sale Quantity & Price
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quantity Sold ({selectedListing?.unit || "kg"}) <span className="text-red-500">*</span>
                </label>
                <input type="number" min="0.01" step="0.01" value={form.quantity_sold}
                  onChange={e => set("quantity_sold", e.target.value)} placeholder="0.00" required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price / {selectedListing?.unit || "kg"} (₹) <span className="text-red-500">*</span>
                </label>
                <input type="number" min="0.01" step="0.01" value={form.price_per_unit}
                  onChange={e => set("price_per_unit", e.target.value)} placeholder="0.00" required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            {totalAmount && (
              <div className="mt-4 p-4 bg-gray-900 rounded-xl flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Amount</span>
                <span className="text-2xl font-bold text-white">₹{Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Buyer */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} /> Buyer Information
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select from Buyers Directory</label>
                <select value={form.buyer_id} onChange={handleBuyerSelect}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Manual entry</option>
                  {buyers.map(b => <option key={b.id} value={b.id}>{b.name} {b.buyer_type ? `(${b.buyer_type.replace("_", " ")})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Buyer Name <span className="text-red-500">*</span></label>
                <input value={form.buyer_name} onChange={e => set("buyer_name", e.target.value)} placeholder="Enter buyer name" required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard size={14} /> Payment Details
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Mode</label>
                <select value={form.payment_mode} onChange={e => set("payment_mode", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Status</label>
                <select value={form.payment_status} onChange={e => set("payment_status", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} /> Sale Date
                </label>
                <input type="date" value={form.sale_date} onChange={e => set("sale_date", e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <MessageSquare size={14} className="text-gray-400" /> Notes (optional)
            </label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Any additional notes about this sale..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-4">
            <button type="button" onClick={() => router.back()}
              className="flex-1 px-5 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-5 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition">
              {saving ? "Recording..." : "Record Sale"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">Loading...</div>}>
      <NewTransactionForm />
    </Suspense>
  );
}
