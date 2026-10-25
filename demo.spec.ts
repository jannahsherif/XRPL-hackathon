import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the simulated settle demo works repeatedly and holds an unusual item", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The Tab That Settles Itself." })).toBeVisible();
  await expect(page.getByText(/No real money moves/)).toBeVisible();
  const landingA11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(landingA11y.violations).toEqual([]);

  await page.getByRole("link", { name: "Enter Settle" }).click();
  await page.getByLabel("Email address").fill("club@example.com");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("$25,275.35")).toBeVisible();

  const overviewA11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(overviewA11y.violations).toEqual([]);

  for (let run = 0; run < 3; run += 1) {
    await page.goto("/tabs");
    await page.getByRole("button", { name: /Margaret Okafor/ }).click();
    await page.getByRole("button", { name: "Close tab" }).click();
    await expect(page.getByRole("status")).toContainText("Settled. $325.11 from Margaret Okafor.");
    await expect(page.getByText(/Matched 7 items/)).toBeVisible();
    await page.getByRole("link", { name: "Payments" }).click();
    await page.getByText("Ledger receipt").click();
    await expect(page.getByText(/148.45 XRP/)).toBeVisible();
    if (run < 2) {
      await page.getByRole("button", { name: "Close details" }).click();
      await page.getByRole("button", { name: "Reset demo" }).click();
      await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    }
  }

  await page.goto("/overview");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.goto("/tabs");
  await page.getByRole("button", { name: /Margaret Okafor/ }).click();
  await page.getByRole("button", { name: "Simulate exit" }).click();
  await expect(page.getByRole("heading", { name: "Thanks for visiting." })).toBeVisible();
  await expect(page.getByText(/10 seconds/)).toBeVisible();
  await page.getByRole("button", { name: "Settle tab" }).click();
  await expect(page.getByRole("heading", { name: "Settled." })).toBeVisible();

  await page.goto("/present");
  await expect(page.getByText("12 days")).toBeVisible();
  await page.keyboard.press("2");
  await expect(page.getByText("ACT 2 · LIVE DEMO")).toBeVisible();

  await page.goto("/pos");
  await page.getByRole("button", { name: /Reserve whiskey/ }).click();
  await page.goto("/tabs");
  await expect(page.getByRole("heading", { name: "Daniel Reyes" })).toBeVisible();
  await page.getByRole("button", { name: "Close tab" }).click();
  await expect(page.getByText(/Held Tab #1064/)).toBeVisible();
  await page.goto("/manager");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("heading", { name: "Review approved." })).toBeVisible();
});
