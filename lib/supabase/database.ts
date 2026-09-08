export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TriggerStatus = "todo" | "achieved";
type DateAssignmentKind = "trigger" | "scenario";
type WritingKind = "gratitude" | "quotes" | "journal" | "reflections" | "done";
type NotificationKind = "check_in";

export type Database = {
  public: {
    Tables: {
      user_data: {
        Row: {
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          onboarding: Json;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      triggers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          source_key: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          source_key?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          source_key?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scenarios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          emoji: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          emoji?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          emoji?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scenario_triggers: {
        Row: {
          scenario_id: string;
          trigger_id: string;
          user_id: string;
          position: number;
        };
        Insert: {
          scenario_id: string;
          trigger_id: string;
          user_id: string;
          position: number;
        };
        Update: {
          scenario_id?: string;
          trigger_id?: string;
          user_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "scenario_triggers_scenario_id_fkey";
            columns: ["scenario_id"];
            isOneToOne: false;
            referencedRelation: "scenarios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scenario_triggers_trigger_id_fkey";
            columns: ["trigger_id"];
            isOneToOne: false;
            referencedRelation: "triggers";
            referencedColumns: ["id"];
          },
        ];
      };
      date_assignments: {
        Row: {
          id: string;
          user_id: string;
          on_date: string;
          kind: DateAssignmentKind;
          trigger_id: string | null;
          scenario_id: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          on_date: string;
          kind: DateAssignmentKind;
          trigger_id?: string | null;
          scenario_id?: string | null;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          on_date?: string;
          kind?: DateAssignmentKind;
          trigger_id?: string | null;
          scenario_id?: string | null;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "date_assignments_trigger_id_fkey";
            columns: ["trigger_id"];
            isOneToOne: false;
            referencedRelation: "triggers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "date_assignments_scenario_id_fkey";
            columns: ["scenario_id"];
            isOneToOne: false;
            referencedRelation: "scenarios";
            referencedColumns: ["id"];
          },
        ];
      };
      date_trigger_states: {
        Row: {
          user_id: string;
          on_date: string;
          trigger_id: string;
          status: TriggerStatus;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          on_date: string;
          trigger_id: string;
          status?: TriggerStatus;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          on_date?: string;
          trigger_id?: string;
          status?: TriggerStatus;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "date_trigger_states_trigger_id_fkey";
            columns: ["trigger_id"];
            isOneToOne: false;
            referencedRelation: "triggers";
            referencedColumns: ["id"];
          },
        ];
      };
      pillar_entries: {
        Row: {
          user_id: string;
          on_date: string;
          pillar_id: string;
          rating: number;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          on_date: string;
          pillar_id: string;
          rating: number;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          on_date?: string;
          pillar_id?: string;
          rating?: number;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      writing_entries: {
        Row: {
          id: string;
          user_id: string;
          on_date: string;
          kind: WritingKind;
          title: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          on_date: string;
          kind: WritingKind;
          title: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          on_date?: string;
          kind?: WritingKind;
          title?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      mind_sweep_items: {
        Row: {
          id: string;
          user_id: string;
          on_date: string;
          title: string;
          notes: string | null;
          status: TriggerStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          on_date: string;
          title: string;
          notes?: string | null;
          status?: TriggerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          on_date?: string;
          title?: string;
          notes?: string | null;
          status?: TriggerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: NotificationKind;
          title: string;
          body: string;
          href: string | null;
          dedupe_key: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: NotificationKind;
          title: string;
          body: string;
          href?: string | null;
          dedupe_key: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: NotificationKind;
          title?: string;
          body?: string;
          href?: string | null;
          dedupe_key?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      trigger_status: TriggerStatus;
      date_assignment_kind: DateAssignmentKind;
      writing_kind: WritingKind;
      notification_kind: NotificationKind;
    };
    CompositeTypes: Record<string, never>;
  };
};
