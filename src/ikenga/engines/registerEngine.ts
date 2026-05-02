/**
 * Supabase registration helpers for Phase 1 engines.
 *
 * These helpers translate the in-memory registry into rows for the `engines`
 * table and expose small utilities for seeding the full registry or upserting
 * a single engine.
 */

import { supabase } from "../lib/supabase";
import { ENGINE_REGISTRY } from "./engineRegistry";
import type { EngineDefinition, EngineRow, RegisterEngineInput } from "./engineTypes";

/**
 * Convert the app-facing engine definition into the DB row shape.
 */
export function toEngineRow(engine: EngineDefinition): EngineRow {
  return {
    id: engine.id,
    name: engine.name,
    path: engine.path,
    description: engine.description,
    category: engine.category,
    status: engine.status,
    api_key_env_var: engine.api.envVar,
    api_key_placeholder: engine.api.placeholder,
    created_at: engine.createdAt,
    updated_at: engine.updatedAt,
  };
}

/**
 * Upsert one engine into Supabase.
 *
 * `onConflict: "id"` keeps the registry idempotent, so re-running the seed
 * updates existing rows instead of creating duplicates.
 */
export async function registerEngine(
  engine: RegisterEngineInput,
  client = supabase
): Promise<EngineRow> {
  const row = toEngineRow(engine);

  const { data, error } = await client
    .from("engines")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to register engine ${engine.id}: ${error.message}`);
  }

  return (data ?? row) as EngineRow;
}

/**
 * Seed all 8 Phase 1 engines into the `engines` table.
 */
export async function registerAllEngines(
  client = supabase
): Promise<EngineRow[]> {
  const rows = ENGINE_REGISTRY.map(toEngineRow);

  const { data, error } = await client
    .from("engines")
    .upsert(rows, { onConflict: "id" })
    .select();

  if (error) {
    throw new Error(`Failed to register Phase 1 engines: ${error.message}`);
  }

  return ((data as EngineRow[] | null) ?? rows) as EngineRow[];
}
