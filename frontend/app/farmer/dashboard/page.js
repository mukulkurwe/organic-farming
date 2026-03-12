"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/services/api";
import {
  Home,
  ClipboardList,
  BarChart2,
  CalendarDays,
  ShoppingCart,
  MapPin,
  Grid,
  Map,
  Plus,
  LogOut,
  User,
  Phone,
  BadgeCheck,
  Clock4,
  Tractor,
  TrendingUp,
  Package,
} from "lucide-react";

export default function FarmerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [farmsLoading, setFarmsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch user's farms
  useEffect(() => {
    if (!user) return;
    async function loadFarms() {
      try {
        const res = await api.get(`/farms?owner_id=${user.id}`);
        setFarms(res.data || []);
      } catch (err) {
        console.error("Load farms error:", err);
      } finally {
        setFarmsLoading(false);
      }
    }
    loadFarms();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("preferredRole");
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Tractor size={20} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Farmer Dashboard</h1>
              <p className="text-xs text-gray-600 mt-0.5">Welcome back, {user?.name || "Farmer"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition cursor-pointer"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Account Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Account Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg"><User size={16} className="text-gray-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg"><Phone size={16} className="text-gray-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{user?.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg"><BadgeCheck size={16} className="text-emerald-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-semibold text-emerald-700 capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg"><Clock4 size={16} className="text-gray-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-semibold text-gray-800">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Create Farm",     desc: "Add a new farm",               icon: Home,         path: "/farmer/create-farm",    color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Log Activity",    desc: "Record farm tasks",            icon: ClipboardList, path: "/farmer/activity/new",   color: "text-blue-600",    bg: "bg-blue-50" },
              { label: "View Reports",    desc: "Performance analytics",        icon: BarChart2,     path: "/farmer/reports",        color: "text-violet-600",  bg: "bg-violet-50" },
              { label: "Agri Calendar",   desc: "Crop schedule & advisory",     icon: CalendarDays,  path: "/farmer/calendar",       color: "text-amber-600",   bg: "bg-amber-50" },
              { label: "Farm Sales",      desc: "Sell produce & track revenue", icon: ShoppingCart,  path: "/farmer/sales",          color: "text-rose-600",    bg: "bg-rose-50" },
              { label: "Supply Forecasts",desc: "Declare upcoming harvests",    icon: TrendingUp,    path: "/farmer/supply",         color: "text-teal-600",    bg: "bg-teal-50" },
              { label: "Demand Board",    desc: "Browse live buyer requests",   icon: Package,       path: "/farmer/demand-board",   color: "text-indigo-600",  bg: "bg-indigo-50" },
            ].map(({ label, desc, icon: Icon, path, color, bg }) => (
              <button key={path} onClick={() => router.push(path)}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md hover:border-gray-300 transition group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* My Farms */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Farms</h2>
            <button onClick={() => router.push("/farmer/create-farm")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer">
              <Plus size={13} /> Add Farm
            </button>
          </div>

          {farmsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />)}
            </div>
          ) : farms.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Home size={24} className="text-gray-500" />
              </div>
              <p className="font-semibold text-gray-700">No farms yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first farm to start managing operations</p>
              <button onClick={() => router.push("/farmer/create-farm")}
                className="mt-4 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition cursor-pointer">
                Create Your First Farm
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {farms.map((farm) => (
                <div key={farm.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-base">{farm.name}</h3>
                    {farm.boundary ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                        <BadgeCheck size={11} /> Mapped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                        <Clock4 size={11} /> Unmapped
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                    <MapPin size={13} className="text-gray-500" />
                    {farm.location || "No location set"}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Created {farm.created_at ? new Date(farm.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/farm/${farm.id}/map`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition cursor-pointer">
                      <Map size={13} /> Map
                    </button>
                    <button onClick={() => router.push(`/farm/${farm.id}/plots`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition cursor-pointer">
                      <Grid size={13} /> Plots
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Platform Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: "Land Mapping",       desc: "Draw and manage farm boundaries" },
              { title: "Crop Planning",       desc: "Plan and track crop cycles" },
              { title: "Worker Management",   desc: "Manage farm workers and tasks" },
              { title: "Activity Tracking",   desc: "Log daily farm activities" },
              { title: "Weather Alerts",      desc: "Get weather-based recommendations" },
              { title: "Reports & Analytics", desc: "View insights and trends" },
            ].map(({ title, desc }) => (
              <div key={title} className="border border-gray-100 rounded-xl p-4 bg-gray-50 cursor-pointer">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-xs text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
