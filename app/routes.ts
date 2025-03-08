// app/routes.ts
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "reviewer", file: "routes/quiz.tsx" },
  { path: "results", file: "routes/results.tsx" },
  { path: "flashcards", file: "routes/flashcards.tsx" },
] satisfies RouteConfig;