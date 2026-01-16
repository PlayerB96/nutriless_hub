"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  isTextarea?: boolean;
}

export default function EditableTextList({
  title,
  icon,
  items,
  onAdd,
  onRemove,
  onUpdate,
  isTextarea = false,
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
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

      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="
                flex gap-3 items-start
                rounded-lg
                border border-slate-200 dark:border-slate-700
                bg-primary dark:bg-slate-800
                p-3
              "
          >

            {/* Número iterativo */}
            <div className="pt-2 text-slate-400 font-medium w-6 text-right select-none">
              {idx + 1}.
            </div>


            {/* Input o Textarea */}
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
                className="
                  flex-1
                  rounded-md
                  border border-slate-300 dark:border-slate-600
                  bg-transparent
                  px-3 py-2
                  text-sm
                  focus:outline-none focus:ring-2 focus:ring-secondary
                "
              />

            )}

            {/* Botón eliminar */}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="
                group
                mt-1
                flex items-center justify-center
                w-9 h-9
                rounded-full
                bg-red-50 dark:bg-red-900/30
                text-red-500
                transition-all duration-200
                hover:bg-red-500 hover:text-white
                focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer
              "
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>


          </li>
        ))}
      </ul>
    </div>
  );
}
