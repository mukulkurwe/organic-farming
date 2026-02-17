// frontend/src/services/api.js
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL,
  timeout: 30000,
});

export default api;

