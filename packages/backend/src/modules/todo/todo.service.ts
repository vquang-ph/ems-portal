import { Inject, Injectable } from "@nestjs/common";
import { TodoEntity } from "./entites/todo.entity";
import { TodoRepository } from "./todo.repository";
import { TodoCreateDto, TodoUpdateDto } from "./dto/todo.dto";
import { AffectedResponse } from "@ems-portal/types";

@Injectable()
export class TodoService {
  public constructor(@Inject() private readonly repository: TodoRepository) {}

  public async findAll(): Promise<TodoEntity[]> {
    return this.repository.find();
  }

  public async findOne(id: string): Promise<TodoEntity> {
    return this.repository.findOneOrFail({ where: { id } });
  }

  public async create(todoDto: TodoCreateDto): Promise<TodoEntity> {
    return this.repository.save(todoDto);
  }

  public async update(
    id: string,
    todoDto: TodoUpdateDto,
  ): Promise<AffectedResponse> {
    const result = await this.repository.update(id, todoDto);

    return { affected: result.affected ?? 0 };
  }

  public async remove(id: string): Promise<AffectedResponse> {
    const result = await this.repository.delete(id);

    return { affected: result.affected ?? 0 };
  }
}
