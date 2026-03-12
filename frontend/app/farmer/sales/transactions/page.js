"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Receipt,
  Plus,
  Search,
  Filter,
  IndianRupee,
  User,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

const PAYMENT_STATUS = {
  paid: {
    label: "Paid",
    icon: CheckCircle,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  partial: {
    label: "Partial",
    icon: AlertCircle,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
};

const PAYMENT_MODE = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  credit: "Credit",
};

function PaymentBadge({ status }) {
  const cfg = PAYMENT_STATUS[status] || PAYMENT_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 border-l-4 ${color}`}
    >
      <div className="p-3 rounded-xl bg-gray-50">
        <Icon size={20} className="text-gray-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFarm, setFilterFarm] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push("/login");
    }
  }, [router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterFarm) params.set("farm_id", filterFarm);
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);
      const [txRes, farmRes] = await Promise.all([
        api.get(`/sales/transactions?${params}`),
        api.get("/farms"),
      ]);
      setTransactions(txRes.data || []);
      setFarms(farmRes.data || []);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [user, filterFarm, filterFrom, filterTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visible = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      (t.buyer_name || "").toLowerCase().includes(q) ||
      (t.crop_name || "").toLowerCase().includes(q);
    const matchP = !filterPayment || t.payment_status === filterPayment;
    return matchQ && matchP;
  });

  const totalRevenue = visible.reduce(
    (s, t) => s + Number(t.total_amount || 0),
    0,
  );
  const paidRevenue = visible
    .filter((t) => t.payment_status === "paid")
    .reduce((s, t) => s + Number(t.total_amount || 0), 0);
  const pendingCount = visible.filter(
    (t) => t.payment_status === "pending",
  ).length;

  const fmtRupee = (n) =>
    `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/farmer/sales")}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <Receipt size={18} className="text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              Transactions
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition ${showFilters ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
            <button
              onClick={() => router.push("/farmer/sales/transactions/new")}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <Plus size={15} />
              Record Sale
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={fmtRupee(totalRevenue)}
            icon={IndianRupee}
            color="border-l-emerald-500"
          />
          <StatCard
            label="Paid Revenue"
            value={fmtRupee(paidRevenue)}
            icon={CheckCircle}
            color="border-l-blue-500"
          />
          <StatCard
            label="Transactions"
            value={visible.length}
            icon={Receipt}
            color="border-l-violet-500"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={Clock}
            color="border-l-amber-500"
          />
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              value={filterFarm}
              onChange={(e) => setFilterFarm(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by buyer or crop name..."
            className="flex-1 text-sm text-gray-900 focus:outline-none"
          />
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Filter size={13} /> {visible.length} results
          </span>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Loading transactions...
            </div>
          ) : visible.length === 0 ? (
            <div className="p-16 text-center">
              <Receipt size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="font-semibold text-gray-700">
                No transactions found
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-5">
                Record your first sale to track revenue
              </p>
              <button
                onClick={() => router.push("/farmer/sales/transactions/new")}
                className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                Record Sale
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Date",
                      "Buyer",
                      "Crop",
                      "Qty Sold",
                      "Amount",
                      "Mode",
                      "Payment",
                      "Farm",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {new Date(tx.sale_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tx.buyer_name}
                            </p>
                            {tx.buyer_type && (
                              <p className="text-xs text-gray-400 capitalize">
                                {tx.buyer_type.replace("_", " ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {tx.crop_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {Number(tx.quantity_sold).toLocaleString("en-IN")}{" "}
                        {tx.unit || "kg"}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {fmtRupee(tx.total_amount)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {PAYMENT_MODE[tx.payment_mode] || tx.payment_mode}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentBadge status={tx.payment_status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {tx.farm_name || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td
                      colSpan={4}
                      className="px-5 py-3.5 text-sm font-semibold text-gray-700"
                    >
                      Total
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-emerald-700">
                      {fmtRupee(totalRevenue)}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
