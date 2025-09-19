// utils/confirmAction.ts
import Swal, { SweetAlertIcon } from "sweetalert2";

export interface ConfirmOptions {
  title: string;
  text: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const confirmAction = async ({
  title,
  text,
  icon = "warning",
  confirmButtonText = "Sí",
  cancelButtonText = "Cancelar",
}: ConfirmOptions) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    background: "var(--primary)", // usa tu variable CSS
    color: "var(--text)",        // usa tu variable CSS
  });
};
