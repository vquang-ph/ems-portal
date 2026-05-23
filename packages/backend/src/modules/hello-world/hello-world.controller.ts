import { Controller, Get } from "@nestjs/common";
import { HelloWorldService } from "./hello-world.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("HelloWorld")
@Controller("hello-world")
export class HelloWorldController {
  public constructor(private readonly service: HelloWorldService) {}

  @Get()
  @ApiOperation({ summary: "Hello from HelloWorld" })
  public async getHello(): Promise<{ message: string }> {
    return this.service.getHello();
  }
}
