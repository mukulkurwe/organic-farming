"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/services/api";

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🌾 Farmer Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.name || "Farmer"}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-lg font-medium text-gray-800">{user?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-medium text-green-600 capitalize">
                {user?.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-medium text-gray-800">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => router.push("/farmer/create-farm")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">🏡</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Create Farm
            </h3>
            <p className="text-sm text-gray-600">
              Add a new farm to your account
            </p>
          </button>

          <button
            onClick={() => router.push("/farmer/activity/new")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Log Activity
            </h3>
            <p className="text-sm text-gray-600">
              Record farm activities and tasks
            </p>
          </button>

          <button
            onClick={() => router.push("/farmer/reports")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              View Reports
            </h3>
            <p className="text-sm text-gray-600">
              Analyze your farm performance
            </p>
          </button>

          <button
            onClick={() => router.push("/farmer/calendar")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">📅</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Agri Calendar
            </h3>
            <p className="text-sm text-gray-600">
              Crop calendar and task advisory
            </p>
          </button>
        </div>

        {/* My Farms */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">🌾 My Farms</h2>
            <button
              onClick={() => router.push("/farmer/create-farm")}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
            >
              + Add Farm
            </button>
          </div>

          {farmsLoading ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              Loading farms...
            </div>
          ) : farms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-5xl mb-3">🏡</p>
              <p className="text-gray-600 font-medium">
                No farms yet
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Create your first farm to start managing operations
              </p>
              <button
                onClick={() => router.push("/farmer/create-farm")}
                className="mt-4 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
              >
                Create Your First Farm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-br from-white to-green-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{farm.name}</h3>
                    {farm.boundary ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        ✅ Mapped
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                        ⏳ Unmapped
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    📍 {farm.location || "No location set"}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Created{" "}
                    {farm.created_at
                      ? new Date(farm.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/farm/${farm.id}/map`)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition font-medium text-center"
                    >
                      🗺️ Map
                    </button>
                    <button
                      onClick={() => router.push(`/farm/${farm.id}/plots`)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition font-medium text-center"
                    >
                      📐 Plots
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Farm Management Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Land Mapping</h3>
              <p className="text-sm text-gray-600">
                Draw and manage farm boundaries
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Crop Planning
              </h3>
              <p className="text-sm text-gray-600">
                Plan and track crop cycles
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Worker Management
              </h3>
              <p className="text-sm text-gray-600">
                Manage farm workers and tasks
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Activity Tracking
              </h3>
              <p className="text-sm text-gray-600">Log daily farm activities</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Weather Alerts
              </h3>
              <p className="text-sm text-gray-600">
                Get weather-based recommendations
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Reports & Analytics
              </h3>
              <p className="text-sm text-gray-600">View insights and trends</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
