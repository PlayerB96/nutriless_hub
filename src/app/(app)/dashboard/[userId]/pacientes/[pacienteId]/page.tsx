"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { User2, Mail, Phone, Ruler, Weight, Calendar, ImagePlus, ImageUp, CheckCircle, AlertCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

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
  const [updateStatus, setUpdateStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
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
  const actualizarPaciente = useCallback(async (dataToUpdate: Record<string, unknown>) => {
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
      setUpdateMessage(error instanceof Error ? error.message : "Error al actualizar");

      // Limpiar el mensaje de error después de 3 segundos
      setTimeout(() => {
        setUpdateStatus("idle");
        setUpdateMessage("");
      }, 3000);
    }
  }, [pacienteId]);

  // Función que se ejecuta cuando cambian los inputs de texto/select/date
  const handleInputChange = useCallback((field: string, value: string | number) => {
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
  }, [actualizarPaciente]);

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
          { label: editData.name ? `${editData.name} ${editData.lastName}`.trim() : "Detalle" },
        ]}
      />
      <div className="w-full flex flex-col md:flex-row gap-6">
        {/* Card foto paciente (izquierda en desktop, arriba en mobile) */}
        <div
          className={`w-full md:basis-1/4 md:max-w-[25%] bg-primary rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border-2 mb-6 md:mb-0 ${dragActive ? "border-secondary" : "border-primary"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ImagePlus size={24} /> Foto del Paciente
        </h3>
        <div
          className={`w-40 h-40 rounded-full bg-bg flex items-center justify-center mb-4 border-2 border-dashed cursor-pointer relative ${dragActive ? "border-secondary" : "border-text-alt"}`}
          onClick={handleClickUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {foto ? (
            <Image src={foto} alt="Foto del paciente" width={160} height={160} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-alt">
              <ImageUp size={32} />
              <span className="mt-2 text-sm">Cargar</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFotoChange}
            className="hidden"
          />
        </div>
        {foto && (
          <span className="text-xs text-text-alt">Imagen cargada</span>
        )}
      </div>

        {/* Card datos paciente (derecha en desktop, abajo en mobile) */}
        <div className="w-full md:basis-3/4 md:max-w-[75%] bg-primary rounded-xl shadow-lg p-6 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User2 size={24} /> Datos del Paciente
          </h2>
          {updateStatus !== "idle" && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
              updateStatus === "saving" ? "bg-blue-100 text-blue-700" :
              updateStatus === "success" ? "bg-green-100 text-green-700" :
              "bg-red-100 text-red-700"
            }`}>
              {updateStatus === "saving" && (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full"></div>
                  Guardando...
                </>
              )}
              {updateStatus === "success" && (
                <>
                  <CheckCircle size={16} />
                  {updateMessage}
                </>
              )}
              {updateStatus === "error" && (
                <>
                  <AlertCircle size={16} />
                  {updateMessage}
                </>
              )}
            </div>
          )}
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fila 1 */}
          <div className="flex flex-col gap-2">
            <div>
              <span className="block text-xs font-semibold mb-0.5">Nombre</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <input 
                  name="name" 
                  type="text" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  placeholder="Nombre" 
                  value={editData.name} 
                  onChange={e => handleInputChange("name", e.target.value)} 
                />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Apellido</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <input 
                  name="lastName" 
                  type="text" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  placeholder="Apellido" 
                  value={editData.lastName} 
                  onChange={e => handleInputChange("lastName", e.target.value)} 
                />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Correo</span>
              <label className="flex items-center gap-2">
                <Mail size={20} className="text-secondary" />
                <input 
                  name="email" 
                  type="email" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  placeholder="Correo" 
                  value={editData.email} 
                  onChange={e => handleInputChange("email", e.target.value)} 
                />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Teléfono</span>
              <label className="flex items-center gap-2">
                <Phone size={20} className="text-secondary" />
                <input 
                  name="phone" 
                  type="text" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  placeholder="Teléfono" 
                  value={editData.phone} 
                  onChange={e => handleInputChange("phone", e.target.value)} 
                />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Ocupación</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <input 
                  name="occupation" 
                  type="text" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  placeholder="Ocupación" 
                  value={editData.occupation} 
                  onChange={e => handleInputChange("occupation", e.target.value)} 
                />
              </label>
            </div>
          </div>
          {/* Fila 2 */}
          <div className="flex flex-col gap-2">
            <div>
              <span className="block text-xs font-semibold mb-0.5">Fecha de nacimiento</span>
              <label className="flex items-center gap-2">
                <Calendar size={20} className="text-secondary" />
                <input 
                  name="birthDate" 
                  type="date" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  value={editData.birthDate} 
                  onChange={e => handleInputChange("birthDate", e.target.value)} 
                />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Género</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <select 
                  name="gender" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  value={editData.gender} 
                  onChange={e => handleInputChange("gender", e.target.value)}
                >
                  <option value="">Selecciona género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Altura (cm)</span>
              <label className="flex items-center gap-2">
                <Ruler size={20} className="text-secondary" />
                <input 
                  name="height" 
                  type="number" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  placeholder="Altura (cm)" 
                  value={editData.height} 
                  onChange={e => handleInputChange("height", e.target.value)} 
                />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Peso (kg)</span>
              <label className="flex items-center gap-2">
                <Weight size={20} className="text-secondary" />
                <input 
                  name="weight" 
                  type="number" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  placeholder="Peso (kg)" 
                  value={editData.weight} 
                  onChange={e => handleInputChange("weight", e.target.value)} 
                />
              </label>
            </div>
          
            <div>
              <span className="block text-xs font-semibold mb-0.5">Estado civil</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <select 
                  name="maritalStatus" 
                  className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" 
                  value={editData.maritalStatus} 
                  onChange={e => handleInputChange("maritalStatus", e.target.value)}
                >
                  <option value="">Selecciona estado civil</option>
                  <option value="Soltero">Soltero</option>
                  <option value="Casado">Casado</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viudo">Viudo</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
