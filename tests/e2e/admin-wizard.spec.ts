import { test } from "@playwright/test";

test.describe("admin wizard v2", () => {
  test.skip("requires deployed app + credentials + seeded test data");

  test("create company to publish flow", async () => {
    // Intentionally skipped in CI by default.
  });
});
