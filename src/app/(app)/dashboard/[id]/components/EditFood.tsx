"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Food } from "@/domain/models/food";
import { NutritionDetail } from "@/domain/models/nutritionDetail";
import { ImagePlus, LoaderCircle, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface EditFoodProps {
  selectedFood: Food;
  onSubmitSuccess?: () => void; // ahora acepta un Food
}

export default function EditFood({
  onSubmitSuccess,
  selectedFood,
}: EditFoodProps) {
  type Categoria = {
    id: number;
    name: string;
  };

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error en fetchCategorias:", error);
      }
    }

    fetchCategorias();
  }, []);

  useEffect(() => {
    async function fetchNutrientsOptional() {
      try {
        const res = await fetch("/api/nutrients-optional");
        if (!res.ok) throw new Error("Error al cargar nutrients opcionales");
        const data = await res.json();
        setNutrientesOptionals(data);
      } catch (error) {
        console.error("Error en fetchNutrientsOptional:", error);
      }
    }

    fetchNutrientsOptional();
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

  const refCategoria = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Food | null>(selectedFood);
  useEffect(() => {
    if (formData?.category) {
      setCategoriaFiltro(formData.category);
    }
  }, [formData]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nutrientesOpcionales, setNutrientesOptionals] = useState<string[]>([]);

  useEffect(() => {
    console.log(
      "Estado actualizado de nutrientesOpcionales:",
      nutrientesOpcionales
    );
  }, [nutrientesOpcionales]);

  const [dropdownCategoriaAbierto, setDropdownCategoriaAbierto] =
    useState(false);

  // Filtrar categorias según búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!categoriaFiltro) return categorias;
    return categorias.filter((cat) =>
      cat.name.toLowerCase().includes(categoriaFiltro.toLowerCase())
    );
  }, [categoriaFiltro, categorias]); // ✅ incluye categorias

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);

  if (!formData) return null;

  const handleCategoriaClick = (cat: Categoria) => {
    setCategoriaFiltro(cat.name); // actualiza visualmente el input
    formData.category = cat.name; // sincroniza con tu objeto
    setCategoriaSeleccionada(cat); // guarda objeto completo si necesitas
    setDropdownCategoriaAbierto(false); // cierra el menú
  };

  const handleChange = (field: keyof Food, value: unknown) => {
    setFormData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value as never, // Necesario para que TypeScript acepte la asignación
      };
    });
  };

  const handleNutritionChange = (
    index: number,
    field: keyof NutritionDetail,
    value: string | number
  ) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            nutritionDetails: prev.nutritionDetails.map((detail, i) =>
              i === index ? { ...detail, [field]: value } : detail
            ),
          }
        : prev
    );
  };

  const handleRemoveNutrition = (idToRemove: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            nutritionDetails: prev.nutritionDetails.filter(
              (detail) => detail.id !== idToRemove
            ),
          }
        : prev
    );
  };

  const handleAddNutrition = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            nutritionDetails: [
              ...prev.nutritionDetails,
              {
                id: Date.now(),
                nutrient: "", // campo vacío para escribir
                value: 0,
                unit: "g",
              },
            ],
          }
        : prev
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const tempUrl = URL.createObjectURL(file);

    setPreviewUrl(tempUrl); // solo para el preview
    setSelectedFile(file); // para enviarlo luego si es necesario
  };

  const handleUpdate = async () => {
    if (!selectedFile && !formData.name) {
      alert("Faltan datos obligatorios");
      return;
    }
    setLoadingButton(true); // inicia animación

    const formdata = new FormData();
    formdata.append("id", formData.id.toString());
    formdata.append("name", formData.name);
    // formdata.append("category", formData.category);
    formdata.append(
      "category",
      categoriaSeleccionada ? categoriaSeleccionada.name : formData.category
    );
    formdata.append("userId", formData.userId.toString());
    formdata.append(
      "nutritionDetails",
      JSON.stringify(formData.nutritionDetails || {})
    );
    formdata.append(
      "householdMeasures",
      JSON.stringify(formData.householdMeasures || [])
    );
    if (selectedFile) {
      formdata.append("image", selectedFile);
    }

    try {
      const res = await fetch(`/api/foods/update`, {
        method: "POST",
        body: formdata, // payload es tu FormData como en POST
      });

      if (res.ok) {
        // const updatedFood = await res.json();
        onSubmitSuccess?.();
        toast.success("Alimento editado correctamente ✅");
      } else {
        const error = await res.json();
        console.error("Error:", error.message);
        toast.error("Error: " + error.message);
      }

      // Aquí actualizar UI, limpiar formulario, etc.
    } catch (error) {
      if (error instanceof Error) {
        alert("Error al guardar: " + error.message);
      } else {
        alert("Error desconocido al guardar");
      }
    } finally {
      setLoadingButton(false); // inicia animación
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold">Nombre</label>
        <input
          type="text"
          className="rounded p-1 bg-primary input input-bordered w-full"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      {/* <div>
        <label className="block font-semibold">Categoría</label>
        <input
          type="text"
          className="rounded p-1 bg-primary input input-bordered w-full"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
        />
      </div> */}
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
            const newValue = e.target.value;
            setCategoriaFiltro(newValue);
            formData.category = newValue; // sincronizas con tu objeto formData si es necesario
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

      <div className="w-48 mx-auto">
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-4 hover:border-blue-500 transition-colors"
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Vista previa"
              width={192}
              height={192}
              className="object-cover rounded"
              unoptimized
            />
          ) : formData.imageUrl && typeof formData.imageUrl === "string" ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${formData.imageUrl}`}
              alt={formData.name || "Imagen"}
              width={192}
              height={192}
              className="object-cover rounded"
              unoptimized
            />
          ) : (
            <>
              <ImagePlus />
              <span className="text-gray-500">Selecciona una imagen</span>
            </>
          )}

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Detalles Nutricionales</h3>
          <button
            type="button"
            className="btn btn-sm btn-outline flex items-center gap-1 cursor-pointer bg-secondary p-1 md:p-2 rounded"
            onClick={handleAddNutrition}
          >
            <Plus className="w-4 h-4" />
            Agregar nutriente
          </button>
        </div>

        <div className="space-y-2 mt-2">
          {formData.nutritionDetails.map((detail, index) => (
            <div
              key={detail.id}
              className="grid grid-cols-4 gap-2 items-center"
            >
              {/* Nutriente: select si está vacío, sino texto */}
              <select
                className="rounded p-1 bg-primary text-white input input-sm input-bordered"
                value={detail.nutrient}
                onChange={(e) =>
                  handleNutritionChange(index, "nutrient", e.target.value)
                }
              >
                <option value="" disabled>
                  Selecciona nutriente
                </option>
                {nutrientesOpcionales.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>

              {/* Valor numérico */}
              <input
                type="number"
                className="rounded p-1 bg-primary input input-sm input-bordered"
                value={detail.value === undefined ? "" : detail.value}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? "" : parseFloat(e.target.value);
                  handleNutritionChange(index, "value", val);
                }}
              />

              {/* Unidad */}
              <span className="input input-sm input-bordered flex items-center px-2">
                {detail.unit}
              </span>

              {/* Botón eliminar */}
              <button
                type="button"
                className="btn btn-sm btn-error ml-auto cursor-pointer"
                onClick={() => handleRemoveNutrition(detail.id)}
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        disabled={loadingButton}
        onClick={handleUpdate}
        className={`w-full cursor-pointer bg-primary text-white  px-4 py-2 rounded-md hover:bg-primary/90 transition flex justify-center items-center ${
          loadingButton ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {loadingButton ? (
          <LoaderCircle className="animate-spin w-5 h-5 text-white" />
        ) : (
          "Guardar"
        )}
      </button>
    </div>
  );
}
