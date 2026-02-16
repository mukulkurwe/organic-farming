"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ExpertDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      
      // Check if user is expert
      if (parsedUser.role !== "expert") {
        toast.error("Access denied. Expert only.");
        router.push("/farmer/dashboard");
        return;
      }
      
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🎓 Expert Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.name || "Expert"}!
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Consultations</div>
            <div className="text-3xl font-bold text-gray-800">24</div>
            <div className="text-xs text-green-600 mt-2">This month</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Active Cases</div>
            <div className="text-3xl font-bold text-gray-800">8</div>
            <div className="text-xs text-blue-600 mt-2">In progress</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Farmers Helped</div>
            <div className="text-3xl font-bold text-gray-800">156</div>
            <div className="text-xs text-gray-600 mt-2">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Rating</div>
            <div className="text-3xl font-bold text-yellow-500">4.8⭐</div>
            <div className="text-xs text-gray-600 mt-2">Based on reviews</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => toast.info("Consultation requests coming soon!")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              View Requests
            </h3>
            <p className="text-sm text-gray-600">
              See pending consultation requests
            </p>
          </button>

          <button
            onClick={() => router.push("/supervisor/dashboard")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Farm Analytics
            </h3>
            <p className="text-sm text-gray-600">
              Analyze farm data and activities
            </p>
          </button>

          <button
            onClick={() => toast.info("Knowledge base coming soon!")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">📚</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Knowledge Base
            </h3>
            <p className="text-sm text-gray-600">
              Access farming guides and resources
            </p>
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Expert Profile
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
              <p className="text-lg font-medium text-purple-600 capitalize">
                {user?.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Joined</p>
              <p className="text-lg font-medium text-gray-800">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
