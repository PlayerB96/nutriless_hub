export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string
  ) {}

  verifyPassword(password: string): boolean {
    // Aquí usas bcrypt.compareSync en la infraestructura real
    throw new Error("Implementar fuera de la entidad");
  }
}
