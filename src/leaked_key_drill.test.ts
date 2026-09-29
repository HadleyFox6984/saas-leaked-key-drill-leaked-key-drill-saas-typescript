import assert from "node:assert/strict";
import test from "node:test";
import { classifyBlastRadius, drillRequestSchema } from "./leaked_key_drill.js";

test("a tenant with matching log events is routed to admin review", () => {
  const request = drillRequestSchema.parse({
    tenantId: "newsroom-7",
    projectId: "daily-edition",
    accountState: "active",
    graceHours: 2,
    lookbackHours: 48,
  });

  assert.equal(request.keyName, "creator-publishing-drill");
  assert.equal(classifyBlastRadius(3), "review-required");
  assert.equal(classifyBlastRadius(0), "contained");
});
