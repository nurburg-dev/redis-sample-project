import http from "k6/http";
import { check, sleep } from "k6";
import faker from "k6/x/faker";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

const API_HOST = __ENV.API_HOST;

export const options = {
  stages: [
    { duration: "2m", target: 10 },
    { duration: "5m", target: 10 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    errors: ["rate<0.1"],
  },
};

export default function () {
  const response = http.get(`${API_HOST}/api/health`);

  const result = check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  errorRate.add(!result);

  if (response.status === 200) {
    const key = `test:${Math.random().toString(36).substring(7)}`;
    const value = faker.person.name();

    const setPayload = JSON.stringify({
      key: key,
      value: value,
    });

    const setResponse = http.post(`${API_HOST}/api`, setPayload, {
      headers: { "Content-Type": "application/json" },
    });

    check(setResponse, {
      "set operation successful": (r) => r.status === 201,
    });

    if (setResponse.status === 201) {
      const getResponse = http.get(`${API_HOST}/api/${key}`);
      check(getResponse, {
        "get operation successful": (r) => r.status === 200,
        "value matches": (r) => {
          if (r.status === 200) {
            const data = JSON.parse(r.body);
            return data.value === value;
          }
          return false;
        },
      });
    }
  }

  sleep(1);
}

export function setup() {
  console.log(`Starting Redis load test against: ${API_HOST}`);
}

export function teardown() {
  console.log("Redis load test completed");
}
