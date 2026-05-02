// ============================================================
// IKENGA GOVERNANCE - DEPLOYMENT LOGS
// Append-only deployment event tracking for Phase 4.
// Every major state transition writes a log entry so deployment
// history remains easy to inspect before database persistence
// is connected in a later phase.
// ============================================================

import { randomUUID } from "node:crypto";

import type { EngineId } from "../engine_types";
import type { DeploymentStatus } from "./deployments";

// ------------------------------------------------------------------
// Immutable log entry contract.
// ------------------------------------------------------------------

export interface DeploymentLogEntry {
  logId: string;
  deploymentId: string;
  engineId: EngineId;
  event: DeploymentStatus;
  actor: string;
  timestamp: string;
  detail?: string;
}

const logStore: DeploymentLogEntry[] = [];

/**
 * Append a deployment log entry.
 */
export function logDeploymentEvent(
  data: Omit<DeploymentLogEntry, "logId" | "timestamp">
): DeploymentLogEntry {
  const entry: DeploymentLogEntry = {
    ...data,
    logId: randomUUID(),
    timestamp: new Date().toISOString(),
  };

  logStore.push(entry);
  return entry;
}

/**
 * Read all logs for a deployment in chronological order.
 */
export function getLogsForDeployment(deploymentId: string): DeploymentLogEntry[] {
  return logStore
    .filter((entry) => entry.deploymentId === deploymentId)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

/**
 * Read all deployment logs for one engine, newest first.
 */
export function getLogsForEngine(engineId: EngineId): DeploymentLogEntry[] {
  return logStore
    .filter((entry) => entry.engineId === engineId)
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}
