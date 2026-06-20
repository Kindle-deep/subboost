import { getCloudflareContext } from "@opennextjs/cloudflare";

type HyperdriveBinding = {
  connectionString?: string;
};

type RuntimeBindingValue = string | HyperdriveBinding | undefined;
type RuntimeBindings = Record<string, RuntimeBindingValue>;

function readNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getCloudflareRuntimeBindings(): RuntimeBindings | undefined {
  try {
    return getCloudflareContext({ async: false }).env as RuntimeBindings;
  } catch {
    return undefined;
  }
}

export function getRuntimeEnv(name: string): string | undefined {
  return readNonEmptyString(process.env[name]) ?? readNonEmptyString(getCloudflareRuntimeBindings()?.[name]);
}

export function getRuntimeDatabaseUrl(): string | undefined {
  const bindings = getCloudflareRuntimeBindings();
  const hyperdrive = bindings?.HYPERDRIVE;
  if (hyperdrive && typeof hyperdrive === "object") {
    const connectionString = readNonEmptyString(hyperdrive.connectionString);
    if (connectionString) return connectionString;
  }
  return getRuntimeEnv("DATABASE_URL");
}

export function getRuntimeEnvRecord(names: string[]): Record<string, string | undefined> {
  return Object.fromEntries(names.map((name) => [name, getRuntimeEnv(name)]));
}
