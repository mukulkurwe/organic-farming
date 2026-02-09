// frontend/lib/api.js
const API_BASE = "http://localhost:4000/api";

export async function apiGet(path, params = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(API_BASE + normalizedPath);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });

  console.log("GET →", url.toString());   // 👈 debug

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    console.error(`GET ${normalizedPath} failed`, res.status);
    throw new Error(`GET ${normalizedPath} failed`);
  }

  return res.json();
}
