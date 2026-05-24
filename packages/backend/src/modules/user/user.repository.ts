import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entites/user.entity";

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  public constructor(@InjectDataSource() private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  /**
   * Finds a user by email, normalizing the input to lowercase first.
   *
   * @param email - The email to look up (case-insensitive).
   * @returns The matching user entity, or null if none exists.
   */
  public async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email: email.toLowerCase() } });
  }
}
