import "dotenv/config"; // Load environment variables
import fs from "fs"; // Import file system module

// Default config
let defaultConfig = {
  jsonReportPath: "reports/[name].json",
  htmlReportUrl: "reports/[name].html",
  ciPipelineUrl: "https://your-ci-pipeline-url",
};

// Load custom config from `reportConfig.json` (if available)
let userConfig = {};
try {
  if (fs.existsSync("./reportConfig.json")) {
    userConfig = JSON.parse(fs.readFileSync("./reportConfig.json", "utf8"));
  }
} catch (error) {
  console.error("⚠️ Failed to load reportConfig.json:", error.message);
}

// Merge defaults with user-configurable options
const reportOptions = {
  jsonReportPath:
    process.env.JSON_REPORT_PATH ||
    userConfig.jsonReportPath ||
    defaultConfig.jsonReportPath,
  htmlReportUrl:
    process.env.REPORT_URL ||
    userConfig.htmlReportUrl ||
    defaultConfig.htmlReportUrl,
  ciPipelineUrl:
    process.env.CI_PIPELINE_URL ||
    userConfig.ciPipelineUrl ||
    defaultConfig.ciPipelineUrl,
};

export default reportOptions;
