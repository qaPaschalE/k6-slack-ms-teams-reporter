## **📖 @paschal_cheps/k6-slack-ms-teams-reporter**

<table align="center" style="margin-bottom:30px;"><tr><td align="center" width="9999" heigth="9999 " >
 <img src="https://github.com/qaPaschalE/blob/main/assets/paschal%20logo%20(2).png?raw=true" alt="paschal Logo" style="margin-top:25px;" align="center"/>

#

</td></tr></table>

[![npm version](https://img.shields.io/npm/v/@paschal_cheps/k6-slack-ms-teams-reporter)](https://www.npmjs.com/package/@paschal_cheps/k6-slack-ms-teams-reporter)
[![license](https://img.shields.io/npm/l/@paschal_cheps/k6-slack-ms-teams-reporter)](https://github.com/qaPaschalE/@paschal_cheps/k6-slack-ms-teams-reporter/blob/main/LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/@paschal_cheps/k6-slack-ms-teams-reporter)](https://www.npmjs.com/package/@paschal_cheps/k6-slack-ms-teams-reporter)
[![Build Status](https://github.com/qaPaschalE/actions/workflows/build.yml/badge.svg)](https://github.com/qaPaschalE/actions/workflows/build.yml)
[![downloads all time](https://img.shields.io/npm/dt/@paschal_cheps/k6-slack-ms-teams-reporter.svg?style=flat&color=black&label=lifetime%20downloads)](https://www.npmjs.com/package/@paschal_cheps/k6-slack-ms-teams-reporter)

🚀 A lightweight reporting tool that sends **K6 Load Test Reports** to **Slack** & **Microsoft Teams**.

### **📌 Features**

✔ Parses **K6 JSON or HTML reports**  
✔ Extracts **failure rate & threshold breaches**  
✔ Sends results **directly to Slack or Teams**  
✔ **Customizable message format**  
✔ **Works in CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins, etc.)**

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

### **1️⃣ Send Report to Slack**

```sh
npx k6-slack-ms-teams-reporter --target slack --report reports/k6TestResults.json
```

### **2️⃣ Send Report to Microsoft Teams**

```sh
npx k6-slack-ms-teams-reporter --target teams --report reports/k6TestResults.json
```

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
        {
          "title": "Threshold Breaches",
          "value": "http_req_duration p(95)<5000ms ❌",
          "short": false
        }
      ],
      "footer": "⏱️ 2025-03-15 12:00 | Environment: Staging"
    }
  ]
}
```

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

Add this to your **GitHub Actions workflow**:

```yaml
- name: Send K6 Report to Slack
  run: npx k6-slack-ms-teams-reporter --target slack --report reports/k6TestResults.json
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Send K6 Report to Microsoft Teams
  run: npx k6-slack-ms-teams-reporter --target teams --report reports/k6TestResults.json
  env:
    TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

---

## **📜 License**

This project is **MIT Licensed**.

---

🚀 **Developed by @paschal_cheps** | **Contributions Welcome!** 💡
