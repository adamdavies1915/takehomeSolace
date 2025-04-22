import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const setup = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Please configure your environment variables.");
  }

  // Create postgres client for queries
  const queryClient = postgres(process.env.DATABASE_URL);
  
  // Create and return the drizzle instance
  return drizzle(queryClient);
};

export default setup();