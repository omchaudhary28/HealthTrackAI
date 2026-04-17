export interface RouteTheme {
  key: string;
  shellGradient: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  activeSurface: string;
  orbA: string;
  orbB: string;
  tabGradient: string;
}

export const ROUTE_THEMES: Record<string, RouteTheme> = {
  landing: {
    key: "landing",
    shellGradient: "linear-gradient(135deg, #fff0e3 0%, #e8f2ff 44%, #e7fff5 100%)",
    accent: "#ff5f00",
    accentStrong: "#ec4899",
    accentSoft: "rgba(255, 95, 0, 0.16)",
    activeSurface: "rgba(255, 244, 235, 0.9)",
    orbA: "rgba(255, 95, 0, 0.22)",
    orbB: "rgba(14, 165, 233, 0.18)",
    tabGradient: "linear-gradient(90deg, rgba(255,95,0,0.96), rgba(236,72,153,0.95), rgba(14,165,233,0.92))"
  },
  auth: {
    key: "auth",
    shellGradient: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #eefbf5 100%)",
    accent: "#0ea5e9",
    accentStrong: "#0369a1",
    accentSoft: "rgba(14, 165, 233, 0.14)",
    activeSurface: "rgba(240, 249, 255, 0.88)",
    orbA: "rgba(14, 165, 233, 0.18)",
    orbB: "rgba(16, 185, 129, 0.16)",
    tabGradient: "linear-gradient(90deg, rgba(14,165,233,0.95), rgba(16,185,129,0.95))"
  },
  dashboard: {
    key: "dashboard",
    shellGradient: "linear-gradient(140deg, #e8f4ff 0%, #f7f3ff 44%, #e8fff5 100%)",
    accent: "#0ea5e9",
    accentStrong: "#ec4899",
    accentSoft: "rgba(14, 165, 233, 0.16)",
    activeSurface: "rgba(240, 249, 255, 0.92)",
    orbA: "rgba(14, 165, 233, 0.24)",
    orbB: "rgba(236, 72, 153, 0.18)",
    tabGradient: "linear-gradient(90deg, rgba(14,165,233,0.95), rgba(236,72,153,0.94), rgba(255,95,0,0.9))"
  },
  tests: {
    key: "tests",
    shellGradient: "linear-gradient(140deg, #fff3df 0%, #eaf3ff 52%, #eefdf8 100%)",
    accent: "#ff8a00",
    accentStrong: "#ea580c",
    accentSoft: "rgba(255, 138, 0, 0.16)",
    activeSurface: "rgba(255, 247, 230, 0.9)",
    orbA: "rgba(255, 138, 0, 0.24)",
    orbB: "rgba(14, 165, 233, 0.14)",
    tabGradient: "linear-gradient(90deg, rgba(255,138,0,0.95), rgba(236,72,153,0.9), rgba(14,165,233,0.88))"
  },
  mentalState: {
    key: "mentalState",
    shellGradient: "linear-gradient(140deg, #f7f3ff 0%, #f7fbff 48%, #f3fff9 100%)",
    accent: "#8b5cf6",
    accentStrong: "#6d28d9",
    accentSoft: "rgba(139, 92, 246, 0.14)",
    activeSurface: "rgba(245, 243, 255, 0.9)",
    orbA: "rgba(167, 139, 250, 0.2)",
    orbB: "rgba(45, 212, 191, 0.15)",
    tabGradient: "linear-gradient(90deg, rgba(139,92,246,0.95), rgba(45,212,191,0.92))"
  },
  exercises: {
    key: "exercises",
    shellGradient: "linear-gradient(140deg, #eafff4 0%, #eef5ff 50%, #fff0e7 100%)",
    accent: "#10b981",
    accentStrong: "#0f766e",
    accentSoft: "rgba(16, 185, 129, 0.16)",
    activeSurface: "rgba(236, 253, 245, 0.9)",
    orbA: "rgba(16, 185, 129, 0.24)",
    orbB: "rgba(255, 95, 0, 0.14)",
    tabGradient: "linear-gradient(90deg, rgba(16,185,129,0.95), rgba(14,165,233,0.9), rgba(255,95,0,0.86))"
  },
  mood: {
    key: "mood",
    shellGradient: "linear-gradient(140deg, #f3fbff 0%, #f8faff 55%, #f4fff9 100%)",
    accent: "#06b6d4",
    accentStrong: "#0f766e",
    accentSoft: "rgba(6, 182, 212, 0.14)",
    activeSurface: "rgba(236, 254, 255, 0.88)",
    orbA: "rgba(34, 211, 238, 0.2)",
    orbB: "rgba(14, 165, 233, 0.12)",
    tabGradient: "linear-gradient(90deg, rgba(6,182,212,0.95), rgba(59,130,246,0.9))"
  },
  journal: {
    key: "journal",
    shellGradient: "linear-gradient(140deg, #fff2e7 0%, #f1efff 50%, #e9fff7 100%)",
    accent: "#ff5f00",
    accentStrong: "#db2777",
    accentSoft: "rgba(255, 95, 0, 0.16)",
    activeSurface: "rgba(255, 244, 236, 0.9)",
    orbA: "rgba(255, 95, 0, 0.22)",
    orbB: "rgba(219, 39, 119, 0.16)",
    tabGradient: "linear-gradient(90deg, rgba(255,95,0,0.95), rgba(219,39,119,0.9), rgba(14,165,233,0.86))"
  },
  community: {
    key: "community",
    shellGradient: "linear-gradient(140deg, #f5f7ff 0%, #f9fcff 50%, #f3fff8 100%)",
    accent: "#6366f1",
    accentStrong: "#4338ca",
    accentSoft: "rgba(99, 102, 241, 0.14)",
    activeSurface: "rgba(238, 242, 255, 0.88)",
    orbA: "rgba(129, 140, 248, 0.2)",
    orbB: "rgba(34, 197, 94, 0.12)",
    tabGradient: "linear-gradient(90deg, rgba(99,102,241,0.95), rgba(34,197,94,0.88))"
  },
  createPost: {
    key: "createPost",
    shellGradient: "linear-gradient(140deg, #fff7f1 0%, #f7f8ff 50%, #eefdf8 100%)",
    accent: "#f97316",
    accentStrong: "#c2410c",
    accentSoft: "rgba(249, 115, 22, 0.14)",
    activeSurface: "rgba(255, 247, 237, 0.9)",
    orbA: "rgba(251, 146, 60, 0.18)",
    orbB: "rgba(99, 102, 241, 0.12)",
    tabGradient: "linear-gradient(90deg, rgba(249,115,22,0.95), rgba(99,102,241,0.88))"
  },
  progress: {
    key: "progress",
    shellGradient: "linear-gradient(140deg, #eaf4ff 0%, #fff4e8 48%, #eafff4 100%)",
    accent: "#0ea5e9",
    accentStrong: "#0f766e",
    accentSoft: "rgba(14, 165, 233, 0.16)",
    activeSurface: "rgba(240, 249, 255, 0.9)",
    orbA: "rgba(14, 165, 233, 0.22)",
    orbB: "rgba(255, 138, 0, 0.16)",
    tabGradient: "linear-gradient(90deg, rgba(14,165,233,0.95), rgba(16,185,129,0.9), rgba(255,138,0,0.86))"
  },
  profile: {
    key: "profile",
    shellGradient: "linear-gradient(140deg, #f8f9ff 0%, #f8fbff 50%, #f0fbff 100%)",
    accent: "#2563eb",
    accentStrong: "#1d4ed8",
    accentSoft: "rgba(37, 99, 235, 0.14)",
    activeSurface: "rgba(239, 246, 255, 0.88)",
    orbA: "rgba(59, 130, 246, 0.18)",
    orbB: "rgba(14, 165, 233, 0.12)",
    tabGradient: "linear-gradient(90deg, rgba(37,99,235,0.95), rgba(14,165,233,0.88))"
  },
  about: {
    key: "about",
    shellGradient: "linear-gradient(140deg, #fff8f1 0%, #f8fbff 48%, #f3fff8 100%)",
    accent: "#ea580c",
    accentStrong: "#9a3412",
    accentSoft: "rgba(234, 88, 12, 0.14)",
    activeSurface: "rgba(255, 247, 237, 0.88)",
    orbA: "rgba(251, 146, 60, 0.18)",
    orbB: "rgba(16, 185, 129, 0.12)",
    tabGradient: "linear-gradient(90deg, rgba(234,88,12,0.95), rgba(16,185,129,0.88))"
  },
  feedback: {
    key: "feedback",
    shellGradient: "linear-gradient(140deg, #fff7fb 0%, #f7fbff 50%, #effff7 100%)",
    accent: "#db2777",
    accentStrong: "#9d174d",
    accentSoft: "rgba(219, 39, 119, 0.14)",
    activeSurface: "rgba(253, 242, 248, 0.9)",
    orbA: "rgba(244, 114, 182, 0.18)",
    orbB: "rgba(45, 212, 191, 0.12)",
    tabGradient: "linear-gradient(90deg, rgba(219,39,119,0.95), rgba(45,212,191,0.88))"
  },
  default: {
    key: "default",
    shellGradient: "linear-gradient(140deg, #f8fafc 0%, #f7fbff 52%, #f2fbf7 100%)",
    accent: "#0f172a",
    accentStrong: "#0f172a",
    accentSoft: "rgba(15, 23, 42, 0.08)",
    activeSurface: "rgba(255, 255, 255, 0.82)",
    orbA: "rgba(142, 184, 215, 0.18)",
    orbB: "rgba(159, 215, 201, 0.14)",
    tabGradient: "linear-gradient(90deg, rgba(15,23,42,0.95), rgba(14,165,233,0.7))"
  }
};
