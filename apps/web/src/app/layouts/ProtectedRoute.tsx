import type { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={`/sign-in?redirect_url=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
