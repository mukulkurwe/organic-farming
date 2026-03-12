"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="h-screen overflow-hidden bg-gray-50">
      <main className="h-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
        <section className="hidden lg:flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700">Organic Farming</p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 leading-tight">Welcome back</h1>
          <p className="mt-4 text-base text-gray-500 max-w-md">Sign in to access dashboards, farm operations, and production workflows.</p>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-500 mt-1 text-sm">Access your account</p>
            {preferredRole && (
              <p className="text-emerald-700 text-sm mt-2 font-medium">
                Logging in as: {preferredRole.charAt(0).toUpperCase() + preferredRole.slice(1)}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Remember me
              </label>

              <button type="button" className="text-emerald-700 hover:underline cursor-pointer">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition ${
                  loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Back to role selection
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-700 font-medium hover:underline">
              Sign up
            </Link>
          </p>
          </div>
        </section>
      </main>
    </div>
  );
}
