import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
export function handleSummary(data) {
  return {
    "examples/reports/k6TestResults.html": htmlReport(data),
    "examples/reports/k6TestResults.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
// Define custom failure rate metric
export const failureRate = new Rate("failure_rate");

export const options = {
  stages: [
    { duration: "5s", target: 10 }, // Ramp up to 10 VUs in 5s
    { duration: "10s", target: 50 }, // Hold 50 VUs for 10s
    { duration: "5s", target: 0 }, // Ramp down to 0 VUs in 5s
  ],
  thresholds: {
    failure_rate: ["rate<0.05"], // Fail rate should be < 5%
    http_req_duration: ["p(95)<5000"], // 95% of requests should complete < 5s
  },
};

export default function () {
  const url = "https://api.demoblaze.com/view";
  const payload = JSON.stringify({ id: "7" });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Send HTTP POST request
  const res = http.post(url, payload, params);

  // Validate response
  const isSuccess = check(res, {
    "is status 200": (r) => r.status === 200,
    "has correct ID": (r) => r.json("id") === 7,
    "has correct title": (r) => r.json("title") === "HTC One M9",
  });

  // Track failures
  failureRate.add(!isSuccess);

  sleep(1);
}
