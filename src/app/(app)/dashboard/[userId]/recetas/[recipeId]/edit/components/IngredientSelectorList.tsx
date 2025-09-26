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
          className="ml-auto text-sm bg-secondary text-white py-1 px-2 rounded flex items-center gap-1 cursor-pointer
             transition-colors duration-300 ease-in-out 
             hover:bg-secondary hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </h2>

      {/* Cabecera (solo desktop) */}
      <div className="hidden md:flex text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
        <div className="w-[30%] min-w-[200px] flex">
          <span className="w-[35%]">Cantidad</span>
          <span className="w-[65%]">Unidad de Consumo</span>
        </div>
        <div className="w-[65%]">Alimento</div>
        <div className="w-auto text-center">Acciones</div>
      </div>

      <ul className="space-y-4">
        {items.map((item, idx) => {
          // Opciones de unidad solo para este item
          const medidaOptions =
            item.householdMeasures?.map((m) => ({
              value: m.id,
              label: `${m.description} (${m.weightGrams}g)`,
            })) || [];

          return (
            <li
              key={idx}
              className="flex flex-col md:flex-row gap-1 items-stretch"
            >
              {/* Cantidad + Unidad */}
              <div className="flex md:w-[30%] w-full min-w-[180px]">
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-[35%] px-2  border border-gray-400 rounded-l-md border-r-0 h-[42px]"
                  value={
                    item.cantidad != null
                      ? item.cantidad
                      : item.householdMeasures?.find(
                        (m) => m.id === item.tipoMedida
                      )?.quantity ?? ""
                  }
                  placeholder="Cant."
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      // Permitir borrar
                      onUpdate(idx, { ...item, cantidad: 0 });
                      return;
                    }
                    const numberValue = parseFloat(value);
                    if (!isNaN(numberValue) && numberValue >= 0.1) {
                      onUpdate(idx, { ...item, cantidad: numberValue });
                    }
                  }}

                />

                <Select
                  options={medidaOptions}
                  value={
                    medidaOptions.find((opt) => opt.value === item.tipoMedida) ||
                    null
                  }
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({
                      ...base,
                      cursor: "pointer",
                      minHeight: "42px",
                      height: "42px",
                      borderRadius: "0 0.5rem 0.5rem 0", // lado derecho solo
                      borderLeft: "0", // unir con input
                      backgroundColor: "var(--primary)",
                      color: "var(--text)",
                      borderColor: "var(--secondary)",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "var(--text)",
                    }),
                    option: (base, state) => ({
                      ...base,
                      cursor: "pointer",
                      backgroundColor: state.isFocused
                        ? "var(--secondary)"
                        : "var(--primary)",
                      color: "var(--text)",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "var(--primary)",
                      borderRadius: "0.5rem",
                      zIndex: 9999,
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  onChange={(selected) => {
                    if (!selected) return;
                    const medidaSeleccionada = item.householdMeasures?.find(
                      (m) => m.id === selected.value
                    );
                    if (!medidaSeleccionada) return;
                    onUpdate(idx, {
                      ...item,
                      tipoMedida: medidaSeleccionada.id,
                      cantidad: medidaSeleccionada.quantity,
                      medida: { ...medidaSeleccionada, foodId: item.id },
                    });
                  }}
                  isDisabled={
                    !item.householdMeasures || item.householdMeasures.length === 0
                  }
                />
              </div>

              {/* Alimento + Macronutrientes */}
              <div className="md:w-[65%] w-full flex flex-col gap-1">
                <div className="h-[42px]">
                  <Select
                    options={foodOptions}
                    value={
                      foodOptions.find((opt) => opt.value === item.id) || null
                    }
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        cursor: "pointer",
                        minHeight: "42px",
                        height: "42px",
                        borderRadius: "0.5rem",
                        backgroundColor: "var(--primary)",
                        color: "var(--text)",
                        borderColor: "var(--secondary)",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--text)",
                      }),
                      option: (base, state) => ({
                        ...base,
                        cursor: "pointer",
                        backgroundColor: state.isFocused
                          ? "var(--secondary)"
                          : "var(--primary)",
                        color: "var(--text)",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "var(--primary)",
                        borderRadius: "0.5rem",
                        zIndex: 9999,
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    onChange={(selected) => {
                      if (!selected) return;
                      const food = availableFoods.find(
                        (f) => f.id === selected.value
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

                {/* Macronutrientes */}
                {item?.nutrients && item.nutrients.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {["kcal", "fat", "carbs", "protein"].map((nutr) => {
                      const getNutrientValue = () => {
                        const totalGrams =
                          item.cantidad && item.medida?.weightGrams
                            ? item.cantidad * item.medida.weightGrams
                            : 100;

                        const n = item.nutrients.find((n) => {
                          const name = n.nutrient.toLowerCase();
                          if (nutr === "kcal")
                            return n.unit.toLowerCase() === "kcal";
                          if (nutr === "fat")
                            return [
                              "grasa total",
                              "grasas",
                              "lipidos",
                            ].includes(name);
                          if (nutr === "carbs")
                            return [
                              "carbohidratos totales",
                              "carbohidratos",
                              "hidratos de carbono",
                            ].includes(name);
                          if (nutr === "protein")
                            return [
                              "proteínas",
                              "proteinas",
                              "protein",
                            ].includes(name);
                          return false;
                        });

                        if (!n) return null;

                        const valuePer100g = n.value || 0;
                        const scaledValue = (valuePer100g * totalGrams) / 100;

                        return {
                          value:
                            nutr === "kcal"
                              ? Math.round(scaledValue)
                              : Math.round(scaledValue * 10) / 10,
                          unit: nutr === "kcal" ? "kcal" : "g",
                        };
                      };

                      const result = getNutrientValue();

                      return (
                        <div
                          key={nutr}
                          className="bg-slate-100 dark:bg-slate-700 rounded-md p-1 text-center"
                        >
                          <p className="font-semibold">
                            {result ? `${result.value}${result.unit}` : "-"}
                          </p>
                          <span className="uppercase text-[10px] tracking-wide">
                            {nutr === "kcal"
                              ? "KCAL"
                              : nutr === "fat"
                                ? "GRA"
                                : nutr === "carbs"
                                  ? "CHO"
                                  : "PRO"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
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
          );
        })}
      </ul>
    </div>
  );
}
