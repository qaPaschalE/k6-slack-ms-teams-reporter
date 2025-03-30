#!/usr/bin/env node

import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { sendSlackMessage } from "./sendSlackMessage.js";
import { sendTeamsMessage } from "./sendTeamsMessage.js";
import reportOptions from "./reportOptions.js";

// Load environment variables
dotenv.config();

// Load reporter config (supporting both `.json` and `.js`)
let config = {};
const configJsonPath = "reportConfig.json";
const configJsPath = path.resolve(process.cwd(), "reportConfig.js");

if (fs.existsSync(configJsPath)) {
  try {
    console.log(chalk.greenBright(`🛠 Loaded config from reportConfig.js`));
    config = (await import(configJsPath)).default;
  } catch (err) {
    console.error(
      chalk.red(`❌ Error reading reportConfig.js: ${err.message}`)
    );
    process.exit(1);
  }
} else if (fs.existsSync(configJsonPath)) {
  try {
    console.log(chalk.greenBright(`🛠 Loaded config from ${configJsonPath}`));
    config = JSON.parse(fs.readFileSync(configJsonPath, "utf8"));
  } catch (err) {
    console.error(
      chalk.red(`❌ Error reading ${configJsonPath}: ${err.message}`)
    );
    process.exit(1);
  }
} else {
  console.log(chalk.yellow("⚠ No config file found. Using default settings."));
}

// Parse command-line arguments
const args = process.argv.slice(2);
const cliOptions = {
  target: null,
  reportName: null,
  verbose: false,
};

// Process CLI arguments
args.forEach((arg, index) => {
  if (arg === "--target" && args[index + 1])
    cliOptions.target = args[index + 1];
  if (arg === "--report-name" && args[index + 1])
    cliOptions.reportName = args[index + 1];
  if (arg === "--verbose") cliOptions.verbose = true;
});

// Merge config options with CLI (CLI takes precedence)
const options = {
  target: cliOptions.target || config.target,
  reportName: cliOptions.reportName || config.reportName,
  verbose: cliOptions.verbose || config.verbose || false,
  jsonReportPath:
    config.jsonReportPath || `reports/${cliOptions.reportName || "test"}.json`,
  htmlReportUrl:
    config.htmlReportUrl || `reports/${cliOptions.reportName || "test"}.html`,
  ciPipelineUrl: config.ciPipelineUrl || reportOptions.gitPipelineUrl,
};

// Validate required arguments
if (!options.target || !options.reportName) {
  console.error(
    chalk.red("❌ Missing required arguments: --target and --report-name")
  );
  process.exit(1);
}

// Validate webhook URLs
const webhookUrl =
  options.target === "slack"
    ? process.env.SLACK_WEBHOOK_URL
    : options.target === "teams"
    ? process.env.TEAMS_WEBHOOK_URL
    : null;

if (!webhookUrl) {
  console.error(
    chalk.red(`❌ No webhook URL found for target: ${options.target}`)
  );
  process.exit(1);
}

// Logging for debug mode
if (options.verbose) {
  console.log(chalk.cyanBright("🔍 Debug Mode Enabled"));
  console.log(
    chalk.greenBright(`📜 JSON Report Path: ${options.jsonReportPath}`)
  );
  console.log(
    chalk.greenBright(`🔗 HTML Report URL: ${options.htmlReportUrl}`)
  );
  console.log(
    chalk.yellowBright(`🌍 CI/CD Pipeline URL: ${options.ciPipelineUrl}`)
  );
}

// Check if JSON report file exists
if (!fs.existsSync(options.jsonReportPath)) {
  console.error(
    chalk.red(`❌ Report file not found: ${options.jsonReportPath}`)
  );
  process.exit(1);
}

// Load JSON report
const results = JSON.parse(fs.readFileSync(options.jsonReportPath, "utf8"));

// Extract key metrics
const totalRequests = results.metrics.http_reqs?.values.count || 0;
const failedRequests = results.metrics.http_req_failed?.values.fails || 0;
const failureRate = results.metrics.http_req_failed?.values.rate || 0;
const iterations = results.metrics.iterations?.values.count || 0;
const vus = results.metrics.vus_max?.values.max || 0;

// Extract threshold breaches
const thresholds = results.metrics.http_req_duration?.thresholds || {};
const breachedThresholds = Object.entries(thresholds)
  .filter(([_, value]) => value.ok === false)
  .map(([key, _]) => key);

const status =
  failureRate > 0.05 || breachedThresholds.length > 0
    ? "❌ Failed"
    : "✅ Passed";
const color = status === "❌ Failed" ? "#FF0000" : "#36a64f";

// Log extracted metrics
if (options.verbose) {
  console.log(chalk.blueBright(`📊 Total Requests: ${totalRequests}`));
  console.log(chalk.redBright(`❌ Failed Requests: ${failedRequests}`));
  console.log(
    chalk.magentaBright(`📉 Failure Rate: ${(failureRate * 100).toFixed(2)}%`)
  );
  console.log(chalk.yellowBright(`🔄 Iterations: ${iterations}`));
  console.log(chalk.greenBright(`👥 Max VUs: ${vus}`));
  console.log(
    chalk.redBright(
      `🚨 Breached Thresholds: ${breachedThresholds.join(", ") || "None"}`
    )
  );
}

// Prepare payload
const payload = {
  status,
  color,
  totalRequests,
  failedRequests,
  failureRate: (failureRate * 100).toFixed(2) + "%",
  iterations,
  vus,
  breachedThresholds,
  htmlReportUrl: options.htmlReportUrl,
  gitPipelineUrl: options.ciPipelineUrl,
};

// Send report to the selected target
if (options.target === "slack") {
  sendSlackMessage(payload);
} else if (options.target === "teams") {
  sendTeamsMessage(payload);
} else {
  console.error(chalk.red(`❌ Unknown target: ${options.target}`));
  process.exit(1);
}
