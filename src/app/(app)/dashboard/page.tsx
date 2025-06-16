"use client";

import { useState, useEffect } from "react";
import MainContent from "@/components/ui/MainContent";
import Modal from "@/components/ui/Modal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FormularioAlimento from "./components/FormularioAlimento";
import { BookOpen, Leaf, NotebookPen, Package, PlusCircle } from "lucide-react";
import FormularioReceta from "./components/FormularioReceta";

export default function Home() {
  // Estado que indica qué modal está abierto, o null si ninguno
  const [openModal, setOpenModal] = useState<"alimento" | "receta" | null>(
    null
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
    const userId = (session?.user as { id: string }).id;
    return (
      <MainContent>
        <div className="bg-primary-secondary text-text dark:bg-primary-secondary dark:text-text rounded-xl p-8 space-y-6">
          <h1 className="text-4xl font-bold">
            Bienvenido{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mb-6 max-w-xl">
            Esta es tu plataforma para poder registrar alimentos procesados y
            generar dietas.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="flex items-center gap-2 bg-secondary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-secondary-secondary transition"
              onClick={() => setOpenModal("alimento")}
            >
              <PlusCircle size={20} />
              Agregar Alimento
            </button>

            {userId && (
              <button
                className="flex items-center gap-2 bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                onClick={() => router.push(`/dashboard/${userId}/procesados`)}
              >
                <Package size={20} />
                Alimentos Procesados
              </button>
            )}

            {userId && (
              <button
                className="flex items-center gap-2 bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                onClick={() => router.push(`/dashboard/${userId}/organicos`)}
              >
                <Leaf size={20} />
                Alimentos Orgánicos
              </button>
            )}
          </div>

          {/* Nueva fila para recetas */}
          {userId && (
            <div className="flex flex-wrap gap-4 mt-4">
              <button
                className="flex items-center gap-2 bg-secondary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                onClick={() => setOpenModal("receta")}
              >
                <NotebookPen size={20} />
                Agregar Receta
              </button>

              <button
                className="flex items-center gap-2 bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                onClick={() => router.push(`/dashboard/${userId}/recetas`)}
              >
                <BookOpen size={20} />
                Lista de Recetas
              </button>
            </div>
          )}
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
          <FormularioReceta onSubmitSuccess={handleSubmitSuccess} />
        </Modal>
      </MainContent>
    );
  }

  return null;
}
