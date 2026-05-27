"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ImagePlus, Pencil, Trash2, X, Calendar, Type, ImageUp } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { confirmAction } from "@/components/ui/confirmAction";
import { getPublicImageUrl } from "@/lib/image-url";
import toast from "react-hot-toast";

type PatientImage = {
  id: number;
  title: string;
  date: string;
  imageKey: string;
};

type Props = {
  pacienteId: string;
};

const MAX_IMAGES = 3;

export default function ImagenesPaciente({ pacienteId }: Props) {
  const [images, setImages] = useState<PatientImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editModal, setEditModal] = useState<PatientImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNewImage, setEditNewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/pacientes/${pacienteId}/images`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImages(data);
    } catch {
      toast.error("Error al cargar imágenes");
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async (file: File) => {
    if (images.length >= MAX_IMAGES) {
      toast.error(`Solo se permiten hasta ${MAX_IMAGES} imágenes`);
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch(`/api/pacientes/${pacienteId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64,
            title: "",
            date: new Date().toISOString(),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al subir imagen");
        }

        const newImage = await res.json();
        setImages((prev) => [...prev, newImage]);
        toast.success("Imagen agregada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al subir imagen");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const openEditModal = (img: PatientImage) => {
    setEditModal(img);
    setEditTitle(img.title);
    setEditDate(img.date ? img.date.slice(0, 10) : "");
    setEditNewImage(null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditNewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        title: editTitle,
        date: editDate || new Date().toISOString(),
      };
      if (editNewImage) body.imageData = editNewImage;

      const res = await fetch(
        `/api/pacientes/${pacienteId}/images/${editModal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar");
      }

      const updated = await res.json();
      setImages((prev) =>
        prev.map((img) => (img.id === updated.id ? updated : img)),
      );
      setEditModal(null);
      toast.success("Imagen actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    const result = await confirmAction({
      title: "¿Eliminar imagen?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `/api/pacientes/${pacienteId}/images/${imageId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      if (editModal?.id === imageId) setEditModal(null);
      toast.success("Imagen eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <span className="text-sm text-text-alt">Cargando imágenes...</span>
      </div>
    );
  }

  const emptySlots = MAX_IMAGES - images.length;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-text">Imágenes del paciente</h3>
      <p className="text-sm text-text-alt">
        Puedes agregar hasta {MAX_IMAGES} imágenes. Haz clic en una imagen para
        editar su título, fecha o cambiarla.
      </p>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative flex flex-col items-center rounded-lg border border-primary bg-primary p-3 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-secondary"
            onClick={() => openEditModal(img)}
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-bg">
              <Image
                src={getPublicImageUrl(img.imageKey) || ""}
                alt={img.title || "Imagen del paciente"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Pencil
                  size={28}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                />
              </div>
            </div>
            <div className="mt-2 w-full text-center">
              <p className="text-sm font-medium text-text truncate">
                {img.title || "Sin título"}
              </p>
              <p className="text-xs text-text-alt">
                {img.date
                  ? new Date(img.date).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Sin fecha"}
              </p>
            </div>
            <button
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(img.id);
              }}
              title="Eliminar imagen"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {emptySlots > 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-text-alt/30 bg-bg p-6 cursor-pointer transition-colors hover:border-secondary hover:bg-primary/50 min-h-[200px]"
            onClick={() => uploadRef.current?.click()}
          >
            {uploading ? (
              <span className="text-sm text-text-alt animate-pulse">
                Subiendo...
              </span>
            ) : (
              <>
                <ImagePlus size={36} className="text-text-alt mb-2" />
                <span className="text-sm text-text-alt">Agregar imagen</span>
                <span className="text-xs text-text-alt mt-1">
                  {images.length + 1}/{MAX_IMAGES}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Modal de edición */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Editar imagen"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 rounded-lg border border-primary text-text text-sm hover:bg-primary transition-colors cursor-pointer"
              onClick={() => setEditModal(null)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        }
      >
        {editModal && (
          <div className="flex flex-col gap-4">
            {/* Preview de imagen */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-bg border border-primary">
              <Image
                src={editNewImage || getPublicImageUrl(editModal.imageKey) || ""}
                alt={editTitle || "Imagen del paciente"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <button
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-white text-sm font-medium shadow hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() => editImageRef.current?.click()}
              >
                <ImageUp size={16} />
                Cambiar imagen
              </button>
            </div>

            <input
              ref={editImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleEditImageChange}
            />

            {editNewImage && (
              <div className="flex items-center gap-2 text-xs text-secondary">
                <ImageUp size={14} />
                <span>Nueva imagen seleccionada</span>
                <button
                  className="ml-auto text-red-500 hover:text-red-600 cursor-pointer"
                  onClick={() => setEditNewImage(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Título */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                <Type size={16} className="text-secondary" />
                Título
              </label>
              <input
                type="text"
                className="w-full bg-bg text-text rounded-lg px-3 py-2 text-sm border border-primary focus:border-secondary focus:outline-none transition-colors"
                placeholder="Título de la imagen"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                <Calendar size={16} className="text-secondary" />
                Fecha
              </label>
              <input
                type="date"
                className="w-full bg-bg text-text rounded-lg px-3 py-2 text-sm border border-primary focus:border-secondary focus:outline-none transition-colors"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            {/* Botón eliminar */}
            <button
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-red-300 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              onClick={() => handleDelete(editModal.id)}
            >
              <Trash2 size={16} />
              Eliminar imagen
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
