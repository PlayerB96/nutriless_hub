"use client";

import { Contact, PlusCircle, SquarePen, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Modal from "@/components/ui/Modal";
import FormularioPaciente from "./components/FormularioPaciente";

type Paciente = {
  id: number;
  name: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email?: string;
  phone?: string;
  height?: number;
  weight?: number;
};

export default function PacientesPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil(pacientes.length / pageSize);
  const pacientesPaginados = pacientes.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // Eliminar paciente con confirmación y feedback
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar paciente?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "var(--primary)",
      color: "var(--text)",
    });

    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.message ?? `Error al eliminar. Status: ${res.status}`,
        );
      }
      setPacientes((prev) => prev.filter((p) => p.id !== id));
      Swal.fire({
        title: "Eliminado",
        text: data?.message || "El paciente ha sido eliminado correctamente",
        icon: "success",
        background: "var(--primary)",
        color: "var(--text)",
      });
    } catch (err: unknown) {
      console.error("Error catch:", err);
      Swal.fire({
        title: "Error",
        text: (err as Error).message || "No se pudo eliminar el paciente",
        icon: "error",
        background: "var(--primary)",
        color: "var(--text)",
      });
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/pacientes?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setPacientes(data))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="relative flex flex-col md:flex-row h-full bg-bg rounded-2xl border border-primary overflow-hidden">
      {/* MAIN */}
      <section className="flex-1 p-4 md:p-6 bg-primary flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center justify-between sticky top-0 bg-primary z-10 pb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2 ">
            <Contact size={20} /> Pacientes
          </h2>

          {/* Desktop button */}
          <button
            onClick={() => setOpenModal(true)}
            className="hidden md:flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg shadow hover:scale-105 cursor-pointer"
          >
            <PlusCircle size={18} /> Nuevo
          </button>
        </div>

        {/* LOADING */}
        {loading && <p className="text-text-alt">Cargando pacientes...</p>}

        {/* MOBILE CARDS */}
        <div className="grid gap-3 md:hidden">
          {pacientesPaginados.map((p) => (
            <div
              key={p.id}
              className="bg-primary rounded-xl p-4 border border-primary shadow-sm"
            >
              <div className="font-bold text-text">
                {p.name} {p.lastName}
              </div>
              <div className="text-xs text-text-alt">
                {p.email || "Sin correo"}
              </div>

              <div className="flex justify-between text-xs mt-2 text-text-alt">
                    <span>{p.gender}</span>
                    <span>{p.birthDate ? new Date(p.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' de ', ' ').replace(' de ', ' del ') : ''}</span>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  className="text-primary hover:bg-primary-secondary p-2 rounded cursor-pointer flex items-center justify-center"
                  title="Editar"
                >
                  <SquarePen size={18} />
                </button>
                <button
                  className="text-red-500 hover:bg-primary-secondary p-2 rounded cursor-pointer flex items-center justify-center"
                  title="Eliminar"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full bg-primary rounded-xl border border-primary text-sm">
            <thead className="bg-primary-secondary text-primary">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2">Género</th>
                <th className="px-4 py-2">Nacimiento</th>
                <th className="px-4 py-2 hidden lg:table-cell">Correo</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesPaginados.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-secondary-secondary"
                >
                  <td className="px-4 py-2 font-medium">
                    {p.name} {p.lastName}
                  </td>
                  <td className="px-4 py-2">{p.gender}</td>
                      <td className="px-4 py-2">{p.birthDate ? new Date(p.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' de ', ' ').replace(' de ', ' del ') : ''}</td>
                  <td className="px-4 py-2 hidden lg:table-cell">{p.email}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        className=" hover:bg-primary-secondary  rounded cursor-pointer"
                        title="Editar"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:bg-primary-secondary p-2 rounded cursor-pointer flex items-center justify-center"
                        title="Eliminar"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded border disabled:opacity-40"
            >
              ←
            </button>
            <span className="text-xs text-text-alt">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </section>

      {/* ASIDE (solo desktop) */}
      <aside className="hidden md:flex w-1/3 bg-bg p-6 border-l border-primary">
        <div className="w-full bg-primary-secondary rounded-xl p-4">
          <h3 className=" font-semibold mb-3">Recientes</h3>
          <ul className="space-y-2">
            {pacientes.slice(0, 3).map((p) => (
              <li key={p.id} className="bg-primary p-3 rounded-lg text-sm">
                <div className="font-bold">
                  {p.name} {p.lastName}
                </div>
                <div className="text-xs text-text-alt">{p.email}</div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* FLOATING BUTTON MOBILE */}
      <button
        onClick={() => setOpenModal(true)}
        className="md:hidden fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-xl"
      >
        <PlusCircle />
      </button>
      {/* Modal para crear paciente */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Nuevo Paciente"
        width="w-full max-w-2xl"
      >
        <FormularioPaciente
          onSubmitSuccess={() => {
            setOpenModal(false);
            // Recargar lista de pacientes
            fetch(`/api/pacientes?userId=${userId}`)
              .then((res) => res.json())
              .then((data) => setPacientes(data));
          }}
        />
      </Modal>
    </div>
  );
}
