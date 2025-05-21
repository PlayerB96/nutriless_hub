"use client";

import { ImageUp } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState, useMemo, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

type Categoria = {
  id: number;
  name: string;
};

const nutrientesOpcionales = ["Calcio", "Vitamina A", "Hierro", "Magnesio"];

const camposNutricionalesIniciales = [
  { key: "gramos", label: "por Cada (gramos)" },
  { key: "calorias", label: "Calorías (kcal)" },
  { key: "proteinas", label: "Proteínas (gr)" },
  { key: "carbohidratos", label: "Carbohidratos (gr)" },
  { key: "grasas", label: "Grasas (gr)" },
];
interface FormularioAlimentoProps {
  onSubmitSuccess: () => void;
  onCancel?: () => void; // opcional si quieres
}

export default function FormularioAlimento({
  onSubmitSuccess,
  onCancel,
}: FormularioAlimentoProps) {
  const { data: session } = useSession();
  // const userId = session?.user?.id;
  const userId = (session?.user as { id: string }).id;

  const [nombre, setNombre] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);

  const [dropdownCategoriaAbierto, setDropdownCategoriaAbierto] =
    useState(false);

  const [nutrienteFiltro, setNutrienteFiltro] = useState("");
  const [dropdownNutrienteAbierto, setDropdownNutrienteAbierto] =
    useState(false);

  const [detalleNutricional, setDetalleNutricional] = useState<
    Record<string, string>
  >({
    gramos: "",
    calorias: "",
    proteinas: "",
    carbohidratos: "",
    grasas: "",
  });

  const [nutrientesExtras, setNutrientesExtras] = useState<string[]>([]);

  const refCategoria = useRef<HTMLDivElement>(null);
  const refNutriente = useRef<HTMLDivElement>(null);

  const [loadingButton, setLoadingButton] = useState(false);

  const [imagen, setImagen] = useState<File | null>(null);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImagen(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoriaSeleccionada) {
      alert("Por favor selecciona una categoría.");
      return;
    }

    setLoadingButton(true); // inicia animación

    try {
      const formData = new FormData();

      formData.append("name", nombre);
      formData.append("category", categoriaSeleccionada.name);
      formData.append("userId", String(userId));

      // Detalle nutricional (objeto) lo convertimos a JSON string
      formData.append("nutritionDetails", JSON.stringify(detalleNutricional));

      // Medidas del hogar (array), lo convertimos a JSON string también
      formData.append("householdMeasures", JSON.stringify([])); // Cambia si tienes medidas reales

      // Imagen (File)
      if (imagen) {
        formData.append("image", imagen); // aquí 'imagen' debe ser un File
      }

      const res = await fetch("/api/foods", {
        method: "POST",
        body: formData, // aquí no pones headers con content-type, el browser lo asigna
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Alimento creado:", data);
        onSubmitSuccess?.(); // cerrar modal, limpiar, etc.
        toast.success("Alimento agregado correctamente ✅");
      } else {
        const error = await res.json();
        console.error("Error:", error.message);
        toast.error("Error: " + error.message);
      }
    } catch (err) {
      toast.error("Error al enviar formulario");
      console.error(err);
    } finally {
      setLoadingButton(false); // termina animación
    }
  };

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        console.log("Categorías recibidas en cliente:", data); // <- ESTE DEBERÍAS VER EN TU NAVEGADOR
        setCategorias(data);
      } catch (error) {
        console.error("Error en fetchCategorias:", error);
      }
    }

    fetchCategorias();
  }, []);

  // Cerrar dropdown si clic fuera - para categoria
  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (
        refCategoria.current &&
        !refCategoria.current.contains(event.target as Node)
      ) {
        setDropdownCategoriaAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  // Cerrar dropdown si clic fuera - para nutriente
  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (
        refNutriente.current &&
        !refNutriente.current.contains(event.target as Node)
      ) {
        setDropdownNutrienteAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  // Filtrar categorias según búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!categoriaFiltro) return categorias;
    return categorias.filter((cat) =>
      cat.name.toLowerCase().includes(categoriaFiltro.toLowerCase())
    );
  }, [categoriaFiltro, categorias]); // ✅ incluye categorias

  // Filtrar nutrientes opcionales según búsqueda y ya no incluidos
  const nutrientesFiltrados = useMemo(() => {
    if (!nutrienteFiltro)
      return nutrientesOpcionales.filter((n) => !nutrientesExtras.includes(n));
    return nutrientesOpcionales
      .filter((n) => !nutrientesExtras.includes(n))
      .filter((n) => n.toLowerCase().includes(nutrienteFiltro.toLowerCase()));
  }, [nutrienteFiltro, nutrientesExtras]);

  const handleDetalleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    campo: string
  ) => {
    setDetalleNutricional((prev) => ({
      ...prev,
      [campo]: e.target.value,
    }));
  };

  const handleCategoriaClick = (cat: Categoria) => {
    setCategoriaSeleccionada(cat);
    setCategoriaFiltro(cat.name);
    setDropdownCategoriaAbierto(false);
  };

  const handleAgregarNutriente = (nuevo: string) => {
    if (!nutrientesExtras.includes(nuevo)) {
      setNutrientesExtras((prev) => [...prev, nuevo]);
      setDetalleNutricional((prev) => ({ ...prev, [nuevo]: "" }));
      setNutrienteFiltro("");
      setDropdownNutrienteAbierto(false);
    }
  };

  const handleEliminarNutriente = (nutriente: string) => {
    setNutrientesExtras((prev) => prev.filter((n) => n !== nutriente));
    setDetalleNutricional((prev) => {
      const copia = { ...prev };
      delete copia[nutriente];
      return copia;
    });
  };

  const todosLosCampos = [
    ...camposNutricionalesIniciales,
    ...nutrientesExtras.map((nutriente) => ({
      key: nutriente,
      label: nutriente,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block mb-1 font-medium">
          Nombre del alimento
        </label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
          placeholder="Ingrese el nombre del alimento"
          required
        />
      </div>

      {/* Categoría con dropdown buscador */}
      <div className="relative" ref={refCategoria}>
        <label htmlFor="categoria" className="block mb-1 font-medium">
          Categoría
        </label>
        <input
          type="text"
          id="categoria"
          value={categoriaFiltro}
          onChange={(e) => {
            setCategoriaFiltro(e.target.value);
            setDropdownCategoriaAbierto(true);
          }}
          onFocus={() => setDropdownCategoriaAbierto(true)}
          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
          placeholder="Seleccione o busque categoría"
          autoComplete="off"
          required
        />
        {dropdownCategoriaAbierto && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-gray-300 shadow-lg bg-primary">
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => handleCategoriaClick(cat)}
                  className="cursor-pointer px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {cat.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No hay coincidencias</li>
            )}
          </ul>
        )}
      </div>

      {/* Detalle Nutricional */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Detalle Nutricional</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {todosLosCampos.map(({ key, label }) => (
            <div key={key} className="relative">
              <label
                htmlFor={key}
                className="block mb-1 font-medium capitalize"
              >
                {label}
              </label>
              <input
                type="number"
                id={key}
                min={0}
                step="any"
                value={detalleNutricional[key] || ""}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
                onChange={(e) => handleDetalleChange(e, key)}
                className="w-full border border-gray-300 rounded-md p-2 bg-bg pr-8"
                placeholder={`Ingrese ${label}`}
                required
              />
              {nutrientesExtras.includes(key) && (
                <button
                  type="button"
                  onClick={() => handleEliminarNutriente(key)}
                  className="absolute right-2 top-[30px] text-red-500 font-bold hover:text-red-700"
                  title={`Eliminar ${label}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Dropdown buscador para agregar nutriente */}
        <div className="mt-6 relative mb-4" ref={refNutriente}>
          <label className="block mb-1 font-medium">
            Agregar otro nutriente
          </label>
          <input
            type="text"
            value={nutrienteFiltro}
            onChange={(e) => {
              setNutrienteFiltro(e.target.value);
              setDropdownNutrienteAbierto(true);
            }}
            onFocus={() => setDropdownNutrienteAbierto(true)}
            className="w-full border border-gray-300 rounded-md p-2 bg-bg"
            placeholder="Buscar nutriente adicional"
            autoComplete="off"
          />
          {dropdownNutrienteAbierto && (
            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-gray-300 shadow-lg bg-primary">
              {nutrientesFiltrados.length > 0 ? (
                nutrientesFiltrados.map((nutriente) => (
                  <li
                    key={nutriente}
                    onClick={() => handleAgregarNutriente(nutriente)}
                    className="cursor-pointer px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {nutriente}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">
                  No hay coincidencias
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Imagen */}
        <div>
          <label className="block mb-1 font-medium">Agregar imagen</label>
          <label
            htmlFor="imagen"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            <ImageUp className="h-5 w-5 mr-2" />
            Seleccionar imagen
          </label>
          <input
            type="file"
            id="imagen"
            accept="image/*"
            onChange={handleImagenChange}
            className="hidden"
          />
        </div>

        {imagen && (
          <div className="mt-4">
            <Image
              src={URL.createObjectURL(imagen)}
              alt="Imagen subida"
              width={500} // Debes definir un ancho fijo o relativo
              height={300} // Debes definir una altura fija o relativa
              className="rounded-md border border-gray-300 shadow-sm"
            />
          </div>
        )}
      </section>

      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loadingButton}
        className={`w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition flex justify-center items-center ${
          loadingButton ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {loadingButton ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          "Ingresar"
        )}
      </button>
    </form>
  );
}
