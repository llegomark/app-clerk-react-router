// app/root.tsx
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/react-router";
import { Toaster } from "sonner";
import { BookOpenIcon } from "lucide-react";

import type { Route } from "./+types/root";
import { Footer } from '~/components/footer';
import stylesheet from "./app.css?url";

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args)
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background">
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <ClerkProvider loaderData={loaderData}>
      <header className="bg-background border-b py-3">
        <div className="container mx-auto flex items-center justify-between px-4 max-w-4xl">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <BookOpenIcon className="size-5 text-primary" />
            <span className="font-bold text-lg">NQESH Reviewer Pro</span>
          </div>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium cursor-pointer hover:bg-primary/90">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-10rem)] bg-background">
        <Outlet />
      </main>
      <Footer />
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-4 p-4 container mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">{message}</h1>
      <p className="text-muted-foreground mb-4">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto text-xs bg-muted rounded-md">
          <code>{stack}</code>
        </pre>
      )}
      <div className="mt-6">
        <button
          onClick={() => window.location.href = '/'}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm cursor-pointer"
        >
          Go Home
        </button>
      </div>
    </main>
  );
}