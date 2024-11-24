import { z } from "zod";

import "dotenv/config"; // Load the environment variables from the .env file

// Define the schema
const envSchema = z.object({
  PORT: z.string().default("5000"),
  DATABASE_URI: z.string(),
  JWT_SECRET_USER: z.string(),
  ADMIN_GMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
});

// Validate and parse the environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Environment variable validation failed:", env.error.format());
  process.exit(1); // Exit the application if validation fails
}

export const parsedEnv = env.data; // Parsed and typed environment variables
