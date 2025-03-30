import chalk from "chalk";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

// Function to send Slack message
export function sendSlackMessage(payload) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    console.error(
      chalk.red("❌ Slack Webhook URL is missing in environment variables.")
    );
    process.exitCode = 1;
  }

  const slackPayload = {
    pretext: "*🚀 K6 Load Test Summary*",
    thumb_url:
      "https://github.com/qaPaschalE/k6-slack-ms-teams-reporter/blob/main/assets/k6%20logo.png?raw=true", // K6 logo
    attachments: [
      {
        color: payload.color,
        fields: [
          { title: "Status", value: payload.status, short: true },
          { title: "Failure Rate", value: payload.failureRate, short: true },
          { title: "Iterations", value: payload.iterations, short: true },
          {
            title: "Failed Requests",
            value: payload.failedRequests,
            short: true,
          },
          { title: "Passed Checks", value: payload.passedChecks, short: true },
          { title: "Failed Checks", value: payload.failedChecks, short: true },
          { title: "Min VUs", value: payload.minVUs, short: true },
          { title: "Max VUs", value: payload.maxVUs, short: true },
          {
            title: "95th Percentile",
            value: payload.p95ResponseTime,
            short: true,
          },
          {
            title: "Threshold Breaches",
            value:
              payload.breachedThresholds.length > 0
                ? payload.breachedThresholds.join("\n")
                : "None ✅",
            short: false,
          },
        ],
        actions: [
          {
            type: "button",
            text: "📜 View Full Report",
            url: payload.htmlReportUrl,
            style: "primary",
          },
        ],
        footer: `⏱ ${new Date().toISOString()}`,
      },
    ],
  };

  if (process.argv.includes("--verbose")) {
    console.log(
      chalk.blue("📤 Sending Slack payload:"),
      JSON.stringify(slackPayload, null, 2)
    );
  }

  const options = {
    hostname: new URL(slackWebhookUrl).hostname,
    path: new URL(slackWebhookUrl).pathname,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };

  const req = https.request(options, (res) => {
    let responseBody = "";

    res.on("data", (chunk) => {
      responseBody += chunk;
    });

    res.on("end", () => {
      if (res.statusCode === 200) {
        console.log(chalk.green("✅ Slack notification sent successfully!"));
      } else {
        console.error(
          chalk.red(
            `❌ Failed to send Slack notification. Status Code: ${res.statusCode}`
          )
        );
        console.error(chalk.red(`❌ Slack Response: ${responseBody}`));
      }
    });
  });

  req.on("error", (err) => {
    console.error(
      chalk.red(`❌ Error sending Slack notification: ${err.message}`)
    );
    process.exitCode = 1;
  });

  req.write(JSON.stringify(slackPayload));
  req.end();
}
