# Zedu API Automation Tests
![CI Status](https://github.com/nnekarachael-bit/zedu-api-tests/actions/workflows/ci.yml/badge.svg)

## Project Overview
This project contains automated API tests for the Zedu platform built using JavaScript and Jest. It includes a fully automated Continuous Integration (CI) pipeline to ensure code quality on every update.

## 🚀 Continuous Integration (CI) Pipeline
This project uses GitHub Actions for CI. The pipeline is configured to automatically:
- Trigger on every `push` and `pull_request` to the `main` branch.
- Set up the Node.js (v18.x) runtime environment.
- Install dependencies automatically.
- Execute the full Jest test suite against the API.
- Fail the build immediately if any tests break.
- Generate a JUnit XML test report as a downloadable artifact.

## Prerequisites
- Node.js v18 or higher
- npm v8 or higher

## Setup Instructions
1. Clone the repository:
```bash
git clone [https://github.com/nnekarachael-bit/zedu-api-tests.git](https://github.com/nnekarachael-bit/zedu-api-tests.git)