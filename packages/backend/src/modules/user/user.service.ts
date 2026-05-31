import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { EntityManager } from "typeorm";
import { BCRYPT_ROUNDS } from "./constants";
import { CreateUserInput } from "./dto/user.dto";
import { UserEntity } from "./entites/user.entity";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  public constructor(@Inject() private readonly repository: UserRepository) {}

  /**
   * Looks up a user by email address.
   *
   * @param email - The email to search for (matched case-insensitively).
   * @returns The matching user entity, or null if none exists.
   */
  public async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findByEmail(email);
  }

  /**
   * Loads a user by their unique identifier.
   *
   * @param id - The user's UUID.
   * @returns The matching user entity.
   * @throws EntityNotFoundError if no user has the given id.
   */
  public async findById(id: string): Promise<UserEntity> {
    return this.repository.findOneOrFail({ where: { id } });
  }

  /**
   * Creates a new user, hashing the plaintext password before persistence.
   * When called inside a transaction, pass the active EntityManager so the
   * insert joins that transaction instead of opening a new connection.
   *
   * @param input - The new user's email, name, role, and plaintext password.
   * @param manager - Optional EntityManager for the enclosing transaction.
   * @returns The newly persisted user entity.
   */
  public async createUser(
    input: CreateUserInput,
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const payload = {
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      passwordHash,
    };

    const repo = manager ? manager.getRepository(UserEntity) : this.repository;
    return repo.save(payload);
  }

  /**
   * Checks whether a plaintext password matches a stored bcrypt hash.
   *
   * @param plain - The plaintext password supplied by the caller.
   * @param hash - The stored bcrypt hash to compare against.
   * @returns True if the password matches the hash, false otherwise.
   */
  public async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
