const DEFAULT_BASE_URL = "http://localhost:3001";

/**
 * Returns the configured API base URL.
 * Uses REACT_APP_API_BASE_URL if provided, otherwise defaults to localhost.
 */
function getApiBaseUrl() {
  const raw = process.env.REACT_APP_API_BASE_URL;
  if (!raw) return DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, "");
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * A typed-ish API error that includes HTTP status and response payload if available.
 */
export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/**
 * API client wrapper around fetch().
 * Automatically injects Authorization header when token is provided.
 *
 * PUBLIC_INTERFACE
 */
export async function apiRequest(path, { method = "GET", token, body, headers } = {}) {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const requestHeaders = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError("Network error: unable to reach the server.", { status: 0, payload: String(e) });
  }

  const text = await res.text();
  const payload = text ? safeJsonParse(text) ?? text : null;

  if (!res.ok) {
    const msg =
      (payload && payload.message) ||
      (payload && payload.error) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(msg, { status: res.status, payload });
  }

  return payload;
}

/**
 * PUBLIC_INTERFACE
 * Auth endpoints (best-effort; backend will be implemented next).
 */
export const AuthApi = {
  async signIn({ email, password }) {
    return apiRequest("/auth/login", { method: "POST", body: { email, password } });
  },
  async signUp({ name, email, password }) {
    return apiRequest("/auth/register", { method: "POST", body: { name, email, password } });
  },
  async me(token) {
    return apiRequest("/auth/me", { method: "GET", token });
  },
};

/**
 * PUBLIC_INTERFACE
 * Habit endpoints (best-effort; backend will be implemented next).
 */
export const HabitsApi = {
  async list({ token, q, frequency, category } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (frequency) params.set("frequency", frequency);
    if (category) params.set("category", category);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/habits${suffix}`, { token });
  },
  async create({ token, habit }) {
    return apiRequest("/habits", { method: "POST", token, body: habit });
  },
  async update({ token, id, patch }) {
    return apiRequest(`/habits/${id}`, { method: "PUT", token, body: patch });
  },
  async remove({ token, id }) {
    return apiRequest(`/habits/${id}`, { method: "DELETE", token });
  },
  async toggleCompletion({ token, id, periodKey, completed }) {
    // periodKey could be date like 2026-02-10 for daily, or ISO week, or YYYY-MM for monthly.
    return apiRequest(`/habits/${id}/completion`, {
      method: "POST",
      token,
      body: { periodKey, completed },
    });
  },
  async progress({ token }) {
    return apiRequest("/progress/summary", { token });
  },
};

/**
 * PUBLIC_INTERFACE
 * Export endpoints (placeholder triggers).
 */
export const ExportApi = {
  async exportCsv({ token }) {
    return apiRequest("/export/csv", { token });
  },
  async exportPdf({ token }) {
    return apiRequest("/export/pdf", { token });
  },
};
