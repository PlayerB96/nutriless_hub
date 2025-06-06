"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export default function FormularioReceta({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const etiquetasDisponibles = [
    "Desayuno",
    "Almuerzo",
    "Cena",
    "Snack",
    "Postre",
  ];
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [etiquetas, setEtiquetas] = useState<string[]>([]); // <-- múltiples etiquetas
  const [porciones, setPorciones] = useState<number | "">("");
  const [tiempoPreparacion, setTiempoPreparacion] = useState<number | "">("");
  const [tiempoCoccion, setTiempoCoccion] = useState<number | "">("");
  const [dificultad, setDificultad] = useState("facil");
  const [esPublica, setEsPublica] = useState(true);
  const refInputEtiqueta = useRef<HTMLInputElement>(null);

  const [etiquetaFiltro, setEtiquetaFiltro] = useState("");
  const [dropdownEtiquetaAbierto, setDropdownEtiquetaAbierto] = useState(false);
  const refEtiqueta = useRef<HTMLDivElement>(null);
  const [loadingButton, setLoadingButton] = useState(false);

  // Filtra etiquetas disponibles que aún no están seleccionadas y que coincidan con el filtro
  const etiquetasFiltradas = etiquetasDisponibles.filter(
    (et) =>
      et.toLowerCase().includes(etiquetaFiltro.toLowerCase()) &&
      !etiquetas.includes(et)
  );

  // Agregar etiqueta, sin repetir
  const handleAgregarEtiqueta = (valor: string) => {
    if (!etiquetas.includes(valor)) {
      setEtiquetas((prev) => [...prev, valor]);
    }
    setEtiquetaFiltro("");
    setDropdownEtiquetaAbierto(false);
  };

  // Eliminar etiqueta individual
  const handleEliminarEtiqueta = (valor: string) => {
    setEtiquetas((prev) => prev.filter((et) => et !== valor));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingButton(true);

    try {
      const formData = new FormData();
      formData.append("name", nombre);
      // Enviar etiquetas como string separado por comas
      formData.append("tags", etiquetas.join(","));
      formData.append("portions", porciones.toString());
      formData.append("prepTime", tiempoPreparacion.toString());
      if (tiempoCoccion !== "") {
        formData.append("cookTime", tiempoCoccion.toString());
      }
      formData.append("difficulty", dificultad);
      formData.append("isPublic", esPublica.toString());

      const res = await fetch("/api/recipes", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Receta creada correctamente ✅");
        // Redirigir al detalle de la receta
        router.push(`/dashboard/recipes/${data.recipe.id}`);
        onSubmitSuccess?.();
      } else {
        const error = await res.json();
        toast.error("Error: " + error.message);
        console.error("Error al guardar receta:", error);
      }
    } catch (error) {
      toast.error("Error al enviar receta");
      console.error(error);
    } finally {
      setLoadingButton(false);
    }
  };

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (
        refEtiqueta.current &&
        !refEtiqueta.current.contains(event.target as Node)
      ) {
        setDropdownEtiquetaAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-2 w-full">
      {/* Nombre */}
      <div className="mt-6 relative mb-4">
        <label className="block mb-1 font-medium">Nombre de la receta</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
          placeholder="Ingrese el nombre de la receta"
          required
        />
      </div>

      {/* Etiquetas con dropdown y chips */}
      <div className="mt-6 relative mb-4" ref={refEtiqueta}>
        <label className="block mb-1 font-medium">Etiquetas</label>
        <div
          className="flex flex-wrap items-center gap-1 border border-gray-300 rounded-md p-2 bg-bg cursor-text"
          onClick={() => {
            // Cuando haces click en el contenedor, enfocas el input real
            const input = refInputEtiqueta.current;
            input?.focus();
            setDropdownEtiquetaAbierto(true);
          }}
        >
          {etiquetas.map((etiqueta) => (
            <span
              key={etiqueta}
              className="flex items-center bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-sm select-none"
            >
              {etiqueta}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que se abra dropdown al borrar etiqueta
                  handleEliminarEtiqueta(etiqueta);
                }}
                className="ml-1 text-green-800 hover:text-green-900 font-bold"
                aria-label={`Eliminar etiqueta ${etiqueta}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={refInputEtiqueta}
            type="text"
            value={etiquetaFiltro}
            onChange={(e) => {
              setEtiquetaFiltro(e.target.value);
              setDropdownEtiquetaAbierto(true);
            }}
            onFocus={() => setDropdownEtiquetaAbierto(true)}
            className="flex-grow bg-transparent border-none outline-none p-1 text-sm"
            placeholder={etiquetas.length === 0 ? "Buscar etiqueta" : ""}
            autoComplete="off"
          />
        </div>

        {dropdownEtiquetaAbierto && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-gray-300 shadow-lg bg-primary">
            {etiquetasFiltradas.length > 0 ? (
              etiquetasFiltradas.map((opcion) => (
                <li
                  key={opcion}
                  onClick={() => handleAgregarEtiqueta(opcion)}
                  className="cursor-pointer px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {opcion}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No hay coincidencias</li>
            )}
          </ul>
        )}
      </div>

      {/* Porciones */}
      <div className="mt-6 relative mb-4">
        <label className="block mb-1 font-medium">Porciones</label>
        <input
          type="number"
          min={1}
          value={porciones}
          onChange={(e) =>
            setPorciones(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
          placeholder="Número de porciones"
          required
        />
      </div>

      {/* Tiempo preparación */}
      <div className="mt-6 relative mb-4">
        <label className="block mb-1 font-medium">
          Tiempo de preparación (min)
        </label>
        <input
          type="number"
          min={0}
          value={tiempoPreparacion}
          onChange={(e) =>
            setTiempoPreparacion(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
          placeholder="Tiempo preparación"
          required
        />
      </div>

      {/* Tiempo cocción */}
      <div className="mt-6 relative mb-4">
        <label className="block mb-1 font-medium">
          Tiempo de cocción (min - opcional)
        </label>
        <input
          type="number"
          min={0}
          value={tiempoCoccion}
          onChange={(e) =>
            setTiempoCoccion(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
          placeholder="Tiempo cocción"
        />
      </div>

      {/* Dificultad */}
      <div className="mt-6 relative mb-4">
        <label className="block mb-1 font-medium">Dificultad</label>
        <select
          value={dificultad}
          onChange={(e) => setDificultad(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 bg-bg"
        >
          <option value="facil">Fácil</option>
          <option value="intermedio">Intermedio</option>
          <option value="dificil">Difícil</option>
        </select>
      </div>

      {/* Pública */}
      <div className="mt-6 mb-4">
        <label className="block mb-2 font-medium">¿Receta pública?</label>
        <div
          className="relative inline-flex items-center cursor-pointer"
          onClick={() => setEsPublica(!esPublica)}
        >
          <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
            {esPublica ? "Sí" : "No"}
          </span>
          <div
            className={`w-11 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${
              esPublica ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                esPublica ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={loadingButton}
          className={` cursor-pointer bg-primary text-white  px-4 py-2 rounded-md hover:bg-primary/90 transition  ${
            loadingButton ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loadingButton ? (
            <LoaderCircle className="animate-spin w-5 h-5 text-white" />
          ) : (
            "Registrar Receta"
          )}
        </button>
      </div>
    </form>
  );
}
