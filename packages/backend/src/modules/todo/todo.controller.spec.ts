import { Test } from "@nestjs/testing";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";
import { TodoStatus } from "@ems-portal/types";
import { TodoEntity } from "./entites/todo.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

const mockedTodos: TodoEntity[] = [
  {
    id: "todo-1",
    title: "Buy groceries",
    description: "Milk, eggs, bread, and vegetables",
    status: TodoStatus.Todo,
    createdAt: new Date("2024-12-01T09:00:00Z"),
    updatedAt: new Date("2024-12-01T09:00:00Z"),
  },
  {
    id: "todo-2",
    title: "Write unit tests",
    description: "Add unit tests for TodoOverview and TodoList",
    status: TodoStatus.InProgress,
    createdAt: new Date("2024-12-02T10:30:00Z"),
    updatedAt: new Date("2024-12-03T14:15:00Z"),
  },
];

const mockedTodo = mockedTodos[0];

describe("TodoController", () => {
  let controller: TodoController;
  let service: jest.Mocked<TodoService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            useValue: {
              find: jest.fn(),
              findOne: jest.fn(),
              create: jest.fn(),
              save: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<TodoController>(TodoController);
    service = moduleRef.get<TodoService, jest.Mocked<TodoService>>(TodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("findAll: should return all todos", async () => {
    service.findAll.mockResolvedValue(mockedTodos);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockedTodos);
  });

  it("findOne: should call service.findOne with params.id and return todo", async () => {
    const params = { id: mockedTodo.id };

    service.findOne.mockResolvedValue(mockedTodo);

    const result = await controller.findOne(params);

    expect(service.findOne).toHaveBeenCalledTimes(1);
    expect(service.findOne).toHaveBeenCalledWith(mockedTodo.id);
    expect(result).toBe(mockedTodo);
  });

  it("create: should call service.create with dto and return created todo", async () => {
    const payload = {
      title: mockedTodo.title,
      description: mockedTodo.description,
    };

    service.create.mockResolvedValue(mockedTodo);

    const result = await controller.create(payload);

    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.create).toHaveBeenCalledWith(payload);
    expect(result).toBe(mockedTodo);
  });

  it("update: should call service.update with params.id and dto and return affected response", async () => {
    const params = { id: mockedTodo.id };
    const payload = {
      title: mockedTodo.title + " Updated",
      description: mockedTodo.description + " Updated",
    };
    const affected = { affected: 1 };

    service.update.mockResolvedValue(affected);

    const result = await controller.update(params, payload);

    expect(service.update).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledWith(mockedTodo.id, payload);
    expect(result).toBe(affected);
  });

  it("remove: should call service.remove with params.id and return affected response", async () => {
    const params = { id: mockedTodo.id };
    const affected = { affected: 1 };

    service.remove.mockResolvedValue(affected);

    const result = await controller.remove(params);

    expect(service.remove).toHaveBeenCalledTimes(1);
    expect(service.remove).toHaveBeenCalledWith(mockedTodo.id);
    expect(result).toBe(affected);
  });

  it("should propagate errors from the service (example: findOne)", async () => {
    const params = { id: "missing" };
    const err = new Error("Not found");

    service.findOne.mockRejectedValue(err);

    await expect(controller.findOne(params)).rejects.toThrow("Not found");
  });
});
