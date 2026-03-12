"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/services/api";
import { ChevronRight, HousePlus, MapPinned, LayoutGrid } from "lucide-react";

export default function CreateFarmPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [existingFarms, setExistingFarms] = useState([]);
  const [farmsLoading, setFarmsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

  // Load existing farms when user is set
  useEffect(() => {
    if (!user) return;
    async function loadFarms() {
      try {
        const res = await api.get(`/farms?owner_id=${user.id}`);
        setExistingFarms(res.data || []);
      } catch (err) {
        console.error("Load farms error:", err);
      } finally {
        setFarmsLoading(false);
      }
    }
    loadFarms();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Farm name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/farms", {
        name: formData.name.trim(),
        location: formData.location.trim() || null,
        owner_id: user?.id,
      });

      const farm = response.data;
      toast.success("Farm created! Now draw the boundary on the map.");

      setTimeout(() => {
        router.push(`/farm/${farm.id}/map`);
      }, 1200);
    } catch (error) {
      console.error("Create farm error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create farm"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/farmer/dashboard")}
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Create Farm</h1>
              <p className="text-xs text-gray-500">Set up farm details and boundary</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/farmer/dashboard")}
            className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer w-full sm:w-auto"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps indicator */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">1</span>
            <span className="text-xs sm:text-sm font-medium text-emerald-700 flex items-center gap-1"><HousePlus size={14} /> Farm Details</span>
          </div>
          <div className="hidden md:block flex-1 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">2</span>
            <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1"><MapPinned size={14} /> Draw Boundary</span>
          </div>
          <div className="hidden md:block flex-1 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">3</span>
            <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1"><LayoutGrid size={14} /> Add Plots</span>
          </div>
        </div>

        {/* Create Farm Form */}
        <div className="max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Farm Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farm Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Green Valley Farm"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Nashik, Maharashtra"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <p className="text-xs text-gray-600 mt-1">
                Village, district, or state
              </p>
            </div>

            {/* Info banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <span className="mt-0.5 text-emerald-600"><MapPinned size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Next step: Draw your farm boundary
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  After creating the farm, you&apos;ll be taken to an
                  interactive map where you can draw the exact boundary of your
                  farm using polygon tools.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/farmer/dashboard")}
                className="w-full sm:w-auto px-5 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-5 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? "Creating..." : "Create Farm & Draw Boundary"}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Farms */}
        {farmsLoading ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            Loading your farms...
          </div>
        ) : existingFarms.length > 0 ? (
          <div className="max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Your Existing Farms ({existingFarms.length})
            </h2>
            <div className="space-y-3">
              {existingFarms.map((farm) => (
                <div
                  key={farm.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {farm.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {farm.location || "No location set"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created{" "}
                      {farm.created_at
                        ? new Date(farm.created_at).toLocaleDateString()
                        : "—"}
                      {farm.boundary ? " · ✅ Boundary drawn" : " · ⏳ No boundary yet"}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => router.push(`/farm/${farm.id}/map`)}
                      className="w-full sm:w-auto px-3 py-1.5 text-sm rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition font-medium cursor-pointer"
                    >
                      Map
                    </button>
                    <button
                      onClick={() => router.push(`/farm/${farm.id}/plots`)}
                      className="w-full sm:w-auto px-3 py-1.5 text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition font-medium cursor-pointer"
                    >
                      Plots
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
