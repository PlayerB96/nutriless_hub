"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Recipe } from "@/domain/models/recipe";
import { Pencil, Eye, List, ListOrdered, ImageIcon } from "lucide-react";
import EditRecipe from "./components/EditRecipe";
import Image from "next/image";

const difficulties = ["Fácil", "Media", "Difícil"];
const DEFAULT_IMAGE = "/images/logonutri.png";

export default function EditRecipePage() {
  const { recipeId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes/${recipeId}`
        );

        if (!res.ok) throw new Error("Error al cargar receta");
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !recipe) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecipe({ ...recipe, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!recipe) return;

    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setRecipe({ ...recipe, [name]: target.checked });
    } else {
      setRecipe({ ...recipe, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipe) {
      alert("Los datos de la receta no están cargados.");
      return;
    }

    // Validaciones mínimas
    if (!recipe.name || !recipe.portions || !recipe.prepTime) {
      alert("Por favor, completa todos los campos requeridos");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes/${recipeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...recipe,
            portions: Number(recipe.portions),
            prepTime: Number(recipe.prepTime),
            cookTime: recipe.cookTime ? Number(recipe.cookTime) : null,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al actualizar receta");
      }

      router.push(`/dashboard`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Error en handleSubmit:", err);
        alert(err.message);
      } else {
        console.error("❌ Error desconocido:", err);
        alert("Error inesperado");
      }
    }
  };

  const addIngredient = () => {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      detail: {
        ...recipe.detail!,
        ingredients: [...(recipe.detail?.ingredients || []), ""],
      },
    });
  };

  const removeIngredient = (index: number) => {
    if (!recipe) return;
    const updated = [...(recipe.detail?.ingredients || [])];
    updated.splice(index, 1);
    setRecipe({
      ...recipe,
      detail: { ...recipe.detail!, ingredients: updated },
    });
  };

  const updateIngredient = (index: number, value: string) => {
    if (!recipe) return;
    const updated = [...(recipe.detail?.ingredients || [])];
    updated[index] = value;
    setRecipe({
      ...recipe,
      detail: { ...recipe.detail!, ingredients: updated },
    });
  };

  const addInstruction = () => {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      detail: {
        ...recipe.detail!,
        instructions: [...(recipe.detail?.instructions || []), ""],
      },
    });
  };

  const removeInstruction = (index: number) => {
    if (!recipe) return;
    const updated = [...(recipe.detail?.instructions || [])];
    updated.splice(index, 1);
    setRecipe({
      ...recipe,
      detail: { ...recipe.detail!, instructions: updated },
    });
  };

  const updateInstruction = (index: number, value: string) => {
    if (!recipe) return;
    const updated = [...(recipe.detail?.instructions || [])];
    updated[index] = value;
    setRecipe({
      ...recipe,
      detail: { ...recipe.detail!, instructions: updated },
    });
  };

  if (loading) return <p className="p-4">Cargando receta...</p>;
  if (!recipe) return <p className="p-4">No se encontró la receta.</p>;

  return (
    <main className=" mx-auto p-6 bg-primary shadow rounded-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Pencil className="w-6 h-6 " />
        Editar Receta
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium ">
              Imagen de la receta
            </label>
            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-slate-700 shadow-sm mb-3">
              <Image
                src={recipe.imageUrl || DEFAULT_IMAGE}
                alt={`Imagen de ${recipe.imageUrl}`}
                width={128} // o el tamaño que quieras
                height={128} // o el tamaño que quieras
                className="object-cover w-full h-full"
              />
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-primary px-4 py-2 rounded hover:bg-primary-dark transition">
              <ImageIcon className="w-5 h-5" />
              Cambiar Imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Ingredientes */}
          <EditRecipe
            title="Ingredientes"
            icon={<List className="w-5 h-5" />}
            items={recipe.detail?.ingredients || []}
            onAdd={addIngredient}
            onRemove={removeIngredient}
            onUpdate={updateIngredient}
          />

          {/* Instrucciones */}
          <EditRecipe
            title="Instrucciones"
            icon={<ListOrdered className="w-5 h-5" />}
            items={recipe.detail?.instructions || []}
            onAdd={addInstruction}
            onRemove={removeInstruction}
            onUpdate={updateInstruction}
            isTextarea
          />
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-1">Nombre</label>
            <input
              name="name"
              value={recipe.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* <div>
            <label className="block font-medium mb-1">Etiquetas</label>
            <input
              name="tags"
              value={recipe.tags.join(", ")}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  tags: e.target.value.split(",").map((t) => t.trim()),
                })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div> */}

          <div>
            <label className="block font-medium mb-1">Porciones</label>
            <input
              type="number"
              name="portions"
              value={recipe.portions}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Tiempo preparación</label>
            <input
              type="number"
              name="prepTime"
              value={recipe.prepTime}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Tiempo cocción</label>
            <input
              type="number"
              name="cookTime"
              value={recipe.cookTime || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Dificultad</label>
            <select
              name="difficulty"
              value={recipe.difficulty}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublic"
              checked={recipe.isPublic}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <label className="font-medium flex items-center gap-1 text-slate-700 dark:text-white">
              <Eye className="w-4 h-4" /> Hacer receta pública
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="bg-secondary text-white cursor-pointer px-6 py-3 rounded-lg hover:bg-primary-dark transition w-full"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
