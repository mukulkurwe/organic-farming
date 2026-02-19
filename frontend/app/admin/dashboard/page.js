"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminDashboard() {
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
      
      // Check if user is admin
      if (parsedUser.role !== "admin") {
        toast.error("Access denied. Admin only.");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                👨‍💼 Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.name || "Admin"}!
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
            <div className="text-sm text-gray-600 mb-2">Total Users</div>
            <div className="text-3xl font-bold text-gray-800">128</div>
            <div className="text-xs text-green-600 mt-2">↑ 12% this month</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Total Farms</div>
            <div className="text-3xl font-bold text-gray-800">45</div>
            <div className="text-xs text-green-600 mt-2">↑ 8% this month</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Active Activities</div>
            <div className="text-3xl font-bold text-gray-800">234</div>
            <div className="text-xs text-blue-600 mt-2">Last 7 days</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">System Health</div>
            <div className="text-3xl font-bold text-green-600">98%</div>
            <div className="text-xs text-gray-600 mt-2">All systems normal</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => toast.info("User management coming soon!")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Manage Users
            </h3>
            <p className="text-sm text-gray-600">
              View and manage user accounts
            </p>
          </button>

          <button
            onClick={() => toast.info("Crop master coming soon!")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">🌾</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Crop Master
            </h3>
            <p className="text-sm text-gray-600">
              Manage crop database
            </p>
          </button>

          <button
            onClick={() => toast.info("System settings coming soon!")}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              System Settings
            </h3>
            <p className="text-sm text-gray-600">
              Configure system preferences
            </p>
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Admin Account Information
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
              <p className="text-lg font-medium text-blue-600 capitalize">
                {user?.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Created</p>
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
