import type { MigrationConfig } from "drizzle-orm/migrator";

type APIConfig = {
  fileServerHits: number;
  port: number;
  platform: string;
  jwtSecret: string;
};

type DBConfig = {
  migrationConfig: MigrationConfig;
  url: string;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

process.loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileServerHits: 0,
    port: Number(envOrThrow("PORT")),
    platform: envOrThrow("PLATFORM"),
    jwtSecret: envOrThrow("JWT_SECRET"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
};
