"use client";

import { useState } from "react";
import MainContent from "@/components/ui/MainContent";
import Modal from "@/components/ui/Modal";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <MainContent>
      <div className="bg-primary-secondary text-text dark:bg-primary-secondary dark:text-text rounded-xl p-8">
        <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
        <p className="mb-6">
          Esta es tu plataforma con soporte para modo claro y oscuro.
        </p>

        <button
          className="bg-secondary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-secondary-secondary transition"
          onClick={() => setModalOpen(true)}
        >
          Abrir Modal
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Formulario y Tabla Compleja"
        width="w-full max-w-4xl" // ancho más amplio para contenido extenso
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="bg-muted text-text px-4 py-2 rounded-md hover:bg-muted/80"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-secondary"
              onClick={() => {
                alert("Formulario enviado");
                setModalOpen(false);
              }}
            >
              Enviar
            </button>
          </div>
        }
      >
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Formulario de Registro</h3>
          <form className="space-y-6 max-w-3xl">
            <div>
              <label htmlFor="nombre" className="block mb-1 font-medium">
                Nombre completo
              </label>
              <input
                type="text"
                id="nombre"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div>
              <label htmlFor="mensaje" className="block mb-1 font-medium">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                className="w-full border border-gray-300 rounded-md p-2"
                rows={4}
                placeholder="Escribe tu mensaje aquí"
              />
            </div>
          </form>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Tabla de Datos</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-left">
              <thead className="bg-primary-secondary text-text dark:bg-primary-secondary dark:text-text">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">ID</th>
                  <th className="border border-gray-300 px-4 py-2">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(15)].map((_, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : ""}
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      {i + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Usuario {i + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      usuario{i + 1}@mail.com
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {i % 3 === 0 ? "Activo" : "Inactivo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Modal>
    </MainContent>
  );
}
