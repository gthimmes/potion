import { test, expect, Page } from "@playwright/test";

const sidebar = (page: Page) => page.locator(".bg-sidebar");
const firstBlock = (page: Page) => page.locator("main [data-block-id]").first();
// Database name-cell text inputs (they use the "Empty" placeholder).
const nameCells = (page: Page) => page.locator('main input[placeholder="Empty"]');

async function waitForApp(page: Page) {
  await page.goto("/");
  await expect(page.locator("main")).toContainText("Welcome to Potion", {
    timeout: 15_000,
  });
}

async function newPage(page: Page) {
  await sidebar(page).getByText("New page").click();
}

test.describe("workspace", () => {
  test("loads the seeded workspace", async ({ page }) => {
    await waitForApp(page);
    await expect(sidebar(page).getByText("Getting Started")).toBeVisible();
    await expect(sidebar(page).getByText("Tasks")).toBeVisible();
    await expect(page.locator("main")).toContainText("The basics");
  });

  test("quick find opens a page with the keyboard", async ({ page }) => {
    await waitForApp(page);
    await page.keyboard.press("Control+k");
    const search = page.getByPlaceholder("Search pages...");
    await expect(search).toBeVisible();
    await search.fill("Tasks");
    await search.press("Enter");
    // landed on the Tasks database
    await expect(nameCells(page).first()).toHaveValue("Task A");
  });
});

test.describe("block editor", () => {
  test("markdown shortcut turns a block into a heading and it persists", async ({
    page,
  }) => {
    await waitForApp(page);
    await newPage(page);
    const block = firstBlock(page);
    await block.click();
    await page.keyboard.type("# Big Heading");
    await expect(block).toHaveClass(/text-3xl/);
    await expect(block).toContainText("Big Heading");

    await page.reload();
    await expect(page.locator("main")).toContainText("Big Heading");
  });

  test("slash menu inserts a callout block", async ({ page }) => {
    await waitForApp(page);
    await newPage(page);
    await firstBlock(page).click();
    await page.keyboard.type("/");
    await expect(page.getByText("Basic blocks")).toBeVisible();
    await page.keyboard.type("call");
    await page.keyboard.press("Enter");
    await page.keyboard.type("A helpful note");
    await expect(page.locator("main")).toContainText("💡");
    await expect(page.locator("main")).toContainText("A helpful note");
  });

  test("toggles a to-do checkbox", async ({ page }) => {
    await waitForApp(page);
    const checkbox = page.getByRole("checkbox").first();
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test("creates a sub-page and navigates into it", async ({ page }) => {
    await waitForApp(page);
    await newPage(page);
    // give the parent a recognisable title
    await page.locator("main textarea").first().fill("Parent Page");
    await firstBlock(page).click();
    await page.keyboard.type("/page");
    await page.keyboard.press("Enter");
    // an inline sub-page link appears in the doc
    const subpage = page.locator("main").getByRole("button", { name: /Untitled/ });
    await expect(subpage).toBeVisible();
    await subpage.click();
    // breadcrumb now shows the parent as an ancestor crumb
    await expect(
      page.locator("main").getByRole("button", { name: /Parent Page/ })
    ).toBeVisible();
  });
});

test.describe("databases", () => {
  test("filters a table down to matching rows", async ({ page }) => {
    await waitForApp(page);
    await sidebar(page).getByText("Tasks").click();
    await expect(nameCells(page)).toHaveCount(3);

    await page.getByRole("button", { name: /Filter/ }).click();
    await page.getByRole("button", { name: /Add filter/ }).click();
    // column -> Status, value -> Done
    await page.getByRole("combobox").nth(0).selectOption({ label: "Status" });
    await page.getByRole("combobox").last().selectOption("Done");

    await expect(nameCells(page)).toHaveCount(1);
    await expect(nameCells(page).first()).toHaveValue("Task C");
  });

  test("switches to the board view", async ({ page }) => {
    await waitForApp(page);
    await sidebar(page).getByText("Tasks").click();
    await page.getByRole("button", { name: /Board/ }).click();
    await expect(page.locator("main")).toContainText("In progress");
    await expect(page.locator("main")).toContainText("Not started");
  });

  test("adds a row to a table", async ({ page }) => {
    await waitForApp(page);
    await sidebar(page).getByText("Tasks").click();
    await expect(nameCells(page)).toHaveCount(3);
    await page.locator("main").getByText("＋ New", { exact: true }).first().click();
    await expect(nameCells(page)).toHaveCount(4);
  });
});
