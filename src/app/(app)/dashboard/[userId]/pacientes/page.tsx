"use client";

import { Contact, Filter, PlusCircle, Search, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import FormularioPaciente from "./components/FormularioPaciente";

type Paciente = {
  id: number;
  name: string;
  lastName: string;
  gender: string;
  birthDate: string;
  createdAt?: string;
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

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredPacientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return pacientes.filter((p) => {
      const fullName = `${p.name} ${p.lastName}`.toLowerCase();
      const matchesName = !term || fullName.includes(term);

      let matchesDate = true;
      if (dateFilter && p.createdAt) {
        const created = new Date(p.createdAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateFilter) {
          case "hoy":
            matchesDate = created >= startOfToday;
            break;
          case "7d": {
            const start = new Date(startOfToday);
            start.setDate(start.getDate() - 6);
            matchesDate = created >= start;
            break;
          }
          case "30d": {
            const start = new Date(startOfToday);
            start.setDate(start.getDate() - 29);
            matchesDate = created >= start;
            break;
          }
          case "esteMes":
            matchesDate =
              created.getMonth() === now.getMonth() &&
              created.getFullYear() === now.getFullYear();
            break;
          case "esteAno":
            matchesDate = created.getFullYear() === now.getFullYear();
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesName && matchesDate;
    });
  }, [pacientes, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredPacientes.length / pageSize);
  const pacientesPaginados = filteredPacientes.slice(
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
      
      if (!res.ok) {
        const text = await res.text();
        let errorMessage = `Error al eliminar. Status: ${res.status}`;
        try {
          const data = JSON.parse(text);
          errorMessage = data?.message || data?.error || errorMessage;
        } catch {
          // Si no es JSON válido, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }
      
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      
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
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error al cargar pacientes: ${res.status}`);
        }
        const text = await res.text();
        if (!text) {
          return [];
        }
        return JSON.parse(text);
      })
      .then((data) => setPacientes(data))
      .catch((error) => {
        console.error("Error al cargar pacientes:", error);
        setPacientes([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="relative flex flex-col desktop:flex-row h-full bg-bg rounded-xl tablet:rounded-2xl border border-primary overflow-hidden">
      {/* MAIN */}
      <section className="flex-1 p-3 tablet:p-4 desktop:p-6 bg-primary flex flex-col gap-3 tablet:gap-4">
        {/* HEADER */}
        <div className="flex items-center justify-between sticky top-0 bg-primary z-10 pb-2">
          <h2 className="text-base tablet:text-lg font-semibold flex items-center gap-2 ">
            <Contact size={20} /> Pacientes
          </h2>

          {/* Desktop button */}
          <button
            onClick={() => setOpenModal(true)}
            className="hidden tablet:flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg shadow hover:scale-105 cursor-pointer"
          >
            <PlusCircle size={18} /> Nuevo
          </button>
        </div>

        {/* FILTROS */}
        <div className="w-full bg-primary-secondary rounded-xl p-4 border border-primary">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-semibold text-text">Filtros</h3>
          </div>

          <div className="flex flex-col tablet:flex-row gap-3 tablet:gap-4">
            {/* Buscar por nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-alt flex items-center gap-1">
                <Search className="w-3.5 h-3.5" />
                Buscar por nombre
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-alt" />
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez..."
                  className="pl-9 pr-3 py-2 border border-primary rounded-lg w-full tablet:w-64
                     text-text bg-bg focus:ring-2 focus:ring-secondary focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Filtro por fecha de registro */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-alt flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Fecha de registro
              </label>

              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-primary rounded-lg
                   text-text bg-bg focus:ring-2 focus:ring-secondary focus:outline-none"
              >
                <option value="">Todas</option>
                <option value="hoy">Hoy</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="esteMes">Este mes</option>
                <option value="esteAno">Este año</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && <p className="text-text-alt">Cargando pacientes...</p>}

        {/* MOBILE CARDS */}
        <div className="grid gap-3 tablet:hidden">
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
        <div className="hidden tablet:block overflow-x-auto">
          <table className="w-full bg-primary rounded-xl border border-primary text-sm">
            <thead className="bg-primary-secondary text-primary">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2">Género</th>
                <th className="px-4 py-2">Nacimiento</th>
                <th className="px-4 py-2 hidden desktop:table-cell">Correo</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t">
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-text-alt">
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                      Cargando pacientes...
                    </div>
                  </td>
                </tr>
              ) : (
                pacientesPaginados.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-secondary-secondary cursor-pointer"
                    onClick={() => {
                      window.location.href = `/dashboard/${userId}/pacientes/${p.id}`;
                    }}
                  >
                    <td className="px-4 py-2 font-medium">
                      {p.name} {p.lastName}
                    </td>
                    <td className="px-4 py-2">{p.gender}</td>
                    <td className="px-4 py-2">{p.birthDate ? new Date(p.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' de ', ' ').replace(' de ', ' del ') : ''}</td>
                    <td className="px-4 py-2 hidden desktop:table-cell">{p.email}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          className="text-red-500 hover:bg-primary-secondary p-2 rounded cursor-pointer flex items-center justify-center"
                          title="Eliminar"
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
      <aside className="hidden desktop:flex w-full desktop:w-1/3 bg-bg p-4 desktop:p-6 border-t desktop:border-t-0 desktop:border-l border-primary">
        <div className="w-full bg-primary-secondary rounded-xl p-4">
          <h3 className=" font-semibold mb-3">Recientes</h3>
          <ul className="space-y-2">
            {pacientes.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/${userId}/pacientes/${p.id}`}
                  className="block cursor-pointer rounded-lg bg-primary p-3 text-sm hover:bg-secondary-secondary hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="font-bold">
                    {p.name} {p.lastName}
                  </div>
                  <div className="text-xs text-text-alt">{p.email || "Sin correo"}</div>
                  <div className="text-[11px] text-text-alt">
                    {p.createdAt
                      ? `Registrado: ${new Date(p.createdAt).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* FLOATING BUTTON MOBILE */}
      <button
        onClick={() => setOpenModal(true)}
        className="tablet:hidden fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-xl"
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
