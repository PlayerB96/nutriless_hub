"use client";

import React from "react";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import { TraditionalFood } from "@/domain/models/traditional-food";
import { TraditionalHouseholdMeasure } from "@prisma/client";
type EnrichedIngredient = TraditionalFood & {
  cantidad: number;
  tipoMedida: number;
  medida: TraditionalHouseholdMeasure;
};

interface Props {
  title: string;
  icon: React.ReactNode;
  items: EnrichedIngredient[];
  availableFoods: TraditionalFood[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: EnrichedIngredient) => void;
}

export default function IngredientSelectorList({
  title,
  icon,
  items,
  availableFoods,
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  const foodOptions = availableFoods.map((food) => ({
    value: food.id,
    label: food.name,
  }));

  return (
    <div>
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-text dark:text-text">
        {icon} {title}
        <button
          type="button"
          onClick={onAdd}
          className="ml-auto text-sm bg-secondary text-white py-1 px-2 rounded flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </h2>

      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex flex-wrap gap-4 items-end md:items-center"
          >
            {/* Select de comida */}
            <div className="w-full md:flex-[2]">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                Selecciona alimento
              </label>
              <Select
                options={foodOptions}
                value={foodOptions.find((opt) => opt.value === item.id)}
                onChange={(selected) => {
                  const food = availableFoods.find(
                    (f) => f.id === selected?.value
                  );
                  if (food) {
                    const medidaSeleccionada = food.householdMeasures?.find(
                      (m) => m.id === item.tipoMedida
                    );
                    if (!medidaSeleccionada) return;
                    onUpdate(idx, {
                      ...food,
                      cantidad: item.cantidad,
                      tipoMedida: item.tipoMedida,
                      medida: {
                        ...medidaSeleccionada,
                        foodId: food.id,
                      },
                    });
                  }
                }}
                styles={{
                  control: (base) => ({ ...base, cursor: "pointer" }),
                  option: (base) => ({ ...base, cursor: "pointer" }),
                }}
              />
            </div>

            {/* Input de cantidad */}
            <div className="w-full md:flex-1">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                Cantidad
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                className="w-full px-2 py-1 border rounded"
                value={
                  item.cantidad != null
                    ? item.cantidad
                    : item.householdMeasures?.find(
                        (m) => m.id === item.tipoMedida
                      )?.quantity ?? ""
                }
                placeholder="Cantidad"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0.1) {
                    onUpdate(idx, { ...item, cantidad: value });
                  }
                }}
              />
            </div>

            {/* Select de unidad */}
            <div className="w-full md:flex-[1.5]">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                Unidad / Medida
              </label>
              <select
                className="w-full px-2 py-1 border rounded"
                value={item.tipoMedida ?? ""}
                onChange={(e) => {
                  const nuevaMedidaId = parseInt(e.target.value);
                  const medidaSeleccionada = item.householdMeasures?.find(
                    (m) => m.id === nuevaMedidaId
                  );
                  if (!medidaSeleccionada) return;
                  onUpdate(idx, {
                    ...item,
                    tipoMedida: nuevaMedidaId,
                    cantidad: medidaSeleccionada.quantity,
                    medida: {
                      ...medidaSeleccionada,
                      foodId: item.id,
                    },
                  });
                }}
                disabled={
                  !item.householdMeasures || item.householdMeasures.length === 0
                }
              >
                <option value="" disabled>
                  {!item.householdMeasures ||
                  item.householdMeasures.length === 0
                    ? "Sin medidas disponibles"
                    : "Selecciona unidad"}
                </option>
                {item.householdMeasures?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {`${m.description} (${m.weightGrams}g)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón eliminar */}
            <div className="w-full md:w-10 flex justify-center items-center">
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-6 h-6 mt-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
