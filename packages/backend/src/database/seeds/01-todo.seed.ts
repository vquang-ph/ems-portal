import { TodoEntity } from "@/modules/todo/entites/todo.entity";
import type { Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { INITIAL_TODOS } from "./data/todo.data";

export const run = async (
  dataSource: DataSource,
  seedLogger: Logger,
): Promise<void> => {
  const todoRepo = dataSource.getRepository(TodoEntity);

  seedLogger.log("Seeding 01-Todo...");

  // Clean the table
  await todoRepo.clear();

  const todoEntities = todoRepo.create(INITIAL_TODOS);

  await todoRepo.save(todoEntities);

  seedLogger.log(`Done. ${INITIAL_TODOS.length} items created.`);
};
