"use client";

import Image from "next/image";
import {
  User2,
  Mail,
  Phone,
  Ruler,
  Weight,
  Calendar,
  ImagePlus,
  ImageUp,
} from "lucide-react";
import PatientAutoSaveStatus from "./PatientAutoSaveStatus";

type EditData = {
  name: string;
  lastName: string;
  email: string;
  gender: string;
  birthDate: string;
  phone: string;
  height: string | number;
  weight: string | number;
  occupation: string;
  maritalStatus: string;
};

type Props = {
  foto: string | null;
  dragActive: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  updateStatus: "idle" | "saving" | "success" | "error";
  updateMessage: string;
  editData: EditData;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onClickUpload: () => void;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (field: string, value: string | number) => void;
};

export default function DatosPersonalesPaciente({
  foto,
  dragActive,
  inputRef,
  updateStatus,
  updateMessage,
  editData,
  onDrop,
  onDragOver,
  onDragLeave,
  onClickUpload,
  onFotoChange,
  onInputChange,
}: Props) {
  return (
    <div className="w-full flex flex-col tablet:flex-row gap-3 tablet:gap-4 desktop:gap-6">
      {/* Card foto paciente (izquierda en tablet/desktop, arriba en mobile) */}
      <div
        className={`w-full tablet:w-[220px] tablet:shrink-0 desktop:w-[260px] bg-primary rounded-xl shadow-lg p-3 tablet:p-4 desktop:p-6 flex flex-col items-center justify-center border-2 ${dragActive ? "border-secondary" : "border-primary"}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ImagePlus size={24} /> Foto del Paciente
        </h3>
        <div
          className={`w-40 h-40 rounded-full bg-bg flex items-center justify-center mb-4 border-2 border-dashed cursor-pointer relative ${dragActive ? "border-secondary" : "border-text-alt"}`}
          onClick={onClickUpload}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {foto ? (
            <Image
              src={foto}
              alt="Foto del paciente"
              width={160}
              height={160}
              className="w-full h-full object-cover rounded-full"
            />
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
            onChange={onFotoChange}
            className="hidden"
          />
        </div>
        {foto && <span className="text-xs text-text-alt">Imagen cargada</span>}
      </div>

      {/* Card datos paciente (derecha en tablet/desktop, abajo en mobile) */}
      <div className="w-full tablet:flex-1 tablet:min-w-0 bg-primary rounded-xl shadow-lg p-3 tablet:p-4 desktop:p-6 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User2 size={24} /> Datos del Paciente
          </h2>
          <PatientAutoSaveStatus
            status={updateStatus}
            errorMessage={updateMessage}
          />
        </div>
        <form className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-3">
          <div>
            <span className="block text-xs font-semibold mb-0.5">Nombre</span>
            <label className="flex items-center gap-2">
              <User2 size={20} className="text-secondary shrink-0" />
              <input
                name="name"
                type="text"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                placeholder="Nombre"
                value={editData.name}
                onChange={(e) => onInputChange("name", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Apellido</span>
            <label className="flex items-center gap-2">
              <User2 size={20} className="text-secondary shrink-0" />
              <input
                name="lastName"
                type="text"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                placeholder="Apellido"
                value={editData.lastName}
                onChange={(e) => onInputChange("lastName", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Correo</span>
            <label className="flex items-center gap-2">
              <Mail size={20} className="text-secondary shrink-0" />
              <input
                name="email"
                type="email"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                placeholder="Correo"
                value={editData.email}
                onChange={(e) => onInputChange("email", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Teléfono</span>
            <label className="flex items-center gap-2">
              <Phone size={20} className="text-secondary shrink-0" />
              <input
                name="phone"
                type="text"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                placeholder="Teléfono"
                value={editData.phone}
                onChange={(e) => onInputChange("phone", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Fecha de nacimiento</span>
            <label className="flex items-center gap-2">
              <Calendar size={20} className="text-secondary shrink-0" />
              <input
                name="birthDate"
                type="date"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                value={editData.birthDate}
                onChange={(e) => onInputChange("birthDate", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Género</span>
            <label className="flex items-center gap-2">
              <User2 size={20} className="text-secondary shrink-0" />
              <select
                name="gender"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                value={editData.gender}
                onChange={(e) => onInputChange("gender", e.target.value)}
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
              <Ruler size={20} className="text-secondary shrink-0" />
              <input
                name="height"
                type="number"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                placeholder="Altura (cm)"
                value={editData.height}
                onChange={(e) => onInputChange("height", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Peso (kg)</span>
            <label className="flex items-center gap-2">
              <Weight size={20} className="text-secondary shrink-0" />
              <input
                name="weight"
                type="number"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                placeholder="Peso (kg)"
                value={editData.weight}
                onChange={(e) => onInputChange("weight", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Ocupación</span>
            <label className="flex items-center gap-2">
              <User2 size={20} className="text-secondary shrink-0" />
              <input
                name="occupation"
                type="text"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                placeholder="Ocupación"
                value={editData.occupation}
                onChange={(e) => onInputChange("occupation", e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-0.5">Estado civil</span>
            <label className="flex items-center gap-2">
              <User2 size={20} className="text-secondary shrink-0" />
              <select
                name="maritalStatus"
                className="input input-bordered w-full bg-bg text-text rounded px-2 py-1 text-sm"
                value={editData.maritalStatus}
                onChange={(e) => onInputChange("maritalStatus", e.target.value)}
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
        </form>
      </div>
    </div>
  );
}
