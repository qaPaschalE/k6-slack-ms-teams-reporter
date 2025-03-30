import "dotenv/config"; // Load environment variables
import fs from "fs"; // Import file system module
import path from "path"; // Import path module for file extension check

// Default config
let defaultConfig = {
  jsonReportPath: "reports/[name].json",
  htmlReportUrl: "reports/[name].html",
  ciPipelineUrl: "https://your-ci-pipeline-url",
};

// Load custom config from `reportConfig.json` or `reportConfig.js` (if available)
let userConfig = {};
try {
  const configPath = "./reportConfig";
  if (fs.existsSync(configPath + ".json")) {
    userConfig = JSON.parse(fs.readFileSync(configPath + ".json", "utf8"));
  } else if (fs.existsSync(configPath + ".js")) {
    // Dynamically import the JS config
    const jsConfig = await import(path.resolve(configPath + ".js"));
    userConfig = jsConfig.default; // Access the default export
  }
} catch (error) {
  console.error("⚠️ Failed to load reportConfig:", error.message);
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
