# Performance Benchmarking with k6

This directory contains the load testing and benchmarking suite for the monorepo. We use k6 to ensure our API maintains a p95 latency of < 200ms.

**Note:** Right now these benchmarks are not used in CI/CD, but they can be easily integrated into the Deployment Readiness Check (in `workflow-orchestration.yaml`) workflow.

## Overview

The benchmarking suite simulates real-world traffic patterns to identify bottlenecks, memory leaks, and concurrency issues before they reach production.

- **Tool:** [k6](https://k6.io/) (Go-based Load Testing)
- **Scripting:** JavaScript (ES6)

## KPIs & Thresholds

The load tests are configured with "Pass/Fail" thresholds. If these metrics are not met, the script will fail:

| Metric          | Target    | Description                                           |
| --------------- | --------- | ----------------------------------------------------- |
| **p95 Latency** | `< 200ms` | 95% of requests must be faster than 200ms.            |
| **Error Rate**  | `< 1%`    | At least 99% of requests must return a 200 OK status. |

## Local Usage

### Install k6

```bash
# macOS
brew install k6

# Windows (Winget)
winget install k6
```

### Run the Benchmark

Ensure the backend is running locally (`yarn workspace @ems-portal/backend dev`), then run:

```bash
# From the project root
yarn test:benchmark
```

To target a different environment (e.g., Staging), pass the `API_URL` environment variable:

```bash
k6 run -e API_URL=https://staging.api.example.com scripts/benchmarks/k6-load-test.js
```

## CI/CD Integration

This step can be added and run in the `Deployment Readiness` (`workflow-orchestration.yaml`) stage of our GitHub Actions to automatically validate performance before merging.

Add the step:

```
- name: Run k6 Load Test
  uses: grafana/k6-action@v0.3.1
  with:
    filename: scripts/benchmarks/k6-load-test.js
    flags: --env API_URL=http://localhost:3000/api
```
