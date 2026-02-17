// frontend/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"\;

// shared helper so we don't duplicate logic
async function handleError(res, path, method) {
  let errorBody = null;

  try {
    errorBody = await res.json();
  } catch (e) {
    // no JSON body or empty body – that's fine
  }

  console.error(`${method} ${path} failed`, res.status, errorBody);

  const messageFromBody =
    errorBody &&
    (errorBody.error || errorBody.message || JSON.stringify(errorBody));

  throw new Error(
    messageFromBody || `${method} ${path} failed (${res.status})`
  );
}

export async function apiGet(path, params = {}) {
  const url = new URL(API_BASE + path);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    await handleError(res, path, "GET");
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
    await handleError(res, path, "POST");
  }

  return res.json();
}
