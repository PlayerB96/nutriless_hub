"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import DatosPersonalesPaciente from "../components/DatosPersonalesPaciente";
import InformacionCompletaPaciente from "../components/InformacionCompletaPaciente";

export default function PacienteDetallePage() {
  const params = useParams();
  const pacienteId = params.pacienteId as string;
  const userId = params.userId as string;
  const [paciente, setPaciente] = useState<{
    detail?: {
      goal: string | null;
      motivation: number | null;
      goalComment: string | null;
      activityLevel: string | null;
      stressLevel: string | null;
      stressReason: string | null;
      sleepHours: number | null;
      sleepQuality: number | null;
      alcoholTypes: string[];
      alcoholFrequency: string | null;
      tobaccoFrequency: string | null;
      supplementTypes: string[];
    } | null;
  } | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    lastName: "",
    email: "",
    gender: "",
    birthDate: "",
    phone: "",
    height: "",
    weight: "",
    occupation: "",
    maritalStatus: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [updateMessage, setUpdateMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos iniciales del paciente
  useEffect(() => {
    if (!pacienteId) return;

    let cancelled = false;

    async function loadPaciente() {
      setLoading(true);
      setLoadError(null);

      try {
        const res = await fetch(`/api/pacientes/${pacienteId}`);
        const text = await res.text();

        if (!text.trim()) {
          throw new Error(
            res.ok
              ? "El servidor devolvió una respuesta vacía"
              : `Error del servidor (${res.status})`,
          );
        }

        let data: Record<string, unknown>;
        try {
          data = JSON.parse(text) as Record<string, unknown>;
        } catch {
          throw new Error("Respuesta inválida del servidor");
        }

        if (!res.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "No se pudo cargar el paciente",
          );
        }

        if (cancelled) return;

        setPaciente(data as typeof paciente);
        setEditData({
          name: String(data.name ?? ""),
          lastName: String(data.lastName ?? ""),
          email: String(data.email ?? ""),
          gender: String(data.gender ?? ""),
          birthDate:
            typeof data.birthDate === "string"
              ? data.birthDate.slice(0, 10)
              : "",
          phone: String(data.phone ?? ""),
          height: String(data.height ?? ""),
          weight: String(data.weight ?? ""),
          occupation: String(data.occupation ?? ""),
          maritalStatus: String(data.maritalStatus ?? ""),
        });
        if (typeof data.photo === "string" && data.photo) {
          setFoto(data.photo);
        }
      } catch (err) {
        if (!cancelled) {
          setPaciente(null);
          setLoadError(
            err instanceof Error ? err.message : "Error al cargar el paciente",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPaciente();
    return () => {
      cancelled = true;
    };
  }, [pacienteId]);

  // Función para actualizar el paciente
  const actualizarPaciente = useCallback(
    async (dataToUpdate: Record<string, unknown>) => {
      try {
        setUpdateStatus("saving");
        setUpdateMessage("");

        const response = await fetch(`/api/pacientes/${pacienteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToUpdate),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error al actualizar");
        }

        const updatedData = await response.json();
        setPaciente(updatedData);
        setUpdateStatus("success");
        setUpdateMessage("");

        setTimeout(() => {
          setUpdateStatus("idle");
        }, 2500);
      } catch (error) {
        setUpdateStatus("error");
        setUpdateMessage(
          error instanceof Error ? error.message : "Error al actualizar",
        );

        // Limpiar el mensaje de error después de 3 segundos
        setTimeout(() => {
          setUpdateStatus("idle");
          setUpdateMessage("");
        }, 3000);
      }
    },
    [pacienteId],
  );

  // Función que se ejecuta cuando cambian los inputs de texto/select/date
  const handleInputChange = useCallback(
    (field: string, value: string | number) => {
      setEditData((prevData) => {
        const newData = { ...prevData, [field]: value };

        // Limpiar debounce anterior
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Crear un nuevo timeout para actualizar
        debounceTimerRef.current = setTimeout(() => {
          actualizarPaciente(newData);
        }, 500); // Espera 500ms después de que el usuario deje de escribir

        return newData;
      });
    },
    [actualizarPaciente],
  );

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setFoto(base64);

      // Actualizar inmediatamente con la imagen
      actualizarPaciente({ photo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFoto(base64);

        // Actualizar inmediatamente con la imagen
        actualizarPaciente({ photo: base64 });
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClickUpload = () => {
    inputRef.current?.click();
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (loadError) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <p className="text-center text-sm text-red-600">{loadError}</p>
        <p className="mt-3 text-center text-xs text-text-alt">
          Si acabas de actualizar el proyecto, ejecuta{" "}
          <code className="rounded bg-primary px-1">npx prisma migrate deploy</code>{" "}
          y recarga la página.
        </p>
      </div>
    );
  }
  if (!paciente) return <div className="p-8">Paciente no encontrado</div>;

  return (
    <div className="w-full max-w-full tablet:max-w-5xl desktop:max-w-6xl mx-auto p-3 tablet:p-4 desktop:p-6 flex flex-col gap-3 tablet:gap-4">
      <Breadcrumb
        items={[
          { label: "Pacientes", href: `/dashboard/${userId}/pacientes` },
          {
            label: editData.name
              ? `${editData.name} ${editData.lastName}`.trim()
              : "Detalle",
          },
        ]}
      />
      <DatosPersonalesPaciente
        foto={foto}
        dragActive={dragActive}
        inputRef={inputRef}
        updateStatus={updateStatus}
        updateMessage={updateMessage}
        editData={editData}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClickUpload={handleClickUpload}
        onFotoChange={handleFotoChange}
        onInputChange={handleInputChange}
      />
      <InformacionCompletaPaciente
        pacienteId={pacienteId}
        detail={paciente.detail ?? null}
      />
    </div>
  );
}
