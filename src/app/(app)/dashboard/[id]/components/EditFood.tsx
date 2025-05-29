"use client";

import { useState } from "react";
import Image from "next/image";
import { Food } from "@/domain/models/food";
import { NutritionDetail } from "@/domain/models/nutritionDetail";
import { ImagePlus, LoaderCircle, Plus, Trash2 } from "lucide-react";

interface EditFoodProps {
  selectedFood: Food | null;
}

export default function EditFood({ selectedFood }: EditFoodProps) {
  const [formData, setFormData] = useState<Food | null>(selectedFood);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingButton, setLoadingButton] = useState(false);

  if (!formData) return null;

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
    const nutrient = prompt("Nombre del nutriente:");
    if (!nutrient) return;

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            nutritionDetails: [
              ...prev.nutritionDetails,
              {
                id: Date.now(), // temporal para el frontend
                nutrient,
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
    // Aquí puedes crear una URL temporal para mostrar la imagen seleccionada
    const imageUrl = URL.createObjectURL(file);

    // Actualiza el estado para mostrar la nueva imagen temporalmente
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            imageUrl, // para mostrar en el preview
            // Podrías guardar el archivo en otro estado si necesitas subirlo luego
            // e.g. imageFile: file,
          }
        : prev
    );

    setSelectedFile(file);
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
    formdata.append("category", formData.category);
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error desconocido");

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

      <div>
        <label className="block font-semibold">Categoría</label>
        <input
          type="text"
          className="rounded p-1 bg-primary input input-bordered w-full"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
        />
      </div>

      <div className="w-48 mx-auto">
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-4 hover:border-blue-500 transition-colors"
        >
          {formData.imageUrl ? (
            <Image
              src={
                formData.imageUrl.startsWith("blob:")
                  ? formData.imageUrl
                  : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${formData.imageUrl}`
              }
              alt={formData.name}
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
            className="btn btn-sm btn-outline flex items-center gap-1 cursor-pointer bg-secondary p-2 rounded "
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
              {/* Nutriente como texto */}
              <span className="input input-sm input-bordered flex items-center px-2">
                {detail.nutrient}
              </span>

              {/* Valor editable (input number) */}
              <input
                type="number"
                className="rounded p-1 bg-primary input input-sm input-bordered"
                value={detail.value}
                onChange={(e) =>
                  handleNutritionChange(
                    index,
                    "value",
                    parseFloat(e.target.value)
                  )
                }
              />

              {/* Unidad como texto */}
              <span className="input input-sm input-bordered flex items-center px-2">
                {detail.unit}
              </span>

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
