"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [preferredRole, setPreferredRole] = useState("");

  useEffect(() => {
    // Get preferred role from localStorage
    const role = localStorage.getItem("preferredRole");
    if (role) {
      setPreferredRole(role);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.phone || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        phone: formData.phone,
        password: formData.password,
      });

      if (response.data.ok) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success(`Welcome back, ${response.data.user.name}!`);

        // Redirect based on role
        setTimeout(() => {
          if (response.data.user.role === "admin") {
            router.push("/admin/dashboard");
          } else if (response.data.user.role === "expert") {
            router.push("/expert/dashboard");
          } else {
            router.push("/farmer/dashboard");
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to login. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mb-4 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <span>←</span> Back to role selection
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h1>
          <p className="text-gray-500 mt-2">
            Login to continue to your account
          </p>
          {preferredRole && (
            <p className="text-green-600 text-sm mt-2 font-medium">
              Logging in as: {preferredRole.charAt(0).toUpperCase() + preferredRole.slice(1)}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              required
              autoComplete="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             bg-white text-gray-900 placeholder:text-gray-400
             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Remember me
            </label>

            <a href="#" className="text-green-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-green-600 font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
