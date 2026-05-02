// ============================================================
// IKENGA - FINAL SYNTHESIS ENTRYPOINT
// Phase 8 unified export surface for the sovereign platform.
// This file gathers the major modules built across all phases so
// routes, jobs, and future admin tooling can import from one place.
// ============================================================

// ------------------------------------------------------------------
// Engine registry and persistence.
// ------------------------------------------------------------------

export {
  ENGINE_REGISTRY as FINAL_ENGINE_REGISTRY,
  ENGINE_REGISTRY_BY_ID,
  getEngineById,
  getEngineByPath,
  listEngines,
} from "./engines/engineRegistry";
export {
  registerAllEngines,
  registerEngine,
  toEngineRow,
} from "./engines/registerEngine";
export type {
  EngineApiConfig,
  EngineCategory,
  EngineDefinition,
  EngineId as RegistryEngineId,
  EngineRow,
  EngineStatus as RegistryEngineStatus,
} from "./engines/engineTypes";

// ------------------------------------------------------------------
// Orchestration brainstem.
// ------------------------------------------------------------------

export { AGENTS, getAgentById, getPipelineAgents } from "./orchestration/agents";
export {
  DEFAULT_PIPELINE,
  consolePipelineLogger,
} from "./orchestration/pipeline";
export { runPipeline } from "./orchestration/runPipeline";
export type {
  PipelineDefinition,
  PipelineInput,
  PipelineResult,
  PipelineRunRecord,
  PipelineStepDefinition,
  StageOutput,
} from "./orchestration/pipeline";

// ------------------------------------------------------------------
// Governance layer.
// ------------------------------------------------------------------

export {
  approvePrompt,
  createPrompt,
  getActivePrompt,
  getPromptHistory,
  rejectPrompt,
  rollbackPrompt,
  submitPromptForApproval,
} from "./governance/prompts";
export {
  approveDeploymentRequest,
  createDeploymentRequest,
  getDeploymentsForEngine,
  getLatestDeployment,
  rejectDeploymentRequest,
  rollbackDeployment,
  submitDeploymentForApproval,
  triggerDeploy,
} from "./governance/deployments";
export { getLogsForDeployment, getLogsForEngine, logDeploymentEvent } from "./governance/deployment_logs";
export {
  denyApproval,
  getApprovalsForTarget,
  getPendingApprovals,
  grantApproval,
  isApproved,
  requestApproval,
  withdrawApproval,
} from "./governance/approvals";

// ------------------------------------------------------------------
// Audit trail layer.
// ------------------------------------------------------------------

export {
  appendAuditEntry,
  getAllAuditEntries,
  getAuditEntriesByAction,
  getAuditEntriesByCategory,
  getAuditEntriesByScope,
  getAuditEntriesForActor,
  getAuditEntriesForEngine,
  getAuditEntriesForRole,
  getLatestAuditEntry,
} from "./audit/audit_store";
export {
  auditDeploymentEvent,
  auditPipelineRun,
  logAction,
} from "./audit/logAction";
export type {
  AuditAction,
  AuditActionCategory,
  AuditEntry,
  AuditOutcome,
  AuditScope,
} from "./audit/audit_types";

// ------------------------------------------------------------------
// Sovereignty and access-control layer.
// ------------------------------------------------------------------

export {
  canActorApprove,
  canActorDeploy,
  canActorManagePrompts,
  canActorWriteAudit,
  checkAIAccess,
  checkActorAccess,
} from "./access/permissions";
export { getRole, getRolesForTier, roleHasCapability, ROLES } from "./access/roles";
export { getPoliciesForEngine, hasPolicyGrant, POLICIES } from "./access/policies";
export type { Actor, PermissionContext, PermissionResult } from "./access/permissions";
export type { AccessOperation, PolicyCondition, PolicyRule } from "./access/policies";
export type { Role, RoleCapabilities, RoleId } from "./access/roles";

// ------------------------------------------------------------------
// Content intelligence layer.
// ------------------------------------------------------------------

export { generateContent } from "./content/generator";
export { createContentPlan } from "./content/planner";
export { evaluateContent } from "./content/evaluator";
export {
  listContentFeedback,
  recordContentFeedback,
  summarizeContentFeedback,
} from "./content/feedback";
export type {
  ContentGenerationRequest,
  ContentLogEvent,
  ContentLogger,
  ContentModel,
  ContentType,
  GeneratedContent,
} from "./content/generator";
export type { ContentPlan, ContentPlanItem, ContentPlanningRequest } from "./content/planner";
export type {
  ContentEvaluation,
  ContentEvaluationRequest,
  ContentMetricScore,
} from "./content/evaluator";
export type {
  ContentFeedbackEntry,
  ContentFeedbackRequest,
  ContentFeedbackSummary,
} from "./content/feedback";

// ------------------------------------------------------------------
// API-facing helpers.
// ------------------------------------------------------------------

export { deployEngine } from "./api/deployEngine";
export { persistEngineAudit } from "./api/persistEngineAudit";
export { supabase } from "./lib/supabase";

// ------------------------------------------------------------------
// UJU Cycle™ — proprietary response refinement layer.
// Only the public entry points are exported. Internal logic stays hidden.
// ------------------------------------------------------------------

export { refineResponse, formatRefinedOutput, proprietaryResponse } from "./uju/refiner";
export type { UJUDomain, UJURefinedOutput, UJURefinementInput } from "./uju/types";
