import { ErrorResponse } from "@ems-portal/types";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { TypeORMError } from "typeorm/error/TypeORMError";

@Catch(TypeORMError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  public catch(exception: TypeORMError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    // By default all errors are treated as internal server errors
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = exception.message;

    // For entityNotFound, we override to status to 404 Not Found, and clean up the error message
    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      error = "Entity Not Found";
    }

    void response.status(status).send({
      status: status,
      error: error,
      timestamp: new Date(),
    } satisfies ErrorResponse);
  }
}
