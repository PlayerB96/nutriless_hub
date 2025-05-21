"use client";

import { Food } from "@/domain/models/food";
import React, { useEffect, useMemo, useState } from "react";
import FoodDetails from "./components/FoodDetails";
import { Check, Edit, X } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

type Props = {
  params: Promise<{ id: string }>;
};

export default function DashboardUserFoodsPage({ params }: Props) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { id } = React.use(params);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const [editFoodId, setEditFoodId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [dropdownCategoriaAbierto, setDropdownCategoriaAbierto] =
    useState(false);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/foods`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Error al obtener los alimentos");
        const data = await res.json();
        setFoods(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFoods();
  }, [id]);

  // Limpia expandedId si el alimento expandido ya no está en la página visible
  useEffect(() => {
    if (
      expandedId !== null &&
      !paginatedFoods.some((food) => food.id === expandedId)
    ) {
      setExpandedId(null);
    }
  }, [expandedId, searchTerm, currentPage, foods]); // dependencias que afectan paginación y filtrado

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleNutritionValueChange = (
    foodId: number,
    nutritionId: number,
    newValue: number
  ) => {
    setFoods((prevFoods) =>
      prevFoods.map((food) => {
        if (food.id !== foodId) return food;
        return {
          ...food,
          nutritionDetails: food.nutritionDetails.map((n) =>
            n.id === nutritionId ? { ...n, value: newValue } : n
          ),
        };
      })
    );
  };
  const [categorias, setCategorias] = useState<{ id: number; name: string }[]>(
    []
  ); // O carga tus categorías

  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const categoriasFiltradas = useMemo(() => {
    if (!categoriaFiltro) return categorias;
    return categorias.filter((cat) =>
      cat.name.toLowerCase().includes(categoriaFiltro.toLowerCase())
    );
  }, [categoriaFiltro, categorias]);

  const handleSave = (foodId: number) => {
    setFoods((prevFoods) =>
      prevFoods.map((food) =>
        food.id === foodId
          ? { ...food, name: editName, category: editCategoria }
          : food
      )
    );
    setEditFoodId(null);
    setDropdownCategoriaAbierto(false);
  };

  const generatePdf = () => {
    const doc = new jsPDF();

    doc.text("Listado de Alimentos", 14, 22);

    const columns = [
      { header: "Nombre", dataKey: "name" },
      { header: "Categoría", dataKey: "category" },
      { header: "Fecha Creación", dataKey: "createdAt" },
      { header: "Imagen", dataKey: "imageUrl" },
    ];

    const rows = paginatedFoods.map((food) => ({
      name: food.name,
      category: food.category,
      createdAt: new Date(food.createdAt).toLocaleDateString(),
      imageUrl: food.imageUrl ? "Sí" : "No",
    }));

    // Aquí llamas a autoTable PASANDO la instancia doc
    autoTable(doc, {
      startY: 30,
      columns,
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("alimentos.pdf");
  };

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

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Alimentos</h1>
      <div className="flex justify-between items-center mb-4">
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
        <div className="mb-4">
          <button
            onClick={generatePdf}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Exportar PDF
          </button>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {foods.length === 0 ? (
        <p>No se encontraron alimentos.</p>
      ) : (
        <table className="min-w-full border border-gray-300 bg-bg">
          <thead className="bg-primary">
            <tr>
              <th className="border px-4 py-2 text-left">Nombre</th>
              <th className="border px-4 py-2 text-left">Categoría</th>
              <th className="border px-4 py-2 text-left">Fecha Creación</th>
              <th className="border px-4 py-2 text-left">Imagen</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFoods.map((food) => (
              <React.Fragment key={food.id}>
                <tr
                  className="hover:bg-gray-200 dark:hover:bg-slate-900 cursor-pointer"
                  onClick={() => toggleExpand(food.id)}
                >
                  <td className="border px-4 py-2">
                    {editFoodId === food.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      food.name
                    )}
                  </td>
                  <td className="border px-4 py-2 relative">
                    {editFoodId === food.id ? (
                      <>
                        <input
                          type="text"
                          id="categoria"
                          value={editCategoria}
                          onChange={(e) => {
                            setEditCategoria(e.target.value);
                            setDropdownCategoriaAbierto(true);
                          }}
                          onFocus={() => setDropdownCategoriaAbierto(true)}
                          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
                          placeholder="Seleccione o busque categoría"
                          autoComplete="off"
                          required
                        />
                        {dropdownCategoriaAbierto && (
                          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-gray-300 shadow-lg bg-primary">
                            {categoriasFiltradas.length > 0 ? (
                              categoriasFiltradas.map((cat) => (
                                <li
                                  key={cat.id}
                                  onClick={() => {
                                    setEditCategoria(cat.name);
                                    setDropdownCategoriaAbierto(false);
                                  }}
                                  className="cursor-pointer px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  {cat.name}
                                </li>
                              ))
                            ) : (
                              <li className="px-4 py-2 text-gray-500">
                                No hay coincidencias
                              </li>
                            )}
                          </ul>
                        )}
                      </>
                    ) : (
                      food.category
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(food.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">
                    {food.imageUrl ? (
                      <img
                        src={`https://pub-b150312a074447b28b7b2fe8fac4e6f5.r2.dev/${food.imageUrl}`}
                        alt={food.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span>No hay imagen</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editFoodId === food.id ? (
                      <>
                        <button
                          className="mr-2 p-1 bg-green-500 text-white rounded hover:bg-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(food.id);
                          }}
                          aria-label="Guardar cambios"
                          title="Guardar"
                        >
                          <Check size={20} />
                        </button>

                        <button
                          className="p-1 bg-gray-400 rounded hover:bg-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditFoodId(null);
                            setDropdownCategoriaAbierto(false);
                          }}
                          aria-label="Cancelar edición"
                          title="Cancelar"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <button
                        className="p-1 text-blue-500 hover:text-blue-700 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditFoodId(food.id);
                          setEditName(food.name);
                          setEditCategoria(food.category);
                        }}
                        aria-label="Editar alimento"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === food.id && (
                  <FoodDetails
                    food={food}
                    onNutritionValueChange={handleNutritionValueChange}
                  />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
