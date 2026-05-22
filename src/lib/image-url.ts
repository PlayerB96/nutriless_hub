/**
 * URL para mostrar imágenes de alimentos en la app.
 * Usa proxy same-origin (/api/images/...) para evitar errores de red con R2 público.
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
        return `/api/images/${encodeURIComponent(proxyKey)}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const key = trimmed.replace(/^\//, "");
  if (!key || key.includes("..") || key.includes("/")) {
    return null;
  }

  return `/api/images/${encodeURIComponent(key)}`;
}
