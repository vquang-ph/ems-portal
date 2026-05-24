import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entites/user.entity";

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  public constructor(@InjectDataSource() private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email: email.toLowerCase() } });
  }
}
