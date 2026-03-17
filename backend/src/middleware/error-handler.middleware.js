export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    error: message,
    disclaimer:
      "MindTrack AI supports self-reflection and wellness only. It does not provide medical diagnosis."
  });
}
