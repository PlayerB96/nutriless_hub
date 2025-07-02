"use client";

import React from "react";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import { TraditionalFood } from "@/domain/models/traditional-food";

interface Props {
  title: string;
  icon: React.ReactNode;
  items: TraditionalFood[];
  availableFoods: TraditionalFood[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: TraditionalFood) => void;
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

      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2 items-center">
            <div className="min-w-[250px] w-full">
              <Select
                options={foodOptions}
                value={foodOptions.find((opt) => opt.value === item.id)}
                onChange={(selected) => {
                  const food = availableFoods.find(
                    (f) => f.id === selected?.value
                  );
                  if (food) onUpdate(idx, food);
                }}
                classNames={{
                  control: () =>
                    "bg-primary text-text-alt border rounded px-2 py-1 text-sm",
                  singleValue: () => "text-text whitespace-normal break-words",
                  menu: () => "bg-primary z-50 text-sm",
                  option: ({ isFocused }) =>
                    `px-3 py-2 cursor-pointer break-words ${
                      isFocused ? "bg-secondary text-white" : "text-text"
                    }`,
                  dropdownIndicator: () => "text-text",
                  input: () => "text-text",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
