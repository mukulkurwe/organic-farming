// // frontend/src/services/api.js
// import axios from "axios";


// // for local host
// const api = axios.create({
//   baseURL: "http://localhost:4000/api",
// });


// // for Production
// // const api = axios.create({
// //   baseURL: process.env.NEXT_PUBLIC_API_URL,
// //   timeout: 30000, // helps with Render cold start
// // });

// export default api;


import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL,
  timeout: 30000, // helpful for Render cold starts
  withCredentials: true, // only needed if using cookies/auth
});

export default api;


// new code
// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// api.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

// export default api;
