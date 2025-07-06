"use client";

// import { Food } from "@/domain/models/food";
import { TraditionalFood } from "@/domain/models/traditional-food";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "jspdf-autotable";

import TraditionFoodDetails from "./components/TraditionFoodDetails";

type Props = {
  params: Promise<{ userId: string }>;
};

export default function DashboardUserFoodsPage({ params }: Props) {
  const [foods, setFoods] = useState<TraditionalFood[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { userId } = React.use(params);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);

  const fetchTraditionalFoods = useCallback(async () => {
    try {
      console.log("#####111");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/foods/organicos`,
        { cache: "no-store" }
      );
      console.log(res);
      console.log("#####222");
      if (!res.ok) throw new Error("Error al obtener los alimentos");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [foods, searchTerm]);

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);

  const paginatedFoods = useMemo(() => {
    return filteredFoods.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
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
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
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

      {foods.length === 0 ? (
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
                          Array.from(new Set([...prev, ...nuevosIds]))
                        );
                      } else {
                        const idsPaginaActual = paginatedFoods.map((f) => f.id);
                        setSelectedFoods((prev) =>
                          prev.filter((id) => !idsPaginaActual.includes(id))
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
