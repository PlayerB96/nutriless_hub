const RETRYABLE_MARKERS = [
  "Can't reach database server",
  "P1001",
  "ECONNREFUSED",
  "Connection timed out",
  "Connection reset",
];

export function isRetryableDbError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_MARKERS.some((marker) => message.includes(marker));
}

/** Mensaje legible para respuestas API cuando falla Prisma. */
export function getDbErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes("does not exist") ||
    message.includes("P2022") ||
    message.includes("alcoholTypes") ||
    message.includes("supplementTypes")
  ) {
    return "La base de datos no está actualizada. Ejecuta: npx prisma migrate deploy";
  }
  if (isRetryableDbError(error)) {
    return "No se pudo conectar a la base de datos. Espera unos segundos e inténtalo de nuevo.";
  }
  return "Error al consultar la base de datos";
}

/** Reintenta consultas cuando Neon u otro Postgres tarda en despertar (cold start). */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 4;
  const delayMs = options.delayMs ?? 2000;

  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableDbError(error) || i === attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
