# React Code Review Guide

React focus areas: Hooks rules, moderation in performance optimization, component design, and modern React 19/RSC patterns.

## Table of Contents

- [Basic Hooks Rules](https://www.google.com/search?q=%23basic-hooks-rules)
- [useEffect Patterns](https://www.google.com/search?q=%23useeffect-patterns)
- [useMemo / useCallback](https://www.google.com/search?q=%23usememo--usecallback)
- [Component Design](https://www.google.com/search?q=%23component-design)
- [Error Boundaries & Suspense](https://www.google.com/search?q=%23error-boundaries--suspense)
- [Server Components (RSC)](https://www.google.com/search?q=%23server-components-rsc)
- [React 19 Actions & Forms](https://www.google.com/search?q=%23react-19-actions--forms)
- [Suspense & Streaming SSR](https://www.google.com/search?q=%23suspense--streaming-ssr)
- [TanStack Query v5](https://www.google.com/search?q=%23tanstack-query-v5)
- [Review Checklists](https://www.google.com/search?q=%23review-checklists)

---

## Basic Hooks Rules

```tsx
// ❌ Conditional Hooks — Violates the Rules of Hooks
function BadComponent({ isLoggedIn }) {
  if (isLoggedIn) {
    const [user, setUser] = useState(null); // Error!
  }
  return <div>...</div>;
}

// ✅ Hooks must be called at the top level
function GoodComponent({ isLoggedIn }) {
  const [user, setUser] = useState(null);
  if (!isLoggedIn) return <LoginPrompt />;
  return <div>{user?.name}</div>;
}
```

---

## useEffect Patterns

```tsx
// ❌ Missing or incomplete dependency array
function BadEffect({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // Missing userId dependency!
}

// ✅ Complete dependency array with cleanup
function GoodEffect({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchUser(userId).then((data) => {
      if (!cancelled) setUser(data);
    });
    return () => {
      cancelled = true;
    }; // Cleanup function
  }, [userId]);
}

// ❌ useEffect for derived state (Anti-pattern)
function BadDerived({ items }) {
  const [filteredItems, setFilteredItems] = useState([]);
  useEffect(() => {
    setFilteredItems(items.filter((i) => i.active));
  }, [items]); // Unnecessary effect + extra render
  return <List items={filteredItems} />;
}

// ✅ Compute directly during render, or use useMemo
function GoodDerived({ items }) {
  const filteredItems = useMemo(() => items.filter((i) => i.active), [items]);
  return <List items={filteredItems} />;
}

// ❌ useEffect for event response
function BadEventEffect() {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (query) {
      analytics.track("search", { query }); // Should be in event handler
    }
  }, [query]);
}

// ✅ Execute side effects in event handlers
function GoodEvent() {
  const [query, setQuery] = useState("");
  const handleSearch = (q: string) => {
    setQuery(q);
    analytics.track("search", { query: q });
  };
}
```

---

## useMemo / useCallback

```tsx
// ❌ Over-optimization — Constants don't need useMemo
function OverOptimized() {
  const config = useMemo(() => ({ timeout: 5000 }), []); // Pointless
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []); // Pointless unless passed to memoized component
}

// ✅ Optimize only when necessary
function ProperlyOptimized() {
  const config = { timeout: 5000 }; // Define simple objects directly
  const handleClick = () => console.log("clicked");
}

// ❌ useCallback dependency changes every render
function BadCallback({ data }) {
  // data is a new object every render, so useCallback is ineffective
  const process = useCallback(() => {
    return data.map(transform);
  }, [data]);
}

// ✅ useMemo + useCallback used with React.memo
const MemoizedChild = React.memo(function Child({ onClick, items }) {
  return <div onClick={onClick}>{items.length}</div>;
});

function Parent({ rawItems }) {
  const items = useMemo(() => processItems(rawItems), [rawItems]);
  const handleClick = useCallback(() => {
    console.log(items.length);
  }, [items]);
  return <MemoizedChild onClick={handleClick} items={items} />;
}
```

---

## Component Design

```tsx
// ❌ Defining components inside components — Creates a new component on every render
function BadParent() {
  function ChildComponent() {
    // New function every render!
    return <div>child</div>;
  }
  return <ChildComponent />;
}

// ✅ Define components outside
function ChildComponent() {
  return <div>child</div>;
}
function GoodParent() {
  return <ChildComponent />;
}

// ❌ Props are always new object references
function BadProps() {
  return (
    <MemoizedComponent
      style={{ color: "red" }} // New object every render
      onClick={() => {}} // New function every render
    />
  );
}

// ✅ Stable references
const style = { color: "red" };
function GoodProps() {
  const handleClick = useCallback(() => {}, []);
  return <MemoizedComponent style={style} onClick={handleClick} />;
}
```

---

## Error Boundaries & Suspense

```tsx
// ❌ No Error Boundary
function BadApp() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent /> {/* Errors will crash the whole app */}
    </Suspense>
  );
}

// ✅ Error Boundary wrapping Suspense
function GoodApp() {
  return (
    <ErrorBoundary fallback={<ErrorUI />}>
      <Suspense fallback={<Loading />}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## Server Components (RSC)

```tsx
// ❌ Using client features in a Server Component
// app/page.tsx (Server Component by default)
function BadServerComponent() {
  const [count, setCount] = useState(0);  // Error! No hooks in RSC
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ Extract interactive logic to a Client Component
// app/counter.tsx
'use client';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// app/page.tsx (Server Component)
async function GoodServerComponent() {
  const data = await fetchData();  // Can await directly
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter />  {/* Client Component */}
    </div>
  );
}

// ❌ Misplacing 'use client' — makes the whole tree client-side
// layout.tsx
'use client';  // This makes all children client components
export default function Layout({ children }) { ... }

// ✅ Use 'use client' only in components that need interaction
// Isolate client logic to leaf components

```

---

## React 19 Actions & Forms

React 19 introduces the Actions system and new Form Hooks to simplify async operations and optimistic updates.

### useActionState

```tsx
// ❌ Traditional way: Multiple state variables
function OldForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(null);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await submitForm(formData);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsPending(false);
    }
  };
}

// ✅ React 19: Unified management with useActionState
import { useActionState } from "react";

function NewForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData: FormData) => {
      try {
        const result = await submitForm(formData);
        return { success: true, data: result };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    { success: false, data: null, error: null },
  );

  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

### useFormStatus

```tsx
// ❌ Prop drilling form status
function BadSubmitButton({ isSubmitting }) {
  return <button disabled={isSubmitting}>Submit</button>;
}

// ✅ useFormStatus accesses parent <form> state (no props needed)
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  // Note: Must be used in a child component inside <form>
  return (
    <button disabled={pending}>{pending ? "Submitting..." : "Submit"}</button>
  );
}

// ❌ useFormStatus called in sibling component — does not work
function BadForm() {
  const { pending } = useFormStatus(); // Cannot get status here!
  return (
    <form action={action}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}

// ✅ useFormStatus must be in a child component of the form
function GoodForm() {
  return (
    <form action={action}>
      <SubmitButton /> {/* useFormStatus is called inside here */}
    </form>
  );
}
```

### useOptimistic

```tsx
// ❌ Waiting for server response to update UI
function SlowLike({ postId, likes }) {
  const [likeCount, setLikeCount] = useState(likes);
  const [isPending, setIsPending] = useState(false);

  const handleLike = async () => {
    setIsPending(true);
    const newCount = await likePost(postId); // Waiting...
    setLikeCount(newCount);
    setIsPending(false);
  };
}

// ✅ useOptimistic for instant feedback, auto-rollback on failure
import { useOptimistic } from "react";

function FastLike({ postId, likes }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes, increment: number) => currentLikes + increment,
  );

  const handleLike = async () => {
    addOptimisticLike(1); // Update UI immediately
    try {
      await likePost(postId); // Sync in background
    } catch {
      // React automatically rolls back to original likes value
    }
  };

  return <button onClick={handleLike}>{optimisticLikes} likes</button>;
}
```

### Server Actions (Next.js 15+)

```tsx
// ❌ Client-side API call
"use client";
function ClientForm() {
  const handleSubmit = async (formData: FormData) => {
    const res = await fetch("/api/submit", {
      method: "POST",
      body: formData,
    });
    // ...
  };
}

// ✅ Server Action + useActionState
// actions.ts
("use server");
export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get("title");
  await db.posts.create({ title });
  revalidatePath("/posts");
  return { success: true };
}

// form.tsx
("use client");
import { createPost } from "./actions";

function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);
  return (
    <form action={formAction}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

---

## Suspense & Streaming SSR

Suspense and Streaming are core React 18+ features, widely used in frameworks like Next.js 15.

### Basic Suspense

```tsx
// ❌ Traditional loading state management
function OldComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner />;
  return <DataView data={data} />;
}

// ✅ Declarative loading state with Suspense
function NewComponent() {
  return (
    <Suspense fallback={<Spinner />}>
      <DataView /> {/* Internal use of use() or Suspense-compatible fetching */}
    </Suspense>
  );
}
```

### Independent Suspense Boundaries

```tsx
// ❌ Single boundary — everything loads together
function BadLayout() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Header />
      <MainContent /> {/* Slow */}
      <Sidebar /> {/* Fast */}
    </Suspense>
  );
}

// ✅ Independent boundaries — parts stream independently
function GoodLayout() {
  return (
    <>
      <Header /> {/* Shows immediately */}
      <div className="flex">
        <Suspense fallback={<ContentSkeleton />}>
          <MainContent /> {/* Loads independently */}
        </Suspense>
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar /> {/* Loads independently */}
        </Suspense>
      </div>
    </>
  );
}
```

### use() Hook (React 19)

```tsx
// ✅ Reading a Promise in a component
import { use } from "react";

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // Automatically triggers Suspense
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  );
}

// Parent creates Promise, child consumes
function Post({ postId }) {
  const commentsPromise = fetchComments(postId); // Do not await here
  return (
    <article>
      <PostContent id={postId} />
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    </article>
  );
}
```

---

## TanStack Query v5

TanStack Query is the most popular data-fetching library in the React ecosystem.

### queryOptions (v5 New)

```tsx
// ❌ Redundant definition of queryKey and queryFn
function Component1() {
  const { data } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
  });
}

