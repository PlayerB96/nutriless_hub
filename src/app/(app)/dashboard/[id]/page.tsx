// dashboard/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";

type NutritionDetail = {
  id: number;
  nutrient: string;
  value: number;
  unit: string;
};

type HouseholdMeasure = {
  id: number;
  description: string;
  quantity: number;
  weightGrams: number;
};

type Food = {
  id: number;
  name: string;
  category: string;
  createdAt: string;
  imageUrl?: string | null;
  nutritionDetails: NutritionDetail[];
  householdMeasures: HouseholdMeasure[];
};
type Props = {
  params: Promise<{ id: string }>; // params es ahora una Promise
};

export default function DashboardUserFoodsPage({ params }: Props) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { id } = React.use(params);

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

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Alimentos</h1>

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
            {foods.map((food) => (
              <React.Fragment key={food.id}>
                <tr
                  className="hover:bg-gray-200 dark:hover:bg-slate-900 cursor-pointer"
                  onClick={() => toggleExpand(food.id)}
                >
                  <td className="border px-4 py-2">{food.name}</td>
                  <td className="border px-4 py-2">{food.category}</td>
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
                </tr>

                {expandedId === food.id && (
                  <tr className="hover:bg-gray-200 dark:hover:bg-slate-900 text-sm">
                    <td
                      colSpan={4}
                      className="px-6 py-4 border-t text-gray-700 dark:text-gray-200"
                    >
                      <div className="space-y-3">
                        {/* DETALLES NUTRICIONALES */}
                        <div>
                          <h4 className="font-semibold mb-1">
                            🧬 Detalles nutricionales:
                          </h4>
                          {food.nutritionDetails.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {food.nutritionDetails.map((n) => (
                                <li key={n.id}>
                                  {n.nutrient}: {n.value} {n.unit}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500">
                              Sin información nutricional.
                            </p>
                          )}
                        </div>

                        {/* MEDIDAS CASERAS */}
                        <div>
                          <h4 className="font-semibold mb-1">
                            🥄 Medidas caseras:
                          </h4>
                          {food.householdMeasures.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {food.householdMeasures.map((m) => (
                                <li key={m.id}>
                                  {m.description} = {m.quantity} unidad(es) ≈{" "}
                                  {m.weightGrams} g
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500">
                              Sin medidas caseras disponibles.
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
