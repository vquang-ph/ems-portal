import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { TodoService } from "./todo.service";
import { TodoRepository } from "./todo.repository";
import { TodoEntity } from "./entites/todo.entity";
import type { TodoCreateDto, TodoUpdateDto } from "./dto/todo.dto";
import { TodoStatus, type AffectedResponse } from "@ems-portal/types";
import type { UpdateResult, DeleteResult } from "typeorm";

describe("TodoService", () => {
  const makeTodoEntity = (overrides: Partial<TodoEntity> = {}): TodoEntity => {
    const todo = new TodoEntity();
    todo.id = "todo_1";
    todo.title = "Buy milk";
    todo.description = "Remember to buy milk";
    todo.status = TodoStatus.Todo;
    todo.createdAt = new Date("2025-01-01T00:00:00.000Z");
    Object.assign(todo, overrides);
    return todo;
  };

  let service: TodoService;

  let repository: TodoRepository;
  let repositoryMock: jest.Mocked<TodoRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: TodoRepository,
          useValue: {
            find: jest.fn(),
            findOneOrFail: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TodoService);

    repository = module.get(TodoRepository);
    repositoryMock = repository as jest.Mocked<TodoRepository>;

    jest.clearAllMocks();
  });

  it("constructor: can be instantiated directly", async () => {
    const service = new TodoService(repository);

    const todos: TodoEntity[] = [makeTodoEntity({ id: "todo_1" })];
    repositoryMock.find.mockResolvedValue(todos);

    await expect(service.findAll()).resolves.toEqual(todos);
    expect(repositoryMock.find).toHaveBeenCalledTimes(1);
  });

  it("findAll: returns repository.find()", async () => {
    const todos: TodoEntity[] = [
      makeTodoEntity({ id: "todo_1" }),
      makeTodoEntity({ id: "todo_2" }),
    ];

    repositoryMock.find.mockResolvedValue(todos);

    await expect(service.findAll()).resolves.toEqual(todos);
    expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    expect(repositoryMock.find).toHaveBeenCalledWith();
  });

  it("findOne: calls repository.findOneOrFail with id filter and returns entity", async () => {
    const mockedTodoId = "todo_123";
    const todo = makeTodoEntity({ id: mockedTodoId });

    repositoryMock.findOneOrFail.mockResolvedValue(todo);

    await expect(service.findOne(mockedTodoId)).resolves.toEqual(todo);
    expect(repositoryMock.findOneOrFail).toHaveBeenCalledWith({
      where: { id: mockedTodoId },
    });
  });

  it("findOne: propagates errors from repository.findOneOrFail", async () => {
    repositoryMock.findOneOrFail.mockRejectedValue(new Error("not found"));
    await expect(service.findOne("missing")).rejects.toThrow("not found");
  });

  it("create: calls repository.save with dto and returns saved entity", async () => {
    const mockedPayload: TodoCreateDto = {
      title: "New task",
      description: "Do the thing",
      status: TodoStatus.Pending,
    };

    const saved = makeTodoEntity({ id: "todo_create", ...mockedPayload });
    repositoryMock.save.mockResolvedValue(saved);

    await expect(service.create(mockedPayload)).resolves.toEqual(saved);
    expect(repositoryMock.save).toHaveBeenCalledWith(mockedPayload);
  });

  it("update: returns affected from repository.update result (non-null)", async () => {
    const mockedPayload: TodoUpdateDto = { status: TodoStatus.Completed };
    const mockedTodoId = "todo_1";
    const affectedResponse: AffectedResponse = { affected: 1 };

    const updateResult: UpdateResult = {
      generatedMaps: [],
      raw: [],
      affected: 1,
    };

    repositoryMock.update.mockResolvedValue(updateResult);

    await expect(service.update(mockedTodoId, mockedPayload)).resolves.toEqual(
      affectedResponse,
    );
    expect(repositoryMock.update).toHaveBeenCalledWith(
      mockedTodoId,
      mockedPayload,
    );
  });

  it("update: returns affected=0 when repository.update has affected undefined", async () => {
    const mockedPayload: TodoUpdateDto = { title: "Updated title" };
    const mockedTodoId = "todo_1";

    const updateResult: UpdateResult = {
      generatedMaps: [],
      raw: [],
      affected: undefined,
    };

    repositoryMock.update.mockResolvedValue(updateResult);

    await expect(service.update(mockedTodoId, mockedPayload)).resolves.toEqual({
      affected: 0,
    });
  });

  it("remove: returns affected from repository.delete result (non-null)", async () => {
    const mockedTodoId = "todo_1";
    const affectedResponse: AffectedResponse = { affected: 1 };

    const deleteResult: DeleteResult = {
      raw: [],
      ...affectedResponse,
    };

    repositoryMock.delete.mockResolvedValue(deleteResult);

    await expect(service.remove(mockedTodoId)).resolves.toEqual(
      affectedResponse,
    );
    expect(repositoryMock.delete).toHaveBeenCalledWith(mockedTodoId);
  });

  it("remove: returns affected=0 when repository.delete has affected undefined", async () => {
    const mockedTodoId = "todo_1";
    const affectedResponse: AffectedResponse = { affected: 0 };

    const deleteResult: DeleteResult = {
      raw: [],
      ...affectedResponse,
    };

    repositoryMock.delete.mockResolvedValue(deleteResult);

    await expect(service.remove(mockedTodoId)).resolves.toEqual(
      affectedResponse,
    );
  });
});
