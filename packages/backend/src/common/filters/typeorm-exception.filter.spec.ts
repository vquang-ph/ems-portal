import { HttpStatus, type ArgumentsHost } from "@nestjs/common";
import { TypeOrmExceptionFilter } from "./typeorm-exception.filter";
import { TypeORMError } from "typeorm/error/TypeORMError";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import type { FastifyReply } from "fastify";

describe("TypeOrmExceptionFilter", () => {
  const makeHost = (reply: FastifyReply): ArgumentsHost => {
    const httpCtx = {
      getResponse: <T>() => reply as unknown as T,
    };

    return {
      switchToHttp: () => httpCtx,
    } as unknown as ArgumentsHost;
  };

  const makeReply = (): jest.Mocked<Pick<FastifyReply, "status" | "send">> => {
    const reply = {
      status: jest.fn(),
      send: jest.fn(),
    } as unknown as jest.Mocked<Pick<FastifyReply, "status" | "send">>;

    reply.status.mockReturnValue(reply as unknown as FastifyReply);

    return reply;
  };

  it("defaults to 500 and sends exception.message for generic TypeORMError", () => {
    const filter = new TypeOrmExceptionFilter();
    const reply = makeReply();
    const host = makeHost(reply as unknown as FastifyReply);

    const err = new TypeORMError("db blew up");

    filter.catch(err, host);

    expect(reply.status).toHaveBeenCalledTimes(1);
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(reply.send).toHaveBeenCalledTimes(1);

    const payload = reply.send.mock.calls[0][0] as {
      status: number;
      error: string;
      timestamp: Date;
    };

    expect(payload.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(payload.error).toBe("db blew up");
    expect(payload.timestamp).toBeInstanceOf(Date);
  });

  it('maps EntityNotFoundError to 404 and replaces message with "Entity Not Found"', () => {
    const filter = new TypeOrmExceptionFilter();
    const reply = makeReply();
    const host = makeHost(reply as unknown as FastifyReply);

    const err = new EntityNotFoundError("TodoEntity", { id: "missing" });

    filter.catch(err, host);

    expect(reply.status).toHaveBeenCalledTimes(1);
    expect(reply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

    expect(reply.send).toHaveBeenCalledTimes(1);

    const payload = reply.send.mock.calls[0][0] as {
      status: number;
      error: string;
      timestamp: Date;
    };

    expect(payload.status).toBe(HttpStatus.NOT_FOUND);
    expect(payload.error).toBe("Entity Not Found");
    expect(payload.timestamp).toBeInstanceOf(Date);
  });
});
