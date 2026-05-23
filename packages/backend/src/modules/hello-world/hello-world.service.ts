import { Inject, Injectable } from "@nestjs/common";
import { HelloWorldRepository } from "./hello-world.repository";

@Injectable()
export class HelloWorldService {
  public constructor(
    @Inject() private readonly repository: HelloWorldRepository,
  ) {}

  public async getHello(): Promise<{ message: string }> {
    return Promise.resolve({ message: "Hello from HelloWorld module" });
  }
}
