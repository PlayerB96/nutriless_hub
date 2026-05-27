"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

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
    setLoadingButton(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/dashboard");
        return;
      }

      const err = decodeURIComponent(res?.error ?? "").replace(/\+/g, " ");
      if (res?.status === 429 || err === "TooManyRequests") {
        setError(
          "Demasiados intentos de inicio de sesión. Espera unos 15 minutos e inténtalo de nuevo.",
        );
      } else if (
        err === "DatabaseUnavailable" ||
        err.includes("database server") ||
        err.includes("Can't reach database") ||
        err.includes("prisma")
      ) {
        setError(
          "No se pudo conectar a Neon desde el servidor. Reinicia `pnpm run dev` (solo una terminal), espera 5–10 s e inténtalo de nuevo. Si persiste, revisa DATABASE_URL en Neon.",
        );
      } else {
        setError("Credenciales inválidas. Intenta de nuevo.");
      }
    } catch (cause) {
      console.error("[login] signIn falló:", cause);
      setError(
        "No se pudo contactar con el servidor de autenticación. Comprueba que `npm run dev` está en marcha, que usas la misma URL que NEXTAUTH_URL (p. ej. http://localhost:3000) y revisa la consola del servidor.",
      );
    } finally {
      setLoadingButton(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex justify-center py-12" aria-busy="true">
        <LoaderCircle className="animate-spin w-8 h-8 text-secondary" />
      </div>
    );
  }

  return (
    <div className="bg-card shadow-xl rounded-xl p-5 tablet:p-6 desktop:p-8 w-full max-w-md">
      <h1 className="text-xl tablet:text-2xl font-bold mb-4 tablet:mb-6 text-center">
        Iniciar sesión
      </h1>

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
          className={`w-full cursor-pointer bg-secondary px-4 py-2 text-white rounded-md transition hover:opacity-90 flex justify-center items-center ${
            loadingButton ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loadingButton ? (
            // Spinner SVG sencillo
            <LoaderCircle className="animate-spin w-5 h-5 text-white" />
          ) : (
            "Ingresar"
          )}
        </button>
      </form>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 border border-dashed border-yellow-500 rounded-md bg-yellow-50 dark:bg-yellow-950/30 text-xs">
          <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
            Credenciales de prueba (dev)
          </p>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-foreground select-all">admin@ejemplo.com</span>
            <button
              type="button"
              className="text-secondary hover:underline cursor-pointer"
              onClick={() => setEmail("admin@ejemplo.com")}
            >
              Usar
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground select-all">123</span>
            <button
              type="button"
              className="text-secondary hover:underline cursor-pointer"
              onClick={() => setPassword("123")}
            >
              Usar
            </button>
          </div>
          <button
            type="button"
            className="mt-2 w-full text-center text-secondary hover:underline cursor-pointer text-xs"
            onClick={() => {
              setEmail("admin@ejemplo.com");
              setPassword("123");
            }}
          >
            Usar ambos
          </button>
        </div>
      )}
    </div>
  );
}
