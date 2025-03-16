// Load dotenv to read environment variables
require("dotenv").config();
const fs = require("fs");
const https = require("https");

// Check if TEAMS_WEBHOOK_URL is set
if (!process.env.TEAMS_WEBHOOK_URL) {
  console.error("Error: TEAMS_WEBHOOK_URL not found in .env");
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
    thresholdsSummary.push({ name: metric, value: `${condition}: ${status}` });
    if (!passed) thresholdsMet = false;
  }
}

// Determine test status
const status = failedRequests === 0 ? "✅ Passed" : "❌ Failed";
const themeColor = failedRequests === 0 ? "36a64f" : "FF0000";

// Construct Teams payload
const teamsPayload = {
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  themeColor,
  summary: "K6 Load Test Report",
  sections: [
    {
      activityTitle: "**📊 Load Test Report**",
      activitySubtitle: `📅 ${new Date().toISOString()} | Environment: Staging`,
      facts: [
        { name: "Status", value: status },
        { name: "Total Requests", value: totalRequests.toString() },
        { name: "Failed Requests", value: failedRequests.toString() },
        ...(failureRate !== null
          ? [{ name: "Failure Rate", value: `${failureRate}%` }]
          : []),
        ...thresholdsSummary,
      ],
      markdown: true,
    },
  ],
  potentialAction: [
    {
      "@type": "OpenUri",
      name: "🔍 View Full Report",
      targets: [{ os: "default", uri: htmlReportUrl }],
    },
  ],
};

// Send notification to Teams
try {
  const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;
  const options = {
    hostname: new URL(teamsWebhookUrl).hostname,
    path: new URL(teamsWebhookUrl).pathname,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log("✅ Teams notification sent successfully!");
    } else {
      console.error(
        `❌ Failed to send Teams notification. Status Code: ${res.statusCode}`
      );
    }
  });

  req.on("error", (err) => {
    console.error(`❌ Error sending Teams notification: ${err.message}`);
    process.exit(1);
  });

  req.write(JSON.stringify(teamsPayload));
  req.end();
} catch (err) {
  console.error(`❌ Error processing Teams script: ${err.message}`);
  process.exit(1);
}
