// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("reviewer", "routes/quiz.tsx"),
  route("results", "routes/results.tsx"),
  route("flashcards", "routes/flashcards.tsx"),
  route("deped-orders", "routes/deped-orders.tsx"),
  route("study-notes", "routes/user-data.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("copyright", "routes/copyright.tsx"),
  // Catch-all route at the end to handle any non-matched paths
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;