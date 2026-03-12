"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "farmer",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get preferred role from localStorage
    const role = localStorage.getItem("preferredRole");
    if (role) {
      setFormData((prev) => ({ ...prev, role }));
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
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    // Password length validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/signup", {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      if (response.data.ok) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Signup successful! Redirecting...");

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
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to sign up. Please try again.";
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
          <h1 className="mt-4 text-4xl font-bold text-gray-900 leading-tight">Create your account</h1>
          <p className="mt-4 text-base text-gray-500 max-w-md">Get started with a secure account and choose your working role on the platform.</p>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-500 text-sm">Register to access the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 mt-1">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">10 digit mobile number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-gray-900 bg-white shadow-sm transition appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
                >
                  <option value="farmer">Farmer</option>
                  <option value="admin">Admin</option>
                  <option value="expert">Expert</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                  v
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-emerald-700 hover:underline cursor-pointer"
            >
              Back to role selection
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-3">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-700 font-medium hover:underline">
              Login
            </Link>
          </p>
          </div>
        </section>
      </main>
    </div>
  );
}
