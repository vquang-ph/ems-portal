#!/bin/bash

if ! command -v k6 &> /dev/null; then
    echo "k6 could not be found. Please install it first."
    exit 1
fi

echo "Starting Load Benchmarks..."

# Run k6 with local environment overrides
# We pass API_URL so the script knows where to point in different environments (Local/CI/Staging)
k6 run -e API_URL=http://localhost:3000/api scripts/benchmarks/k6-load-test.js