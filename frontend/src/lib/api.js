// frontend/lib/api.js
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api";

export async function apiGet(path, params = {}) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    console.error(`GET ${path} failed`, res.status);
    throw new Error(`GET ${path} failed`);
  }

  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`POST ${path} failed`, res.status);
    throw new Error(`POST ${path} failed`);
  }

  return res.json();
}
