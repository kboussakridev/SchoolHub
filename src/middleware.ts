import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Définir les routes qui nécessitent une authentification
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Activer la protection Clerk uniquement si les clés Clerk sont définies dans l'environnement
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Ignore les fichiers statiques et les composants internes Next.js
    "/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)",
    // Toujours appliquer le middleware aux routes d'API
    "/(api|trpc)(.*)",
  ],
};
