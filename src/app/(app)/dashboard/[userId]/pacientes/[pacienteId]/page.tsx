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
  const [paciente, setPaciente] = useState<unknown>(null);
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
    fetch(`/api/pacientes/${pacienteId}`)
      .then((res) => res.json())
      .then((data) => {
        setPaciente(data);
        setEditData({
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
          gender: data.gender || "",
          birthDate: data.birthDate ? data.birthDate.slice(0, 10) : "",
          phone: data.phone || "",
          height: data.height || "",
          weight: data.weight || "",
          occupation: data.occupation || "",
          maritalStatus: data.maritalStatus || "",
        });
        if (data.photo) {
          setFoto(data.photo);
        }
      })
      .finally(() => setLoading(false));
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
        setUpdateMessage("Cambios guardados correctamente");

        // Limpiar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setUpdateStatus("idle");
          setUpdateMessage("");
        }, 3000);
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
  if (!paciente) return <div className="p-8">Paciente no encontrado</div>;

  return (
    <div className="w-full max-w mx-auto p-4 flex flex-col gap-4">
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
      <InformacionCompletaPaciente />
    </div>
  );
}
