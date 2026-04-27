# Zedu API Automation Tests

## Project Overview
This project contains automated API tests for the Zedu platform built using JavaScript and Jest.

## Prerequisites
- Node.js v18 or higher
- npm v8 or higher

## Setup Instructions
1. Clone the repository:
git clone <your-github-repo-link>

2. Navigate into the project folder:
cd zedu-api-tests

3. Install dependencies:
npm install

4. Create your .env file:
cp .env.example .env

5. Fill in your credentials in the .env file:
BASE_URL=https://api.staging.zedu.chat/api/v1
EMAIL=your_email_here
PASSWORD=your_password_here

## How to Run Tests
npm test

## Test Files
- **tests/auth.test.js** — 13 tests covering registration and login endpoints including positive, negative and edge cases
- **tests/users.test.js** — 12 tests covering user endpoints including getting current user, specific user, all users and organisations

## Environment Variables
| Variable | Description |
|---|---|
| BASE_URL | Base URL for the Zedu staging API |
| EMAIL | Registered email for testing |
| PASSWORD | Password for the test account |