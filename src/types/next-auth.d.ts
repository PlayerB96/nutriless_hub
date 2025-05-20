import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // <-- agrega esta propiedad
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  // Si usas JWT y quieres que también tenga `sub` como string:
  interface JWT {
    sub?: string;
  }
}
