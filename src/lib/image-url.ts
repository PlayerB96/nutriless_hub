/**
 * URL para mostrar imágenes en la app.
 * Convierte una key R2 (ej. "pacientes/imagenes/uuid.ext") al proxy same-origin.
 * Soporta keys planas ("uuid.ext") y con paths ("entidad/tipo/uuid.ext").
 */
export function getPublicImageUrl(
  imagePath: string | null | undefined,
): string | null {
  if (!imagePath?.trim()) return null;

  const trimmed = imagePath.trim();

  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("/api/images/")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const proxyKey = url.pathname.replace(/^\//, "");
      if (proxyKey && !proxyKey.includes("..")) {
        return `/api/images/${proxyKey}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const key = trimmed.replace(/^\//, "");
  if (!key || key.includes("..")) {
    return null;
  }

  return `/api/images/${key}`;
}
