I apologize for the oversight. I have restored all previously omitted sections, including the **Review Questions**, **Metric References**, and the full **Reference Resources** list, to ensure a complete 1:1 translation of your guide.

---

# Architecture Review Guide

An architecture design review guide to help evaluate whether code architecture is logical and design is appropriate.

## SOLID Principles Checklist

### S - Single Responsibility Principle (SRP)

**Key Points:**

* Does this class/module have only one reason to change?
* Do the methods in the class all serve the same purpose?
* If you were to describe this class to a non-technical person, could you do it in one sentence?

**Red Flags in Code Review:**

```
⚠️ Class names containing "And", "Manager", "Handler", "Processor", etc.
⚠️ A single class exceeding 200-300 lines of code.
⚠️ A class with more than 5-7 public methods.
⚠️ Different methods operating on completely unrelated data.

```

**Review Questions:**

* "What are the responsibilities of this class? Can it be split?"
* "If requirement X changes, which methods need to change? What if requirement Y changes?"

### O - Open/Closed Principle (OCP)

**Key Points:**

* When adding new features, do you need to modify existing code?
* Can new behaviors be added through extension (inheritance, composition)?
* Are there large amounts of if/else or switch statements to handle different types?

**Red Flags in Code Review:**

```
⚠️ switch/if-else chains handling different types.
⚠️ Adding a new feature requires modifying core classes.
⚠️ Type checking (instanceof, typeof) scattered throughout the code.

```

**Review Questions:**

* "If we want to add a new type X, which files need to be modified?"
* "Will this switch statement grow as new types are added?"

### L - Liskov Substitution Principle (LSP)

**Key Points:**

* Can subclasses completely replace the parent class?
* Does the subclass change the expected behavior of the parent's methods?
* Does the subclass throw exceptions that the parent did not declare?

**Red Flags in Code Review:**

```
⚠️ Explicit type casting.
⚠️ Subclass methods throwing NotImplementedException.
⚠️ Subclass methods with empty implementations or just a return.
⚠️ Code using the base class needs to check for specific types.

```

**Review Questions:**

* "If we replace the parent with the subclass, does the calling code need to be modified?"
* "Does the behavior of this method in the subclass follow the contract of the parent?"

### I - Interface Segregation Principle (ISP)

**Key Points:**

* Is the interface small and focused enough?
* Are implementation classes forced to implement methods they don't need?
* Do clients depend on methods they don't use?

**Red Flags in Code Review:**

```
⚠️ Interface has more than 5-7 methods.
⚠️ Implementation classes have empty methods or throw NotImplementedException.
⚠️ Interface names are too broad (IManager, IService).
⚠️ Different clients only use a portion of the interface methods.

```

**Review Questions:**

* "Are all methods of this interface used by every implementation class?"
* "Can this large interface be split into smaller, dedicated interfaces?"

### D - Dependency Inversion Principle (DIP)

**Key Points:**

* Do high-level modules depend on abstractions rather than concrete implementations?
* Is dependency injection used instead of direct instantiation (`new`)?
* Are abstractions defined by the high-level module rather than the low-level module?

**Red Flags in Code Review:**

```
⚠️ High-level modules directly 'new' up concrete low-level classes.
⚠️ Importing concrete implementation classes instead of interfaces/abstract classes.
⚠️ Configs and connection strings hardcoded in business logic.
⚠️ Difficulty in writing unit tests for a specific class.

```

**Review Questions:**

* "Can the dependencies of this class be replaced by mocks during testing?"
* "If we change the database/API implementation, how many places need to change?"

---

## Architectural Anti-Pattern Identification

### Critical Anti-Patterns

| Anti-Pattern | Red Flags | Impact |
| --- | --- | --- |
| **Big Ball of Mud** | No clear module boundaries; any code can call any other code. | Difficult to understand, modify, and test. |
| **God Object** | A single class assumes too many responsibilities; knows/does too much. | High coupling; hard to reuse and test. |
| **Spaghetti Code** | Tangled control flow, gotos, or deep nesting; hard to trace. | Difficult to understand and maintain. |
| **Lava Flow** | Ancient code no one dares touch; lacks docs and tests. | Accumulation of technical debt. |

### Design Anti-Patterns

| Anti-Pattern | Red Flags | Suggestion |
| --- | --- | --- |
| **Golden Hammer** | Using the same technology/pattern for every problem. | Choose the right tool for the specific problem. |
| **Gas Factory** | Complex solutions for simple problems; pattern abuse. | Follow YAGNI; simple first, then complex. |
| **Boat Anchor** | Unused code written for "future needs." | Delete unused code; write it when needed. |
| **Copy-Paste** | Same logic appears in multiple places. | Extract common methods or modules. |

