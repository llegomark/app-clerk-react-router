// app/routes.ts
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "reviewer", file: "routes/quiz.tsx" },
  { path: "results", file: "routes/results.tsx" },
  { path: "flashcards", file: "routes/flashcards.tsx" },
  { path: "deped-orders", file: "routes/deped-orders.tsx" },
  { path: "user-data", file: "routes/user-data.tsx" },
] satisfies RouteConfig;