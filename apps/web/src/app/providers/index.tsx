import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { env } from "@/shared/lib/env";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export { useTheme } from "./ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={env.clerkPublishableKey}>
      <ThemeProvider>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
