"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300">
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
          <h1 className="text-3xl font-bold text-gray-800">Create Account 🌱</h1>
          <p className="text-gray-500 mt-2">Join us to manage your farm</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 
           bg-white text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-green-500 
           focus:border-green-500 transition"

            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-3 rounded-xl border border-gray-300
           bg-white text-gray-900 placeholder:text-gray-400
           focus:outline-none focus:ring-2 focus:ring-green-500
           focus:border-green-500 transition"

            />
         <p className="text-xs text-gray-700 mt-1">
  10 digit mobile number
</p>

          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                       !bg-white !text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            >
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             bg-white text-gray-900 placeholder:text-gray-400
             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />

            <p className="text-xs text-gray-500 mt-1">
              At least 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300
             bg-white text-gray-900 placeholder:text-gray-400
             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-600 font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
