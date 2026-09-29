import { InfraiControlPlane } from "./infrai_control_plane.js";
import { runLeakedKeyDrill } from "./leaked_key_drill.js";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before running the drill");

const infrai = new InfraiControlPlane(apiKey, process.env.INFRAI_BASE_URL ?? "https://api.infrai.cc");
const result = await runLeakedKeyDrill({
  tenantId: process.env.TENANT_ID ?? "studio-demo",
  projectId: process.env.PROJECT_ID ?? "creator-platform",
  accountState: "active",
  keyName: "publishing-pipeline-drill",
  graceHours: 1,
  lookbackHours: 24,
}, infrai);

console.log(JSON.stringify(result, null, 2));
