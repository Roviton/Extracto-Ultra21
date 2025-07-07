// Configuration for different environments
export const config = {
  // Site URL for email redirects and other purposes
  siteUrl:
    process.env.NODE_ENV === "production"
      ? "https://ultra21.com"
      : typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000",

  // API base URL
  apiUrl: process.env.NODE_ENV === "production" ? "https://ultra21.com/api" : "/api",

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Auth redirect URLs
  authRedirectUrl:
    process.env.NODE_ENV === "production"
      ? "https://ultra21.com/auth/callback"
      : typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "http://localhost:3000/auth/callback",
}
