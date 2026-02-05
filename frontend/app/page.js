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
import CreateFarm from "../src/components/pages/farmer/CreateFarm.js";

export default function CreateFarmPage() {
  return <CreateFarm />;
}
