import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcryptjs";

export class ValidateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return false;

    return bcrypt.compare(password, user.passwordHash); // Verifica con hash
  }
}
