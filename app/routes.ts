// app/routes.ts
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "quiz", file: "routes/quiz.tsx" },
  { path: "results", file: "routes/results.tsx" },
] satisfies RouteConfig;