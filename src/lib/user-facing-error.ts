const KNOWN_ERROR_MESSAGES = [
  {
    includes: "Environment variable not found: DATABASE_URL",
    message:
      "Database connection is not configured yet. Add DATABASE_URL to .env.local, then restart the app.",
  },
  {
    includes: "does not exist in the current database",
    message:
      "Database schema is not ready yet. Run `npm run db:migrate` and `npm run db:seed`, then refresh this page.",
  },
  {
    includes: "Can't reach database server",
    message:
      "Database server is not reachable right now. Start PostgreSQL or Docker Compose first, then refresh this page.",
  },
  {
    includes: "connect ECONNREFUSED",
    message:
      "Database server is not reachable right now. Start PostgreSQL or Docker Compose first, then refresh this page.",
  },
  {
    includes: "fetch failed",
    message: "The app could not load the required data right now. Try again in a moment.",
  },
];

export function toUserFacingErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  for (const knownError of KNOWN_ERROR_MESSAGES) {
    if (error.message.includes(knownError.includes)) {
      return knownError.message;
    }
  }

  const compactMessage = error.message.replace(/\s+/g, " ").trim();

  if (compactMessage && compactMessage.length <= 160 && !compactMessage.includes("Invalid `")) {
    return compactMessage;
  }

  return fallback;
}
