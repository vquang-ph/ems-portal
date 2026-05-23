import http from "k6/http";
import { check, sleep } from "k6";

// Read from environment or fallback to defaults
const BASE_URL = __ENV.API_URL || "http://localhost:3000/api";

export const options = {
  thresholds: {
    http_req_duration: ["p(95)<200"],
    http_req_failed: ["rate<0.01"],
  },
  stages: [
    { duration: "30s", target: 50 }, // Ramp up
    { duration: "1m", target: 50 }, // Steady state
    { duration: "30s", target: 0 }, // Ramp down
  ],
};

export default function () {
  const res = http.get(`${BASE_URL}/todos`);
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
