"use client";

import { useState, useEffect } from "react";
import MainContent from "@/components/ui/MainContent";
import Modal from "@/components/ui/Modal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FormularioAlimento from "./components/FormularioAlimento";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSubmitSuccess = () => {
    setModalOpen(false); // cierra el modal cuando el form se envíe bien
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Cargando...</div>;
  }
    console.log(status)
    console.log(session)

  if (status === "authenticated") {
    // const userId = session?.user?.id;
    const userId = (session?.user as { id: string }).id;
    return (
      <MainContent>
        <div className="bg-primary-secondary text-text dark:bg-primary-secondary dark:text-text rounded-xl p-8">
          <h1 className="text-4xl font-bold mb-4">
            Bienvenido{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mb-6">
            Esta es tu plataforma con soporte para modo claro y oscuro.
          </p>

          <button
            className="bg-secondary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-secondary-secondary transition mr-4"
            onClick={() => setModalOpen(true)}
          >
            Abrir Modal
          </button>

          {userId && (
            <button
              className="bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
              onClick={() => router.push(`/dashboard/${userId}`)}
            >
              Ver mis alimentos
            </button>
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Crea Nuevo Alimento"
          width="w-full max-w-4xl"
        >
          <FormularioAlimento
            onSubmitSuccess={handleSubmitSuccess}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      </MainContent>
    );
  }

  return null;
}
