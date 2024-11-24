import { z } from "zod";

// Define the schema
const envSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().default("http://localhost:5000"),
  NEXT_PUBLIC_SECRET: z.string().default("my-next-auth-secret-hahahah"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
});

// Validate and parse the environment variables
export const parsedEnv = envSchema.parse(process.env);
