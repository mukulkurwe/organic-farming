"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("");

  const roles = [
    { value: "farmer", label: "Farmer - Manage your farm operations" },
    { value: "admin", label: "Admin - System administration" },
    { value: "expert", label: "Expert - Provide consultation" },
  ];

  const handleContinue = () => {
    if (!selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }
    
    // Store selected role preference
    localStorage.setItem("preferredRole", selectedRole);
    
    // Redirect to login page
    router.push("/login");
  };

  const handleDemoMode = (role) => {
    localStorage.setItem("preferredRole", role);
    localStorage.setItem("demoMode", "true");
    
    // For demo, redirect based on role
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "expert") {
      router.push("/expert/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <main className="h-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
        <section className="hidden lg:flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700">Organic Farming</p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 leading-tight">Smart management for modern farms</h1>
          <p className="mt-4 text-base text-gray-500 max-w-md">Plan, track, and manage farming operations with role-based access for farmers, admins, and experts.</p>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Select your role</h2>
            <p className="text-sm text-gray-500 mt-1">Choose how you want to continue</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login as:
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 text-gray-700 bg-white shadow-sm transition appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400"
              >
                <option value="">-- Select Role --</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                v
              </span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition mb-6 cursor-pointer"
          >
            Continue to Login
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3">Demo mode</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDemoMode("farmer")}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium cursor-pointer"
              >
                Continue as Farmer
              </button>
              <button
                onClick={() => handleDemoMode("admin")}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium cursor-pointer"
              >
                Continue as Admin
              </button>
              <button
                onClick={() => handleDemoMode("expert")}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium cursor-pointer"
              >
                Continue as Expert
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
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

