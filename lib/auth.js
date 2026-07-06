// Simple frontend-only "gate" — not real security.
// Credentials are read from env vars so they aren't hardcoded in the
// repo source, but they still end up inside the compiled JS the browser
// downloads (any NEXT_PUBLIC_ var does). That's fine for keeping a
// private family tool tidy — it is NOT meant to stop a determined person.

const DEFAULT_USERNAME = "mom";
const DEFAULT_PASSWORD = "family2026";

const VALID_USERNAME = process.env.NEXT_PUBLIC_LEDGER_USERNAME || DEFAULT_USERNAME;
const VALID_PASSWORD = process.env.NEXT_PUBLIC_LEDGER_PASSWORD || DEFAULT_PASSWORD;

const SESSION_KEY = "ledger_session";

export function checkCredentials(username, password) {
  return username.trim() === VALID_USERNAME && password === VALID_PASSWORD;
}

export function startSession() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, "active");
  }
}

export function hasSession() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_KEY) === "active";
}

export function endSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
  }
}
