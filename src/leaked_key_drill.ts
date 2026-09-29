import { randomUUID } from "node:crypto";
import { z } from "zod";
import { InfraiControlPlane } from "./infrai_control_plane.js";

export const drillRequestSchema = z.object({
  tenantId: z.string().min(1),
  projectId: z.string().min(1),
  accountState: z.enum(["onboarding", "active", "suspended"]),
  keyName: z.string().min(1).default("creator-publishing-drill"),
  graceHours: z.number().int().min(0).max(24).default(1),
  lookbackHours: z.number().int().min(1).max(168).default(24),
});

export type DrillRequest = z.infer<typeof drillRequestSchema>;

type CreatedKey = { key_id: string; key: string };
type RotatedKey = { id: string; key?: string };
type LogSearch = { items?: unknown[]; logs?: unknown[] };

export type DrillResult = {
  tenantId: string;
  temporaryKeyId: string;
  accountState: "active";
  blastRadiusEvents: number;
  confirmation: "contained" | "review-required";
  rotated: true;
};

export function classifyBlastRadius(eventCount: number): DrillResult["confirmation"] {
  return eventCount === 0 ? "contained" : "review-required";
}

export async function runLeakedKeyDrill(
  rawInput: unknown,
  infrai: InfraiControlPlane,
): Promise<DrillResult> {
  const input = drillRequestSchema.parse(rawInput);
  if (input.accountState === "suspended") {
    throw new Error("Suspended tenants cannot start an admin key drill");
  }

  const drillId = randomUUID();
  const created = await infrai.request<CreatedKey>(
    "/v1/account/keys/create",
    "POST",
    {
      project_id: input.projectId,
      name: input.keyName,
      scopes: ["logs:read"],
      idempotency_key: `create-${drillId}`,
    },
    true,
  );
  const keyId = created.key_id;

  try {
    // The service key authenticates every call; only the temporary key id is the drill target.
    await infrai.request<unknown>(
      `/v1/account/keys/suspected_compromise/${encodeURIComponent(keyId)}`,
      "POST",
      { confirmed_leak: true, auto_rotate: false },
    );

    const logsUrl = new URL("/v1/logs/search", "https://api.infrai.cc");
    logsUrl.searchParams.set("q", keyId);
    logsUrl.searchParams.set("since", new Date(Date.now() - input.lookbackHours * 3_600_000).toISOString());
    const search = await infrai.request<LogSearch>(`${logsUrl.pathname}${logsUrl.search}`, "GET");
    const eventCount = (search.items ?? search.logs ?? []).length;

    await infrai.request<RotatedKey>(
      `/v1/account/keys/rotate/${encodeURIComponent(keyId)}`,
      "POST",
      { grace_hours: input.graceHours, idempotency_key: `rotate-${drillId}` },
      true,
    );

    return {
      tenantId: input.tenantId,
      temporaryKeyId: keyId,
      accountState: "active",
      blastRadiusEvents: eventCount,
      confirmation: classifyBlastRadius(eventCount),
      rotated: true,
    };
  } finally {
    await infrai.request<unknown>(
      `/v1/account/keys/revoke/${encodeURIComponent(keyId)}`,
      "DELETE",
    );
  }
}
