import chalk from "chalk";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

// Function to send Teams message
export function sendTeamsMessage(payload) {
  const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!teamsWebhookUrl) {
    console.error(
      chalk.red("❌ Teams Webhook URL is missing in environment variables.")
    );
    process.exit(1);
  }

  const teamsPayload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: payload.color.replace("#", ""),
    summary: "📊 K6 Load Test Results",
    sections: [
      {
        activityTitle: "🚀 Load Test Summary",
        facts: [
          { name: "Status", value: payload.status },
          { name: "Failure Rate", value: payload.failureRate },
          { name: "Total Requests", value: payload.totalRequests },
          { name: "Failed Requests", value: payload.failedRequests },
          { name: "Iterations", value: payload.iterations },
          { name: "Max VUs", value: payload.vus },
          {
            name: "Threshold Breaches",
            value:
              payload.breachedThresholds.length > 0
                ? payload.breachedThresholds.join("\n")
                : "None ✅",
          },
        ],
      },
    ],
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "📜 View Full Report",
        targets: [{ os: "default", uri: payload.htmlReportUrl }],
      },
      {
        "@type": "OpenUri",
        name: "🔗 View CI/CD Pipeline",
        targets: [{ os: "default", uri: payload.gitPipelineUrl }],
      },
    ],
  };

  if (process.argv.includes("--verbose")) {
    console.log(
      chalk.blue("📤 Sending Teams payload:"),
      JSON.stringify(teamsPayload, null, 2)
    );
  }

  const options = {
    hostname: new URL(teamsWebhookUrl).hostname,
    path: new URL(teamsWebhookUrl).pathname,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log(chalk.green("✅ Teams notification sent successfully!"));
    } else {
      console.error(
        chalk.red(
          `❌ Failed to send Teams notification. Status Code: ${res.statusCode}`
        )
      );
    }
  });

  req.on("error", (err) => {
    console.error(
      chalk.red(`❌ Error sending Teams notification: ${err.message}`)
    );
    process.exit(1);
  });

  req.write(JSON.stringify(teamsPayload));
  req.end();
}
