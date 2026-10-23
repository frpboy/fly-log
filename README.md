# Flight Data Visualizer

Fly Log is a React + Vite application for tracking personal flight history. Firebase Authentication and Firestore handle accounts and per-user flight records; the frontend enriches those records with airport and airline reference data and presents interactive maps, statistics, filters, AI-assisted entry, and CSV import.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Testing](#testing)
  - [Unit Testing with Vitest](#unit-testing-with-vitest)
  - [End-to-End Testing with Cypress](#end-to-end-testing-with-cypress)
  - [Test Structure](#test-structure)
  - [Writing Tests](#writing-tests)
- [Current Features](#current-features)
- [Developer Guide](#developer-guide)

## Project Overview

The application has two main parts:

1. **Flight storage and enrichment:** Flights are stored per user in Firestore and enriched in the frontend using airport and airline reference datasets.
2. **Frontend (React + Vite):** A single-page application with interactive maps, statistics, filtering, manual entry, AI-assisted entry, and CSV import. The UI uses Mantine.
3. **Python data utilities:** Scripts in `python/` generate the airport and airline reference datasets. The app does not require a generated `flights_with_coordinates.json` file to load a user's flights.

## Tech Stack

- **Frontend:** React, Vite, Mantine UI
- **Data Processing:** Python, Pandas
- **Deployment:** Configured for static site deployment on Netlify

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by the project's Vite version)
- npm
- Python 3.x and `uv` only if you need to regenerate the reference datasets

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2. **Configure the app:**
   - Copy `.env.example` to `.env.local`.
   - Fill in the Firebase `VITE_FIREBASE_*` values for your project. The app intentionally leaves authentication and Firestore uninitialized when the Firebase API key is empty.
   - Personal flight records are loaded from Firestore; you do not need to generate a `flights_with_coordinates.json` file.

3. **Install frontend dependencies:**

   ```bash
   npm ci
   ```

4.  **Run the development server:**
    - This will start the app on `http://localhost:5173`. The page will automatically reload if you make changes to the source code.

    ```bash
    npm run dev
    ```

    - To work on anything that calls a Netlify function (the flight status
      checker), use `npm run dev:netlify` instead. Vite on its own does not
      serve `netlify/functions/`, so those endpoints 404 under `npm run dev`.

5.  **Build for production:**
    - This command bundles the app into the `dist` directory for deployment.
    ```bash
    npm run build
    ```

## Asset Optimization

The ImageMagick helper script in `scripts/optimize-assets.sh` generates responsive WebP variants for images in `src/assets`. It creates `-380.webp`, `-760.webp`, `-1200.webp`, and `-1800.webp` sizes for each image, and includes explicit handling for the landing showcase image so it stays up to date whenever you replace it.

```bash
./scripts/optimize-assets.sh
```

## Firebase Deployment

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login to Firebase:**
    ```bash
    firebase login:list  # to see logged in accounts
    firebase login  # if not already logged in
    firebase login:add  # to add another account
    firebase login:use  # to select the project to use (run from project directory)
    ```
3.  **Initialize Firebase in your project:**

    ```bash
    firebase init
    ```

    - Select "Hosting" and follow the prompts to set up your project.

4.  **Deploy to Firebase:**
    ```bash
    firebase deploy
    ```

## Firebase Firestore Security Rules Setup

```bash
firebase deploy --only firestore:rules
```

### Firestore Security Rules

This repo includes a sample Firestore rules file at `firestore.rules` that enforces per-user access to flight documents stored under `/flights/{userId}/records/{docId}`. Rules ensure that:

- Only authenticated users can read/write their own flight records.
- Created documents must include `departure_date`, `departure_airport_iata`, `arrival_airport_iata`, and `airline_iata` and `departure_date` must be a Firestore timestamp.

To deploy those rules to your Firebase project use:

```bash
firebase deploy --only firestore:rules
```

Or, during `firebase init`, point the Firestore rules location to `firestore.rules` so rules are deployed together with hosting.

## Testing

This project uses two testing frameworks:

### Unit Testing with Vitest

Vitest is used for unit and integration testing of React components and utility functions.

**Run the full unit and integration test suite:**

```bash
npm run vitest
```

**Run tests in watch mode:**

```bash
npm run vitest:watch
```

The project does not currently define coverage or Vitest UI scripts in `package.json`.

### End-to-End Testing with Cypress

Cypress is used for end-to-end testing of the complete application workflow.

**Run Cypress tests in headless mode:**

```bash
npm run test:e2e:headless
```

**Open the interactive Cypress Test Runner:**

```bash
npm run test:e2e
```

Cypress reads its test-account settings from `.env.local` (see `.env.example`). Configure valid test credentials before running tests that authenticate against Firebase.

### Test Structure

- **Unit tests:** Located in `src/` alongside components (e.g., `Component.test.jsx`)
- **Test utilities:** Shared testing utilities in `test-utils/` (see `test-utils/README.md` for details on the global i18n test setup, how translations are injected during tests, and examples to override per-test).
- **Cypress tests:** End-to-end tests in `cypress/e2e/`
- **Test constants:** Centralized test IDS in `src/constants/testIds.js`

### Writing Tests

**Example unit test:**

```javascript
import { describe, it, expect } from "vitest";
import { render } from "../test-utils/render";
import { screen } from "@testing-library/react";
import { TEST_IDS } from "../constants/testIds";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

## Current Features

- Interactive globe displaying all flight paths.
- Detailed flight list in a table format.
- Filter flights by date range, airline, and airport.
- Displays airline logos for each flight.
- Add new flights manually through a form, using CSV upload, or by parsing natural language input with AI assistance.
- Timeline heatmap showing flight activity by year and month.

## Developer Guide

See `docs/developer-guide.md` for the internal architecture map, data flow, and key module notes.
