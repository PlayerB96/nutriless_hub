"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Recipe } from "@/domain/models/recipe";
import Swal from "sweetalert2";

import {
  Pencil,
  Eye,
  List,
  ListOrdered,
  ImageIcon,
  ClipboardSignature,
  Timer,
  UtensilsCrossed,
  Users,
  GaugeCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { TraditionalFood } from "@/domain/models/traditional-food";
import EditableTextList from "./components/EditableTextList";
import IngredientSelectorList from "./components/IngredientSelectorList";
import { TraditionalHouseholdMeasure } from "@prisma/client";
type EnrichedIngredient = TraditionalFood & {
  cantidad: number;
  tipoMedida: number;
  medida: TraditionalHouseholdMeasure;
};

const difficulties = ["Fácil", "Media", "Difícil"];
const DEFAULT_IMAGE = "/images/receta_defecto.png";
import { confirmAction } from "@/components/ui/confirmAction";

export default function EditRecipePage() {
  const { recipeId, userId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [availableFoods, setAvailableFoods] = useState<TraditionalFood[]>([]);
  const [macros, setMacros] = useState({
    calories: 0,
    fat: 0,
    carbs: 0,
    protein: 0,
  });

  // 🔹 Fetch alimentos disponibles
  useEffect(() => {
    const fetchFoods = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/foods/organicos`
      );
      const data = await res.json();
      setAvailableFoods(data);
    };

    if (userId) fetchFoods();
  }, [userId]);

  // 🔹 Fetch receta
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

  // 🔹 Función para calcular macros
  const calculateMacros = React.useCallback(() => {
    if (!recipe) return { calories: 0, fat: 0, carbs: 0, protein: 0 };

    let calories = 0;
    let fat = 0;
    let carbs = 0;
    let protein = 0;

    const ingredients =
      (recipe.detail?.ingredients as (TraditionalFood & {
        medida: TraditionalHouseholdMeasure;
        cantidad: number;
      })[]) || [];

    ingredients.forEach((ingredient) => {
      // ✅ Verificamos que cantidad y medida existan
      if (!ingredient.cantidad || !ingredient.medida) return;

      const totalGrams = ingredient.cantidad * ingredient.medida.weightGrams;
      // console.log(`🍴 ${ingredient.name}: ${ingredient.cantidad} x ${ingredient.medida.weightGrams} = ${totalGrams} g`);

      (ingredient.nutrients || []).forEach((nutrient) => {
        const valuePer100g = nutrient.value || 0; // valor por 100g
        const scaledValue = (valuePer100g * totalGrams) / 100; // regla de 3 simple
        const nutrientName = nutrient.nutrient.toLowerCase();
        const unit = nutrient.unit?.toLowerCase() || "";

        switch (nutrientName) {
          case "energía":
            if (unit === "kcal") calories += scaledValue;
            break;
          case "grasa total":
          case "grasas":
          case "lipidos":
            fat += scaledValue;
            break;
          case "carbohidratos totales":
          case "carbohidratos":
          case "hidratos de carbono":
            carbs += scaledValue;
            break;
          case "proteínas":
          case "proteinas":
            protein += scaledValue;
            break;
          default:
            break; // otros micronutrientes los ignoramos
        }
      });
    });

    return {
      calories: Math.round(calories),
      fat: Math.round(fat * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      protein: Math.round(protein * 10) / 10,
    };
  }, [recipe]);

  // 🔹 Actualizar macros cada vez que cambien los ingredientes
  useEffect(() => {
    setMacros(calculateMacros());
  }, [calculateMacros]);

  // 🔹 Handlers y helpers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !recipe) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecipe({ ...recipe, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!recipe) return;

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        await Swal.fire(
          "Error",
          `No se pudo eliminar: ${data.message}`,
          "error"
        );
        return;
      }
      await Swal.fire(
        "Eliminado",
        "La receta fue eliminada correctamente.",
        "success"
      );
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al eliminar receta:", error);
      await Swal.fire(
        "Error",
        "Ocurrió un error al eliminar la receta.",
        "error"
      );
    }
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
    if (!recipe) return alert("Los datos de la receta no están cargados.");
    if (!recipe.name || !recipe.portions || !recipe.prepTime)
      return alert("Por favor, completa todos los campos requeridos");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...recipe,
            portions: Number(recipe.portions),
            prepTime: Number(recipe.prepTime),
            cookTime: recipe.cookTime ? Number(recipe.cookTime) : null,
            detail: {
              ingredients: recipe.detail?.ingredients || [],
              instructions: recipe.detail?.instructions || [],
            },
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al actualizar receta");
      }
      router.push(`/dashboard`);
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Error inesperado");
      console.error(err);
    }
  };

  const addIngredient = () => {
    if (!recipe) return;
    const newIngredient: EnrichedIngredient = {
      id: 0,
      name: "",
      category: "",
      createdAt: new Date().toISOString(),
      nutrients: [],
      householdMeasures: [], // 👈 aseguramos que exista aunque esté vacío
      cantidad: 0,
      tipoMedida: 0,
      medida: {} as TraditionalHouseholdMeasure, // inicial vacío
    };
    setRecipe({
      ...recipe,
      detail: {
        ...recipe.detail!,
        ingredients: [...(recipe.detail?.ingredients || []), newIngredient],
      },
    });
  };

  const removeIngredient = async (index: number) => {
    if (!recipe) return;

    // Llamamos al helper reutilizable
    const result = await confirmAction({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el ingrediente seleccionado.",
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const updated = [...(recipe.detail?.ingredients || [])];
      updated.splice(index, 1);
      setRecipe({
        ...recipe,
        detail: { ...recipe.detail!, ingredients: updated },
      });
    }
  };

  const updateIngredient = (index: number, value: TraditionalFood) => {
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

  const removeInstruction = async (index: number) => {
    if (!recipe) return;

    // Llamamos al helper reutilizable
    const result = await confirmAction({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la instrucción seleccionada.",
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const updated = [...(recipe.detail?.instructions || [])];
      updated.splice(index, 1);
      setRecipe({
        ...recipe,
        detail: { ...recipe.detail!, instructions: updated },
      });
    }
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
    <main className="mx-auto p-6 bg-primary shadow rounded-2xl">
      {/* Botón eliminar */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
        >
          <Trash2 className="w-5 h-5" />
          Eliminar receta
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Pencil className="w-6 h-6" />
        Editar Receta
      </h1>

      {/* Cabecera macronutrientes */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🔥 Calorías
          </p>
          <p className="font-bold text-lg">{macros.calories} kcal</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🥑 Grasas
          </p>
          <p className="font-bold text-lg">{macros.fat} g</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🍞 Carbohidratos
          </p>
          <p className="font-bold text-lg">{macros.carbs} g</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🍗 Proteínas
          </p>
          <p className="font-bold text-lg">{macros.protein} g</p>
        </div>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        {/* Columna izquierda: Imagen, Ingredientes, Instrucciones */}
        <div className="space-y-6 md:col-span-2">
          {/* Imagen */}
          <div>
            <label className="text-sm font-medium inline-flex gap-2">
              <ImageIcon className="w-5 h-5" />
              Imagen de la receta
            </label>
            <div className="relative w-full h-82 rounded-lg overflow-hidden border border-gray-300 dark:border-slate-700 shadow-sm mb-3">
              <Image
                src={recipe.image || DEFAULT_IMAGE}
                alt={`Imagen de ${recipe.name}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-primary px-4 py-2 rounded hover:bg-primary-dark transition">
              <RefreshCw className="w-5 h-5" />
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
          <IngredientSelectorList
            title="Ingredientes"
            icon={<List className="w-5 h-5" />}
            items={recipe.detail?.ingredients as EnrichedIngredient[]}
            onAdd={addIngredient}
            onRemove={removeIngredient}
            onUpdate={updateIngredient}
            availableFoods={availableFoods}
          />

          {/* Instrucciones */}
          <EditableTextList
            title="Instrucciones"
            icon={<ListOrdered className="w-5 h-5" />}
            items={recipe.detail?.instructions || []}
            onAdd={addInstruction}
            onRemove={removeInstruction}
            onUpdate={updateInstruction}
            isTextarea
          />
        </div>

        {/* Columna derecha: Datos receta */}
        <div className="space-y-6 p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1">
          {/* Nombre */}
          <div>
            <label className=" text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
              <ClipboardSignature className="w-4 h-4" />
              Nombre de la receta
            </label>
            <input
              name="name"
              value={recipe.name}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400"
              placeholder="Ej: Tacu Tacu"
              required
            />
          </div>

          {/* Porciones */}
          <div>
            <label className=" text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Porciones
            </label>
            <input
              type="number"
              name="portions"
              value={recipe.portions}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              placeholder="Ej: 4"
              required
            />
          </div>

          {/* Tiempo preparación */}
          <div>
            <label className=" text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
              <Timer className="w-4 h-4" />
              Tiempo de preparación (min)
            </label>
            <input
              type="number"
              name="prepTime"
              value={recipe.prepTime}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              placeholder="Ej: 15"
              required
            />
          </div>

          {/* Tiempo cocción */}
          <div>
            <label className=" text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
              <UtensilsCrossed className="w-4 h-4" />
              Tiempo de cocción (min)
            </label>
            <input
              type="number"
              name="cookTime"
              value={recipe.cookTime || ""}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              placeholder="Ej: 30"
            />
          </div>

          {/* Dificultad */}
          <div>
            <label className=" text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
              <GaugeCircle className="w-4 h-4" />
              Dificultad
            </label>
            <select
              name="difficulty"
              value={recipe.difficulty}
              onChange={handleChange}
              className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          {/* Público */}
          <div className="flex items-center gap-3 mt-4">
            <input
              type="checkbox"
              name="isPublic"
              checked={recipe.isPublic}
              onChange={handleChange}
              className="h-5 w-5 accent-secondary"
            />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Hacer receta pública
            </label>
          </div>

          {/* Guardar */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/80 transition text-white font-semibold py-3 px-4 rounded-xl shadow-sm cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
