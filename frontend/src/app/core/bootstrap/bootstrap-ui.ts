const FALLBACK_ID = "app-bootstrap-fallback";
const TITLE_ID = "app-bootstrap-title";
const MESSAGE_ID = "app-bootstrap-message";
const DEFAULT_BOOT_MESSAGE =
  "MindTrack hit a startup problem before the interface rendered. Refresh the page. If it keeps happening, clear this site's storage and try again.";

export function installBootstrapErrorListeners(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("error", (event) => {
    if (shouldIgnoreRuntimeError(event.error || event.message)) {
      event.preventDefault();
      return;
    }

    if (isAppReady()) {
      return;
    }

    showBootstrapError(event.error || event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (shouldIgnoreRuntimeError(event.reason)) {
      event.preventDefault();
      return;
    }

    if (isAppReady()) {
      return;
    }

    showBootstrapError(event.reason);
  });
}

export function markBootstrapReady(): void {
  if (typeof document === "undefined") {
    return;
  }

  const body = document.body;
  if (!body) {
    return;
  }

  body.classList.remove("app-bootstrap-error");
  body.classList.add("app-bootstrap-ready");

  const fallback = document.getElementById(FALLBACK_ID);
  if (!fallback) {
    return;
  }

  window.setTimeout(() => fallback.remove(), 320);
}

export function showBootstrapError(error: unknown, title = "Unable To Start MindTrack"): void {
  if (shouldIgnoreRuntimeError(error)) {
    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  const body = document.body;
  if (body) {
    body.classList.remove("app-bootstrap-ready");
    body.classList.add("app-bootstrap-error");
  }

  const fallback = document.getElementById(FALLBACK_ID);
  const titleElement = document.getElementById(TITLE_ID);
  const messageElement = document.getElementById(MESSAGE_ID);

  fallback?.setAttribute("data-state", "error");

  if (titleElement) {
    titleElement.textContent = title;
  }

  if (messageElement) {
    messageElement.textContent = normalizeErrorMessage(error);
  }

  console.error("[MindTrack] bootstrap failure", error);
}

export function normalizeErrorMessage(error: unknown): string {
  const extracted = extractErrorMessage(error);
  if (!extracted) {
    return DEFAULT_BOOT_MESSAGE;
  }

  if (/loading chunk|failed to fetch dynamically imported module/i.test(extracted)) {
    return "A cached production bundle is out of date. Refresh the page to load the latest app version.";
  }

  if (/storage|localstorage|quota|securityerror/i.test(extracted)) {
    return "This browser blocked MindTrack from reading saved session data. Refresh the page or allow site storage, then try again.";
  }

  return extracted;
}

export function shouldIgnoreRuntimeError(error: unknown): boolean {
  const message = extractErrorMessage(error);
  if (!message) {
    return false;
  }

  if (/play\(\) request was interrupted by a call to pause\(\)/i.test(message)) {
    return true;
  }

  if (/AbortError/i.test(message) && /play\(\)/i.test(message)) {
    return true;
  }

  return false;
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error.trim();
  }

  if (!error || typeof error !== "object") {
    return "";
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message.trim();
  }

  if ("reason" in error) {
    return extractErrorMessage(error.reason);
  }

  return "";
}

function isAppReady(): boolean {
  return typeof document !== "undefined" && document.body?.classList.contains("app-bootstrap-ready");
}
