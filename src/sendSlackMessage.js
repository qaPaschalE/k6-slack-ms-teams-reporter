// Load dotenv to read environment variables
require("dotenv").config();
const fs = require("fs");
const https = require("https");

// Check if SLACK_WEBHOOK_URL is set
if (!process.env.SLACK_WEBHOOK_URL) {
  console.error("Error: SLACK_WEBHOOK_URL not found in .env");
  process.exit(1);
}

// Define report paths
const jsonReportPath = "report/sandboxLoadTestResults.json";
const htmlReportUrl = process.env.REPORT_URL || "https://your-report-url.com"; // Replace with actual report URL

// Check if results.json exists
if (!fs.existsSync(jsonReportPath)) {
  console.error(`Error: ${jsonReportPath} not found!`);
  process.exit(1);
}

// Parse k6 results
const results = JSON.parse(fs.readFileSync(jsonReportPath, "utf8"));

// Extract metrics
const totalRequests = results.metrics.http_reqs?.values?.count || 0;
const failedRequests = results.metrics.http_req_failed?.values?.fails || 0;
const successfulRequests = totalRequests - failedRequests;

// Calculate failure rate percentage (if available)
let failureRate = null;
if (totalRequests > 0) {
  failureRate = ((failedRequests / totalRequests) * 100).toFixed(2);
}

// Check if thresholds exist in JSON
const thresholdMetrics = results.thresholds || {};
const thresholdsSummary = [];
let thresholdsMet = true;

for (const [metric, checks] of Object.entries(thresholdMetrics)) {
  for (const [condition, passed] of Object.entries(checks)) {
    const status = passed ? "✅ Met" : "❌ Breached";
    thresholdsSummary.push({
      title: metric,
      value: `${condition}: ${status}`,
      short: true,
    });
    if (!passed) thresholdsMet = false;
  }
}

// Determine test status
const status = failedRequests === 0 ? "✅ Passed" : "❌ Failed";
const color = failedRequests === 0 ? "#36a64f" : "#FF0000";

// Construct Slack payload
const slackPayload = {
  text: "📊 *Load Test Report*",
  attachments: [
    {
      fallback: "Load Test Report",
      color,
      fields: [
        { title: "Status", value: status, short: true },
        {
          title: "Total Requests",
          value: totalRequests.toString(),
          short: true,
        },
        {
          title: "Failed Requests",
          value: failedRequests.toString(),
          short: true,
        },
        ...(failureRate !== null
          ? [{ title: "Failure Rate", value: `${failureRate}%`, short: true }]
          : []),
        ...thresholdsSummary,
      ],
      actions: [
        {
          type: "button",
          text: "🔍 View Full Report",
          url: htmlReportUrl,
          style: "primary",
        },
      ],
      footer: `📅 ${new Date().toISOString()} | Environment: Staging`,
    },
  ],
};

// Send notification to Slack
try {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  const options = {
    hostname: new URL(slackWebhookUrl).hostname,
    path: new URL(slackWebhookUrl).pathname,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log("✅ Slack notification sent successfully!");
    } else {
      console.error(
        `❌ Failed to send Slack notification. Status Code: ${res.statusCode}`
      );
    }
  });

  req.on("error", (err) => {
    console.error(`❌ Error sending Slack notification: ${err.message}`);
    process.exit(1);
  });

  req.write(JSON.stringify(slackPayload));
  req.end();
} catch (err) {
  console.error(`❌ Error processing Slack script: ${err.message}`);
  process.exit(1);
}
