// frontend/src/services/api.js
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

// for production+ local


// import axios from "axios";

// const baseURL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// const api = axios.create({
//   baseURL,
//   timeout: 30000,
// });

// export default api;

// services/api.js
// frontend/services/api.js (or src/services/api.js)
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. https://organic-farming-7lw1.onrender.com/api in Vercel
  withCredentials: true,
});

export default api;

