import { sendTeamsMessage } from "../src/sendTeamsMessage.js";
import dotenv from "dotenv";
import https from "https";
import { jest } from "@jest/globals"; // ✅ Ensure Jest is correctly imported

dotenv.config();

describe("sendTeamsMessage", () => {
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
    gitPipelineUrl: "https://ci.example.com/pipeline",
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

  it("should send a valid Teams message", () => {
    sendTeamsMessage(payload);

    expect(https.request).toHaveBeenCalledTimes(1);
    expect(requestMock.write).toHaveBeenCalledWith(
      expect.stringContaining("K6 Load Test Results")
    );
    expect(requestMock.end).toHaveBeenCalledTimes(1);
  });

  it("should log an error and exit if Teams webhook URL is missing", () => {
    process.env.TEAMS_WEBHOOK_URL = "";

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    sendTeamsMessage(payload);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Teams Webhook URL is missing.")
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should log an error if the request fails", () => {
    requestMock.on.mockImplementation((event, callback) => {
      if (event === "error") callback(new Error("Request failed"));
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    sendTeamsMessage(payload);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Teams Error: Request failed")
    );

    consoleSpy.mockRestore();
  });
});
