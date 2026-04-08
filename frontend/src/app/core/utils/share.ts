export async function shareTextSafely(title: string, text: string): Promise<boolean> {
  if (typeof navigator === "undefined") {
    return false;
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return true;
    } catch (error) {
      if (isAbortError(error)) {
        return false;
      }

      console.warn("[MindTrack] Share API failed", error);
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("[MindTrack] Clipboard copy failed", error);
    }
  }

  return false;
}

function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "name" in error && error.name === "AbortError");
}
