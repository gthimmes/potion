import { test, expect, Page } from "@playwright/test";

// The in-app help center (help-navigator widget mounted in the root layout).
// Playwright locators pierce the widget's shadow root automatically.

const sidebar = (page: Page) => page.locator(".bg-sidebar");

async function waitForApp(page: Page) {
  await page.goto("/");
  await expect(page.locator("main")).toContainText("Welcome to Potion", {
    timeout: 15_000,
  });
}

test.describe("help center", () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page);
  });

  test("launcher opens contextual help; context follows the workspace view", async ({
    page,
  }) => {
    // Seeded workspace opens on the Getting Started document page.
    await page.getByRole("button", { name: "Open help" }).click();
    const panel = page.getByRole("dialog", { name: "Potion Help" });
    await expect(panel.getByText("Suggested for this page")).toBeVisible();
    await expect(panel.getByText("The slash menu: every block type")).toBeVisible();
    await expect(panel.getByText("Browse by topic")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel.getByText("Browse by topic")).not.toBeVisible();

    // Switch to the Tasks database — suggestions follow.
    await sidebar(page).getByText("Tasks").click();
    await page.keyboard.press("F1");
    await expect(panel.getByText("Databases: tables and boards in one")).toBeVisible();
    await expect(panel.getByText("Filtering and sorting views")).toBeVisible();
  });

  test("search, article rendering, feedback, and back navigation", async ({ page }) => {
    await page.keyboard.press("F1");
    const panel = page.getByRole("dialog", { name: "Potion Help" });

    await panel.getByPlaceholder("Search help articles…").fill("kanban");
    await expect(panel.locator("mark").first()).toBeVisible();
    await panel.locator("button.hn-item", { hasText: "Working in Board view" }).click();
    await expect(
      panel.getByRole("heading", { name: "Working in Board view" })
    ).toBeVisible();
    await expect(panel.getByText("Drag a card")).toBeVisible();

    await panel.getByRole("button", { name: "Yes", exact: true }).click();
    await expect(panel.getByText("Thanks for the feedback!")).toBeVisible();

    await panel.getByRole("button", { name: "Back" }).click();
    await expect(panel.locator("mark").first()).toBeVisible(); // back on search results
  });

  test("category browsing drills into database help", async ({ page }) => {
    await page.keyboard.press("F1");
    const panel = page.getByRole("dialog", { name: "Potion Help" });

    await panel
      .locator("button.hn-item", { hasText: "Tables and boards, column types" })
      .click();
    await expect(
      panel.getByText("Tables and boards, column types, filtering, and sorting.")
    ).toBeVisible();
    await panel.locator("button.hn-item", { hasText: "Filtering and sorting views" }).click();
    await expect(panel.getByText("saved per view", { exact: false })).toBeVisible();

    await panel.getByRole("button", { name: "Back" }).click();
    await panel.getByRole("button", { name: "Back" }).click();
    await expect(panel.getByText("Browse by topic")).toBeVisible();
  });
});
