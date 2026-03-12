"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  BarChart3,
  ChevronRight,
  Calendar,
  Wheat,
} from "lucide-react";
import api from "@/services/api";

function StatCard({ label, value, sub, icon: Icon, trend, color = "green" }) {
  const colorMap = {
    green: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-100",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      border: "border-orange-100",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      border: "border-purple-100",
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={`bg-white rounded-2xl border ${c.border} p-6 flex flex-col gap-4 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div
          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <Icon size={20} className={c.icon} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {trend >= 0 ? (
            <ArrowUpRight size={16} />
          ) : (
            <ArrowDownRight size={16} />
          )}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}

function BarRow({ label, value, max, amount }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-sm font-medium text-gray-700 truncate max-w-[60%]"
          title={label}
        >
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-900 shrink-0">
          ₹{Number(amount).toLocaleString("en-IN")}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SalesDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!user) return;
    api
      .get("/farms")
      .then((r) => setFarms(r.data || []))
      .catch(() => {});
  }, [user]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = farmId ? `?farm_id=${farmId}` : "";
      const res = await api.get(`/sales/report${params}`);
      setReport(res.data);
    } catch (err) {
      console.error("Sales report error:", err);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    if (user) loadReport();
  }, [user, loadReport]);

  const fmt = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const maxCrop = report?.by_crop?.[0]?.revenue ?? 1;

  const paidAmt =
    report?.payment_status?.find((p) => p.payment_status === "paid")?.amount ??
    0;
  const pendingAmt =
    report?.payment_status?.find((p) => p.payment_status === "pending")
      ?.amount ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/farmer/dashboard")}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">
              Sales Overview
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto sm:justify-end">
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => router.push("/farmer/sales/transactions/new")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm w-full sm:w-auto"
            >
              <ShoppingCart size={15} />
              Record Sale
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Produce Listings",
              icon: Package,
              path: "/farmer/sales/listings",
              desc: "Manage available stock",
            },
            {
              label: "Record Sale",
              icon: ShoppingCart,
              path: "/farmer/sales/transactions/new",
              desc: "Log a new transaction",
            },
            {
              label: "All Transactions",
              icon: BarChart3,
              path: "/farmer/sales/transactions",
              desc: "View sales history",
            },
            {
              label: "Buyers",
              icon: Users,
              path: "/farmer/sales/buyers",
              desc: "Buyer directory",
            },
          ].map(({ label, icon: Icon, path, desc }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-emerald-400 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition">
                <Icon size={20} className="text-emerald-600" />
              </div>
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 h-36 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
                <div className="h-8 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : report ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={fmt(report.summary?.total_revenue)}
              icon={IndianRupee}
              color="green"
            />
            <StatCard
              label="Transactions"
              value={report.summary?.total_transactions ?? 0}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              label="Quantity Sold"
              value={`${Number(report.summary?.total_quantity_sold ?? 0).toFixed(0)} kg`}
              icon={Wheat}
              color="orange"
            />
            <StatCard
              label="Avg. Price / Unit"
              value={fmt(report.summary?.avg_price_per_unit)}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        ) : null}

        {report && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue by Month */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Revenue by Month
                  </h2>
                </div>
                {report.by_month.length > 0 && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {report.by_month.length} month
                    {report.by_month.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {report.by_month.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  No data yet
                </p>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                  {report.by_month.map((row) => {
                    const maxRev = Math.max(
                      ...report.by_month.map((r) => r.revenue),
                      1,
                    );
                    return (
                      <BarRow
                        key={row.month}
                        label={row.month}
                        value={row.revenue}
                        max={maxRev}
                        amount={row.revenue}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revenue by Crop */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Wheat size={18} className="text-emerald-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Revenue by Crop
                  </h2>
                </div>
                {report.by_crop.length > 0 && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Top {Math.min(report.by_crop.length, 5)}
                  </span>
                )}
              </div>
              {report.by_crop.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  No data yet
                </p>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                  {report.by_crop.slice(0, 5).map((row) => (
                    <BarRow
                      key={row.crop}
                      label={row.crop}
                      value={row.revenue}
                      max={maxCrop}
                      amount={row.revenue}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Buyer Type breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-emerald-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Revenue by Buyer Type
                  </h2>
                </div>
                {report.by_buyer_type.length > 0 && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {report.by_buyer_type.length} type
                    {report.by_buyer_type.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {report.by_buyer_type.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  No data yet
                </p>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                  {report.by_buyer_type.map((row) => {
                    const maxRev = Math.max(
                      ...report.by_buyer_type.map((r) => r.revenue),
                      1,
                    );
                    return (
                      <BarRow
                        key={row.buyer_type}
                        label={row.buyer_type}
                        value={row.revenue}
                        max={maxRev}
                        amount={row.revenue}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Status */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <IndianRupee size={18} className="text-emerald-600" />
                <h2 className="text-base font-semibold text-gray-800">
                  Payment Status
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      Received
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Paid transactions
                    </p>
                  </div>
                  <p className="text-xl font-bold text-emerald-700">
                    {fmt(paidAmt)}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Outstanding
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Pending / credit
                    </p>
                  </div>
                  <p className="text-xl font-bold text-amber-700">
                    {fmt(pendingAmt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
