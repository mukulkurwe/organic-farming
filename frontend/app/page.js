// "use client";

// import CreateFarm from "../src/components/pages/farmer/CreateFarm.js";

// export default function CreateFarmPage() {
//   return <CreateFarm />;
// }

"use client";

// export default function Home() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      
//       {/* Card */}
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h1>
//           <p className="text-gray-500 mt-2">
//             Login to continue to your account
//           </p>
//         </div>

//         {/* Form */}
//         <form className="space-y-6">
          
//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               placeholder="you@example.com"
//               className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
//             />
//           </div>

//           {/* Remember + Forgot */}
//           <div className="flex items-center justify-between text-sm">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//               />
//               Remember me
//             </label>

//             <a href="#" className="text-green-600 hover:underline">
//               Forgot password?
//             </a>
//           </div>

//           {/* Button */}
//           <button
//             type="submit"
//             className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
//           >
//             Login
//           </button>
//         </form>

//         {/* Footer */}
//         <p className="text-center text-sm text-gray-500 mt-6">
//           Don’t have an account?{" "}
//           <a href="#" className="text-green-600 font-medium hover:underline">
//             Sign up
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      alert("Please select a role to continue");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-12 border border-gray-200">
        
        {/* Icon */}
         <div className="text-3xl mb-2 text-center">
                              🌾
                         </div>

        {/* <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-gray-700 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
              <circle cx="12" cy="6" r="2" fill="currentColor" />
            </svg>
          </div>
        </div> */}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 pt-2">
           Organic Farming Management
          </h1>
          <p className="text-gray-500 text-base">
            Select your role to continue
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Login as:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition appearance-none bg-white"
          >
            <option value="">-- Select Role --</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 mb-6"
        >
          Continue to Login
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Demo Mode */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Demo Mode: Select any user to explore the platform
          </p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleDemoMode("farmer")}
              className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              🌾 Demo as Farmer
            </button>
            <button
              onClick={() => handleDemoMode("admin")}
              className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              👨‍💼 Demo as Admin
            </button>
            <button
              onClick={() => handleDemoMode("expert")}
              className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              🎓 Demo as Expert
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-500 mt-8">
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

