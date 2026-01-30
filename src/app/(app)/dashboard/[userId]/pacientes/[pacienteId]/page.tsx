"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { User2, Mail, Phone, Ruler, Weight, Calendar, ImagePlus, UploadCloud } from "lucide-react";

export default function PacienteDetallePage() {
  const params = useParams();
  const pacienteId = params.pacienteId as string;
  const userId = params.userId as string;
  const [paciente, setPaciente] = useState<any>(null);
  const [editData, setEditData] = useState({
    name: "",
    lastName: "",
    email: "",
    gender: "",
    birthDate: "",
    phone: "",
    height: "",
    weight: "",
    ocupacion: "",
    estadoCivil: "",
  });
  const [loading, setLoading] = useState(true);
  const [foto, setFoto] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          ocupacion: data.ocupacion || "",
          estadoCivil: data.estadoCivil || "",
        });
      })
      .finally(() => setLoading(false));
  }, [pacienteId]);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setFoto(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFoto(URL.createObjectURL(e.dataTransfer.files[0]));
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
    <div className="w-full max-w mx-auto p-4 flex flex-col md:flex-row gap-6">
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
              <UploadCloud size={32} />
              <span className="mt-2 text-sm">Arrastra o haz click para cargar</span>
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
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <User2 size={24} /> Datos del Paciente
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fila 1 */}
          <div className="flex flex-col gap-2">
            <div>
              <span className="block text-xs font-semibold mb-0.5">Nombre</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <input name="name" type="text" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" placeholder="Nombre" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Apellido</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <input name="lastName" type="text" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" placeholder="Apellido" value={editData.lastName} onChange={e => setEditData(d => ({ ...d, lastName: e.target.value }))} />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Correo</span>
              <label className="flex items-center gap-2">
                <Mail size={20} className="text-secondary" />
                <input name="email" type="email" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" placeholder="Correo" value={editData.email} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Teléfono</span>
              <label className="flex items-center gap-2">
                <Phone size={20} className="text-secondary" />
                <input name="phone" type="text" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" placeholder="Teléfono" value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Ocupación</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <input name="ocupacion" type="text" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" placeholder="Ocupación" value={editData.ocupacion} onChange={e => setEditData(d => ({ ...d, ocupacion: e.target.value }))} />
              </label>
            </div>
          </div>
          {/* Fila 2 */}
          <div className="flex flex-col gap-2">
            <div>
              <span className="block text-xs font-semibold mb-0.5">Fecha de nacimiento</span>
              <label className="flex items-center gap-2">
                <Calendar size={20} className="text-secondary" />
                <input name="birthDate" type="date" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" value={editData.birthDate} onChange={e => setEditData(d => ({ ...d, birthDate: e.target.value }))} />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Género</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <select name="gender" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" value={editData.gender} onChange={e => setEditData(d => ({ ...d, gender: e.target.value }))}>
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
                <input name="height" type="number" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" placeholder="Altura (cm)" value={editData.height} onChange={e => setEditData(d => ({ ...d, height: e.target.value }))} />
              </label>
            </div>
            <div>
              <span className="block text-xs font-semibold mb-0.5">Peso (kg)</span>
              <label className="flex items-center gap-2">
                <Weight size={20} className="text-secondary" />
                <input name="weight" type="number" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" placeholder="Peso (kg)" value={editData.weight} onChange={e => setEditData(d => ({ ...d, weight: e.target.value }))} />
              </label>
            </div>
          
            <div>
              <span className="block text-xs font-semibold mb-0.5">Estado civil</span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
                <select name="estadoCivil" className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm" value={editData.estadoCivil} onChange={e => setEditData(d => ({ ...d, estadoCivil: e.target.value }))}>
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
  );
}
