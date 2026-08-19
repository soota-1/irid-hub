import "@testing-library/jest-dom/vitest";
import i18n from "@/shared/i18n";

// jsdom's navigator.language defaults to en-US, which would make
// i18next-browser-languagedetector pick English and break every existing
// test assertion written against the Indonesian copy. Pin it explicitly
// so test output stays deterministic regardless of the CI/dev machine's
// locale.
void i18n.changeLanguage("id");

// jsdom doesn't implement matchMedia — components read
// prefers-reduced-motion via it (useReducedMotion), so tests need a stub.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
