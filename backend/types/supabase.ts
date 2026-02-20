export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          clicks: number | null
          commission_pct: number | null
          conversions: number | null
          created_at: string | null
          id: string
          slug: string
          status: string | null
          total_earned_paise: number | null
          user_id: string
          utm_source: string | null
        }
        Insert: {
          clicks?: number | null
          commission_pct?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          slug: string
          status?: string | null
          total_earned_paise?: number | null
          user_id: string
          utm_source?: string | null
        }
        Update: {
          clicks?: number | null
          commission_pct?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          slug?: string
          status?: string | null
          total_earned_paise?: number | null
          user_id?: string
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_task_tickets: {
        Row: {
          assigned_to: string
          block_type: string | null
          blueprint_json: Json
          completed_at: string | null
          created_at: string
          created_by: string
          failure_reason: string | null
          gamma_iterations: number | null
          id: string
          mutation_type: string
          niche: string | null
          npm_validation_passed: boolean | null
          output_code_path: string | null
          parent_template_id: string | null
          status: string
          updated_at: string
          zone_type: string | null
        }
        Insert: {
          assigned_to: string
          block_type?: string | null
          blueprint_json?: Json
          completed_at?: string | null
          created_at?: string
          created_by?: string
          failure_reason?: string | null
          gamma_iterations?: number | null
          id?: string
          mutation_type: string
          niche?: string | null
          npm_validation_passed?: boolean | null
          output_code_path?: string | null
          parent_template_id?: string | null
          status?: string
          updated_at?: string
          zone_type?: string | null
        }
        Update: {
          assigned_to?: string
          block_type?: string | null
          blueprint_json?: Json
          completed_at?: string | null
          created_at?: string
          created_by?: string
          failure_reason?: string | null
          gamma_iterations?: number | null
          id?: string
          mutation_type?: string
          niche?: string | null
          npm_validation_passed?: boolean | null
          output_code_path?: string | null
          parent_template_id?: string | null
          status?: string
          updated_at?: string
          zone_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_task_tickets_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "vault_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          element_id: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          project_id: string
          session_id: string | null
          timestamp: string
          updated_at: string
          user_agent: string | null
          viewport_height: number | null
          viewport_width: number | null
          x: number | null
          y: number | null
        }
        Insert: {
          created_at?: string
          element_id?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          project_id: string
          session_id?: string | null
          timestamp?: string
          updated_at?: string
          user_agent?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          x?: number | null
          y?: number | null
        }
        Update: {
          created_at?: string
          element_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          project_id?: string
          session_id?: string | null
          timestamp?: string
          updated_at?: string
          user_agent?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          phase1_at: string | null
          phase2_at: string | null
          project_id: string | null
          status: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          phase1_at?: string | null
          phase2_at?: string | null
          project_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          phase1_at?: string | null
          phase2_at?: string | null
          project_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "casino_ledger_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chip_packages: {
        Row: {
          active: boolean | null
          chips: number
          created_at: string
          id: string
          is_popular: boolean | null
          is_starter: boolean | null
          name: string
          price_display: string
          price_paise: number
          sort_order: number | null
          tier_highlight: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          chips: number
          created_at?: string
          id?: string
          is_popular?: boolean | null
          is_starter?: boolean | null
          name: string
          price_display: string
          price_paise: number
          sort_order?: number | null
          tier_highlight?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          chips?: number
          created_at?: string
          id?: string
          is_popular?: boolean | null
          is_starter?: boolean | null
          name?: string
          price_display?: string
          price_paise?: number
          sort_order?: number | null
          tier_highlight?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_type: string
          consent_version: string
          consented_at: string
          created_at: string
          id: string
          ip_address: string | null
          reconsented_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consent_version?: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          reconsented_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consent_version?: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          reconsented_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deploy_jobs: {
        Row: {
          chip_cost: number
          completed_at: string | null
          created_at: string
          deployed_at: string | null
          id: string
          ledger_entry_id: string | null
          project_id: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          vercel_deploy_id: string | null
          vercel_url: string | null
        }
        Insert: {
          chip_cost?: number
          completed_at?: string | null
          created_at?: string
          deployed_at?: string | null
          id?: string
          ledger_entry_id?: string | null
          project_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vercel_deploy_id?: string | null
          vercel_url?: string | null
        }
        Update: {
          chip_cost?: number
          completed_at?: string | null
          created_at?: string
          deployed_at?: string | null
          id?: string
          ledger_entry_id?: string | null
          project_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vercel_deploy_id?: string | null
          vercel_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deploy_jobs_ledger_entry_id_fkey"
            columns: ["ledger_entry_id"]
            isOneToOne: false
            referencedRelation: "casino_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deploy_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      device_trust: {
        Row: {
          created_at: string
          device_label: string
          hw_hash: string
          hw_salt: string | null
          last_seen_at: string
          trust_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_label?: string
          hw_hash: string
          hw_salt?: string | null
          last_seen_at?: string
          trust_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_label?: string
          hw_hash?: string
          hw_salt?: string | null
          last_seen_at?: string
          trust_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_blocks: {
        Row: {
          block_type: string
          created_at: string
          id: string
          metadata: Json
          parent_block_id: string | null
          position: number
          project_id: string
          props: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          block_type: string
          created_at?: string
          id?: string
          metadata?: Json
          parent_block_id?: string | null
          position?: number
          project_id: string
          props?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          block_type?: string
          created_at?: string
          id?: string
          metadata?: Json
          parent_block_id?: string | null
          position?: number
          project_id?: string
          props?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_blocks_parent_block_id_fkey"
            columns: ["parent_block_id"]
            isOneToOne: false
            referencedRelation: "dna_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dna_blocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_mutations: {
        Row: {
          applied_at: string
          conflict_detected: boolean | null
          created_at: string
          id: string
          new_props: Json | null
          node_id: string
          previous_props: Json | null
          project_id: string
          prompt: string | null
          updated_at: string
          user_id: string
          version_vector: number | null
        }
        Insert: {
          applied_at?: string
          conflict_detected?: boolean | null
          created_at?: string
          id?: string
          new_props?: Json | null
          node_id: string
          previous_props?: Json | null
          project_id: string
          prompt?: string | null
          updated_at?: string
          user_id: string
          version_vector?: number | null
        }
        Update: {
          applied_at?: string
          conflict_detected?: boolean | null
          created_at?: string
          id?: string
          new_props?: Json | null
          node_id?: string
          previous_props?: Json | null
          project_id?: string
          prompt?: string | null
          updated_at?: string
          user_id?: string
          version_vector?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dna_mutations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_sessions: {
        Row: {
          created_at: string
          dna_snapshot: Json
          ended_at: string | null
          id: string
          project_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dna_snapshot?: Json
          ended_at?: string | null
          id?: string
          project_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dna_snapshot?: Json
          ended_at?: string | null
          id?: string
          project_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_configs: {
        Row: {
          a_record_ip: string
          cname_target: string
          created_at: string
          domain: string
          expires_at: string | null
          id: string
          last_checked_at: string | null
          project_id: string
          ssl_status: string
          status: string
          subdomain: string | null
          txt_verification: string
          updated_at: string
          user_id: string | null
          vercel_domain_id: string | null
          verified_at: string | null
          verify_attempts: number | null
        }
        Insert: {
          a_record_ip?: string
          cname_target?: string
          created_at?: string
          domain: string
          expires_at?: string | null
          id?: string
          last_checked_at?: string | null
          project_id: string
          ssl_status?: string
          status?: string
          subdomain?: string | null
          txt_verification?: string
          updated_at?: string
          user_id?: string | null
          vercel_domain_id?: string | null
          verified_at?: string | null
          verify_attempts?: number | null
        }
        Update: {
          a_record_ip?: string
          cname_target?: string
          created_at?: string
          domain?: string
          expires_at?: string | null
          id?: string
          last_checked_at?: string | null
          project_id?: string
          ssl_status?: string
          status?: string
          subdomain?: string | null
          txt_verification?: string
          updated_at?: string
          user_id?: string | null
          vercel_domain_id?: string | null
          verified_at?: string | null
          verify_attempts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string | null
          error_code: string
          error_message: string
          id: string
          project_id: string | null
          resolved: boolean | null
          route: string | null
          severity: string
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_code: string
          error_message: string
          id?: string
          project_id?: string | null
          resolved?: boolean | null
          route?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string
          error_message?: string
          id?: string
          project_id?: string | null
          resolved?: boolean | null
          route?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          chip_cost: number
          completed_at: string | null
          created_at: string
          download_expires_at: string | null
          download_url: string | null
          error_message: string | null
          format: string
          id: string
          project_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chip_cost: number
          completed_at?: string | null
          created_at?: string
          download_expires_at?: string | null
          download_url?: string | null
          error_message?: string | null
          format: string
          id?: string
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chip_cost?: number
          completed_at?: string | null
          created_at?: string
          download_expires_at?: string | null
          download_url?: string | null
          error_message?: string | null
          format?: string
          id?: string
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      game_saves: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          level: number | null
          player_id: string
          save_data: Json
          score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          level?: number | null
          player_id: string
          save_data?: Json
          score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          level?: number | null
          player_id?: string
          save_data?: Json
          score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_saves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      game_servers: {
        Row: {
          billing_started_at: string
          chips_burned: number
          chips_per_hour: number | null
          created_at: string
          hetzner_server_id: number
          id: string
          idle_since_at: string | null
          ipv4_address: string | null
          last_heartbeat_at: string | null
          max_players: number | null
          player_count: number
          project_id: string
          status: string
          stopped_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_started_at?: string
          chips_burned?: number
          chips_per_hour?: number | null
          created_at?: string
          hetzner_server_id: number
          id?: string
          idle_since_at?: string | null
          ipv4_address?: string | null
          last_heartbeat_at?: string | null
          max_players?: number | null
          player_count?: number
          project_id: string
          status?: string
          stopped_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_started_at?: string
          chips_burned?: number
          chips_per_hour?: number | null
          created_at?: string
          hetzner_server_id?: number
          id?: string
          idle_since_at?: string | null
          ipv4_address?: string | null
          last_heartbeat_at?: string | null
          max_players?: number | null
          player_count?: number
          project_id?: string
          status?: string
          stopped_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_servers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_rules: {
        Row: {
          action_type: string
          action_value: string
          active: boolean | null
          condition_type: string
          condition_value: string
          country_code: string | null
          created_at: string
          currency_override: string | null
          id: string
          is_active: boolean
          priority: number
          project_id: string
          redirect_url: string | null
          replacement_dna: Json | null
          rule_type: string | null
          target_block_id: string | null
          updated_at: string
        }
        Insert: {
          action_type: string
          action_value: string
          active?: boolean | null
          condition_type: string
          condition_value: string
          country_code?: string | null
          created_at?: string
          currency_override?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          project_id: string
          redirect_url?: string | null
          replacement_dna?: Json | null
          rule_type?: string | null
          target_block_id?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          action_value?: string
          active?: boolean | null
          condition_type?: string
          condition_value?: string
          country_code?: string | null
          created_at?: string
          currency_override?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          project_id?: string
          redirect_url?: string | null
          replacement_dna?: Json | null
          rule_type?: string | null
          target_block_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_rules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gso_variants: {
        Row: {
          conversions: number | null
          created_at: string
          dna_branch: Json
          id: string
          impressions: number | null
          is_control: boolean | null
          is_winner: boolean | null
          project_id: string
          updated_at: string
          variant_name: string
        }
        Insert: {
          conversions?: number | null
          created_at?: string
          dna_branch?: Json
          id?: string
          impressions?: number | null
          is_control?: boolean | null
          is_winner?: boolean | null
          project_id: string
          updated_at?: string
          variant_name: string
        }
        Update: {
          conversions?: number | null
          created_at?: string
          dna_branch?: Json
          id?: string
          impressions?: number | null
          is_control?: boolean | null
          is_winner?: boolean | null
          project_id?: string
          updated_at?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "gso_variants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      infinite_library_assets: {
        Row: {
          asset_type: string
          block_id: string | null
          block_version: string
          created_at: string | null
          file_format: string
          file_path: string
          id: string
          is_premium: boolean | null
          niche: string | null
          sdf_params: Json | null
          species_name: string
          sub_niche: string | null
          tier_required: string | null
          vibe_embedding: string | null
          wgsl_shader_path: string | null
          zone_type: string
        }
        Insert: {
          asset_type: string
          block_id?: string | null
          block_version?: string
          created_at?: string | null
          file_format: string
          file_path: string
          id?: string
          is_premium?: boolean | null
          niche?: string | null
          sdf_params?: Json | null
          species_name: string
          sub_niche?: string | null
          tier_required?: string | null
          vibe_embedding?: string | null
          wgsl_shader_path?: string | null
          zone_type?: string
        }
        Update: {
          asset_type?: string
          block_id?: string | null
          block_version?: string
          created_at?: string | null
          file_format?: string
          file_path?: string
          id?: string
          is_premium?: boolean | null
          niche?: string | null
          sdf_params?: Json | null
          species_name?: string
          sub_niche?: string | null
          tier_required?: string | null
          vibe_embedding?: string | null
          wgsl_shader_path?: string | null
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "infinite_library_assets_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "infinite_library_blocks"
            referencedColumns: ["block_id"]
          },
        ]
      }
      infinite_library_blocks: {
        Row: {
          block_id: string
          block_type: string
          block_version: string
          code_flutter: string | null
          code_react: string | null
          created_at: string
          deprecated_at: string | null
          dna_blueprint: Json
          is_deprecated: boolean | null
          is_niche_specific: boolean | null
          license: string
          niche: string | null
          species_name: string | null
          status: string
          sub_niche: string | null
          successor_block_id: string | null
          updated_at: string
          version: string
          vibe_embedding: string | null
          zone_type: string
        }
        Insert: {
          block_id?: string
          block_type: string
          block_version?: string
          code_flutter?: string | null
          code_react?: string | null
          created_at?: string
          deprecated_at?: string | null
          dna_blueprint?: Json
          is_deprecated?: boolean | null
          is_niche_specific?: boolean | null
          license?: string
          niche?: string | null
          species_name?: string | null
          status?: string
          sub_niche?: string | null
          successor_block_id?: string | null
          updated_at?: string
          version?: string
          vibe_embedding?: string | null
          zone_type: string
        }
        Update: {
          block_id?: string
          block_type?: string
          block_version?: string
          code_flutter?: string | null
          code_react?: string | null
          created_at?: string
          deprecated_at?: string | null
          dna_blueprint?: Json
          is_deprecated?: boolean | null
          is_niche_specific?: boolean | null
          license?: string
          niche?: string | null
          species_name?: string | null
          status?: string
          sub_niche?: string | null
          successor_block_id?: string | null
          updated_at?: string
          version?: string
          vibe_embedding?: string | null
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "infinite_library_blocks_successor_block_id_fkey"
            columns: ["successor_block_id"]
            isOneToOne: false
            referencedRelation: "infinite_library_blocks"
            referencedColumns: ["block_id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token_enc: string
          account_id: string | null
          account_label: string | null
          connected_at: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_refreshed_at: string | null
          project_id: string | null
          refresh_token_enc: string
          scope: string[] | null
          service: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_enc: string
          account_id?: string | null
          account_label?: string | null
          connected_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_refreshed_at?: string | null
          project_id?: string | null
          refresh_token_enc: string
          scope?: string[] | null
          service: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_enc?: string
          account_id?: string | null
          account_label?: string | null
          connected_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_refreshed_at?: string | null
          project_id?: string | null
          refresh_token_enc?: string
          scope?: string[] | null
          service?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paise: number
          created_at: string | null
          gst_amount_paise: number | null
          gstin_user: string | null
          id: string
          invoice_date: string
          invoice_number: string
          pdf_url: string | null
          razorpay_order_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_paise: number
          created_at?: string | null
          gst_amount_paise?: number | null
          gstin_user?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          pdf_url?: string | null
          razorpay_order_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_paise?: number
          created_at?: string | null
          gst_amount_paise?: number | null
          gstin_user?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          pdf_url?: string | null
          razorpay_order_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      materialise_jobs: {
        Row: {
          agent_logs: Json
          created_at: string
          eas_build_id: string | null
          eas_build_timeout_at: string | null
          job_id: string
          phase: string
          project_id: string
          retry_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_logs?: Json
          created_at?: string
          eas_build_id?: string | null
          eas_build_timeout_at?: string | null
          job_id?: string
          phase: string
          project_id: string
          retry_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_logs?: Json
          created_at?: string
          eas_build_id?: string | null
          eas_build_timeout_at?: string | null
          job_id?: string
          phase?: string
          project_id?: string
          retry_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materialise_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      oracle_messages: {
        Row: {
          chip_cost: number
          content: string
          created_at: string
          id: string
          project_id: string | null
          role: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chip_cost?: number
          content?: string
          created_at?: string
          id?: string
          project_id?: string | null
          role: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chip_cost?: number
          content?: string
          created_at?: string
          id?: string
          project_id?: string | null
          role?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracle_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oracle_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "oracle_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      oracle_sessions: {
        Row: {
          call_count: number
          conversation: Json
          created_at: string
          last_call_at: string
          project_id: string
          session_id: string
          session_started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          call_count?: number
          conversation?: Json
          created_at?: string
          last_call_at?: string
          project_id: string
          session_id?: string
          session_started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          call_count?: number
          conversation?: Json
          created_at?: string
          last_call_at?: string
          project_id?: string
          session_id?: string
          session_started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracle_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pixel_events: {
        Row: {
          created_at: string
          element_selector: string | null
          event_id: string
          event_type: string
          page_url: string
          project_id: string
          referrer: string | null
          session_duration: number | null
          updated_at: string
          visitor_hash: string
          x_coord: number | null
          y_coord: number | null
        }
        Insert: {
          created_at?: string
          element_selector?: string | null
          event_id?: string
          event_type: string
          page_url: string
          project_id: string
          referrer?: string | null
          session_duration?: number | null
          updated_at?: string
          visitor_hash: string
          x_coord?: number | null
          y_coord?: number | null
        }
        Update: {
          created_at?: string
          element_selector?: string | null
          event_id?: string
          event_type?: string
          page_url?: string
          project_id?: string
          referrer?: string | null
          session_duration?: number | null
          updated_at?: string
          visitor_hash?: string
          x_coord?: number | null
          y_coord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pixel_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_collaborators: {
        Row: {
          accepted_at: string | null
          collab_id: string
          invited_at: string | null
          invited_user_id: string
          owner_id: string
          project_id: string
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          collab_id?: string
          invited_at?: string | null
          invited_user_id: string
          owner_id: string
          project_id: string
          role: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          collab_id?: string
          invited_at?: string | null
          invited_user_id?: string
          owner_id?: string
          project_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          built_with_badge: boolean | null
          built_with_badge_enabled: boolean | null
          created_at: string
          custom_domain: string | null
          deploy_chip_cost: number
          deployed_url: string | null
          dir: string | null
          dna_string: Json
          domain: string | null
          domain_status: string | null
          domain_verified: boolean | null
          domain_verify_attempts: number | null
          eas_build_id: string | null
          eas_build_timeout_at: string | null
          id: string
          is_multi_page: boolean | null
          materialize_chip_cost: number
          niche: string | null
          pages: Json | null
          pixel_secret: string | null
          preview_url: string | null
          pwa_enabled: boolean | null
          sandbox_mode: boolean | null
          slug: string
          status: string
          sub_niche: string | null
          updated_at: string
          user_id: string
          version: number
          version_vector: number | null
          zone_type: string
        }
        Insert: {
          built_with_badge?: boolean | null
          built_with_badge_enabled?: boolean | null
          created_at?: string
          custom_domain?: string | null
          deploy_chip_cost?: number
          deployed_url?: string | null
          dir?: string | null
          dna_string?: Json
          domain?: string | null
          domain_status?: string | null
          domain_verified?: boolean | null
          domain_verify_attempts?: number | null
          eas_build_id?: string | null
          eas_build_timeout_at?: string | null
          id?: string
          is_multi_page?: boolean | null
          materialize_chip_cost?: number
          niche?: string | null
          pages?: Json | null
          pixel_secret?: string | null
          preview_url?: string | null
          pwa_enabled?: boolean | null
          sandbox_mode?: boolean | null
          slug: string
          status?: string
          sub_niche?: string | null
          updated_at?: string
          user_id: string
          version?: number
          version_vector?: number | null
          zone_type: string
        }
        Update: {
          built_with_badge?: boolean | null
          built_with_badge_enabled?: boolean | null
          created_at?: string
          custom_domain?: string | null
          deploy_chip_cost?: number
          deployed_url?: string | null
          dir?: string | null
          dna_string?: Json
          domain?: string | null
          domain_status?: string | null
          domain_verified?: boolean | null
          domain_verify_attempts?: number | null
          eas_build_id?: string | null
          eas_build_timeout_at?: string | null
          id?: string
          is_multi_page?: boolean | null
          materialize_chip_cost?: number
          niche?: string | null
          pages?: Json | null
          pixel_secret?: string | null
          preview_url?: string | null
          pwa_enabled?: boolean | null
          sandbox_mode?: boolean | null
          slug?: string
          status?: string
          sub_niche?: string | null
          updated_at?: string
          user_id?: string
          version?: number
          version_vector?: number | null
          zone_type?: string
        }
        Relationships: []
      }
      questionnaire_answers: {
        Row: {
          answers: Json
          created_at: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_answers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_niche_map: {
        Row: {
          block_types: string[]
          created_at: string | null
          id: string
          niche: string
          priority_order: number | null
          q1_default: string | null
          sub_niche: string | null
          vibe_default: string | null
          zone_type: string
        }
        Insert: {
          block_types?: string[]
          created_at?: string | null
          id?: string
          niche: string
          priority_order?: number | null
          q1_default?: string | null
          sub_niche?: string | null
          vibe_default?: string | null
          zone_type: string
        }
        Update: {
          block_types?: string[]
          created_at?: string | null
          id?: string
          niche?: string
          priority_order?: number | null
          q1_default?: string | null
          sub_niche?: string | null
          vibe_default?: string | null
          zone_type?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          chips_awarded: number | null
          converted_at: string | null
          created_at: string | null
          id: string
          referee_chips_awarded: number | null
          referral_code: string
          referred_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          chips_awarded?: number | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referee_chips_awarded?: number | null
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          chips_awarded?: number | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referee_chips_awarded?: number | null
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_scores: {
        Row: {
          created_at: string
          issues: Json
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          project_id: string
          seo_score: number
          sitemap_url: string | null
          snapshot_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          issues?: Json
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          project_id: string
          seo_score: number
          sitemap_url?: string | null
          snapshot_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          issues?: Json
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          project_id?: string
          seo_score?: number
          sitemap_url?: string | null
          snapshot_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_snapshots: {
        Row: {
          alt_coverage: number | null
          created_at: string | null
          id: string
          lighthouse_score: number | null
          meta_score: number | null
          og_complete: boolean | null
          project_id: string
          sitemap_valid: boolean | null
        }
        Insert: {
          alt_coverage?: number | null
          created_at?: string | null
          id?: string
          lighthouse_score?: number | null
          meta_score?: number | null
          og_complete?: boolean | null
          project_id: string
          sitemap_valid?: boolean | null
        }
        Update: {
          alt_coverage?: number | null
          created_at?: string | null
          id?: string
          lighthouse_score?: number | null
          meta_score?: number | null
          og_complete?: boolean | null
          project_id?: string
          sitemap_valid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_snapshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profile: {
        Row: {
          chip_balance: number
          consent_version: string | null
          created_at: string
          gstin: string | null
          id: string
          interface_language: string | null
          is_disputed: boolean
          last_payment_retry_at: string | null
          nps_score: number | null
          nps_submitted_at: string | null
          onboarding_channel: string | null
          onboarding_completed: boolean | null
          payment_retry_count: number | null
          pixel_nps_shown_at: string | null
          razorpay_subscription_id: string | null
          referral_code: string | null
          referred_by: string | null
          role: string
          rollover_chips: number | null
          subscription_status: string
          subscription_tier: string
          t2fp_first_deploy_at: string | null
          totp_enabled: boolean | null
          totp_secret_enc: string | null
          totp_verified_at: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
        }
        Insert: {
          chip_balance?: number
          consent_version?: string | null
          created_at?: string
          gstin?: string | null
          id: string
          interface_language?: string | null
          is_disputed?: boolean
          last_payment_retry_at?: string | null
          nps_score?: number | null
          nps_submitted_at?: string | null
          onboarding_channel?: string | null
          onboarding_completed?: boolean | null
          payment_retry_count?: number | null
          pixel_nps_shown_at?: string | null
          razorpay_subscription_id?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string
          rollover_chips?: number | null
          subscription_status?: string
          subscription_tier?: string
          t2fp_first_deploy_at?: string | null
          totp_enabled?: boolean | null
          totp_secret_enc?: string | null
          totp_verified_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Update: {
          chip_balance?: number
          consent_version?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          interface_language?: string | null
          is_disputed?: boolean
          last_payment_retry_at?: string | null
          nps_score?: number | null
          nps_submitted_at?: string | null
          onboarding_channel?: string | null
          onboarding_completed?: boolean | null
          payment_retry_count?: number | null
          pixel_nps_shown_at?: string | null
          razorpay_subscription_id?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string
          rollover_chips?: number | null
          subscription_status?: string
          subscription_tier?: string
          t2fp_first_deploy_at?: string | null
          totp_enabled?: boolean | null
          totp_secret_enc?: string | null
          totp_verified_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_profile_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_templates: {
        Row: {
          block_count: number
          buyer_user_id: string | null
          created_at: string
          description: string | null
          dispute_snapshot_id: string | null
          dna_string: Json
          escrow_release_at: string | null
          id: string
          payout_status: string | null
          price_chips: number | null
          price_inr: number | null
          project_id: string | null
          reported_count: number | null
          seller_id: string
          sold_at: string | null
          status: string
          tier: string
          title: string
          updated_at: string
          version: string
          zone_type: string
        }
        Insert: {
          block_count?: number
          buyer_user_id?: string | null
          created_at?: string
          description?: string | null
          dispute_snapshot_id?: string | null
          dna_string: Json
          escrow_release_at?: string | null
          id?: string
          payout_status?: string | null
          price_chips?: number | null
          price_inr?: number | null
          project_id?: string | null
          reported_count?: number | null
          seller_id: string
          sold_at?: string | null
          status?: string
          tier: string
          title: string
          updated_at?: string
          version?: string
          zone_type: string
        }
        Update: {
          block_count?: number
          buyer_user_id?: string | null
          created_at?: string
          description?: string | null
          dispute_snapshot_id?: string | null
          dna_string?: Json
          escrow_release_at?: string | null
          id?: string
          payout_status?: string | null
          price_chips?: number | null
          price_inr?: number | null
          project_id?: string | null
          reported_count?: number | null
          seller_id?: string
          sold_at?: string | null
          status?: string
          tier?: string
          title?: string
          updated_at?: string
          version?: string
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_templates_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_templates_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      commit_chip_topup: {
        Args: { p_chip_delta: number; p_user_id: string }
        Returns: undefined
      }
      transition_ledger_entry: {
        Args: { p_entry_id: string; p_new_status: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
