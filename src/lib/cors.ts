const ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

/** Origen permitido para CORS (no usar `*`). */
export function getAllowedOrigin(): string | null {
  return (
    process.env.ALLOWED_ORIGIN ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    null
  );
}

export function getCorsHeaders(): Record<string, string> {
  const origin = getAllowedOrigin();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

export function corsOptionsResponse(): Response {
  return new Response(null, { status: 204, headers: getCorsHeaders() });
}

export function withCors(init?: ResponseInit): ResponseInit {
  return {
    ...init,
    headers: {
      ...getCorsHeaders(),
      ...(init?.headers instanceof Headers
        ? Object.fromEntries(init.headers.entries())
        : (init?.headers as Record<string, string>) ?? {}),
    },
  };
}
