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
          className="
            ml-auto
            flex items-center gap-1
            rounded-md
            bg-secondary
            px-3 py-1.5
            text-sm font-medium text-white
            shadow-sm
            transition-all
            hover:opacity-90 hover:shadow
            active:scale-95 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-secondary
          "
          title="Agregar ingrediente"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>

      </h2>



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
              className="
              flex flex-col md:flex-row gap-2
              items-stretch
              rounded-lg
              border border-slate-200 dark:border-slate-700
              p-3
              bg-primary dark:bg-slate-800
            "
            >

              {/* Cantidad + Unidad */}
              <div className="flex md:w-fill min-w-[180px]">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="w-[35%] px-2 border border-gray-400 rounded-l-md border-r-0 h-[42px]"
                  value={
                    item.cantidad === 0 || item.cantidad == null ? "" : item.cantidad
                  }
                  placeholder="Cant."
                  onChange={(e) => {
                    const value = e.target.value;

                    // Si el usuario borra todo, no mostramos nada, pero guardamos 0 internamente
                    if (value === "") {
                      onUpdate(idx, { ...item, cantidad: 0 });
                      return;
                    }

                    const numberValue = parseFloat(value);

                    // Solo permitir números positivos mayores a 0
                    if (!isNaN(numberValue) && numberValue > 0) {
                      onUpdate(idx, { ...item, cantidad: numberValue });
                    }
                  }}
                  onBlur={(e) => {
                    // Si el usuario deja el campo vacío al salir, forzamos el valor 0 internamente
                    if (e.target.value === "") {
                      onUpdate(idx, { ...item, cantidad: 0 });
                    }
                  }}
                />

                <div className="w-[160px]"><Select
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
                /></div>

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
                  <div className="grid grid-cols-4 gap-2 text-sm text-slate-900 dark:text-slate-300">
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
                          className="bg-slate-200 dark:bg-slate-700 rounded-md p-1 text-center"
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
              <div className="flex md:w-auto w-full justify-end items-start pt-1">
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="
                    group
                    flex items-center justify-center
                    w-9 h-9
                    rounded-full
                    bg-red-50 dark:bg-red-900/30
                    text-red-500
                    transition-all duration-200
                    hover:bg-red-500 hover:text-white
                    focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer
                  "
                  title="Eliminar ingrediente"
                >
                  <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                </button>
              </div>

            </li>
          );
        })}
      </ul>
    </div>
  );
}
