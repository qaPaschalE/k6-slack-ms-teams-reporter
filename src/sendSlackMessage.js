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
    process.exit(1);
  }

  // 📝 Slack Payload using your WORKING format
  const slackPayload = {
    text: "📊 *K6 Load Test Results*", // Fallback text
    attachments: [
      {
        color: payload.color,
        fields: [
          { title: "Status", value: payload.status, short: true },
          { title: "Failure Rate", value: payload.failureRate, short: true },
          {
            title: "Total Requests",
            value: payload.totalRequests,
            short: true,
          },
          {
            title: "Failed Requests",
            value: payload.failedRequests,
            short: true,
          },
          { title: "Iterations", value: payload.iterations, short: true },
          { title: "Max VUs", value: payload.vus, short: true },
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

  // ✅ Debugging: Log the payload before sending
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
    process.exit(1);
  });

  req.write(JSON.stringify(slackPayload));
  req.end();
}
