import { useState } from "react";

import { useParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function FormularioPaciente({ onSubmitSuccess }: { onSubmitSuccess: () => void }) {
  const params = useParams();
  const userId = params.userId as string;
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    gender: "",
    birthDate: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        setError(error.error || "Error al guardar el paciente.");
        return;
      }
      onSubmitSuccess();
    } catch {
      setError("Error al guardar el paciente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Datos personales */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Datos del Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">Nombre</label>
            <input name="name" id="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="w-full border border-gray-300 rounded-md p-2 bg-bg" required />
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-1 font-medium">Apellido</label>
            <input name="lastName" id="lastName" value={form.lastName} onChange={handleChange} placeholder="Apellido" className="w-full border border-gray-300 rounded-md p-2 bg-bg" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="gender" className="block mb-1 font-medium">Género</label>
            <select name="gender" id="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 bg-bg" required>
              <option value="">Selecciona género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
          <div>
            <label htmlFor="birthDate" className="block mb-1 font-medium">Fecha de nacimiento</label>
            <input name="birthDate" id="birthDate" type="date" value={form.birthDate} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 bg-bg" required />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">Correo electrónico</label>
            <input name="email" id="email" value={form.email} onChange={handleChange} placeholder="Correo" className="w-full border border-gray-300 rounded-md p-2 bg-bg" type="email" />
          </div>
          <div>
            <label htmlFor="phone" className="block mb-1 font-medium">Teléfono</label>
            <input name="phone" id="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" className="w-full border border-gray-300 rounded-md p-2 bg-bg" />
          </div>
        </div>
      </section>

      {/* Datos físicos */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Datos físicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="height" className="block mb-1 font-medium">Altura (cm)</label>
            <input name="height" id="height" value={form.height} onChange={handleChange} placeholder="Altura (cm)" className="w-full border border-gray-300 rounded-md p-2 bg-bg" type="number" min="0" />
          </div>
          <div>
            <label htmlFor="weight" className="block mb-1 font-medium">Peso (kg)</label>
            <input name="weight" id="weight" value={form.weight} onChange={handleChange} placeholder="Peso (kg)" className="w-full border border-gray-300 rounded-md p-2 bg-bg" type="number" min="0" />
          </div>
        </div>
      </section>

      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end gap-4 pt-4">
        <button type="submit" className={`cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition ${loading ? "cursor-not-allowed opacity-70" : ""}`} disabled={loading}>
          {loading ? (
            <LoaderCircle className="animate-spin w-5 h-5 text-white" />
          ) : (
            "Registrar Paciente"
          )}
        </button>
      </div>
    </form>
  );
}
