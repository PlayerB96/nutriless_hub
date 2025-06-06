import React from "react";
import { Salad } from "lucide-react";
import { TraditionalFood } from "@/domain/models/traditional-food";

type Props = {
  food: TraditionalFood;
};

export default function TraditionFoodDetails({ food }: Props) {
  return (
    <tr className="hover:bg-gray-200 dark:hover:bg-slate-900 text-sm">
      <td
        colSpan={5}
        className="px-6 py-4 border-t text-gray-700 dark:text-gray-200"
      >
        <div className="space-y-3">
          {/* Detalles nutricionales */}
          <div>
            <h4 className="font-semibold mb-1 flex items-center gap-2">
              <Salad size={16} />
              Detalles nutricionales:
            </h4>

            {food.nutrients.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {food.nutrients.map((n) => (
                  <li key={n.id} className="flex items-center gap-2">
                    <span>{n.nutrient}:</span>
                    <span>{n.value}</span>
                    <span>{n.unit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                Sin información nutricional disponible.
              </p>
            )}
          </div>

          {/* Información adicional del alimento */}
          <div>
            <h4 className="font-semibold mb-1">📍 Origen:</h4>
            <p className="text-gray-600 dark:text-gray-300">
              {food.origin || "No especificado"}
            </p>
          </div>

          {food.imageUrl && (
            <div>
              <h4 className="font-semibold mb-1">🖼️ Imagen:</h4>
              <img
                src={food.imageUrl}
                alt={`Imagen de ${food.name}`}
                className="w-32 h-auto rounded border"
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
