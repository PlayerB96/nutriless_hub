import React from "react";
import { Food } from "@/domain/models/food";
import { Salad } from "lucide-react";

type Props = {
  food: Food;

};

export default function FoodDetails({ food }: Props) {
  return (
    <tr className="hover:bg-gray-200 dark:hover:bg-slate-900 text-sm">
      <td
        colSpan={4}
        className="px-6 py-4 border-t text-gray-700 dark:text-gray-200"
      >
        <div className="space-y-3">
          {/* DETALLES NUTRICIONALES */}
          <div>
            <h4 className="font-semibold mb-1 flex items-center gap-2">
              <Salad size={16} />
              Detalles nutricionales:
            </h4>

            {food.nutritionDetails.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {food.nutritionDetails.map((n) => (
                  <li key={n.id} className="flex items-center gap-2">
                    <span>{n.nutrient}:</span>
                    <span>
                      {n.value}
                    </span>

                    <span>{n.unit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sin información nutricional.</p>
            )}
          </div>

          {/* MEDIDAS CASERAS */}
          <div>
            <h4 className="font-semibold mb-1">🥄 Medidas caseras:</h4>
            {food.householdMeasures.length > 0 ? (
              <ul className="list-disc list-inside">
                {food.householdMeasures.map((m) => (
                  <li key={m.id}>
                    {m.description} = {m.quantity} unidad(es) ≈ {m.weightGrams}{" "}
                    g
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sin medidas caseras disponibles.</p>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
