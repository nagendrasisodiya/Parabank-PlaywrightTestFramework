# Parabank Test Automation

This project contains automated tests for the Parabank application, covering UI, API, and End-to-End (E2E) scenarios using Playwright and TypeScript.

## 🚀 Overview

The automation suite is designed to validate the core functionalities of the Parabank application, including user registration, login, account management, and fund transfers.

- **Language:** TypeScript
- **Framework:** [Playwright](https://playwright.dev/)
- **Reporting:** Allure Report & Playwright HTML Report
- **CI/CD:** Jenkins

## 📋 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 22 recommended as per Jenkinsfile)
- npm (comes with Node.js)

## 🛠️ Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Parabank
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

## 🧪 Running Tests

### Run all tests
```bash
npx playwright test
```

### Run tests in headed mode
```bash
npx playwright test --headed
```

### Run specific test suites
- **UI Tests:** `npx playwright test tests/UI`
- **API Tests:** `npx playwright test tests/API`
- **E2E Tests:** `npx playwright test tests/E2E`

### Run tests on a specific browser
```bash
npx playwright test --project=chromium
```

## 📊 Reporting

### Playwright HTML Report
After running tests, you can view the default HTML report:
```bash
npx playwright show-report
```

### Allure Report
1. **Generate the report:**
   ```bash
   npx allure generate allure-results --clean
   ```
2. **Open the report:**
   ```bash
   npx allure open allure-report
   ```

## 📂 Project Structure

```text
Parabank/
├── pages/             # Page Object Models (POM)
├── tests/             # Test suites
│   ├── API/           # API-level functional tests
│   ├── E2E/           # End-to-end business flow tests
│   └── UI/            # User Interface functional tests
├── utils/             # Shared utility functions (API helpers, etc.)
├── test-data/         # Static test data (JSON files)
├── playwright.config.ts # Playwright configuration
├── Jenkinsfile        # Jenkins CI/CD pipeline definition
└── package.json       # Project dependencies and scripts
```


## 🏗️ CI/CD
The project includes a `Jenkinsfile` for automated execution in Jenkins. It performs the following steps:
1. Checkouts the code.
2. Installs dependencies.
3. Installs Playwright browsers.
4. Executes tests.
5. Publishes HTML and Allure reports.
