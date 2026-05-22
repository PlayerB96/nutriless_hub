type SaveStatus = "idle" | "saving" | "success" | "error";

type Props = {
  status: SaveStatus;
  errorMessage?: string;
};

export default function PatientAutoSaveStatus({ status, errorMessage }: Props) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <div
        className="flex shrink-0 items-center gap-2 text-xs text-text-alt"
        role="status"
        aria-live="polite"
      >
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent"
          aria-hidden
        />
        Guardando…
      </div>
    );
  }

  if (status === "success") {
    return (
      <span className="shrink-0 text-xs text-green-600" role="status" aria-live="polite">
        Guardado
      </span>
    );
  }

  return (
    <span className="shrink-0 text-xs text-red-600" role="alert">
      {errorMessage?.trim() || "Error al guardar"}
    </span>
  );
}
