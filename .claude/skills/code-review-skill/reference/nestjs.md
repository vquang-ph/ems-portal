# NestJS Code Review Guide

> A NestJS code review guide covering core topics such as Dependency Injection (DI), layered architecture, module organization, Guards/Interceptors/Pipes, DTO validation, error handling, circular dependencies, and testing patterns.

## Table of Contents

* [Dependency Injection & Layered Architecture](https://www.google.com/search?q=%23dependency-injection--layered-architecture)
* [Module Organization](https://www.google.com/search?q=%23module-organization)
* [Guards / Interceptors / Pipes](https://www.google.com/search?q=%23guards--interceptors--pipes)
* [Validation Patterns (DTOs)](https://www.google.com/search?q=%23validation-patterns-dtos)
* [Error Handling](https://www.google.com/search?q=%23error-handling)
* [Circular Dependencies](https://www.google.com/search?q=%23circular-dependencies)
* [Testing Patterns](https://www.google.com/search?q=%23testing-patterns)
* [Review Checklist](https://www.google.com/search?q=%23review-checklist)

---

## Dependency Injection & Layered Architecture

### Three-Tier Architecture: Controller → Service → Repository

```typescript
// ❌ ORM injected directly into Controller, skipping the Service layer
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.user.findMany();
  }
}

// ✅ Controller → Service → Repository
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  findAll() {
    return this.usersRepo.findAll();
  }
}

```

### Repositories Should Not Inject Each Other

```typescript
// ❌ Repository importing another Repository—orchestration logic belongs in the Service
@Injectable()
export class OrdersRepository {
  constructor(private readonly usersRepository: UsersRepository) {}
}

// ✅ Cross-repository orchestration is handled within the Service
@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly usersRepo: UsersRepository,
  ) {}
}

```

### God Service: Split When Dependencies Exceed 8

```typescript
// ❌ A giant Service with 9 dependencies
@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly usersRepo: UsersRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly paymentsService: PaymentsService,
    private readonly mailerService: MailerService,
    private readonly inventoryService: InventoryService,
    private readonly discountService: DiscountService,
    private readonly taxService: TaxService,
    private readonly auditService: AuditService,
  ) {}
}

// ✅ Split into Use-Case Services (one file per operation)
@Injectable()
export class CreateOrderService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly paymentsService: PaymentsService,
  ) {}

  async execute(dto: CreateOrderDto) { /* ... */ }
}

```

### Dependency Inversion Using Symbol Tokens

```typescript
// ❌ Directly depending on a concrete implementation—impossible to swap during testing
@Injectable()
export class UsersService {
  constructor(private readonly repo: TypeOrmUserRepository) {}
}

// ✅ Interface + Symbol Token—swappable for an in-memory implementation
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
}

// module:
{
  provide: USER_REPOSITORY,
  useClass: TypeOrmUserRepository,
}

// service:
@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}
}

```

---

## Module Organization

### Recommended Four-Layer Structure

```
src/
  common/       ← Global technical infrastructure (Guards, Filters, Interceptors, Decorators)
  core/         ← Internal infrastructure (Config, Database, Queue configurations)
  integrations/ ← Wrappers for external services (Mailer, Storage, Stripe, SMS)
  modules/      ← Business logic organized by domain
    [feature]/
      dtos/
      repositories/
      services/
        internal/   ← Services shared within the module
        use-cases/  ← One file = One operation
      types/
      [feature].controller.ts
      [feature].module.ts

```

### Domains Must Be Framework-Agnostic

```typescript
// ❌ Domain Entity depending on NestJS—cannot be tested independently
import { Injectable } from '@nestjs/common';

@Injectable()
export class User {
  constructor(private readonly email: string) {}
}

// ✅ Domain is a pure class with no framework decorators
export class User {
  private constructor(private readonly email: string) {}

  static create(email: string): User {
    return new User(email);
  }
}

```

### Key Rules

* `common/` must be **business-agnostic**—if it needs to know about an "Order," it doesn't belong here.
* `integrations/` wraps external services; switching from SendGrid to AWS SES should only require changing one directory.
* Use **Use-Case Services** (one file per operation) instead of giant `XxxService` files with 15 methods.

---

## Guards / Interceptors / Pipes

### Business Logic Should Not Be in Guards

```typescript
// ❌ Guard querying database + business logic evaluation
@Injectable()
export class OrderOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const order = await this.prisma.order.findUnique({
      where: { id: req.params.id },
    });
    if (order.userId !== req.user.id) {
      return false; // Data fetching + business rule logic inside the Guard
    }
    return true;
  }
}

// ✅ Guard only handles authorization checks (Roles/Permissions)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

```

### Interceptors Are Only for Cross-Cutting Concerns

```typescript
// ❌ Executing business logic in an Interceptor
@Injectable()
export class PricingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // Calculating discounts—this is NOT a cross-cutting concern!
    return next.handle().pipe(map(data => applyDiscount(data)));
  }
}

// ✅ Interceptor for logging, caching, response transformation, or timing
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(() => console.log(`${req.method} ${req.url} - ${Date.now() - now}ms`)),
    );
  }
}

```

### Global ValidationPipe Must Use Whitelist

```typescript
// ❌ No whitelist—extra properties in the request body are passed through
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// ✅ Global ValidationPipe + whitelist to filter unknown properties
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3000);
}

```

---

## Validation Patterns (DTOs)

### @ValidateNested() Requires @Type()

```typescript
// ❌ @ValidateNested without @Type—nested object validation is silently skipped!
export class CreateOrderDto {
  @ValidateNested()
  shipping: AddressDto;
}

// ✅ @ValidateNested and @Type used together
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)
  shipping: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

```

### Avoid Raw 'any' Body

```typescript
// ❌ No DTO—no validation, no type safety, no Swagger documentation
@Post()
create(@Body() body: any) {
  return this.service.create(body);
}

// ✅ Create a DTO for every operation
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

@Post()
create(@Body() dto: CreateUserDto) {
  return this.service.create(dto);
}

```

### Use Separate DTOs for Create and Update

```typescript
// ❌ PATCH requiring all fields—unreasonable API design
@Patch(':id')
update(@Body() dto: CreateUserDto) { /* all fields required */ }

// ✅ Update using PartialType
export class UpdateUserDto extends PartialType(CreateUserDto) {}

@Patch(':id')
update(@Body() dto: UpdateUserDto) { /* all fields optional */ }

```

### Optional Nested Objects

```typescript
// ❌ Optional nested object missing @IsOptional
export class UpdateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)
  shipping?: AddressDto; // Still attempts to validate even if undefined
}

// ✅ @IsOptional + @ValidateNested + @Type
export class UpdateOrderDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  shipping?: AddressDto;
}

```

---

## Error Handling

### Never Swallow Errors

```typescript
// ❌ catch { return null }—hides the issue; caller can't distinguish "not found" from "error"
async findOne(id: string) {
  try {
    return await this.repo.findById(id);
  } catch (e) {
    return null;
  }
}

// ✅ Throw meaningful exceptions
async findOne(id: string): Promise<User> {
  const user = await this.repo.findById(id);
  if (!user) {
    throw new NotFoundException(`User ${id} not found`);
  }
  return user;
}

```

### Use Built-in Exception Classes

```typescript
// ❌ Manually constructing HTTP responses
throw new HttpException('Bad request', 400);

// ✅ Use semantic built-in exceptions
throw new BadRequestException('Invalid email format');
throw new NotFoundException('User not found');
throw new ConflictException('Email already taken');
throw new ForbiddenException('Insufficient permissions');
throw new UnauthorizedException('Invalid credentials');

```

### Custom Exception Filter

```typescript
// ✅ Global Exception Filter—unified response format
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`${request.method} ${request.url} - ${status}`, exception instanceof Error ? exception.stack : '');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

```

---

## Circular Dependencies

### Circular Module References

```typescript
// ❌ Module A ↔ Module B
@Module({ imports: [UsersModule] })
export class OrdersModule {}

@Module({ imports: [OrdersModule] })
export class UsersModule {}

// ✅ Extract shared logic to a third module
@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}

@Module({ imports: [SharedModule] })
export class OrdersModule {}

@Module({ imports: [SharedModule] })
export class UsersModule {}

```

### forwardRef is a Last Resort

```typescript
// ⚠️ forwardRef indicates a design flaw—prioritize redesigning
@Module({
  imports: [forwardRef(() => UsersModule)],
})
export class OrdersModule {}

// ✅ Redesign to eliminate the cycle:
// 1. Extract shared modules
// 2. Use Event-Driven patterns (EventEmitter) instead of direct calls
// 3. Lift shared logic to a higher-level Service

```

---

## Testing Patterns

### Use-Cases Should Be Testable Outside of NestJS

```typescript
// ✅ No need for NestFactory—instantiate directly
describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    handler = new CreateUserHandler(repo);
  });

  it('creates a user', async () => {
    const id = await handler.execute(
      new CreateUserCommand('user@example.com', 'Alice'),
    );
    expect(id).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await handler.execute(new CreateUserCommand('user@example.com', 'Alice'));
    await expect(
      handler.execute(new CreateUserCommand('user@example.com', 'Bob')),
    ).rejects.toThrow('already exists');
  });
});

```

### E2E Tests Should Match Production Pipe Configuration

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Must match the global config in main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/POST users - valid', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@test.com', name: 'Test' })
      .expect(201);
  });

  it('/POST users - extra fields rejected', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@test.com', name: 'Test', role: 'admin' })
      .expect(400);
  });
});

```

---

## Review Checklist

### Layered Architecture

* [ ] ORM/Prisma is NOT injected directly into Controllers.
* [ ] Business logic is NOT in Controllers.
* [ ] Repositories do NOT inject each other.
* [ ] Service dependency count ≤ 8 (split into Use-Cases if exceeded).

### Dependency Injection

* [ ] Interface + Symbol Token used for swappable dependencies.
* [ ] No `forwardRef()` (if present, requires design documentation explaining why).
* [ ] Scoped services are NOT injected into Singletons.

### Validation

* [ ] Every `@ValidateNested()` has a corresponding `@Type()`.
* [ ] Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` is configured.
* [ ] No `@Body() body: any`—DTOs must be used.
* [ ] Create and Update use separate DTOs (`PartialType`).
* [ ] Array validation uses `{ each: true }`.
* [ ] Optional nested objects use `@IsOptional()` + `@ValidateNested()` + `@Type()`.

### Guards / Interceptors / Pipes

* [ ] Guards only handle authorization, not database queries.
* [ ] Interceptors are only used for cross-cutting concerns (logging, caching, response transformation).
* [ ] Business rules are located in Services.

### Error Handling

* [ ] No `catch { return null }`—throw meaningful exceptions.
* [ ] Use NestJS built-in exception classes.
* [ ] Custom exception filters are placed in `common/filters/`.

### Modules

* [ ] No circular module references.
* [ ] Domain Entities have no framework decorators (`@Injectable`, etc.).
* [ ] External service calls are located in `integrations/`.

### Testing

* [ ] Use-Case Services can be tested without NestJS.
* [ ] E2E tests use global Pipes/Guards consistent with production.
* [ ] Domain Entities have zero framework dependencies.
