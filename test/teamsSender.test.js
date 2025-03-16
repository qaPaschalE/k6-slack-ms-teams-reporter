const fs = require("fs");
const sinon = require("sinon");
const nock = require("nock");
const { expect } = require("chai");

describe("Teams Reporter", () => {
  let teamsModule;
  const mockResults = {
    metrics: {
      http_reqs: { values: { count: 100 } },
      http_req_failed: { values: { fails: 8 } },
    },
    thresholds: {
      http_req_duration: { "p(95)<5000": true },
    },
  };

  beforeEach(() => {
    process.env.TEAMS_WEBHOOK_URL = "https://outlook.office.com/mock-webhook";
    sinon.stub(fs, "readFileSync").returns(JSON.stringify(mockResults));
    teamsModule = require("../src/sendTeamsMessage");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should correctly calculate failure rate", () => {
    expect(teamsModule.getFailureRate(mockResults)).to.equal("8.00");
  });

  it("should extract threshold results", () => {
    expect(teamsModule.getThresholdFailures(mockResults)).to.deep.equal([
      { name: "http_req_duration", value: "p(95)<5000: ✅ Met" },
    ]);
  });

  it("should construct Teams payload correctly", () => {
    const payload = teamsModule.createTeamsPayload(mockResults);
    expect(payload.sections[0].facts).to.deep.include({
      name: "Failure Rate",
      value: "8.00%",
    });
  });

  it("should send a Teams notification", (done) => {
    nock("https://outlook.office.com").post("/mock-webhook").reply(200);

    teamsModule
      .sendTeamsNotification(mockResults)
      .then(() => done())
      .catch((err) => done(err));
  });

  it("should handle Teams webhook failure", (done) => {
    nock("https://outlook.office.com").post("/mock-webhook").reply(500);

    teamsModule.sendTeamsNotification(mockResults).catch((err) => {
      expect(err.message).to.include("Failed to send Teams notification");
      done();
    });
  });
});
