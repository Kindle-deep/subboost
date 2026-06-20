import openNextWorker from "../.open-next/worker.js";

function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function runScheduledSubscriptionUpdate(env, ctx) {
  const baseUrl = readString(env.APP_URL) || "https://subboost.local";
  const cronSecret = readString(env.CRON_SECRET);
  const headers = new Headers({
    "x-subboost-cron-source": "cloudflare",
  });

  if (cronSecret) {
    headers.set("authorization", `Bearer ${cronSecret}`);
  }

  const response = await openNextWorker.fetch(
    new Request(new URL("/api/cron/update-subscriptions", baseUrl), {
      method: "POST",
      headers,
    }),
    env,
    ctx
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`SubBoost scheduled refresh failed: HTTP ${response.status}${body ? ` ${body}` : ""}`);
  }
}

const worker = {
  fetch(request, env, ctx) {
    return openNextWorker.fetch(request, env, ctx);
  },
  scheduled(_event, env, ctx) {
    ctx.waitUntil(runScheduledSubscriptionUpdate(env, ctx));
  },
};

export default worker;
