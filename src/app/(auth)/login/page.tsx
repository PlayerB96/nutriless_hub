"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingButton, setLoadingButton] = useState(false);

  // Redirige si ya está autenticado
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingButton(true); // activamos spinner en el botón

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoadingButton(false);

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Credenciales inválidas. Intenta de nuevo.");
    }
  };

  if (status === "authenticated") {
    return null; // redirige
  }

  return (
    <div className="bg-card shadow-xl rounded-xl p-8 w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-background text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loadingButton}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            className="w-full mt-1 px-4 py-2 border rounded-md bg-background text-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loadingButton}
          />
        </div>

        <button
          type="submit"
          disabled={loadingButton}
          className={`w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition flex justify-center items-center ${
            loadingButton ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loadingButton ? (
            // Spinner SVG sencillo
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            "Ingresar"
          )}
        </button>
      </form>
    </div>
  );
}
