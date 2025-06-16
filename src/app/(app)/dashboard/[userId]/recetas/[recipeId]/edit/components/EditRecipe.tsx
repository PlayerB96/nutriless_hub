// components/EditableList.tsx
"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface EditRecipe {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  isTextarea?: boolean;
}

export default function EditableList({
  title,
  icon,
  items,
  onAdd,
  onRemove,
  onUpdate,
  isTextarea = false,
}: EditRecipe) {
  return (
    <div>
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
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
          <li key={idx} className="flex gap-2 items-start">
            {isTextarea ? (
              <textarea
                value={item}
                onChange={(e) => onUpdate(idx, e.target.value)}
                className="flex-1 border px-3 py-1 rounded resize-none"
                rows={2}
              />
            ) : (
              <input
                type="text"
                value={item}
                onChange={(e) => onUpdate(idx, e.target.value)}
                className="flex-1 border px-3 py-1 rounded"
              />
            )}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mt-1" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
