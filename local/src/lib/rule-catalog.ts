import "server-only";

import { createRuleCatalogService } from "@subboost/server-core/rules";
import { getRuntimeEnv } from "./runtime-env";

export const localRuleCatalogService = createRuleCatalogService({
  getGitHubToken: () => getRuntimeEnv("GITHUB_TOKEN"),
  logger: console,
});

export const searchRules = localRuleCatalogService.searchRules;
export const refreshRuleIndex = localRuleCatalogService.refreshRuleIndex;
export const getCnRuleCandidateDiscovery = localRuleCatalogService.getCnRuleCandidateDiscovery;
