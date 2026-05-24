import { UserEntity } from "@/modules/user/entites/user.entity";
import type { Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { INITIAL_USERS } from "./data/user.data";

const BCRYPT_ROUNDS = 10;

export const run = async (
  dataSource: DataSource,
  seedLogger: Logger,
): Promise<void> => {
  const userRepo = dataSource.getRepository(UserEntity);

  seedLogger.log("Seeding 1-Users...");

  const entities = await Promise.all(
    INITIAL_USERS.map(async ({ password, email, ...rest }) => ({
      ...rest,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    })),
  );

  await userRepo.upsert(entities, {
    conflictPaths: ["email"],
    skipUpdateIfNoValuesChanged: true,
  });

  seedLogger.log(`Done. ${INITIAL_USERS.length} items upserted.`);
};
