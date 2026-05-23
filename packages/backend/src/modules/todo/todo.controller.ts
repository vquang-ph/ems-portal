import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { TodoService } from "./todo.service";
import { type TodoParams } from "@ems-portal/types";
import { TodoCreateDto, TodoDto, TodoUpdateDto } from "./dto/todo.dto";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AffectedResponseDto } from "@/common/dto/base.dto";

@ApiTags("Todos")
@Controller("todos")
export class TodoController {
  public constructor(private readonly service: TodoService) {}

  @Get()
  @ApiOperation({ summary: "Get all todos" })
  public async findAll(): Promise<TodoDto[]> {
    return this.service.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a todo by ID" })
  @ApiParam({
    name: "id",
    type: String,
    description: "The ID of the todo to retrieve",
  })
  public async findOne(@Param() params: TodoParams): Promise<TodoDto> {
    return this.service.findOne(params.id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new todo" })
  public async create(@Body() todoCreateDto: TodoCreateDto): Promise<TodoDto> {
    return this.service.create(todoCreateDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a todo by ID" })
  @ApiParam({
    name: "id",
    type: String,
    description: "The ID of the todo to update",
  })
  public async update(
    @Param() params: TodoParams,
    @Body() todoDto: TodoUpdateDto,
  ): Promise<AffectedResponseDto> {
    return this.service.update(params.id, todoDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a todo by ID" })
  @ApiParam({
    name: "id",
    type: String,
    description: "The ID of the todo to delete",
  })
  public async remove(
    @Param() params: TodoParams,
  ): Promise<AffectedResponseDto> {
    return this.service.remove(params.id);
  }
}