### Review Comments

```markdown
🔴 [blocking] "This class has 2000 lines of code; suggest splitting into focused classes."
🟡 [important] "This logic is duplicated in 3 places; consider extracting a common method?"
💡 [suggestion] "This switch can be replaced with a Strategy pattern for better extensibility."

```

---

## Coupling and Cohesion Evaluation

### Coupling Types (From Best to Worst)

| Type | Description | Example |
| --- | --- | --- |
| **Message Coupling** ✅ | Passing data via parameters. | `calculate(price, quantity)` |
| **Data Coupling** ✅ | Sharing simple data structures. | `processOrder(orderDTO)` |
| **Stamp Coupling** ⚠️ | Sharing complex structures but only using part. | Passing whole User but only using `name`. |
| **Control Coupling** ⚠️ | Passing flags to influence behavior. | `process(data, isAdmin=true)` |
| **Common Coupling** ❌ | Sharing global variables. | Modules reading/writing same global state. |
| **Content Coupling** ❌ | Directly accessing another's internals. | Manipulating private properties of another class. |

### Cohesion Types (From Best to Worst)

| Type | Description | Quality |
| --- | --- | --- |
| **Functional** | All elements perform a single task. | ✅ Best |
| **Sequential** | Output of one step is input for next. | ✅ Good |
| **Communicational** | Operations act on the same data. | ⚠️ Acceptable |
| **Temporal** | Tasks performed at the same time. | ⚠️ Poor |
| **Logical** | Logically related but functionally different. | ❌ Bad |
| **Coincidental** | No meaningful relationship. | ❌ Worst |

### Metric Reference

```yaml
Coupling Metrics:
  CBO (Coupling Between Objects):
    Good: < 5
    Warning: 5-10
    Danger: > 10

  Ce (Efferent Coupling):
    Description: How many external classes it depends on.
    Good: < 7

  Ca (Afferent Coupling):
    Description: How many classes depend on it.
    High value means: High impact on change; needs stability.

Cohesion Metrics:
  LCOM4 (Lack of Cohesion in Methods):
    1: Single Responsibility ✅
    2-3: May need splitting ⚠️
    >3: Should be split ❌

```

**Review Questions:**

* "How many other modules does this module depend on? Can it be reduced?"
* "How many other places will be affected by changing this class?"
* "Do all methods in this class operate on the same data?"

---

## Layered Architecture Review

### Clean Architecture Layer Check

```
┌─────────────────────────────────────┐
│       Frameworks & Drivers          │ ← Outer: Web, DB, UI
├─────────────────────────────────────┤
│       Interface Adapters            │ ← Controllers, Gateways, Presenters
├─────────────────────────────────────┤
│        Application Layer            │ ← Use Cases, Application Services
├─────────────────────────────────────┤
│           Domain Layer              │ ← Entities, Domain Services
└─────────────────────────────────────┘
          ↑ Dependency direction is INWARDS only ↑

```

### Dependency Rule Check

**Core Rule: Source code dependencies can only point to inner layers.**

```typescript
// ❌ Violation: Domain layer depends on Infrastructure
// domain/User.ts
import { MySQLConnection } from '../infrastructure/database';

// ✅ Correct: Domain defines interface, Infrastructure implements it
// domain/UserRepository.ts (Interface)
interface UserRepository {
  findById(id: string): Promise<User>;
}

// infrastructure/MySQLUserRepository.ts (Implementation)
class MySQLUserRepository implements UserRepository {
  findById(id: string): Promise<User> { /* ... */ }
}

```

### Review Checklist

**Layer Boundary Check:**

* [ ] Does the Domain layer have external dependencies (DB, HTTP, File System)?
* [ ] Does the Application layer directly manipulate the DB or call external APIs?
* [ ] Does the Controller contain business logic?
* [ ] Are there cross-layer calls (UI directly calling Repository)?

**Separation of Concerns:**

* [ ] Is business logic separated from presentation logic?
* [ ] Is data access encapsulated in a dedicated layer?
* [ ] Is configuration and environment-specific code centrally managed?

**Review Questions:**

```markdown
🔴 [blocking] "Domain entities directly import DB connections; violates dependency rules."
🟡 [important] "Controller contains business logic; suggest moving to Service layer."
💡 [suggestion] "Consider using Dependency Injection to decouple these components."

```

---

## Design Pattern Usage Evaluation

### When to Use Design Patterns

