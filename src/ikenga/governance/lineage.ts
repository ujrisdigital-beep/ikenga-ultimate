// ============================================================
// IKENGA GOVERNANCE - PROMPT LINEAGE
// Tracks the ancestry chain of every prompt version.
// Provides a full derivation graph for IP protection.
// ============================================================

import type { EngineId } from "../engine_types";
import { getPromptHistory, type PromptRecord } from "./prompts";

// ------------------------------------------------------------------
// Lineage node - one node in the derivation tree.
// ------------------------------------------------------------------

export interface LineageNode {
  promptId: string;
  version: string;
  createdBy: string;
  createdAt: string;
  changeNote: string;
  children: LineageNode[];
}

// ------------------------------------------------------------------
// Build a lineage tree for a given engine.
// ------------------------------------------------------------------

export function buildLineageTree(engineId: EngineId): LineageNode[] {
  const history = getPromptHistory(engineId);
  const nodeMap = new Map<string, LineageNode>();

  // Create nodes.
  for (const prompt of history) {
    nodeMap.set(prompt.promptId, {
      promptId: prompt.promptId,
      version: prompt.version,
      createdBy: prompt.createdBy,
      createdAt: prompt.createdAt,
      changeNote: prompt.changeNote,
      children: [],
    });
  }

  const roots: LineageNode[] = [];

  // Wire parent -> child relationships.
  for (const prompt of history) {
    const node = nodeMap.get(prompt.promptId);

    if (!node) {
      continue;
    }

    if (prompt.parentPromptId && nodeMap.has(prompt.parentPromptId)) {
      nodeMap.get(prompt.parentPromptId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ------------------------------------------------------------------
// Get a flat ancestry chain for a specific prompt (oldest -> newest).
// ------------------------------------------------------------------

export function getAncestryChain(
  promptId: string,
  engineId: EngineId
): PromptRecord[] {
  const history = getPromptHistory(engineId);
  const byId = new Map<string, PromptRecord>(
    history.map((prompt) => [prompt.promptId, prompt])
  );

  const chain: PromptRecord[] = [];
  let current = byId.get(promptId);

  while (current) {
    chain.unshift(current);
    current = current.parentPromptId
      ? byId.get(current.parentPromptId)
      : undefined;
  }

  return chain;
}
