export default {
  reporter: "k6-slack-ms-teams-reporter",
  target: "slack",
  reportName: "k6TestResults",
  verbose: false,
  jsonReportPath: "examples/reports/k6TestResults.json",
  htmlReportUrl: "http://127.0.0.1/examples/reports/k6TestResults.html",
  ciPipelineUrl: "https://gitlab.com/myproject/-/jobs/",
};
