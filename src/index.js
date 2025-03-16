require("dotenv").config();
const { sendSlackMessage } = require("./sendSlackMessage");
const { sendTeamsMessage } = require("./sendTeamsMessage");

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;

async function generateReport() {
  // Example values – replace these with actual test results
  const failed = 35;
  const total = 37;
  const httpReqDuration = 4800; // p(95) request duration in ms
  const thresholdLimit = 5000;
  const thresholdMet = httpReqDuration < thresholdLimit;

  const failureRate = ((failed / total) * 100).toFixed(2);

  const reportData = {
    status: failed > 0 ? "Failed" : "Passed",
    failed,
    total,
    failureRate,
    httpReqDuration,
    thresholdMet,
    timestamp: new Date().toISOString(),
    environment: "Staging",
    reportUrl: "https://your-report-url.com", // Replace with actual report URL
  };

  if (slackWebhookUrl) {
    await sendSlackMessage(slackWebhookUrl, reportData);
  }

  if (teamsWebhookUrl) {
    await sendTeamsMessage(teamsWebhookUrl, reportData);
  }
}

generateReport();