function prefetchUser(queryClient, userId) {
  queryClient.prefetchQuery({
    queryKey: ["users", userId], // Duplication!
    queryFn: () => fetchUser(userId), // Duplication!
  });
}

// ✅ Unified definition with queryOptions, type-safe
import { queryOptions } from "@tanstack/react-query";

const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
  });

function Component1({ userId }) {
  const { data } = useQuery(userQueryOptions(userId));
}

function prefetchUser(queryClient, userId) {
  queryClient.prefetchQuery(userQueryOptions(userId));
}
```

### useSuspenseQuery

| Feature           | useQuery             | useSuspenseQuery         |
| ----------------- | -------------------- | ------------------------ |
| `enabled` option  | ✅ Supported         | ❌ Not supported         |
| `placeholderData` | ✅ Supported         | ❌ Not supported         |
| `data` type       | `T                   | undefined`               |
| Error Handling    | `error` property     | Thrown to Error Boundary |
| Loading State     | `isLoading` property | Suspends to Suspense     |

---

## Review Checklists

### Hooks Rules

- [ ] Hooks are called at the top level of components/custom Hooks.
- [ ] No Hook calls inside conditions or loops.
- [ ] `useEffect` dependency array is complete.
- [ ] `useEffect` has a cleanup function for subscriptions/timers.
- [ ] No `useEffect` used for calculating derived state.

### Performance Optimization

- [ ] `useMemo`/`useCallback` used only where strictly necessary.
- [ ] `React.memo` paired with stable prop references.
- [ ] No child components defined inside other components.
- [ ] Virtualization used for long lists (e.g., `react-window`).

### Server Components (RSC)

- [ ] `'use client'` used only for components requiring interaction.
- [ ] Server Components do not use Hooks or event handlers.
- [ ] Data fetching happens in Server Components where possible.

### React 19 Forms

- [ ] `useActionState` used instead of multiple `useState` calls.
- [ ] `useFormStatus` called inside a form's child component.
- [ ] Server Actions correctly marked with `'use server'`.

### Testing

- [ ] Using `@testing-library/react`.
- [ ] Querying elements via `screen`.
- [ ] Preferring `*ByRole` queries.
- [ ] Testing behaviors rather than implementation details.
