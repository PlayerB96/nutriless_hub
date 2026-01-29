"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LoaderCircle,
  Search,
  Star,
  StarHalf,
  StarOff,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Recipe } from "@/domain/models/recipe";

const DEFAULT_IMAGE = "/images/receta_defecto.png";

export default function DashboardUserRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { userId } = useParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes?userId=${userId}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Error al obtener las recetas");
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  /* 🔹 Tags únicos para el select */
  const availableTags = useMemo(() => {
    const tags = recipes.flatMap((recipe) => recipe.tags || []);
    return Array.from(new Set(tags));
  }, [recipes]);

  /* 🔹 Filtro por nombre + tag */
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesName = recipe.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesTag =
        !selectedTag || recipe.tags.includes(selectedTag);

      return matchesName && matchesTag;
    });
  }, [recipes, searchTerm, selectedTag]);

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

      {/* 🔍 Buscador + Filtro */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        

        <div className="w-full sm:w-auto bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filtros
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Buscar por nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Search className="w-3.5 h-3.5" />
                Buscar por nombre
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej. Lasaña, Ensalada..."
                  className="pl-9 pr-3 py-2 border dark:border-slate-700 rounded-lg w-full sm:w-64
                     text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900
                     focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Filtro por categorías */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Categoría
              </label>

              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border dark:border-slate-700 rounded-lg
                   text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900
                   focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Todas las categorías</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ⏮️ Paginación */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoaderCircle className="animate-spin w-8 h-8 text-secondary" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <p>No se encontraron recetas.</p>
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
                <h2 className="text-lg font-semibold mb-2">
                  {recipe.name}
                </h2>

                {/* 🏷️ Tags */}
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

                {/* ⏱️ Tiempos */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preparación: {recipe.prepTime} min
                  {recipe.cookTime
                    ? ` • Cocción: ${recipe.cookTime} min`
                    : ""}
                </p>

                {/* ⭐ Dificultad */}
                <div className="flex items-center gap-2 text-sm mt-1">
                  {recipe.difficulty === "Fácil" && (
                    <>
                      <Star className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        Fácil
                      </span>
                    </>
                  )}
                  {recipe.difficulty === "Media" && (
                    <>
                      <StarHalf className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Media
                      </span>
                    </>
                  )}
                  {recipe.difficulty === "Difícil" && (
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
