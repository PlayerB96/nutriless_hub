// components/RecetaDetalle.tsx
"use client";

import { useEffect, useState } from "react";

type Receta = {
  id: string;
  name: string;
  tags: string[];
  portions: number;
  prepTime: number;
  cookTime: number | null;
  difficulty: string;
  isPublic: boolean;
};

export default function RecetaDetalle({ id }: { id: string }) {
  const [receta, setReceta] = useState<Receta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceta = async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar la receta");
        const data = await res.json();
        setReceta(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceta();
  }, [id]);

  if (loading) return <p>Cargando receta...</p>;
  if (!receta) return <p>No se encontró la receta.</p>;

  return (
    <div className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow">
      <h2 className="text-xl font-bold mb-2">{receta.name}</h2>
      <p>
        <strong>Porciones:</strong> {receta.portions}
      </p>
      <p>
        <strong>Tiempo de preparación:</strong> {receta.prepTime} min
      </p>
      {receta.cookTime !== null && (
        <p>
          <strong>Tiempo de cocción:</strong> {receta.cookTime} min
        </p>
      )}
      <p>
        <strong>Dificultad:</strong> {receta.difficulty}
      </p>
      <p>
        <strong>Es pública:</strong> {receta.isPublic ? "Sí" : "No"}
      </p>
      <div className="mt-2">
        <strong>Etiquetas:</strong>
        <ul className="list-disc list-inside">
          {receta.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
