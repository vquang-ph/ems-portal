# Performance Review Guide

A performance review guide covering frontend, backend, database, algorithmic complexity, and API performance.

## Table of Contents

* [Frontend Performance (Core Web Vitals)](https://www.google.com/search?q=%23frontend-frontend-performance-core-web-vitals)
* [JavaScript Performance](https://www.google.com/search?q=%23javascript-performance)
* [Memory Management](https://www.google.com/search?q=%23memory-management)
* [Database Performance](https://www.google.com/search?q=%23database-performance)
* [API Performance](https://www.google.com/search?q=%23api-performance)
* [Algorithmic Complexity](https://www.google.com/search?q=%23algorithmic-complexity)
* [Performance Review Checklist](https://www.google.com/search?q=%23performance-review-checklist)

---

## Frontend Performance (Core Web Vitals)

### 2024 Core Metrics

| Metric | Full Name | Target Value | Definition |
| --- | --- | --- | --- |
| **LCP** | Largest Contentful Paint | ≤ 2.5s | Loading performance (main content) |
| **INP** | Interaction to Next Paint | ≤ 200ms | Interaction responsiveness (replaced FID in 2024) |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | Visual stability |
| **FCP** | First Contentful Paint | ≤ 1.8s | Time until first text/image is rendered |
| **TBT** | Total Blocking Time | ≤ 200ms | Total time main thread was blocked |

### LCP Optimization Check

```javascript
// ❌ LCP image lazy loading - Delays critical content
<img src="hero.jpg" loading="lazy" />

// ✅ LCP image immediate loading
<img src="hero.jpg" fetchpriority="high" />

// ❌ Unoptimized image format
<img src="hero.png" />  // PNG files are too large

// ✅ Modern image formats + Responsive
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Hero" />
</picture>

```

**Review Points:**

* [ ] Is `fetchpriority="high"` set on the LCP element?
* [ ] Are modern formats like WebP/AVIF used?
* [ ] Is Server-Side Rendering (SSR) or Static Generation (SSG) utilized?
* [ ] Is the CDN configured correctly?

### FCP Optimization Check

```html
<link rel="stylesheet" href="all-styles.css" />

<style>/* Critical above-the-fold styles */</style>
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />

@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2');
}

@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2');
  font-display: swap;  /* Use system font first, then swap */
}

```

### INP Optimization Check

```javascript
// ❌ Long task blocking the main thread
button.addEventListener('click', () => {
  // Synchronous operation taking 500ms
  processLargeData(data);
  updateUI();
});

// ✅ Breaking up long tasks
button.addEventListener('click', async () => {
  // Yield to the main thread
  await scheduler.yield?.() ?? new Promise(r => setTimeout(r, 0));

  // Process in chunks
  for (const chunk of chunks) {
    processChunk(chunk);
    await scheduler.yield?.();
  }
  updateUI();
});

// ✅ Using Web Workers for complex computations
const worker = new Worker('heavy-computation.js');
worker.postMessage(data);
worker.onmessage = (e) => updateUI(e.data);

```

### CLS Optimization Check

```css
/* ❌ Media without specified dimensions */
img { width: 100%; }

/* ✅ Reserve space */
img {
  width: 100%;
  aspect-ratio: 16 / 9;
}

/* ❌ Dynamic content causing layout shifts */
.ad-container { }

/* ✅ Reserve fixed height */
.ad-container {
  min-height: 250px;
}

```

**CLS Review Checklist:**

* [ ] Do images/videos have `width`/`height` or `aspect-ratio`?
* [ ] Do fonts use `font-display: swap`?
* [ ] Is space reserved for dynamic content (ads, banners)?
* [ ] Does the code avoid inserting content above existing content?

---

## JavaScript Performance

### Code Splitting & Lazy Loading

```javascript
// ❌ Loading everything at once
import { HeavyChart } from './charts';
import { PDFExporter } from './pdf';
import { AdminPanel } from './admin';

// ✅ Load on demand
const HeavyChart = lazy(() => import('./charts'));
const PDFExporter = lazy(() => import('./pdf'));

// ✅ Route-level code splitting
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard')),
  },
  {
    path: '/admin',
    component: lazy(() => import('./pages/Admin')),
  },
];

```

### Bundle Size Optimization

```javascript
// ❌ Importing the whole library
import _ from 'lodash';
import moment from 'moment';

// ✅ Named imports (Tree Shaking)
import debounce from 'lodash/debounce';
import { format } from 'date-fns';

// ❌ Not utilizing Tree Shaking
export default {
  fn1() {},
  fn2() {},  // Packaged even if unused
};

// ✅ Named exports support Tree Shaking
export function fn1() {}
export function fn2() {}

```

**Bundle Review Checklist:**

* [ ] Is dynamic `import()` used for code splitting?
* [ ] Are large libraries imported selectively?
* [ ] Has the bundle been analyzed (e.g., `webpack-bundle-analyzer`)?
* [ ] Are there unused dependencies?

### List Rendering Optimization

```javascript
// ❌ Rendering a massive list
function List({ items }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );  // 10,000 items = 10,000 DOM nodes
}

// ✅ Virtualized List - Only render visible items
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={35}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}

```

---

## Memory Management

### Common Memory Leaks

#### 1. Uncleared Event Listeners

```javascript
// ❌ Listener persists after component unmount
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ Cleanup function
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

```

#### 2. Uncleared Timers

```javascript
// ❌ Timer persists
useEffect(() => {
  setInterval(fetchData, 5000);
}, []);

// ✅ Clear timer
useEffect(() => {
  const timer = setInterval(fetchData, 5000);
  return () => clearInterval(timer);
}, []);

```

#### 3. Closure References

```javascript
// ❌ Closure holds onto large objects
function createHandler() {
  const largeData = new Array(1000000).fill('x');
  return function handler() {
    console.log(largeData.length); // largeData cannot be GC'd
  };
}

// ✅ Keep only necessary data
function createHandler() {
  const largeData = new Array(1000000).fill('x');
  const length = largeData.length;
  return function handler() {
    console.log(length);
  };
}

```

### Memory Review Checklist

* [ ] Do all `useEffect` hooks have appropriate cleanup functions?
* [ ] Are event listeners removed on unmount?
* [ ] Are intervals and timeouts cleared?
* [ ] Are WebSockets/SSE connections closed when no longer needed?
* [ ] Are large objects manually released (set to `null`) when finished?

---

## Database Performance

### N+1 Query Problem

```python
# ❌ N+1 Problem - 1 + N queries
users = User.objects.all()  # 1 query
for user in users:
    print(user.profile.bio) # N queries (one for each user profile)

# ✅ Eager Loading - 2 queries total
users = User.objects.select_related('profile').all()
for user in users:
    print(user.profile.bio) # No extra queries

```

### Index Optimization

```sql
-- ❌ Full table scan
SELECT * FROM orders WHERE status = 'pending';

-- ✅ Add index
CREATE INDEX idx_orders_status ON orders(status);

-- ❌ Index invalidation: Function operations on columns
SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- ✅ Use range queries to utilize index
SELECT * FROM users
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

```

### Query Optimization

* [ ] **Avoid `SELECT ***`: Query only necessary columns.
* [ ] **Pagination**: Use `LIMIT` and `OFFSET` for large tables.
* [ ] **Batching**: Use `IN` clauses instead of querying inside a loop.

---

## API Performance

### Pagination Implementation

```javascript
// ❌ Returning all data
app.get('/users', async (req, res) => {
  const users = await User.findAll(); // Could return 100,000 rows
  res.json(users);
});

// ✅ Pagination + Max Limit
app.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Caps at 100
  const offset = (page - 1) * limit;

  const { rows, count } = await User.findAndCountAll({ limit, offset });
  res.json({ data: rows, pagination: { page, limit, total: count } });
});

```

### Caching Strategies

* [ ] **Redis**: Cache hot data with a TTL (Time-to-Live).
* [ ] **HTTP Headers**: Use `Cache-Control` and `ETag` for static responses.

---

## Algorithmic Complexity

### Complexity Comparison

| Complexity | Name | 10 Items | 1000 Items | 1 Million Items | Example |
| --- | --- | --- | --- | --- | --- |
| $O(1)$ | Constant | 1 | 1 | 1 | Hash Map lookup |
| $O(\log n)$ | Logarithmic | 3 | 10 | 20 | Binary Search |
| $O(n)$ | Linear | 10 | 1000 | 1 Million | Array traversal |
| $O(n \log n)$ | Linearithmic | 33 | 10,000 | 20 Million | Quick Sort |
| $O(n^2)$ | Quadratic | 100 | 1 Million | 1 Trillion | Nested loops |

### Practical Identification

```javascript
// ❌ O(n²) - Nested Loop
function findDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) { /* ... */ }
    }
  }
}

// ✅ O(n) - Hash Set
function findDuplicates(arr) {
  const seen = new Set();
  for (const item of arr) {
    if (seen.has(item)) { /* ... */ }
    seen.add(item);
  }
}

```

---

## Performance Review Checklist

### 🔴 Critical (Blockers)

* [ ] LCP images are NOT lazy-loaded.
* [ ] No $O(n^2)$ nested loops on large data sets.
* [ ] No N+1 query problems in backend logic.
* [ ] Cleanup functions exist for all timers and listeners.
* [ ] Large list interfaces are virtualized.

### 🟡 Important (Strong Recommendations)

* [ ] Code splitting is used for separate routes.
* [ ] WebP/AVIF images are utilized.
* [ ] Hot API data is cached (Redis).
* [ ] Database columns in `WHERE` clauses are indexed.

### 🟢 Optimizations (Best Practices)

* [ ] Bundle size analyzed and minimized.
* [ ] CDN is used for static assets.
* [ ] Response compression (Gzip/Brotli) is enabled.

---

## Reference Resources

* [Core Web Vitals - web.dev](https://web.dev/articles/vitals)
* [Big O Cheat Sheet](https://www.bigocheatsheet.com/)
* [MemLab - Meta Engineering](https://engineering.fb.com/2022/09/12/open-source/memlab/)
* [API Performance Optimization](https://algorithmsin60days.com/blog/optimizing-api-performance/)
