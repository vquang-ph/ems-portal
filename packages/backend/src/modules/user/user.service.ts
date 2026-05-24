import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { CreateUserInput } from "./dto/user.dto";
import { UserEntity } from "./entites/user.entity";
import { UserRepository } from "./user.repository";

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UserService {
  public constructor(@Inject() private readonly repository: UserRepository) {}

  public async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findByEmail(email);
  }

  public async findById(id: string): Promise<UserEntity> {
    return this.repository.findOneOrFail({ where: { id } });
  }

  public async createUser(input: CreateUserInput): Promise<UserEntity> {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    return this.repository.save({
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      passwordHash,
    });
  }

  public async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
