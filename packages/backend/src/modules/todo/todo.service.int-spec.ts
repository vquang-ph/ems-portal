import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TodoService } from "./todo.service";
import { TodoRepository } from "./todo.repository";
import { TodoEntity } from "./entites/todo.entity";
import { databaseConfig } from "@/config/database";
import { TodoStatus } from "@ems-portal/types";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { INITIAL_TODOS } from "@/database/seeds/data/todo.data";

/**
 * Integration Tests for TodoService
 * Expected to be run with Database connected with Seed Data
 */
describe("TodoService (Integration)", () => {
  let service: TodoService;
  let repository: TodoRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const options = databaseConfig(config);

            return {
              ...options,
              entities: [TodoEntity],

              // No sync, No drop in Integration Tests
              synchronize: false,
              dropSchema: false,
            };
          },
        }),
        TypeOrmModule.forFeature([TodoEntity]),
      ],
      providers: [TodoService, TodoRepository],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get<TodoRepository>(TodoRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  it("should return the exact seeded data structure", async () => {
    const todos = await service.findAll();

    expect(todos.length).toBeGreaterThanOrEqual(INITIAL_TODOS.length);

    const expectedFirstItem = INITIAL_TODOS[0];

    const actualItem = todos.find((t) => t.title === expectedFirstItem.title);

    expect(actualItem).toBeDefined();
    expect(actualItem?.description).toBe(expectedFirstItem.description);
    expect(actualItem?.status).toBe(expectedFirstItem.status);
  });

  it("should find a specific seed item by ID", async () => {
    const allTodos = await service.findAll();
    const knownSeed = allTodos.find((t) => t.title === INITIAL_TODOS[1].title);

    expect(knownSeed).toBeDefined();

    const found = await service.findOne(knownSeed!.id);

    expect(found).toBeDefined();
    expect(found.id).toBe(knownSeed!.id);
    expect(found.title).toBe(INITIAL_TODOS[1].title);
  });

  it("should throw an error when finding a non-existent ID", async () => {
    const fakeId = "99999-non-existent";
    await expect(service.findOne(fakeId)).rejects.toThrow();
  });

  it("should create a new todo and persist it", async () => {
    const createDto = {
      title: "Integration Create Test",
      description: "Testing Create",
      status: TodoStatus.Pending,
    };

    const newTodo = await service.create(createDto);

    const inDb = await repository.findOne({ where: { id: newTodo.id } });
    expect(inDb?.title).toBe(createDto.title);

    // Clean Up
    await repository.delete(newTodo.id);
  });

  it("should update an existing todo and return affected count", async () => {
    // Create a temporary item just for this test
    const todo = await service.create({
      title: "To Be Updated",
      description: "Old Desc",
      status: TodoStatus.Pending,
    });

    const updateResult = await service.update(todo.id, {
      status: TodoStatus.Completed,
    });

    expect(updateResult.affected).toBe(1);

    const updatedInDb = await repository.findOne({ where: { id: todo.id } });
    expect(updatedInDb?.status).toBe(TodoStatus.Completed);

    // Clean Up
    await repository.delete(todo.id);
  });

  it("should remove a todo permanently", async () => {
    // Create a temporary item just for this test
    const todo = await service.create({
      title: "To Be Deleted",
      description: "Delete me",
      status: TodoStatus.Pending,
    });

    const deleteResult = await service.remove(todo.id);
    expect(deleteResult.affected).toBe(1);

    const inDb = await repository.findOne({ where: { id: todo.id } });
    expect(inDb).toBeNull();
  });
});
