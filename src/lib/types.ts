export type EquipmentStatus = 'Available' | 'Assigned' | 'In repair' | 'Retired'
export type HistoryEvent =
  | 'Assigned'
  | 'Checked in'
  | 'Available'
  | 'In repair'
  | 'Retired'
  | 'Added to inventory'
  | 'Edited'
export type ContractStatus = 'Active' | 'Expiring soon' | 'Expired' | 'No end date'

export interface Person {
  id: string
  name: string
  job_title: string | null
  department: string | null
  email: string | null
  employee_no: string | null
  id_number: string | null
  employment_status: 'Active' | 'Former'
  left_date: string | null
  created_at: string
}

export interface Equipment {
  id: string
  asset_tag: string
  name: string
  type: string | null
  serial: string | null
  status: EquipmentStatus
  assignee_id: string | null
  location: string | null
  issue_date: string | null
  purchase_date: string | null
  condition: string | null
  notes: string | null
  register_no: string | null
  make: string | null
  model: string | null
  value_incl_vat: number | null
  created_at: string
}

export interface LaptopRegisterItem {
  register_no: string
  id: string
  name: string
  type: string | null
  serial: string | null
  status: EquipmentStatus
  asset_tag: string
  holder: string | null
}

export interface EquipmentWithAssignee extends Equipment {
  assignee: Person | null
}

export interface AssignmentHistory {
  id: string
  equipment_id: string
  event_type: HistoryEvent
  person_id: string | null
  note: string | null
  actor: string | null
  event_date: string
  created_at: string
  person?: Person | null
}

export interface Contract {
  id: string
  name: string
  type: string | null
  provider: string | null
  account_number: string | null
  monthly_cost: number
  data_gb: number | null
  start_date: string | null
  renewal_date: string | null
  holder: string | null
  holder_id: string | null
  linked_equipment_id: string | null
  notes: string | null
  created_at: string
}

export interface ContractWithStatus extends Contract {
  status: ContractStatus
  days_until: number | null
}

export interface PublicAsset {
  asset_tag: string
  name: string
  type: string | null
  serial: string | null
  status: EquipmentStatus
  location: string | null
  issue_date: string | null
  assignee_name: string | null
}

export interface PasswordSystem {
  id: string
  key: string
  name: string
  subtitle: string | null
  sort_order: number
}

export interface LoginRow {
  id: string
  system_id: string
  first_name: string
  surname: string | null
  username: string | null
  updated_at: string
}

export interface SharedAccountRow {
  id: string
  service: string
  category: string | null
  username: string | null
  url: string | null
  owner: string | null
  notes: string | null
  updated_at: string
}

export interface Settings {
  id: 1
  company_name: string
  asset_tag_prefix: string
  show_property_of: boolean
}

type Relationships = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}[]

export type Database = {
  public: {
    Tables: {
      people: {
        Row: Person
        Insert: Omit<Person, 'id' | 'created_at'>
        Update: Partial<Omit<Person, 'id' | 'created_at'>>
        Relationships: Relationships
      }
      equipment: {
        Row: Equipment
        Insert: Omit<Equipment, 'id' | 'created_at'>
        Update: Partial<Omit<Equipment, 'id' | 'created_at'>>
        Relationships: Relationships
      }
      assignment_history: {
        Row: AssignmentHistory
        Insert: Omit<AssignmentHistory, 'id' | 'created_at' | 'person'>
        Update: Partial<Omit<AssignmentHistory, 'id' | 'created_at' | 'person'>>
        Relationships: Relationships
      }
      contracts: {
        Row: Contract
        Insert: Omit<Contract, 'id' | 'created_at'>
        Update: Partial<Omit<Contract, 'id' | 'created_at'>>
        Relationships: Relationships
      }
      settings: {
        Row: Settings
        Insert: Partial<Settings>
        Update: Partial<Settings>
        Relationships: Relationships
      }
    }
    Views: {
      public_asset: {
        Row: PublicAsset
        Relationships: Relationships
      }
      contracts_with_status: {
        Row: ContractWithStatus
        Relationships: Relationships
      }
    }
    Functions: {
      contract_status: {
        Args: { renewal: string | null }
        Returns: ContractStatus
      }
    }
    Enums: {
      equipment_status: EquipmentStatus
      history_event: HistoryEvent
    }
    CompositeTypes: Record<string, never>
  }
}
