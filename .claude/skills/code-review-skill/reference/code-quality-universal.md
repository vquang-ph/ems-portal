# Universal Code Quality Anti-Patterns

> A language-agnostic guide to code quality anti-patterns, covering core themes such as code reuse, leaky abstractions, parameter bloat, nested conditionals, string typing, TOCTOU, no-op updates, and more. Applicable to PR reviews across all programming languages.

## Table of Contents

* [Code Reuse Review](https://www.google.com/search?q=%23code-reuse-review)
* [Parameter Bloat](https://www.google.com/search?q=%23parameter-bloat)
* [Leaky Abstractions](https://www.google.com/search?q=%23leaky-abstractions)
* [String Typing](https://www.google.com/search?q=%23string-typing)
* [Nested Conditional Expressions](https://www.google.com/search?q=%23nested-conditional-expressions)
* [Copy-Paste Variations](https://www.google.com/search?q=%23copy-paste-variations)
* [No-op Updates](https://www.google.com/search?q=%23no-op-updates)
* [TOCTOU Race Conditions](https://www.google.com/search?q=%23toctou-race-conditions)
* [Overly Broad Operations](https://www.google.com/search?q=%23overly-broad-operations)
* [Redundant State](https://www.google.com/search?q=%23redundant-state)
* [General Quality Review Checklist](https://www.google.com/search?q=%23general-quality-review-checklist)

---

## Code Reuse Review

Before accepting new code, search the existing codebase for reusable utilities.

### Search for Existing Utility Functions

```python
# ❌ New path joining logic—PathBuilder already exists in the project
def get_config_path(name):
    base = os.environ.get("APP_ROOT", ".")
    return os.path.join(base, "config", name + ".json")

# ✅ Use the existing PathBuilder
def get_config_path(name):
    return PathBuilder.config(f"{name}.json")

```

```javascript
// ❌ Manual debounce—lodash or utils/debounce.ts already exists
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ✅ Use the existing utility function
import { debounce } from "@/utils/debounce";

```

**Review Points:**

* Is the new function a duplicate or overlap in functionality with an existing utility?
* Can inline logic be extracted as a call to an existing module?
* Check adjacent files and the `shared/utils` directory.

---

## Parameter Bloat

### Ever-Growing Function Parameters

```python
# ❌ Adding a new parameter for every new requirement
def create_user(name, email, role, team, active, avatar_url, timezone):
    ...

# ✅ Use a configuration object / dataclass
@dataclass
class CreateUserParams:
    name: str
    email: str
    role: Role = Role.MEMBER
    team: str | None = None
    active: bool = True
    avatar_url: str | None = None
    timezone: str = "UTC"

def create_user(params: CreateUserParams) -> User:
    ...

```

```typescript
// ❌ 6+ positional parameters
function renderWidget(
  title: string, width: number, height: number,
  theme: string, collapsible: boolean, icon: string
) { ... }

// ✅ Options object pattern
interface WidgetOptions {
  title: string;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  collapsible?: boolean;
  icon?: string;
}
function renderWidget(options: WidgetOptions) { ... }

```

**Review Points:**

* Does the function have $\ge 4$ parameters? Consider an options object / dataclass.
* Is the new parameter just a boolean flag? Consider an enum or strategy pattern.
* Are there mutually exclusive parameters like `enable_x` and `disable_y`?

---

## Leaky Abstractions

### Exposing Internal Implementation Details

```python
# ❌ Returning internal ORM objects—caller is forced to know SQLAlchemy
def get_users():
    return session.query(User).filter(User.active == True).all()

# ✅ Return a domain object, hiding the persistence layer
def get_active_users() -> list[UserDTO]:
    rows = user_repo.find_active()
    return [UserDTO.from_row(r) for r in rows]

```

```typescript
// ❌ Component receives raw API response structure
<UserCard user={apiResponse.data.results[0]} />

// ✅ Component receives domain type, adapter handles mapping
interface UserSummary {
  displayName: string;
  avatarUrl: string;
}
<UserCard user={adaptUser(apiResponse)} />

```

**Review Points:**

* Does the function return type leak underlying implementations (ORM, HTTP client, file format)?
* Does the component/function depend on the data structure of an external system?
* Does it break existing abstraction boundaries?

---

## String Typing

### Using Raw Strings Instead of Constants/Enums

```python
# ❌ Magic strings scattered everywhere
if status == "active":
    ...
if role == "admin":
    ...

# ✅ Use an enum
class Status(StrEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"

if user.status == Status.ACTIVE:
    ...

```

```typescript
// ❌ Raw string event names—typos won't trigger errors
emitter.emit("userCreated", data);
emitter.on("usercreated", handler); // bug: typo

// ✅ Constants or branded types
const Events = {
  USER_CREATED: "userCreated",
  USER_SUSPENDED: "userSuspended",
} as const;
emitter.emit(Events.USER_CREATED, data);

```

**Review Points:**

* Are strings used instead of existing enums/union types?
* Are event names, action types, or status values scattered across multiple files?
* Are string comparisons case-sensitive but unvalidated?

---

## Nested Conditional Expressions

### Ternary Chains and Nested if/else

```python
# ❌ Ternary chains are hard to read
label = (
    "Admin" if role == "admin" else
    "Manager" if role == "manager" else
    "Viewer" if role == "viewer" else
    "Unknown"
)

# ✅ Lookup table or match
ROLE_LABELS = {
    "admin": "Admin",
    "manager": "Manager",
    "viewer": "Viewer",
}
label = ROLE_LABELS.get(role, "Unknown")

```

```typescript
// ❌ Nested ternaries
const bg = isHovered
  ? isSelected ? "blue" : "gray"
  : isSelected ? "navy" : "white";

// ✅ Lookup map
const bgMap: Record<string, string> = {
  "true-true": "blue",
  "true-false": "gray",
  "false-true": "navy",
  "false-false": "white",
};
const bg = bgMap[`${isHovered}-${isSelected}`];

```

```python
# ❌ Nested if statements 3+ levels deep
def process(order):
    if order is not None:
        if order.items:
            for item in order.items:
                if item.price > 0:
                    ...

# ✅ Early return + guard clauses
def process(order):
    if not order or not order.items:
        return
    for item in order.items:
        if item.price <= 0:
            continue
        ...

```

**Review Points:**

* Is the ternary expression nested $\ge 2$ levels?
* Is the if/else nesting $\ge 3$ levels deep?
* Can it be replaced with a lookup table, early return, or match statement?

---

## Copy-Paste Variations

### Nearly Identical Code Blocks

```python
# ❌ Two functions are almost identical, only field names differ
def format_user(user):
    return f"{user.first_name} {user.last_name} ({user.email})"

def format_employee(emp):
    return f"{emp.first_name} {emp.last_name} ({emp.work_email})"

# ✅ Unified abstraction
def format_person(first: str, last: str, email: str) -> str:
    return f"{first} {last} ({email})"

```

```typescript
// ❌ Copy-paste handler with only the URL changed
async function deletePost(id: string) {
  await fetch(`/api/posts/${id}`, { method: "DELETE" });
  router.push("/posts");
}
async function deleteComment(id: string) {
  await fetch(`/api/comments/${id}`, { method: "DELETE" });
  router.push("/comments");
}

// ✅ Parameterization
async function deleteResource(resource: string, id: string) {
  await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
  router.push(`/${resource}`);
}

```

**Review Points:**

* Are there $\ge 2$ blocks of code that differ only by variable names/URLs/strings?
* Can a parameterized shared function be extracted?
* Can variations be eliminated using a template method or strategy pattern?

---

## No-op Updates

### Unconditionally Triggering State Updates

```typescript
// ❌ Triggering update on every poll—even if data hasn't changed
useEffect(() => {
  const interval = setInterval(() => {
    fetch("/api/status").then(r => r.json()).then(setStatus);
  }, 5000);
  return () => clearInterval(interval);
}, []);

// ✅ Update only when the value changes
useEffect(() => {
  const interval = setInterval(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(data => {
        setStatus(prev => isEqual(prev, data) ? prev : data);
      });
  }, 5000);
  return () => clearInterval(interval);
}, []);

```

```python
# ❌ Writing to DB on every loop—even if the value hasn't changed
for item in items:
    item.status = compute_status(item)
    session.commit()

# ✅ Write only when changed
for item in items:
    new_status = compute_status(item)
    if item.status != new_status:
        item.status = new_status
        session.commit()

```

**Review Points:**

* Do polling/interval/event handlers update unconditionally?
* Does the wrapper function respect same-reference returns?
* Do DB writes check for actual changes?

---

## TOCTOU Race Conditions

### Time-of-Check-to-Time-of-Use

```python
# ❌ Check then act—the file could be deleted/created in between
if os.path.exists(path):
    with open(path) as f:
        data = f.read()

# ✅ Act directly + handle exception
try:
    with open(path) as f:
        data = f.read()
except FileNotFoundError:
    data = None

```

```python
# ❌ Check balance → Deduct funds; two-step operation is not atomic
if account.balance >= amount:
    account.balance -= amount

# ✅ Atomic operation or lock
with account.lock:
    if account.balance < amount:
        raise InsufficientFundsError()
    account.balance -= amount

```

```typescript
// ❌ Check-then-act is unsafe in async environments
if (!fileExists(path)) {
  await writeFile(path, content);
}

// ✅ Act directly + catch
try {
  await writeFile(path, content, { flag: "wx" });
} catch (e) {
  if (e.code === "EEXIST") { /* handle */ }
  else throw e;
}

```

**Review Points:**

* Can the `if exists → operate` pattern be replaced with `try operate → catch`?
* Are multi-step state changes handled within a transaction or lock?
* In async operations, is there an `await` between the check and the act?

---

## Overly Broad Operations

### Reading Excessive Data

```python
# ❌ Reading the entire file just to get the first line
content = Path("log.txt").read_text()
first_line = content.split("\n")[0]

# ✅ Read only what is needed
first_line = Path("log.txt").read_text().split("\n", 1)[0]
# Or even better: read line by line
with open("log.txt") as f:
    first_line = f.readline()

```

```typescript
// ❌ Loading all items then filtering
const allItems = await db.query("SELECT * FROM orders");
const pending = allItems.filter(o => o.status === "pending");

// ✅ Database-level filtering
const pending = await db.query(
  "SELECT * FROM orders WHERE status = ?", ["pending"]
);

```

```python
# ❌ Reading an entire list to find one record
users = list(User.objects.all())
user = next(u for u in users if u.id == user_id)

# ✅ Precise query
user = User.objects.get(id=user_id)

```

**Review Points:**

* Is the entire collection/file being read only to use a small part?
* Can filtering be pushed to the database/storage layer?
* Do API calls support pagination/limit parameters?

---

## Redundant State

### Derived State

```typescript
// ❌ Storing both fullName and firstName + lastName
interface User {
  firstName: string;
  lastName: string;
  fullName: string;  // redundant
}

// ✅ fullName is a derived value
interface User {
  firstName: string;
  lastName: string;
}
const fullName = `${user.firstName} ${user.lastName}`;

```

```python
# ❌ Cached values can become stale when source data changes
class Order:
    total: float
    item_count: int       # redundant if len(items) gives the same
    items: list[Item]

# ✅ Derivation or property
class Order:
    items: list[Item]

    @property
    def total(self) -> float:
        return sum(item.price for item in self.items)

    @property
    def item_count(self) -> int:
        return len(self.items)

```

**Review Points:**

* Are there fields that can be derived from others?
* Is there an invalidation mechanism for cached values?
* Can observers/effects be replaced with direct calls?

---

## General Quality Review Checklist

* [ ] **Reuse Review**: Have existing utilities/helpers been searched? No reinventing the wheel?
* [ ] **Parameter Count**: Are function parameters $\le 3$? If more, is an options object / dataclass used?
* [ ] **Abstraction Boundaries**: Does the return type avoid exposing internal implementation details (ORM, HTTP client, file format)?
* [ ] **Type Safety**: Are magic strings avoided in favor of existing enums/constants/union types?
* [ ] **Conditional Depth**: Is ternary nesting $\le 1$ level? Is if/else nesting $\le 2$ levels?
* [ ] **DRY**: Is there no copy-paste-with-variation ($\ge 2$ similar code blocks)?
* [ ] **No-op Protection**: Do polling / interval / event handlers have change-detection guards?
* [ ] **TOCTOU**: Is `if exists → operate` replaced with `try operate → catch`?
* [ ] **Data Precision**: Is the code avoiding reading entire collections/files just for a subset?
* [ ] **Redundant State**: are there any stored fields that could be derived from others?
