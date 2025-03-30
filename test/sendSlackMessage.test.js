import { sendSlackMessage } from "../src/sendSlackMessage.js";
import dotenv from "dotenv";
import https from "https";
import { jest } from "@jest/globals"; // ✅ Ensure Jest is correctly imported

dotenv.config();

describe("sendSlackMessage", () => {
  const payload = {
    color: "#36a64f",
    status: "✅ Passed",
    failureRate: "0%",
    iterations: 500,
    failedRequests: 1,
    passedChecks: 10,
    failedChecks: 0,
    minVUs: 5,
    maxVUs: 50,
    percentile95: "200ms",
    breachedThresholds: [],
    htmlReportUrl: "https://example.com/report",
  };

  let requestMock;

  beforeEach(() => {
    requestMock = {
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
    };

    // ✅ Use jest.spyOn instead of jest.mock
    jest.spyOn(https, "request").mockImplementation(() => requestMock);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // ✅ Ensures clean mock between tests
  });

  it("should send a valid Slack message", () => {
    sendSlackMessage(payload);

    expect(https.request).toHaveBeenCalledTimes(1);
    expect(requestMock.write).toHaveBeenCalledWith(
      expect.stringContaining("K6 Load Test Results")
    );
    expect(requestMock.end).toHaveBeenCalledTimes(1);
  });

  it("should log an error if the request fails", () => {
    requestMock.on.mockImplementation((event, callback) => {
      if (event === "error") callback(new Error("Request failed"));
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    sendSlackMessage(payload);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Slack Error: Request failed")
    );

    consoleSpy.mockRestore();
  });
  it("should log an error and exit if Slack webhook URL is missing", () => {
    process.env.SLACK_WEBHOOK_URL = ""; // Simulate missing webhook

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit(1) called");
    });

    expect(() => sendSlackMessage(payload)).toThrow("process.exit(1) called"); // Ensure the function attempts to exit

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Slack Webhook URL is missing.")
    );

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
