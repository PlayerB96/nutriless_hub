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
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-text dark:text-text">
        {icon} {title}
        <button
          type="button"
          onClick={onAdd}
          className="ml-auto text-sm bg-secondary text-white py-1 px-2 rounded flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </h2>

      {/* Cabecera (solo visible en desktop) */}
      <div className="hidden md:flex text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
        <div className="w-[30%] min-w-[200px] flex">
          <span className="w-[35%]">Cantidad</span>
          <span className="w-[65%]">Unidad</span>
        </div>
        <div className="w-[65%]">Alimento</div>
        <div className="w-auto text-center">Acciones</div>
      </div>

      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex flex-col md:flex-row gap-1 items-stretch"
          >
            {/* Cantidad + Unidad */}
            <div className="flex md:w-[30%] w-full min-w-[180px]">
              <input
                type="number"
                min="0.1"
                step="0.1"
                className="w-[35%] px-2 py-2 border rounded-l-md border-r-0"
                value={
                  item.cantidad != null
                    ? item.cantidad
                    : item.householdMeasures?.find(
                        (m) => m.id === item.tipoMedida
                      )?.quantity ?? ""
                }
                placeholder="Cant."
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0.1) {
                    onUpdate(idx, { ...item, cantidad: value });
                  }
                }}
              />

              <select
                className="w-[65%] px-2 py-2 border rounded-r-md"
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
                    ? "Sin medidas"
                    : "Unidad"}
                </option>
                {item.householdMeasures?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {`${m.description} (${m.weightGrams}g)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Select de alimento */}
            <div className="md:w-[65%] w-full">
              <Select
                options={foodOptions}
                value={foodOptions.find((opt) => opt.value === item.id)}
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    cursor: "pointer",
                    minHeight: "42px",
                    borderRadius: "0.5rem",
                  }),
                  option: (base) => ({ ...base, cursor: "pointer" }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                onChange={(selected) => {
                  const food = availableFoods.find(
                    (f) => f.id === selected?.value
                  );
                  if (food) {
                    const medidaSeleccionada =
                      food.householdMeasures?.find(
                        (m) => m.id === item.tipoMedida
                      ) || food.householdMeasures?.[0];

                    onUpdate(idx, {
                      ...food,
                      householdMeasures: food.householdMeasures ?? [],
                      cantidad: item.cantidad || 0,
                      tipoMedida: medidaSeleccionada
                        ? medidaSeleccionada.id
                        : 0,
                      medida: medidaSeleccionada
                        ? { ...medidaSeleccionada, foodId: food.id }
                        : ({} as TraditionalHouseholdMeasure),
                    });
                  }
                }}
              />
            </div>

            {/* Botón eliminar */}
            <div className="flex md:w-auto w-full justify-end items-center">
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
