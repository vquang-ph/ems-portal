import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { TodoEntity } from "./entites/todo.entity";
import { TodoRepository } from "./todo.repository";

describe("TodoRepository", () => {
  let repository: TodoRepository;
  let mockDataSource: jest.Mocked<Partial<DataSource>>;

  beforeEach(async () => {
    // Minimal mock EntityManager that DataSource returns
    const mockEntityManager = {};

    mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoRepository,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get(TodoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should be an instance of Repository<TodoEntity>", () => {
    expect(repository).toBeInstanceOf(Repository);
  });

  it("should create an EntityManager from the DataSource", () => {
    expect(mockDataSource.createEntityManager).toHaveBeenCalledTimes(1);
  });
});
