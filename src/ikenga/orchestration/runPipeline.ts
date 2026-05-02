// ============================================================
// IKENGA ORCHESTRATION - RUN PIPELINE
// Phase 2 sequential orchestration runtime with:
// - Claude + GPT support
// - logging hooks
// - placeholder execution logic
// - graceful error handling
// ============================================================

import { randomUUID } from "node:crypto";

import { canAIAccess } from "../engine_permissions";
import { getAgentById } from "./agents";
import {
  DEFAULT_PIPELINE,
  consolePipelineLogger,
  type PipelineDefinition,
  type PipelineInput,
  type PipelineLogEvent,
  type PipelineLogger,
  type PipelineResult,
  type PipelineStepDefinition,
  type StageOutput,
} from "./pipeline";

// ------------------------------------------------------------------
// Create a stable run id for each execution.
// ------------------------------------------------------------------

function generateRunId(): string {
  return randomUUID();
}

// ------------------------------------------------------------------
// Emit a log event without letting logging failures break the run.
// ------------------------------------------------------------------

async function emitLog(
  logger: PipelineLogger,
  event: Omit<PipelineLogEvent, "timestamp">
): Promise<void> {
  try {
    await logger({
      ...event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Pipeline logger failed: ${message}`);
  }
}

// ------------------------------------------------------------------
// Verify that all declared dependencies have completed successfully.
// ------------------------------------------------------------------

function dependenciesSatisfied(
  step: PipelineStepDefinition,
  stages: StageOutput[]
): boolean {
  const dependencies = step.dependsOn ?? [];

  return dependencies.every((dependencyId) =>
    stages.some(
      (stage) => stage.stepId === dependencyId && stage.status === "completed"
    )
  );
}

// ------------------------------------------------------------------
// Build a readable prompt for placeholder agent execution by combining
// the original input with prior successful step outputs.
// ------------------------------------------------------------------

function buildStepPrompt(
  step: PipelineStepDefinition,
  input: PipelineInput,
  stages: StageOutput[]
): string {
  const priorContext = stages
    .filter((stage) => stage.status === "completed" && stage.output)
    .map((stage) => `${stage.role.toUpperCase()}:\n${stage.output}`)
    .join("\n\n---\n\n");

  const contextBlock = priorContext ? `\n\nPrevious outputs:\n${priorContext}` : "";
  const metadataBlock = input.context
    ? `\n\nRuntime context:\n${JSON.stringify(input.context, null, 2)}`
    : "";

  return `Step: ${step.name}\nDescription: ${step.description}\n\nUser prompt:\n${input.prompt}${contextBlock}${metadataBlock}`;
}

// ------------------------------------------------------------------
// Placeholder model execution for Phase 2.
// This intentionally avoids real SDK calls while still exercising the
// orchestration shape, status handling, and logging behavior.
// ------------------------------------------------------------------

async function executeAgentStep(
  step: PipelineStepDefinition,
  input: PipelineInput,
  stages: StageOutput[]
): Promise<StageOutput> {
  const startedAt = Date.now();
  const completedAt = new Date().toISOString();

  if (!step.agentId) {
    return {
      stepId: step.id,
      role: "agent",
      model: "merge",
      output: "",
      tokensUsed: 0,
      durationMs: Date.now() - startedAt,
      completedAt,
      status: "failed",
      error: "Agent step is missing an agentId.",
    };
  }

  const agent = getAgentById(step.agentId);

  if (!canAIAccess(input.engineId, agent.model)) {
    return {
      stepId: step.id,
      role: agent.role,
      model: agent.model,
      output: "",
      tokensUsed: 0,
      durationMs: Date.now() - startedAt,
      completedAt,
      status: step.optional ? "skipped" : "failed",
      error: `Model '${agent.model}' is not permitted to access engine '${input.engineId}'.`,
    };
  }

  try {
    const prompt = buildStepPrompt(step, input, stages);

    const output =
      `[Placeholder ${agent.label} response]\n` +
      `Engine: ${input.engineId}\n` +
      `Step: ${step.id}\n` +
      `Prompt summary: ${input.prompt.slice(0, 180)}\n` +
      `Resolved prompt length: ${prompt.length}\n` +
      `API key source: ${agent.apiKeyEnvVar} (${agent.apiKeyPlaceholder})`;

    return {
      stepId: step.id,
      role: agent.role,
      model: agent.model,
      output,
      tokensUsed: Math.min(prompt.length, agent.maxTokens),
      durationMs: Date.now() - startedAt,
      completedAt,
      status: "completed",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      stepId: step.id,
      role: agent.role,
      model: agent.model,
      output: "",
      tokensUsed: 0,
      durationMs: Date.now() - startedAt,
      completedAt,
      status: step.optional ? "skipped" : "failed",
      error: message,
    };
  }
}

// ------------------------------------------------------------------
// Placeholder merge step that combines successful outputs into the final
// synthesis payload returned to the caller.
// ------------------------------------------------------------------

async function executeMergeStep(
  step: PipelineStepDefinition,
  stages: StageOutput[]
): Promise<StageOutput> {
  const startedAt = Date.now();
  const completedAt = new Date().toISOString();

  try {
    const successfulStages = stages.filter((stage) => stage.status === "completed");

    const output = successfulStages.length
      ? successfulStages
          .map(
            (stage) =>
              `## ${stage.stepId}\nModel: ${stage.model}\n${stage.output}`
          )
          .join("\n\n")
      : "No successful stage outputs were available to merge.";

    return {
      stepId: step.id,
      role: "merge",
      model: "merge",
      output,
      tokensUsed: 0,
      durationMs: Date.now() - startedAt,
      completedAt,
      status: "completed",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      stepId: step.id,
      role: "merge",
      model: "merge",
      output: "",
      tokensUsed: 0,
      durationMs: Date.now() - startedAt,
      completedAt,
      status: step.optional ? "skipped" : "failed",
      error: message,
    };
  }
}

// ------------------------------------------------------------------
// Execute one step with dependency and status handling.
// ------------------------------------------------------------------

async function executeStep(
  pipeline: PipelineDefinition,
  step: PipelineStepDefinition,
  input: PipelineInput,
  stages: StageOutput[],
  logger: PipelineLogger,
  runId: string
): Promise<StageOutput> {
  if (!dependenciesSatisfied(step, stages)) {
    const skippedStage: StageOutput = {
      stepId: step.id,
      role: step.kind,
      model: step.kind === "merge" ? "merge" : "claude",
      output: "",
      tokensUsed: 0,
      durationMs: 0,
      completedAt: new Date().toISOString(),
      status: step.optional ? "skipped" : "failed",
      error: `Dependencies for step '${step.id}' were not satisfied.`,
    };

    await emitLog(logger, {
      level: skippedStage.status === "failed" ? "error" : "warn",
      message: "Pipeline step could not run because a dependency was missing.",
      runId,
      pipelineId: pipeline.id,
      stepId: step.id,
      engineId: input.engineId,
      details: { dependsOn: step.dependsOn ?? [] },
    });

    return skippedStage;
  }

  await emitLog(logger, {
    level: "info",
    message: "Pipeline step started.",
    runId,
    pipelineId: pipeline.id,
    stepId: step.id,
    engineId: input.engineId,
    details: { kind: step.kind },
  });

  const result =
    step.kind === "merge"
      ? await executeMergeStep(step, stages)
      : await executeAgentStep(step, input, stages);

  await emitLog(logger, {
    level: result.status === "completed" ? "info" : "error",
    message:
      result.status === "completed"
        ? "Pipeline step completed."
        : "Pipeline step failed.",
    runId,
    pipelineId: pipeline.id,
    stepId: step.id,
    engineId: input.engineId,
    details: {
      status: result.status,
      durationMs: result.durationMs,
      error: result.error,
    },
  });

  return result;
}

// ------------------------------------------------------------------
// Public pipeline runner.
// Uses the Phase 2 default definition unless a caller provides another.
// ------------------------------------------------------------------

export async function runPipeline(
  input: PipelineInput,
  pipeline: PipelineDefinition = DEFAULT_PIPELINE
): Promise<PipelineResult> {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const runId = input.runId ?? generateRunId();
  const logger = input.logger ?? consolePipelineLogger;
  const stages: StageOutput[] = [];

  await emitLog(logger, {
    level: "info",
    message: "Pipeline run started.",
    runId,
    pipelineId: pipeline.id,
    engineId: input.engineId,
    details: {
      initiatedBy: input.initiatedBy,
      stepCount: pipeline.steps.length,
    },
  });

  for (const step of pipeline.steps) {
    const result = await executeStep(pipeline, step, input, stages, logger, runId);
    stages.push(result);

    if (result.status === "failed" && !step.optional) {
      const completedAt = new Date().toISOString();

      await emitLog(logger, {
        level: "error",
        message: "Pipeline run failed.",
        runId,
        pipelineId: pipeline.id,
        stepId: step.id,
        engineId: input.engineId,
        details: { error: result.error },
      });

      return {
        runId,
        pipelineId: pipeline.id,
        engineId: input.engineId,
        initiatedBy: input.initiatedBy,
        stages,
        synthesis: "",
        version: pipeline.version,
        startedAt,
        completedAt,
        durationMs: Date.now() - startedMs,
        success: false,
        error: result.error ?? `Pipeline stopped at step '${step.id}'.`,
      };
    }
  }

  const synthesis =
    stages.find((stage) => stage.stepId === "merge-output")?.output ??
    stages
      .filter((stage) => stage.status === "completed" && stage.output)
      .map((stage) => stage.output)
      .join("\n\n");

  const completedAt = new Date().toISOString();

  await emitLog(logger, {
    level: "info",
    message: "Pipeline run completed.",
    runId,
    pipelineId: pipeline.id,
    engineId: input.engineId,
    details: {
      success: true,
      durationMs: Date.now() - startedMs,
    },
  });

  return {
    runId,
    pipelineId: pipeline.id,
    engineId: input.engineId,
    initiatedBy: input.initiatedBy,
    stages,
    synthesis,
    version: pipeline.version,
    startedAt,
    completedAt,
    durationMs: Date.now() - startedMs,
    success: true,
  };
}
