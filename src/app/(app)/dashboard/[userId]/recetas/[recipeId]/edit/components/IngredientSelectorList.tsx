"use client";

import React from "react";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import { TraditionalFood } from "@/domain/models/traditional-food";

interface Props {
  title: string;
  icon: React.ReactNode;
  items: TraditionalFood[]; // ⬅️ cada item también tendrá `cantidad` y `tipoMedida`
  availableFoods: TraditionalFood[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: TraditionalFood) => void;
}

const getMedidasParaItem = (item: TraditionalFood) => {
  return item.householdMeasures?.length
    ? item.householdMeasures.map((m) => ({
        id: m.id,
        label: `${m.description} (${m.weightGrams}g)`,
      }))
    : [];
};

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

      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex flex-wrap md:flex-nowrap gap-2 items-center"
          >
            {/* Select de comida */}
            <div className="min-w-[250px] w-full">
              <Select
                options={foodOptions}
                value={foodOptions.find((opt) => opt.value === item.id)}
                onChange={(selected) => {
                  const food = availableFoods.find(
                    (f) => f.id === selected?.value
                  );
                  if (food) {
                    onUpdate(idx, {
                      ...food,
                      cantidad: item.cantidad,
                      tipoMedida: item.tipoMedida,
                    });
                  }
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    cursor: "pointer",
                  }),
                  option: (base) => ({
                    ...base,
                    cursor: "pointer",
                  }),
                }}
              />
            </div>

            {/* Input de cantidad */}
            <input
              type="number"
              min="0.1"
              step="0.1"
              className="w-24 px-2 py-1 border rounded"
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
                  onUpdate(idx, {
                    ...item,
                    cantidad: value,
                  });
                }
              }}
            />

            {/* Select de unidad */}
            <select
              className="w-40 px-2 py-1 border rounded"
              value={item.tipoMedida ?? ""}
              onChange={(e) => {
                const nuevaMedidaId = parseInt(e.target.value);
                const medidaSeleccionada = item.householdMeasures?.find(
                  (m) => m.id === nuevaMedidaId
                );
                onUpdate(idx, {
                  ...item,
                  tipoMedida: nuevaMedidaId,
                  cantidad: item.cantidad ?? medidaSeleccionada?.quantity ?? 1,
                });
              }}
              disabled={getMedidasParaItem(item).length === 0}
            >
              <option value="" disabled>
                {getMedidasParaItem(item).length === 0
                  ? "Sin medidas disponibles"
                  : "Selecciona unidad"}
              </option>
              {getMedidasParaItem(item).map((medida) => (
                <option key={medida.id} value={medida.id}>
                  {medida.label}
                </option>
              ))}
            </select>

            {/* Botón eliminar */}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
