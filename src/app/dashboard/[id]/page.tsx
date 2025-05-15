"use client";

import { useParams } from "next/navigation";

export default function DashboardIdPage() {
  const params = useParams();
  const { id } = params;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard - Detalle para ID: {id}</h1>

      {id === "1" && <p>Contenido especial para la ID 1</p>}
      {id === "2" && <p>Contenido especial para la ID 2</p>}
      {id !== "1" && id !== "2" && <p>Contenido general para ID: {id}</p>}
    </main>
  );
}
