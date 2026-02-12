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
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Card foto paciente (izquierda en desktop, arriba en mobile) */}
      <div
        className={`w-full md:basis-1/4 md:max-w-[25%] bg-primary rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border-2 mb-6 md:mb-0 ${dragActive ? "border-secondary" : "border-primary"}`}
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

      {/* Card datos paciente (derecha en desktop, abajo en mobile) */}
      <div className="w-full md:basis-3/4 md:max-w-[75%] bg-primary rounded-xl shadow-lg p-6 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User2 size={24} /> Datos del Paciente
          </h2>
          {updateStatus !== "idle" && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                updateStatus === "saving"
                  ? "bg-blue-100 text-blue-700"
                  : updateStatus === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
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
                  onChange={(e) => onInputChange("name", e.target.value)}
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
                  onChange={(e) => onInputChange("lastName", e.target.value)}
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
                  onChange={(e) => onInputChange("email", e.target.value)}
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
                  onChange={(e) => onInputChange("phone", e.target.value)}
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
                  onChange={(e) => onInputChange("occupation", e.target.value)}
                />
              </label>
            </div>
          </div>
          {/* Fila 2 */}
          <div className="flex flex-col gap-2">
            <div>
              <span className="block text-xs font-semibold mb-0.5">
                Fecha de nacimiento
              </span>
              <label className="flex items-center gap-2">
                <Calendar size={20} className="text-secondary" />
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
                <User2 size={20} className="text-secondary" />
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
              <span className="block text-xs font-semibold mb-0.5">
                Altura (cm)
              </span>
              <label className="flex items-center gap-2">
                <Ruler size={20} className="text-secondary" />
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
                <Weight size={20} className="text-secondary" />
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
              <span className="block text-xs font-semibold mb-0.5">
                Estado civil
              </span>
              <label className="flex items-center gap-2">
                <User2 size={20} className="text-secondary" />
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
          </div>
        </form>
      </div>
    </div>
  );
}
