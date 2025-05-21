declare module "next-auth" {
  interface Session {
    expires: string;

    user: {
      id: string; // tu propiedad extra
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string; // extensión para el usuario en general
  }

  interface JWT {
    id?: string; // <-- Extiendes para que JWT tenga id
    sub?: string;
  }
}
