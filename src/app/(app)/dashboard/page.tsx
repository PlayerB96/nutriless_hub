"use client";

import { useState, useEffect } from "react";
import MainContent from "@/components/ui/MainContent";
import Modal from "@/components/ui/Modal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FormularioAlimento from "./components/FormularioAlimento";
import {
  BookOpen,
  Contact,
  Leaf,
  NotebookPen,
  Package,
  PlusCircle,
  User,
} from "lucide-react";
import FormularioReceta from "./components/FormularioReceta";

export default function Home() {
  // Estado que indica qué modal está abierto, o null si ninguno
  const [openModal, setOpenModal] = useState<"alimento" | "receta" | null>(
    null,
  );

  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSubmitSuccess = () => {
    setOpenModal(null); // cierra cualquier modal abierto
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (status === "authenticated") {
    // Simulación de userId en duro para pruebas locales
    const userId = (session?.user as { id: string })?.id || "demo123";
    return (
      <MainContent>
        <div className="text-text rounded-2xl p-2 space-y-4">
          <h1 className="text-4xl font-bold mb-2 text-secondary">
            Bienvenido{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mb-8 max-w-xl text-text-alt text-lg">
            Esta es tu plataforma para registrar alimentos, pacientes y generar
            dietas de manera sencilla.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tarjeta estándar para cada sección */}
            <section className="bg-primary rounded-xl p-6 flex flex-col items-center border border-primary transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4">Pacientes</h2>
              <button
                className="w-full cursor-pointer flex items-center justify-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg font-medium mb-3 transition-all duration-200 shadow hover:scale-105  hover:bg-secondary-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => setOpenModal("receta")}
              >
                <User size={20} /> Agregar Paciente
              </button>
              <button
                className="w-full  cursor-pointer flex items-center justify-center gap-2 text-secondary border border-secondary px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow hover:scale-105  hover:bg-secondary-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => router.push(`/dashboard/${userId}/pacientes`)}
              >
                <Contact size={20} /> Lista de Pacientes
              </button>
            </section>

            <section className="bg-primary rounded-xl p-6 flex flex-col items-center border border-primary transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4">Recetas</h2>
              <button
                className="w-full cursor-pointer flex items-center justify-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg font-medium mb-3 transition-all duration-200 shadow hover:scale-105  hover:bg-secondary-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => setOpenModal("receta")}
              >
                <NotebookPen size={20} /> Agregar Receta
              </button>
              <button
                className="w-full cursor-pointer flex items-center justify-center gap-2 text-secondary border border-secondary px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow hover:scale-105  hover:bg-secondary-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => router.push(`/dashboard/${userId}/recetas`)}
              >
                <BookOpen size={20} /> Lista de Recetas
              </button>
            </section>

            <section className="bg-primary rounded-xl p-6 flex flex-col items-center border border-primary transition-all duration-200">
              <h2 className="text-xl font-semibold mb-4">
                Alimentos y Pacientes
              </h2>
              <button
                className="w-full cursor-pointer flex items-center justify-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg font-medium mb-3 transition-all duration-200 shadow hover:scale-105  hover:bg-secondary-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => setOpenModal("alimento")}
              >
                <PlusCircle size={20} /> Agregar Alimento
              </button>
              <button
                className="w-full cursor-pointer flex items-center justify-center gap-2 text-secondary border border-secondary px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow hover:scale-105  hover:bg-secondary-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => router.push(`/dashboard/${userId}/procesados`)}
              >
                <Package size={20} /> Alimentos Procesados
              </button>
              <button
                className="w-full cursor-pointer flex items-center justify-center gap-2 text-secondary border border-secondary px-4 py-2 rounded-lg font-medium mt-2 transition-all duration-200 shadow hover:scale-105  hover:bg-secondary-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                onClick={() => router.push(`/dashboard/${userId}/organicos`)}
              >
                <Leaf size={20} /> Alimentos Orgánicos
              </button>
            </section>
          </div>
        </div>

        {/* Modal para Alimento */}
        <Modal
          isOpen={openModal === "alimento"}
          onClose={() => setOpenModal(null)}
          title="Crea Nuevo Alimento"
          width="w-full max-w-4xl"
        >
          <FormularioAlimento onSubmitSuccess={handleSubmitSuccess} />
        </Modal>

        {/* Modal para Receta (ejemplo, agrega el componente de receta aquí) */}
        <Modal
          isOpen={openModal === "receta"}
          onClose={() => setOpenModal(null)}
          title="Crea Nueva Receta"
          width="w-full max-w-4xl"
        >
          {/* Aquí puedes poner el formulario de receta, por ejemplo: */}
          <FormularioReceta
            onSubmitSuccess={handleSubmitSuccess}
            userId={userId}
          />
        </Modal>
      </MainContent>
    );
  }

  return null;
}
