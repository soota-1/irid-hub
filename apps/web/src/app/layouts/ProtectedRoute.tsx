import type { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";

/** Gates member/admin routes behind a Clerk session. Actual role checks
 * (member/officer/admin) are enforced by the backend — pages here render
 * optimistically for any signed-in user and surface a clear message on a
 * 403 from the API rather than guessing permissions client-side. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <div className="min-h-[50vh]" aria-busy="true" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
