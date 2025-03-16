### **📖 @paschal_cheps/k6-slack-ms-teams-reporter**

<table align="center"><tr><td align="center" width="9999">
 <img src="https://github.com/qaPaschalE/blob/main/assets/paschal%20logo%20(2).png?raw=true" alt="paschal Logo" style="margin-top:25px;" align="center"/>
</td></tr></table>

[![npm version](https://img.shields.io/npm/v/@paschal_cheps/k6-slack-ms-teams-reporter)](https://www.npmjs.com/package/@paschal_cheps/k6-slack-ms-teams-reporter)  
[![license](https://img.shields.io/npm/l/@paschal_cheps/k6-slack-ms-teams-reporter)](https://github.com/qaPaschalE/@paschal_cheps/k6-slack-ms-teams-reporter/blob/main/LICENSE)  
[![npm downloads](https://img.shields.io/npm/dt/@paschal_cheps/k6-slack-ms-teams-reporter)](https://www.npmjs.com/package/@paschal_cheps/k6-slack-ms-teams-reporter)  
[![Build Status](https://github.com/qaPaschalE/actions/workflows/build.yml/badge.svg)](https://github.com/qaPaschalE/actions/workflows/build.yml)  
[![downloads all time](https://img.shields.io/npm/dt/@paschal_cheps/k6-slack-ms-teams-reporter.svg?style=flat&color=black&label=lifetime%20downloads)](https://www.npmjs.com/package/@paschal_cheps/k6-slack-ms-teams-reporter)

🚀 A lightweight reporting tool that sends **K6 Load Test Reports** to **Slack** & **Microsoft Teams**.

---

## **📌 Features**

✔ Parses **K6 JSON or HTML reports**  
✔ Extracts **failure rate, iteration stats & threshold breaches**  
✔ Sends results **directly to Slack or Teams**  
✔ **Customizable message format & colors**  
✔ **Works in CI/CD pipelines** (GitHub Actions, GitLab CI, Jenkins, etc.)

---

## **📋 Prerequisites**

Before using this package, ensure you have the following installed:

1️⃣ **Node.js** (`>=18.x`) - [Download](https://nodejs.org/)  
2️⃣ **NPM** (Comes with Node.js)  
3️⃣ **K6** for load testing - [Install K6](https://k6.io/docs/getting-started/installation/)  
4️⃣ **Slack & Teams Webhook URLs** (Saved in `.env`)

---

## **📦 Installation**

```sh
npm install --save-dev @paschal_cheps/k6-slack-ms-teams-reporter
```

---

## **🔧 Configuration**

### **1️⃣ Set Up Environment Variables**

Create a `.env` file and add your Slack or Teams webhook URL:

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook-url
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url
```

---

## **📊 Generating Reports**

To generate **HTML and JSON reports**, modify your **K6 script**:

```js
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export function handleSummary(data) {
  return {
    "reports/k6TestReport.html": htmlReport(data),
    "reports/k6TestResults.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
```

This will create:  
📜 **HTML Report:** `reports/k6TestReport.html`  
📜 **JSON Report:** `reports/k6TestResults.json`

---

## **🚀 Sending Reports**

### **1️⃣ CLI Usage**

#### **Send Report to Slack**

```sh
npx k6-slack-ms-teams-reporter --target slack --report-name k6TestResults
```

#### **Send Report to Microsoft Teams**

```sh
npx k6-slack-ms-teams-reporter --target teams --report-name k6TestResults
```

---

## **🛠️ Custom Reporter Options**

You can configure custom options via **reporterOptions.json**:

Create a `reporterOptions.json` file in your project:

```json
{
  "target": "slack",
  "reportName": "k6TestResults",
  "verbose": true,
  "jsonReportPath": "artifacts/loadTestResults.json",
  "htmlReportUrl": "artifacts/loadTestReport.html",
  "ciPipelineUrl": "https://gitlab.com/myproject/-/jobs/"
}
```

Then run the reporter:

```sh
npx k6-slack-ms-teams-reporter
```

The reporter will automatically pick up configurations from `reporterOptions.json`.

---

## **📝 Example Slack & Teams Reports**

### **📌 Slack Report**

```json
{
  "text": "📊 Load Test Results",
  "attachments": [
    {
      "color": "#FF0000",
      "fields": [
        { "title": "Failure Rate", "value": "12.5%", "short": true },
        { "title": "Total Requests", "value": "400", "short": true },
        { "title": "Failed Requests", "value": "50", "short": true },
        { "title": "Iterations", "value": "20", "short": true },
        { "title": "Max VUs", "value": "50", "short": true },
        {
          "title": "Threshold Breaches",
          "value": "http_req_duration p(95)<5000ms ❌",
          "short": false
        }
      ],
      "actions": [
        {
          "type": "button",
          "text": "📜 View Full Reports",
          "url": "https://gitlab.com/myproject/-/jobs/",
          "style": "primary"
        }
      ],
      "footer": "⏱️ 2025-03-15 12:00 | Environment: Staging"
    }
  ]
}
```

---

### **📌 Microsoft Teams Report**

```json
{
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  "themeColor": "FF0000",
  "summary": "K6 Load Test Results",
  "sections": [
    {
      "activityTitle": "🚀 Load Test Summary",
      "facts": [
        { "name": "Failure Rate", "value": "12.5%" },
        { "name": "Total Requests", "value": "400" },
        { "name": "Failed Requests", "value": "50" },
        { "name": "Iterations", "value": "20" },
        { "name": "Max VUs", "value": "50" },
        {
          "name": "Threshold Breaches",
          "value": "http_req_duration p(95)<5000ms ❌"
        }
      ]
    }
  ]
}
```

---

## **🧪 Running Tests**

Run unit tests using Mocha:

```sh
npx mocha test --recursive --exit
```

---

## **📌 CI/CD Integration**

### **GitHub Actions**

```yaml
- name: Send K6 Report to Slack
  run: npx k6-slack-ms-teams-reporter
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Send K6 Report to Microsoft Teams
  run: npx k6-slack-ms-teams-reporter
  env:
    TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

### **GitLab CI**

```yaml
stages:
  - test
  - report

report:
  stage: report
  script:
    - npx k6-slack-ms-teams-reporter
  only:
    - main
```

---

## **🛠 Debugging & Troubleshooting**

- **Run with verbose logs:**
  ```sh
  node src/index.js --target slack --report-name k6TestResults --verbose
  ```
- **Check webhook URL is valid**
- **Ensure `reports/k6TestResults.json` exists**
- **Check network connectivity & API limits**

---

## **📜 License**

This project is **MIT Licensed**.

🚀 **Developed by @paschal_cheps** | **Contributions Welcome!** 💡