| Pattern | Use Case | When NOT to Use |
| --- | --- | --- |
| **Factory** | Need to create different types determined at runtime. | Only one type, or type is fixed. |
| **Strategy** | Algorithms need swapping at runtime; interchangeable. | Only one algorithm, or it won't change. |
| **Observer** | One-to-many dependency; state change needs notification. | A simple direct call is sufficient. |
| **Singleton** | Truly need one unique instance (e.g., Config). | Objects that can be passed via DI. |
| **Decorator** | Dynamically add responsibilities; avoid inheritance bloat. | Fixed responsibilities. |

### Over-engineering Warning Signs

```
⚠️ Patternitis Signs:
1. Simple if/else replaced by Strategy + Factory + Registry.
2. Interfaces with only one implementation.
3. Abstractions added for "future needs."
4. Line count increases significantly due to pattern application.
5. Newcomers take a long time to understand the code structure.

```

**Review Questions:**

* "What specific problem does using this pattern solve?"
* "What would be wrong with the code if this pattern wasn't used?"
* "Is the value of this abstraction greater than its complexity?"

---

## Extensibility Assessment

### Extensibility Checklist

**Functional Extensibility:**

* [ ] Does adding a feature require modifying core code?
* [ ] Are extension points provided (hooks, plugins, events)?
* [ ] Is configuration externalized (env variables, config files)?

**Data Extensibility:**

* [ ] Does the data model support new fields?
* [ ] Is the scenario of data growth considered?
* [ ] Are there appropriate indexes for queries?

**Load Extensibility:**

* [ ] Can it scale horizontally (add more instances)?
* [ ] Are there state dependencies (session, local cache)?
* [ ] Does the DB use a connection pool?

### Extension Point Design Check

```typescript
// ✅ Good: Using events/hooks
class OrderService {
  private hooks: OrderHooks;

  async createOrder(order: Order) {
    await this.hooks.beforeCreate?.(order);
    const result = await this.save(order);
    await this.hooks.afterCreate?.(result);
    return result;
  }
}

// ❌ Bad: Hardcoding all behaviors
class OrderService {
  async createOrder(order: Order) {
    await this.sendEmail(order);        // Hardcoded
    await this.updateInventory(order);  // Hardcoded
    await this.notifyWarehouse(order);  // Hardcoded
    return await this.save(order);
  }
}

```

---

## Code Structure Best Practices

### Directory Organization

**By Feature/Domain (Recommended):**

```
src/
├── user/
│   ├── User.ts            (Entity)
│   ├── UserService.ts     (Service)
│   ├── UserRepository.ts  (Repository)
│   └── UserController.ts  (API)
├── order/
│   ├── Order.ts
│   ├── OrderService.ts
│   └── ...
└── shared/
    ├── utils/
    └── types/

```

**By Technical Layer (Not Recommended):**

```
src/
├── controllers/     ← Mixed domains
│   ├── UserController.ts
│   └── OrderController.ts
├── services/
├── repositories/
└── models/

```

### File Size Guidelines

```yaml
Suggested Limits:
  Single File: < 300 lines
  Single Function: < 50 lines
  Single Class: < 200 lines
  Function Params: < 4
  Nesting Depth: < 4 levels

```

---

## Quick Reference Checklist

### Architecture 5-Minute Check

* [ ] Is the dependency direction correct? (Outer → Inner)
* [ ] Are there circular dependencies?
* [ ] Is core logic decoupled from Framework/UI/DB?
* [ ] Does it follow SOLID?
* [ ] Are there obvious anti-patterns?

### Red Flags (Must Address)

* 🔴 **God Object** - Single class > 1000 lines.
* 🔴 **Circular Dependency** - A → B → C → A.
* 🔴 **Domain Layer** contains framework dependencies.
* 🔴 **Hardcoded** configs and keys.
* 🔴 **External services** called without interfaces.

---

## Tool Recommendations

| Tool | Use | Support |
| --- | --- | --- |
| **SonarQube** | Code quality, coupling analysis | Multi-lang |
| **Madge** | Module dependency graph | JS/TS |
| **ESLint** | Code standards, complexity check | JS/TS |

---

## Reference Resources

* [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
* [SOLID Principles in Code Review - JetBrains](https://blog.jetbrains.com/upsource/2015/08/31/what-to-look-for-in-a-code-review-solid-principles-2/)
* [Software Architecture Anti-Patterns](https://medium.com/@christophnissle/anti-patterns-in-software-architecture-3c8970c9c4f5)
* [Coupling and Cohesion in System Design](https://www.geeksforgeeks.org/system-design/coupling-and-cohesion-in-system-design/)
* [Design Patterns - Refactoring Guru](https://refactoring.guru/design-patterns)
