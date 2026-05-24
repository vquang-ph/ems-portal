import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "./entites/user.entity";
import { UserRepository } from "./user.repository";

describe("UserRepository", () => {
  let repository: UserRepository;
  let mockDataSource: jest.Mocked<Partial<DataSource>>;

  beforeEach(async () => {
    const mockEntityManager = {};

    mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should be an instance of Repository<UserEntity>", () => {
    expect(repository).toBeInstanceOf(Repository);
  });

  it("findByEmail: lowercases input before querying", async () => {
    const findOneSpy = jest
      .spyOn(repository, "findOne")
      .mockResolvedValue(null);

    await repository.findByEmail("Admin@EMS.local");

    expect(findOneSpy).toHaveBeenCalledWith({
      where: { email: "admin@ems.local" },
    });
  });
});
