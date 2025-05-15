// app/page.tsx 
"use client";

import MainContent from "@/components/ui/MainContent";

export default function Home() {

  return (
    <MainContent>
      <div className="bg-yellow-100 dark:bg-blue-950 text-gray-900 dark:text-gray-100 rounded-xl p-8 ">
        <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
        <p className="mb-6">
          Esta es tu plataforma con soporte para modo claro y oscuro.
        </p>
       
      </div>
    </MainContent>
  );
}
