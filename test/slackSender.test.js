const fs = require("fs");
const sinon = require("sinon");
const nock = require("nock");
const { expect } = require("chai");

describe("Slack Reporter", () => {
  let slackModule;
  const mockResults = {
    metrics: {
      http_reqs: { values: { count: 50 } },
      http_req_failed: { values: { fails: 5 } },
    },
    thresholds: {
      http_req_duration: { "p(95)<5000": false },
    },
  };

  beforeEach(() => {
    // Stub environment variables
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/mock-url";

    // Stub file system to return mock JSON
    sinon.stub(fs, "readFileSync").returns(JSON.stringify(mockResults));

    // Require the module after stubbing
    slackModule = require("../src/sendSlackMessage");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should correctly calculate failure rate", () => {
    expect(slackModule.getFailureRate(mockResults)).to.equal("10.00");
  });

  it("should extract threshold failures", () => {
    expect(slackModule.getThresholdFailures(mockResults)).to.deep.equal([
      { name: "http_req_duration", value: "p(95)<5000: ❌ Breached" },
    ]);
  });

  it("should construct Slack payload correctly", () => {
    const payload = slackModule.createSlackPayload(mockResults);
    expect(payload.attachments[0].fields).to.deep.include({
      title: "Failure Rate",
      value: "10.00%",
      short: true,
    });
  });

  it("should send a Slack notification", (done) => {
    nock("https://hooks.slack.com").post("/mock-url").reply(200, { ok: true });

    slackModule
      .sendSlackNotification(mockResults)
      .then(() => done())
      .catch((err) => done(err));
  });

  it("should handle Slack webhook failure", (done) => {
    nock("https://hooks.slack.com").post("/mock-url").reply(500);

    slackModule.sendSlackNotification(mockResults).catch((err) => {
      expect(err.message).to.include("Failed to send Slack notification");
      done();
    });
  });
});
