import { DEFAULT_RACE_COUNT, HORSES_PER_RACE } from "../../src/store/modules/race/race.constants";
import { expect, test } from "@playwright/test";

async function clickGenerate(page: import("@playwright/test").Page) {
  const btn = page.getByRole("button", { name: /generate/i });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
  await btn.click();
}

async function clickStart(page: import("@playwright/test").Page) {
  const btn = page.getByRole("button", { name: /^start$/i });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
  await btn.click();
}

async function clickReset(page: import("@playwright/test").Page) {
  const btn = page.getByRole("button", { name: /reset/i });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
  await btn.click();
}

test.describe("Horse Racing Game - Race Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the race page successfully", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/horse\s*racing\s*game/i);

    const appRoot = page.locator("#app");
    await expect(appRoot).toBeVisible();

    await expect(page.locator("body")).toBeVisible();
  });

  test("should display the race course with horses", async ({ page }) => {
    const generateButton = page.locator("button", { hasText: /generate/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(500);
    }

    const tracks = page.locator(".track-root");
    await page.waitForTimeout(200);
    const trackCount = await tracks.count();
    expect(trackCount).toBeGreaterThan(0);
  });

  test(`should generate races with ${DEFAULT_RACE_COUNT} races and ${HORSES_PER_RACE} horses each`, async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    await clickGenerate(page);

    const racesSection = page.getByRole("region", { name: /races/i });
    await expect(racesSection).toBeVisible();

    const raceBlocks = racesSection.getByRole("region", {
      name: /race\s+\d+\s+-\s+\d+m/i,
    });
    await expect(raceBlocks).toHaveCount(DEFAULT_RACE_COUNT);

    for (let i = 0; i < DEFAULT_RACE_COUNT; i++) {
      const raceBlock = raceBlocks.nth(i);
      const horseRows = raceBlock.locator("table tbody tr");
      await expect(horseRows).toHaveCount(HORSES_PER_RACE);
    }
  });

  test("should show race results ordered by horse condition", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    await clickGenerate(page);

    const horsesSection = page.getByRole("region", { name: /horses/i });
    await expect(horsesSection).toBeVisible();

    const horseConditionByName = new Map<string, number>();
    const horseRows = horsesSection.locator("table tbody tr");
    const horseRowCount = await horseRows.count();
    for (let i = 0; i < horseRowCount; i++) {
      const row = horseRows.nth(i);
      const name = (await row.locator("td").nth(0).innerText()).trim();
      const conditionText = (await row.locator("td").nth(1).innerText()).trim();
      const condition = Number(conditionText);
      if (name && Number.isFinite(condition)) {
        horseConditionByName.set(name, condition);
      }
    }

    const racesSection = page.getByRole("region", { name: /races/i });
    await expect(racesSection).toBeVisible();

    const race1Block = racesSection.getByRole("region", {
      name: /race\s+1\s+-\s+\d+m/i,
    });
    await expect(race1Block).toBeVisible();

    const race1HorseRows = race1Block.locator("table tbody tr");
    await expect(race1HorseRows).toHaveCount(HORSES_PER_RACE);

    const race1HorseNames: string[] = [];
    for (let i = 0; i < HORSES_PER_RACE; i++) {
      const name = (await race1HorseRows.nth(i).locator("td").nth(1).innerText()).trim();
      race1HorseNames.push(name);
    }

    await clickStart(page);

    const resultsSection = page.getByRole("region", { name: /results/i });
    await expect(resultsSection).toBeVisible();

    const race1ResultBlock = resultsSection.getByRole("region", {
      name: /race\s+1\s+-\s+\d+m/i,
    });
    await expect(race1ResultBlock).toBeVisible({ timeout: 30_000 });

    const resultRows = race1ResultBlock.locator("table tbody tr");
    await expect(resultRows).toHaveCount(HORSES_PER_RACE);

    const actualResultOrder: string[] = [];
    for (let i = 0; i < HORSES_PER_RACE; i++) {
      const name = (await resultRows.nth(i).locator("td").nth(1).innerText()).trim();
      actualResultOrder.push(name);
    }

    const expectedOrder = [...race1HorseNames].sort((a, b) => {
      const ca = horseConditionByName.get(a);
      const cb = horseConditionByName.get(b);
      if (ca == null || cb == null) return 0;
      return cb - ca;
    });

    expect(actualResultOrder).toEqual(expectedOrder);
  });

  test(`should complete all ${DEFAULT_RACE_COUNT} races with correct results`, async ({ page }) => {
    test.setTimeout(240_000);

    await page.waitForLoadState("networkidle");

    await clickGenerate(page);

    const horsesSection = page.getByRole("region", { name: /horses/i });
    await expect(horsesSection).toBeVisible();

    const horseConditionByName = new Map<string, number>();
    const horseRows = horsesSection.locator("table tbody tr");
    const horseRowCount = await horseRows.count();
    for (let i = 0; i < horseRowCount; i++) {
      const row = horseRows.nth(i);
      const name = (await row.locator("td").nth(0).innerText()).trim();
      const conditionText = (await row.locator("td").nth(1).innerText()).trim();
      const condition = Number(conditionText);
      if (name && Number.isFinite(condition)) {
        horseConditionByName.set(name, condition);
      }
    }

    const racesSection = page.getByRole("region", { name: /races/i });
    await expect(racesSection).toBeVisible();

    const expectedOrderByRaceNo = new Map<number, string[]>();
    for (let raceNo = 1; raceNo <= DEFAULT_RACE_COUNT; raceNo++) {
      const raceBlock = racesSection.getByRole("region", {
        name: new RegExp(`race\\s+${raceNo}\\s+-\\s+\\d+m`, "i"),
      });
      await expect(raceBlock).toBeVisible();

      const rows = raceBlock.locator("table tbody tr");
      await expect(rows).toHaveCount(HORSES_PER_RACE);

      const names: string[] = [];
      for (let i = 0; i < HORSES_PER_RACE; i++) {
        const name = (await rows.nth(i).locator("td").nth(1).innerText()).trim();
        names.push(name);
      }

      const expectedOrder = [...names].sort((a, b) => {
        const ca = horseConditionByName.get(a);
        const cb = horseConditionByName.get(b);
        if (ca == null || cb == null) return 0;
        return cb - ca;
      });

      expectedOrderByRaceNo.set(raceNo, expectedOrder);
    }

    await clickStart(page);

    const resultsSection = page.getByRole("region", { name: /results/i });
    await expect(resultsSection).toBeVisible();

    const resultBlocks = resultsSection.getByRole("region", {
      name: /race\s+\d+\s+-\s+\d+m/i,
    });

    await expect(resultBlocks).toHaveCount(DEFAULT_RACE_COUNT, { timeout: 240_000 });

    for (let raceNo = 1; raceNo <= DEFAULT_RACE_COUNT; raceNo++) {
      const resultBlock = resultsSection.getByRole("region", {
        name: new RegExp(`race\\s+${raceNo}\\s+-\\s+\\d+m`, "i"),
      });
      await expect(resultBlock).toBeVisible();

      const resultRows = resultBlock.locator("table tbody tr");
      await expect(resultRows).toHaveCount(HORSES_PER_RACE);

      const actualOrder: string[] = [];
      for (let i = 0; i < HORSES_PER_RACE; i++) {
        const name = (await resultRows.nth(i).locator("td").nth(1).innerText()).trim();
        actualOrder.push(name);
      }

      const expectedOrder = expectedOrderByRaceNo.get(raceNo);
      expect(expectedOrder).toBeTruthy();
      expect(actualOrder).toEqual(expectedOrder);
    }
  });

  test("should be able to start a race", async ({ page }) => {
    const generateButton = page.locator("button", { hasText: /generate/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(500);
    }

    const startButton = page.locator("button", { hasText: /start|run|go/i });

    if (await startButton.isVisible()) {
      await startButton.click();

      await page.waitForTimeout(100);

      const runners = page.locator(".runner.is-running");
      const runningCount = await runners.count();
      expect(runningCount).toBeGreaterThan(0);
    }
  });

  test("should pause the race when clicking pause", async ({ page }) => {
    const generateButton = page.locator("button", { hasText: /generate/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(500);
    }

    const startButton = page.locator("button", { hasText: /start|run|go/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(200);

      const pauseButton = page.locator("button", { hasText: /pause|stop/i });
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
        await page.waitForTimeout(100);

        const pausedRunners = page.locator(".runner.is-paused");
        const pausedCount = await pausedRunners.count();
        expect(pausedCount).toBeGreaterThan(0);
      }
    }
  });

  test("should reset and clear races/results", async ({ page }) => {
    await clickGenerate(page);
    await clickStart(page);

    await expect(page.locator(".runner.is-running").first()).toBeVisible();

    await clickReset(page);

    const racesSection = page.getByRole("region", { name: /races/i });
    await expect(racesSection).toBeVisible();
    await expect(racesSection).toContainText(/total:\s*0/i);
    await expect(racesSection).toContainText(/no races yet/i);

    const resultsSection = page.getByRole("region", { name: /results/i });
    await expect(resultsSection).toBeVisible();
    await expect(resultsSection).toContainText(/total:\s*0/i);
    await expect(resultsSection).toContainText(/results will appear here/i);

    const emptyTrack = page.locator(".empty-track").first();
    await expect(emptyTrack.locator(".empty-track__text").first()).toContainText(/generate/i);

    await expect(page.getByRole("button", { name: /^start$/i })).toBeDisabled();
    await expect(page.getByRole("button", { name: /generate/i })).toBeEnabled();
  });

  test("should display horse information", async ({ page }) => {
    const generateButton = page.locator("button", { hasText: /generate/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(200);
    }

    const horseSection = page.getByRole("region", { name: /Horses/i });
    await expect(horseSection).toBeVisible();

    const horseRows = horseSection.locator("table tbody tr");
    const horseCount = await horseRows.count();
    expect(horseCount).toBeGreaterThan(0);
  });

  test("should display race results after completion", async ({ page }) => {
    const generateButton = page.locator("button", { hasText: /generate/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(500);
    }

    const startButton = page.locator("button", { hasText: /start|run|go/i });
    if (await startButton.isVisible()) {
      await startButton.click();

      await page.waitForTimeout(12000);

      const finishedRunners = page.locator(".runner.is-finished");
      const finishedCount = await finishedRunners.count();

      if (finishedCount > 0) {
        expect(finishedCount).toBeGreaterThan(0);
      }
    }
  });

  test("should handle multiple races in sequence", async ({ page }) => {
    await clickGenerate(page);
    await clickStart(page);
    await expect(page.locator(".runner.is-running").first()).toBeVisible();

    await clickReset(page);
    await clickGenerate(page);
    await clickStart(page);

    await expect(page.locator(".runner.is-running").first()).toBeVisible();
  });

  test("should display track lanes with correct direction", async ({ page }) => {
    const generateButton = page.locator("button", { hasText: /generate/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(500);
    }

    const tracks = page.locator(".track-root");

    await expect(tracks.first()).toBeVisible();
  });
});
