"use client";

// import { Food } from "@/domain/models/food";
import { TraditionalFood } from "@/domain/models/traditional-food";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, LoaderCircle } from "lucide-react";
import "jspdf-autotable";

import TraditionFoodDetails from "./components/TraditionFoodDetails";
import Swal from "sweetalert2";

type Props = {
  params: { userId: string };
};

export default function DashboardUserFoodsPage({ params }: Props) {
  const [foods, setFoods] = useState<TraditionalFood[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { userId } = params;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTraditionalFoods = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/foods/organicos`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Error al obtener los alimentos");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [foods, searchTerm]);

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);

  const paginatedFoods = useMemo(() => {
    return filteredFoods.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredFoods, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchTraditionalFoods();
  }, [fetchTraditionalFoods]);

  useEffect(() => {
    if (
      expandedId !== null &&
      !paginatedFoods.some((food) => food.id === expandedId)
    ) {
      setExpandedId(null);
    }
  }, [expandedId, paginatedFoods]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleSelect = (id: number) => {
    setSelectedFoods((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar alimento?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "var(--primary)",
      color: "var(--text)",
    });

    if (!result.isConfirmed) return;
    console.log("Eliminando alimento con ID:", id);
    try {
      const res = await fetch(`/api/users/${userId}/foods/organicos/${id}`, {
        method: "DELETE",
      });

      // let data: { message?: string } = {};
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ?? `Error al eliminar. Status: ${res.status}`,
        );
      }

      // Actualizar lista de alimentos en frontend
      setFoods((prev) => prev.filter((f) => f.id !== id));

      Swal.fire({
        title: "Eliminado",
        text: data?.message || "El alimento ha sido eliminado correctamente",
        icon: "success",
        background: "var(--primary)",
        color: "var(--text)",
      });
    } catch (err: unknown) {
      console.error("Error catch:", err);
      Swal.fire({
        title: "Error",
        text: (err as Error).message || "No se pudo eliminar el alimento",
        icon: "error",
        background: "var(--primary)",
        color: "var(--text)",
      });
    }
  };

  return (
    <main className="p-1 w-full overflow-x-auto sm:overflow-visible">
      <h1 className="text-2xl font-bold mb-6">Alimentos Orgánicos</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 ">
        {/* Buscador y botón de exportar agrupados */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="text"
            placeholder="Buscar alimento..."
            className="border px-3 py-2 rounded w-64 text-gray-700 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Paginación */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoaderCircle className="animate-spin w-8 h-8 text-secondary" />
        </div>
      ) : foods.length === 0 ? (
        <p>No se encontraron alimentos.</p>
      ) : (
        <div className="rounded-lg border border-gray-900">
          <table className="min-w-full border-collapse bg-bg text-sm sm:text-base rounded-lg overflow-hidden">
            <thead className="bg-primary">
              <tr>
                <th className=" px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedFoods.length > 0 &&
                      paginatedFoods.every((f) => selectedFoods.includes(f.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const nuevosIds = paginatedFoods.map((f) => f.id);
                        setSelectedFoods((prev) =>
                          Array.from(new Set([...prev, ...nuevosIds])),
                        );
                      } else {
                        const idsPaginaActual = paginatedFoods.map((f) => f.id);
                        setSelectedFoods((prev) =>
                          prev.filter((id) => !idsPaginaActual.includes(id)),
                        );
                      }
                    }}
                  />
                </th>

                <th className=" px-4 py-2 text-left">Nombre</th>
                {/* Ocultar en móvil */}
                <th className="hidden sm:table-cell px-4 py-2 text-left">
                  Fecha Creación
                </th>

                <th className=" px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFoods.map((food) => (
                <React.Fragment key={food.id}>
                  <tr
                    className="hover:bg-gray-200 dark:hover:bg-slate-900 cursor-pointer"
                    onClick={() => toggleExpand(food.id)}
                  >
                    {/* ✅ Checkbox de selección */}
                    <td
                      className=" px-4 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFoods.includes(food.id)}
                        onChange={() => toggleSelect(food.id)}
                      />
                    </td>

                    {/* El resto de las celdas igual que antes */}
                    <td className="px-4 py-2">{food.name}</td>

                    <td className="hidden sm:table-cell px-4 py-2 text-left">
                      {new Date(food.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                      })}
                    </td>
                    <td
                      className="px-4 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-5 h-5 mx-auto cursor-pointer" />
                      </button>
                    </td>
                  </tr>

                  {expandedId === food.id && (
                    <TraditionFoodDetails food={food} />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
