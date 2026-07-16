export const env = {
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  isProduction: process.env["NODE_ENV"] === "production",
  isDevelopment: process.env["NODE_ENV"] !== "production",
} as const;

export const server = {
  host: process.env["HOST"] ?? "0.0.0.0",
  port: Number(process.env["PORT"] ?? 4000),
} as const;

export const app = {
  name: "Debatr",
  apiUrl: process.env["PUBLIC_API_URL"] ?? "http://localhost:4000",
} as const;
