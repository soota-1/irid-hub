function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key} (check apps/web/.env)`);
  }
  return value;
}

export const env = {
  clerkPublishableKey: requireEnv("VITE_CLERK_PUBLISHABLE_KEY"),
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
};
