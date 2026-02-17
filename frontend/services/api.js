// frontend/src/services/api.js
import axios from "axios";


// for local host
// const api = axios.create({
//   baseURL: "http://localhost:4000/api",
// });


// for Production
const api = axios.create({
  baseURL: "https://organic-farming-7lw1.onrender.com/api",
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
