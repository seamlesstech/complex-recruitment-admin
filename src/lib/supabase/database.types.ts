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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          actor_profile_id: string | null
          audit_event_id: number | null
          detail: string | null
          entity_id: string
          entity_reference: string | null
          entity_type: string
          id: number
          occurred_at: string
          verb: string
        }
        Insert: {
          actor_profile_id?: string | null
          audit_event_id?: number | null
          detail?: string | null
          entity_id: string
          entity_reference?: string | null
          entity_type: string
          id?: never
          occurred_at?: string
          verb: string
        }
        Update: {
          actor_profile_id?: string | null
          audit_event_id?: number | null
          detail?: string | null
          entity_id?: string
          entity_reference?: string | null
          entity_type?: string
          id?: never
          occurred_at?: string
          verb?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "activity_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_audit_event_id_fkey"
            columns: ["audit_event_id"]
            isOneToOne: false
            referencedRelation: "audit_events"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          application_id: string
          candidate_document_id: string
          id: string
          linked_at: string
        }
        Insert: {
          application_id: string
          candidate_document_id: string
          id?: string
          linked_at?: string
        }
        Update: {
          application_id?: string
          candidate_document_id?: string
          id?: string
          linked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_candidate_document_id_fkey"
            columns: ["candidate_document_id"]
            isOneToOne: false
            referencedRelation: "candidate_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
        }
        Insert: {
          application_id: string
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "application_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_message: string | null
          archived_at: string | null
          candidate_id: string
          created_at: string
          id: string
          job_id: string
          owner_id: string | null
          read_at: string | null
          reference: string
          source: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          applicant_message?: string | null
          archived_at?: string | null
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
          owner_id?: string | null
          read_at?: string | null
          reference: string
          source?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          applicant_message?: string | null
          archived_at?: string | null
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
          owner_id?: string | null
          read_at?: string | null
          reference?: string
          source?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_profile_id: string | null
          after_data: Json | null
          before_data: Json | null
          entity_id: string
          entity_type: string
          id: number
          metadata: Json | null
          occurred_at: string
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          entity_id: string
          entity_type: string
          id?: never
          metadata?: Json | null
          occurred_at?: string
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          entity_id?: string
          entity_type?: string
          id?: never
          metadata?: Json | null
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "audit_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          archived_at: string | null
          candidate_id: string
          document_type_id: string
          expiry_date: string | null
          id: string
          is_current: boolean
          mime_type: string
          object_path: string
          original_filename: string
          size_bytes: number
          superseded_by_id: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          archived_at?: string | null
          candidate_id: string
          document_type_id: string
          expiry_date?: string | null
          id?: string
          is_current?: boolean
          mime_type: string
          object_path: string
          original_filename: string
          size_bytes: number
          superseded_by_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          archived_at?: string | null
          candidate_id?: string
          document_type_id?: string
          expiry_date?: string | null
          id?: string
          is_current?: boolean
          mime_type?: string
          object_path?: string
          original_filename?: string
          size_bytes?: number
          superseded_by_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_documents_superseded_by_id_fkey"
            columns: ["superseded_by_id"]
            isOneToOne: false
            referencedRelation: "candidate_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "candidate_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_notes: {
        Row: {
          author_id: string
          body: string
          candidate_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
        }
        Insert: {
          author_id: string
          body: string
          candidate_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          candidate_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "candidate_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          archived_at: string | null
          availability: Database["public"]["Enums"]["candidate_availability"]
          created_at: string
          email: string | null
          email_normalized: string | null
          full_name: string
          id: string
          last_activity_at: string
          location: string | null
          owner_id: string | null
          phone: string | null
          primary_sector_id: string | null
          reference: string
          registered_at: string
          registration_source: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          availability?: Database["public"]["Enums"]["candidate_availability"]
          created_at?: string
          email?: string | null
          email_normalized?: string | null
          full_name: string
          id?: string
          last_activity_at?: string
          location?: string | null
          owner_id?: string | null
          phone?: string | null
          primary_sector_id?: string | null
          reference: string
          registered_at?: string
          registration_source?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          availability?: Database["public"]["Enums"]["candidate_availability"]
          created_at?: string
          email?: string | null
          email_normalized?: string | null
          full_name?: string
          id?: string
          last_activity_at?: string
          location?: string | null
          owner_id?: string | null
          phone?: string | null
          primary_sector_id?: string | null
          reference?: string
          registered_at?: string
          registration_source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "candidates_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_primary_sector_id_fkey"
            columns: ["primary_sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          created_at: string
          id: string
          name: string
          requires_expiry: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          requires_expiry?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          requires_expiry?: boolean
        }
        Relationships: []
      }
      employer_contacts: {
        Row: {
          archived_at: string | null
          created_at: string
          email: string | null
          employer_id: string
          id: string
          is_primary: boolean
          job_title: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          employer_id: string
          id?: string
          is_primary?: boolean
          job_title?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          employer_id?: string
          id?: string
          is_primary?: boolean
          job_title?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_contacts_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "employers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          archived_at: string | null
          company_free_text: string | null
          contact_name: string
          converted_candidate_id: string | null
          converted_staff_request_id: string | null
          created_at: string
          email: string | null
          employer_id: string | null
          id: string
          message: string
          owner_id: string | null
          phone: string | null
          read_at: string | null
          received_at: string
          reference: string
          source: string | null
          status: Database["public"]["Enums"]["enquiry_status"]
          subject: string | null
          type: Database["public"]["Enums"]["enquiry_type"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          company_free_text?: string | null
          contact_name: string
          converted_candidate_id?: string | null
          converted_staff_request_id?: string | null
          created_at?: string
          email?: string | null
          employer_id?: string | null
          id?: string
          message: string
          owner_id?: string | null
          phone?: string | null
          read_at?: string | null
          received_at?: string
          reference: string
          source?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          subject?: string | null
          type: Database["public"]["Enums"]["enquiry_type"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          company_free_text?: string | null
          contact_name?: string
          converted_candidate_id?: string | null
          converted_staff_request_id?: string | null
          created_at?: string
          email?: string | null
          employer_id?: string | null
          id?: string
          message?: string
          owner_id?: string | null
          phone?: string | null
          read_at?: string | null
          received_at?: string
          reference?: string
          source?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["enquiry_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_converted_candidate_id_fkey"
            columns: ["converted_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_converted_staff_request_id_fkey"
            columns: ["converted_staff_request_id"]
            isOneToOne: false
            referencedRelation: "staff_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "enquiries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          enquiry_id: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          enquiry_id: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          enquiry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiry_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "enquiry_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiry_notes_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      job_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          job_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          job_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "job_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_instructions: string | null
          archived_at: string | null
          benefits: string | null
          closing_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          employer_id: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          id: string
          location: string | null
          owner_id: string | null
          pay_from: number | null
          pay_to: number | null
          pay_type: Database["public"]["Enums"]["pay_type"] | null
          publish_on_website: boolean
          reference: string
          requirements: string | null
          responsibilities: string | null
          sector_id: string | null
          staff_request_id: string | null
          status: Database["public"]["Enums"]["job_status"]
          summary: string | null
          title: string
          updated_at: string
          vacancies_count: number
          work_pattern: Database["public"]["Enums"]["work_pattern"] | null
          workplace_type: Database["public"]["Enums"]["workplace_type"]
        }
        Insert: {
          application_instructions?: string | null
          archived_at?: string | null
          benefits?: string | null
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          employer_id: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          id?: string
          location?: string | null
          owner_id?: string | null
          pay_from?: number | null
          pay_to?: number | null
          pay_type?: Database["public"]["Enums"]["pay_type"] | null
          publish_on_website?: boolean
          reference: string
          requirements?: string | null
          responsibilities?: string | null
          sector_id?: string | null
          staff_request_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          summary?: string | null
          title: string
          updated_at?: string
          vacancies_count?: number
          work_pattern?: Database["public"]["Enums"]["work_pattern"] | null
          workplace_type?: Database["public"]["Enums"]["workplace_type"]
        }
        Update: {
          application_instructions?: string | null
          archived_at?: string | null
          benefits?: string | null
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          employer_id?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          id?: string
          location?: string | null
          owner_id?: string | null
          pay_from?: number | null
          pay_to?: number | null
          pay_type?: Database["public"]["Enums"]["pay_type"] | null
          publish_on_website?: boolean
          reference?: string
          requirements?: string | null
          responsibilities?: string | null
          sector_id?: string | null
          staff_request_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          vacancies_count?: number
          work_pattern?: Database["public"]["Enums"]["work_pattern"] | null
          workplace_type?: Database["public"]["Enums"]["workplace_type"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_staff_request_id_fkey"
            columns: ["staff_request_id"]
            isOneToOne: false
            referencedRelation: "staff_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_event_types: {
        Row: {
          created_at: string
          default_email: boolean
          default_in_app: boolean
          description: string | null
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          default_email?: boolean
          default_in_app?: boolean
          description?: string | null
          key: string
          label: string
        }
        Update: {
          created_at?: string
          default_email?: boolean
          default_in_app?: boolean
          description?: string | null
          key?: string
          label?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email: boolean
          event_key: string
          in_app: boolean
          profile_id: string
          updated_at: string
        }
        Insert: {
          email: boolean
          event_key: string
          in_app: boolean
          profile_id: string
          updated_at?: string
        }
        Update: {
          email?: boolean
          event_key?: string
          in_app?: boolean
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_event_key_fkey"
            columns: ["event_key"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["event_key"]
          },
          {
            foreignKeyName: "notification_preferences_event_key_fkey"
            columns: ["event_key"]
            isOneToOne: false
            referencedRelation: "notification_event_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_reference: string | null
          entity_type: string | null
          id: string
          message: string | null
          read_at: string | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_reference?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read_at?: string | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_reference?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["event_key"]
          },
          {
            foreignKeyName: "notifications_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "notification_event_types"
            referencedColumns: ["key"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          initials: string | null
          invited_at: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["profile_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          email: string
          id: string
          initials?: string | null
          invited_at?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          initials?: string | null
          invited_at?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      staff_request_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          staff_request_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          staff_request_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          staff_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_request_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "staff_request_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_request_notes_staff_request_id_fkey"
            columns: ["staff_request_id"]
            isOneToOne: false
            referencedRelation: "staff_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_requests: {
        Row: {
          archived_at: string | null
          created_at: string
          duration: string | null
          employer_contact_id: string | null
          employer_id: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          id: string
          location: string | null
          needed_by: string | null
          owner_id: string | null
          pay_from: number | null
          pay_to: number | null
          pay_type: Database["public"]["Enums"]["pay_type"] | null
          quantity_filled: number
          quantity_required: number
          reference: string
          requirement_title: string
          sector_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["staff_request_status"]
          submitted_at: string
          updated_at: string
          urgency: Database["public"]["Enums"]["staff_request_urgency"]
          work_pattern: Database["public"]["Enums"]["work_pattern"] | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          duration?: string | null
          employer_contact_id?: string | null
          employer_id: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          id?: string
          location?: string | null
          needed_by?: string | null
          owner_id?: string | null
          pay_from?: number | null
          pay_to?: number | null
          pay_type?: Database["public"]["Enums"]["pay_type"] | null
          quantity_filled?: number
          quantity_required: number
          reference: string
          requirement_title: string
          sector_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["staff_request_status"]
          submitted_at?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["staff_request_urgency"]
          work_pattern?: Database["public"]["Enums"]["work_pattern"] | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          duration?: string | null
          employer_contact_id?: string | null
          employer_id?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          id?: string
          location?: string | null
          needed_by?: string | null
          owner_id?: string | null
          pay_from?: number | null
          pay_to?: number | null
          pay_type?: Database["public"]["Enums"]["pay_type"] | null
          quantity_filled?: number
          quantity_required?: number
          reference?: string
          requirement_title?: string
          sector_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["staff_request_status"]
          submitted_at?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["staff_request_urgency"]
          work_pattern?: Database["public"]["Enums"]["work_pattern"] | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_requests_employer_contact_id_employer_id_fkey"
            columns: ["employer_contact_id", "employer_id"]
            isOneToOne: false
            referencedRelation: "employer_contacts"
            referencedColumns: ["id", "employer_id"]
          },
          {
            foreignKeyName: "staff_requests_employer_contact_id_fkey"
            columns: ["employer_contact_id"]
            isOneToOne: false
            referencedRelation: "employer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "effective_notification_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "staff_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      effective_notification_preferences: {
        Row: {
          email: boolean | null
          event_key: string | null
          in_app: boolean | null
          profile_id: string | null
        }
        Relationships: []
      }
      public_jobs: {
        Row: {
          application_instructions: string | null
          benefits: string | null
          closing_date: string | null
          description: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          location: string | null
          pay_display: string | null
          pay_type: Database["public"]["Enums"]["pay_type"] | null
          reference: string | null
          requirements: string | null
          responsibilities: string | null
          sector: string | null
          summary: string | null
          title: string | null
          vacancies_count: number | null
          work_pattern: Database["public"]["Enums"]["work_pattern"] | null
          workplace_type: Database["public"]["Enums"]["workplace_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      attach_public_application_cv: {
        Args: {
          p_application_id: string
          p_document_id: string
          p_mime_type: string
          p_original_filename: string
          p_size_bytes: number
        }
        Returns: {
          candidate_document_id: string
          superseded_document_id: string
        }[]
      }
      convert_enquiry: {
        Args: {
          p_candidate_id?: string
          p_enquiry_id: string
          p_staff_request_id?: string
        }
        Returns: {
          archived_at: string | null
          company_free_text: string | null
          contact_name: string
          converted_candidate_id: string | null
          converted_staff_request_id: string | null
          created_at: string
          email: string | null
          employer_id: string | null
          id: string
          message: string
          owner_id: string | null
          phone: string | null
          read_at: string | null
          received_at: string
          reference: string
          source: string | null
          status: Database["public"]["Enums"]["enquiry_status"]
          subject: string | null
          type: Database["public"]["Enums"]["enquiry_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "enquiries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_profile_id: { Args: never; Returns: string }
      current_profile_role: {
        Args: never
        Returns: Database["public"]["Enums"]["profile_role"]
      }
      discard_public_application: {
        Args: { p_application_id: string; p_candidate_created: boolean }
        Returns: {
          application_deleted: boolean
          candidate_deleted: boolean
        }[]
      }
      is_active_profile: { Args: never; Returns: boolean }
      is_admin_tier: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      submit_public_application: {
        Args: {
          p_email: string
          p_full_name: string
          p_job_reference: string
          p_location?: string
          p_message?: string
          p_phone: string
          p_source?: string
        }
        Returns: {
          application_id: string
          application_reference: string
          candidate_created: boolean
          candidate_id: string
          candidate_reference: string
        }[]
      }
    }
    Enums: {
      application_status:
        | "new"
        | "reviewing"
        | "shortlisted"
        | "interview"
        | "offered"
        | "placed"
        | "rejected"
        | "withdrawn"
      candidate_availability:
        | "available"
        | "working"
        | "unavailable"
        | "inactive"
      employment_type: "temporary" | "permanent" | "contract"
      enquiry_status: "new" | "in_review" | "responded" | "converted" | "closed"
      enquiry_type: "employer" | "candidate" | "general" | "partnership"
      job_status: "draft" | "open" | "closed"
      pay_type: "hourly" | "daily" | "annual_salary" | "negotiable"
      profile_role: "super_admin" | "admin_manager" | "recruiter" | "viewer"
      profile_status: "active" | "invited" | "disabled"
      staff_request_status:
        | "new"
        | "assigned"
        | "sourcing"
        | "partially_filled"
        | "filled"
        | "closed"
      staff_request_urgency: "standard" | "urgent"
      work_pattern:
        | "full_time"
        | "part_time"
        | "shift_work"
        | "nights"
        | "weekends"
        | "flexible"
      workplace_type: "on_site" | "hybrid" | "remote"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "new",
        "reviewing",
        "shortlisted",
        "interview",
        "offered",
        "placed",
        "rejected",
        "withdrawn",
      ],
      candidate_availability: [
        "available",
        "working",
        "unavailable",
        "inactive",
      ],
      employment_type: ["temporary", "permanent", "contract"],
      enquiry_status: ["new", "in_review", "responded", "converted", "closed"],
      enquiry_type: ["employer", "candidate", "general", "partnership"],
      job_status: ["draft", "open", "closed"],
      pay_type: ["hourly", "daily", "annual_salary", "negotiable"],
      profile_role: ["super_admin", "admin_manager", "recruiter", "viewer"],
      profile_status: ["active", "invited", "disabled"],
      staff_request_status: [
        "new",
        "assigned",
        "sourcing",
        "partially_filled",
        "filled",
        "closed",
      ],
      staff_request_urgency: ["standard", "urgent"],
      work_pattern: [
        "full_time",
        "part_time",
        "shift_work",
        "nights",
        "weekends",
        "flexible",
      ],
      workplace_type: ["on_site", "hybrid", "remote"],
    },
  },
} as const
