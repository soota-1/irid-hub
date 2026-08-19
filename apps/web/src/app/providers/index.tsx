import { ClerkProvider } from "@clerk/clerk-react";
import { type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { env } from "@/shared/lib/env";
import i18n from "@/shared/i18n";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <ClerkProvider publishableKey={env.clerkPublishableKey} signInUrl="/sign-in" signUpUrl="/sign-up">
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export { useTheme } from "./ThemeProvider";
