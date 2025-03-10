// app/routes.ts
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "reviewer", file: "routes/quiz.tsx" },
  { path: "results", file: "routes/results.tsx" },
  { path: "flashcards", file: "routes/flashcards.tsx" },
  { path: "deped-orders", file: "routes/deped-orders.tsx" },
  { path: "study-notes", file: "routes/user-data.tsx" },
  { path: "dashboard", file: "routes/dashboard.tsx" },
  { path: "copyright", file: "routes/copyright.tsx" },
  // Catch-all route at the end to handle any non-matched paths
  { path: "*", file: "routes/404.tsx" },
] satisfies RouteConfig;