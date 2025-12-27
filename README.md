# Horse Racing Game

A small horse racing game built with **Vue 3 + Vite + Vuew + TypeScript**.

The app lets you generate a program of **6 races**, each with **10 horses**, then start/pause the race sequence and view results.

## Tech Stack

- **Vue 3** (SFCs with `<script setup>`)
- **Vite** (dev server + build)
- **TypeScript**
- **Vuex** (state management)
- **Vitest** (unit tests)
- **Storybook** (component documentation and preview)
- **Playwright** (E2E tests)

## Requirements

- **Node.js**: use a modern Node version compatible with Vite 7.
  - Recommended: **Node 22.12+** (or newer)

- **npm** (ships with Node)

If you see `TypeError: crypto.hash is not a function` when starting Vite, you are on an older Node version. Upgrade Node (24.12.0).

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Vite runs on:

- http://localhost:5173

## Scripts

Common scripts from `package.json`:

```bash
# Dev
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Storybook
npm run storybook
npm run build-storybook

# Tests
npm run test
npm run test:unit
npm run test:unit:run
npm run test:storybook

# E2E
npm run e2e
npm run e2e:ui

# Formatting / Linting
npm run format
npm run format:check
npm run lint
npm run lint:fix
```

## Testing

### Unit Tests (Vitest)

Runs unit tests under `src/**/*.spec.ts` using a JSDOM environment.

```bash
npm run test:unit
```

To run once in CI style:

```bash
npm run test:unit:run
```

### Component / Storybook Tests

This project uses Storybook + the Vitest addon to validate stories in a real browser environment.

```bash
npm run test:storybook
```

### E2E Tests (Playwright)

E2E specs live under `tests/e2e` and run against the Vite dev server.
Playwright is configured to start the dev server automatically.

Run all E2E tests:

```bash
npm run e2e
```

Open the Playwright UI runner:

```bash
npm run e2e:ui
```

Run a single test by name (example):

```bash
npx playwright test tests/e2e/race.spec.ts -g "should generate races" --project=chromium
```

After a run, view the HTML report:

```bash
npx playwright show-report
```

#### Speeding up E2E

To reduce flakiness and avoid large timeouts, E2E runs can be sped up via a Vite env flag:

```bash
VITE_RACE_SPEED_MULTIPLIER=10 npm run e2e
```

This scales Track animation speed and internal delays between races.

## CI

This repo includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs on pushes to `main` and on pull requests.

It runs:

- ESLint (`npm run lint`)
- Prettier check (`npm run format:check`)
- Typecheck (`vue-tsc -b`)
- Unit tests (`npm run test:unit:run`)
- Build (`npm run build`)
- Playwright E2E (`npm run e2e`, headless)

Playwright reports are uploaded as build artifacts on every run.

## Editor Setup

- The workspace has VS Code settings in `.vscode/settings.json` to use Prettier as the default formatter.
- Extensions are recommended in `.vscode/extensions.json` (Volar, ESLint, Prettier).

## Project Structure

High-level layout:

```text
src/
	pages/              # Page-level views (e.g. RacePage)
	components/
		atoms/            # Small reusable components (Button, Table, Horse)
		molecules/        # Composed components (Track)
		organisms/        # Larger composed UI (AppHeader, RaceCourse)
		layouts/          # Layout primitives (AppLayout, TitledSection)
	store/              # Vuex store modules
	data/               # Static data (horses)
tests/
	e2e/                # Playwright tests
```

## Troubleshooting

### Vite fails with `crypto.hash is not a function`

Cause: Node is too old for the current Vite version.

Fix:

```bash
node -v
```

Then upgrade and re-install dependencies if needed:

```bash
# if you use nvm
nvm install 24
nvm use 24

npm install
```

### Playwright webServer doesn’t start

Playwright starts the dev server using `npm run dev` (see `playwright.config.ts`).
If `npm run dev` fails, E2E will fail as well — fix dev-server issues first.

## Notes

- This repo uses TypeScript project references (`vue-tsc -b`) during `npm run build`.
- `ResizeObserver` is mocked for unit tests via `vitest.setup.ts`.
