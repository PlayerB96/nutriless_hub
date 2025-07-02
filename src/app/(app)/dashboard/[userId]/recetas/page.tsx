"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  StarHalf,
  StarOff,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Recipe } from "@/domain/models/recipe";

const DEFAULT_IMAGE = "/images/logonutri.png";

export default function DashboardUserRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  // const { id } = React.use(params);
  const { userId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const router = useRouter();

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes?userId=${userId}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Error al obtener las recetas");
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recipes, searchTerm]);

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  const paginatedRecipes = useMemo(() => {
    return filteredRecipes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredRecipes, currentPage]);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">Recetas</h1>

      {/* Buscador */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar receta..."
          className="border px-3 py-2 rounded w-full sm:w-64 text-gray-700 dark:text-gray-200"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Paginación */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
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
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {paginatedRecipes.length === 0 ? (
        <p className="text-gray-500">No se encontraron recetas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 cursor-pointer">
          {paginatedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() =>
                router.push(`/dashboard/${userId}/recetas/${recipe.id}/edit`)
              }
              className="relative border rounded-lg shadow transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg overflow-hidden group"
            >
              <Image
                src={recipe.image || DEFAULT_IMAGE}
                alt={`Imagen de ${recipe.name}`}
                width={400}
                height={200}
                className="object-cover w-full h-48"
              />
              <div className="p-4 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">{recipe.name}</h2>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {recipe.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full dark:bg-emerald-900 dark:text-emerald-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Tiempos */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preparación: {recipe.prepTime} min
                  {recipe.cookTime ? ` • Cocción: ${recipe.cookTime} min` : ""}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 mt-1">
                  {recipe.difficulty === "facil" && (
                    <>
                      <Star className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        Fácil
                      </span>
                    </>
                  )}
                  {recipe.difficulty === "intermedio" && (
                    <>
                      <StarHalf className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Media
                      </span>
                    </>
                  )}
                  {recipe.difficulty === "dificil" && (
                    <>
                      <StarOff className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">
                        Difícil
                      </span>
                    </>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Creado:{" "}
                  {new Date(recipe.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
