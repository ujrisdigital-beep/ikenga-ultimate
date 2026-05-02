export interface Database {
  public: {
    Tables: {
      engines: {
        Row: {
          id: string;
          name: string;
          path: string;
          description: string;
          category: string;
          status: string;
          api_key_env_var: string;
          api_key_placeholder: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          path: string;
          description: string;
          category: string;
          status?: string;
          api_key_env_var: string;
          api_key_placeholder: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["engines"]["Insert"]>;
        Relationships: [];
      };
      engine_versions: {
        Row: {
          id: string;
          engine_id: string;
          version: string;
          changelog: string;
          deployed_at: string;
          deployed_by: string;
          parent_version: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          engine_id: string;
          version: string;
          changelog: string;
          deployed_at?: string;
          deployed_by: string;
          parent_version?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["engine_versions"]["Insert"]>;
        Relationships: [];
      };
      engine_deployments: {
        Row: {
          id: string;
          engine_id: string;
          version: string;
          environment: string;
          status: string;
          requested_by: string;
          requested_at: string;
          approval_request_id: string | null;
          approved_by: string | null;
          approved_at: string | null;
          deployed_at: string | null;
          deployed_by: string | null;
          rollback_target_id: string | null;
          vercel_deployment_id: string | null;
          deployment_url: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          engine_id: string;
          version: string;
          environment: string;
          status?: string;
          requested_by: string;
          requested_at?: string;
          approval_request_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          deployed_at?: string | null;
          deployed_by?: string | null;
          rollback_target_id?: string | null;
          vercel_deployment_id?: string | null;
          deployment_url?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["engine_deployments"]["Insert"]>;
        Relationships: [];
      };
      engine_audit_logs: {
        Row: {
          audit_id: string;
          action: string;
          category: string;
          scope: string;
          scope_id: string | null;
          actor: string;
          actor_role: string;
          actor_tier: string;
          engine_id: string | null;
          target_id: string | null;
          ai_model: string | null;
          agent_id: string | null;
          outcome: string;
          payload: unknown;
          payload_hash: string | null;
          output_hash: string | null;
          previous_entry_hash: string | null;
          entry_hash: string;
          ip_address: string | null;
          session_id: string | null;
          timestamp: string;
        };
        Insert: {
          audit_id: string;
          action: string;
          category: string;
          scope: string;
          scope_id?: string | null;
          actor: string;
          actor_role: string;
          actor_tier: string;
          engine_id?: string | null;
          target_id?: string | null;
          ai_model?: string | null;
          agent_id?: string | null;
          outcome: string;
          payload?: unknown;
          payload_hash?: string | null;
          output_hash?: string | null;
          previous_entry_hash?: string | null;
          entry_hash: string;
          ip_address?: string | null;
          session_id?: string | null;
          timestamp?: string;
        };
        Update: Partial<Database["public"]["Tables"]["engine_audit_logs"]["Insert"]>;
        Relationships: [];
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          source: string;
          status: string;
          metadata: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          status?: string;
          metadata?: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["waitlist_signups"]["Insert"]>;
        Relationships: [];
      };
      user_profiles: {
        Row: {
          email: string;
          display_name: string | null;
          tier: string;
          pro_type: string | null;
          pro_expires: string | null;
          gens_used: number;
          created_at: string;
          streak_days: number;
          last_active: string | null;
          bonus_gens: number;
          active_product: string;
        };
        Insert: {
          email: string;
          display_name?: string | null;
          tier?: string;
          pro_type?: string | null;
          pro_expires?: string | null;
          gens_used?: number;
          created_at?: string;
          streak_days?: number;
          last_active?: string | null;
          bonus_gens?: number;
          active_product?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
        Relationships: [];
      };
      payment_requests: {
        Row: {
          id: string;
          email: string;
          unique_ref: string;
          tier_type: string;
          amount_gbp: number;
          status: string;
          admin_notes: string | null;
          created_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          unique_ref: string;
          tier_type: string;
          amount_gbp: number;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payment_requests"]["Insert"]>;
        Relationships: [];
      };
      generation_logs: {
        Row: { id: string; email: string; label: string; created_at: string; product: string; };
        Insert: { id?: string; email: string; label: string; created_at?: string; product?: string; };
        Update: Partial<Database["public"]["Tables"]["generation_logs"]["Insert"]>;
        Relationships: [];
      };
      onboarding_progress: {
        Row: { email: string; current_step: number; completed_days: unknown; referral_code: string | null; referred_by: string | null; created_at: string; };
        Insert: { email: string; current_step?: number; completed_days?: unknown; referral_code?: string | null; referred_by?: string | null; created_at?: string; };
        Update: Partial<Database["public"]["Tables"]["onboarding_progress"]["Insert"]>;
        Relationships: [];
      };
      content_items: {
        Row: { id: string; email: string; product: string; content_type: string; title: string; body: string; platform: string | null; day: number | null; metadata: unknown; quality: string; published: boolean; copied: boolean; created_at: string; };
        Insert: { id?: string; email: string; product: string; content_type: string; title: string; body: string; platform?: string | null; day?: number | null; metadata?: unknown; quality?: string; published?: boolean; copied?: boolean; created_at?: string; };
        Update: Partial<Database["public"]["Tables"]["content_items"]["Insert"]>;
        Relationships: [];
      };
      content_feedback: {
        Row: { id: string; email: string; item_id: string; product: string; signal: string; created_at: string; };
        Insert: { id?: string; email: string; item_id: string; product: string; signal: string; created_at?: string; };
        Update: Partial<Database["public"]["Tables"]["content_feedback"]["Insert"]>;
        Relationships: [];
      };
      user_events: {
        Row: { id: string; email: string | null; event: string; product: string | null; metadata: unknown; created_at: string; };
        Insert: { id?: string; email?: string | null; event: string; product?: string | null; metadata?: unknown; created_at?: string; };
        Update: Partial<Database["public"]["Tables"]["user_events"]["Insert"]>;
        Relationships: [];
      };
      referral_codes: {
        Row: { code: string; owner: string; uses: number; created_at: string; };
        Insert: { code: string; owner: string; uses?: number; created_at?: string; };
        Update: Partial<Database["public"]["Tables"]["referral_codes"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
}
