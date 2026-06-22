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
  created_at: string
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

export interface Settings {
  id: 1
  company_name: string
  asset_tag_prefix: string
  show_property_of: boolean
}

export type Database = {
  public: {
    Tables: {
      people: {
        Row: Person
        Insert: Omit<Person, 'id' | 'created_at'>
        Update: Partial<Omit<Person, 'id' | 'created_at'>>
      }
      equipment: {
        Row: Equipment
        Insert: Omit<Equipment, 'id' | 'created_at'>
        Update: Partial<Omit<Equipment, 'id' | 'created_at'>>
      }
      assignment_history: {
        Row: AssignmentHistory
        Insert: Omit<AssignmentHistory, 'id' | 'created_at'>
        Update: Partial<Omit<AssignmentHistory, 'id' | 'created_at'>>
      }
      contracts: {
        Row: Contract
        Insert: Omit<Contract, 'id' | 'created_at'>
        Update: Partial<Omit<Contract, 'id' | 'created_at'>>
      }
      settings: {
        Row: Settings
        Insert: Partial<Settings>
        Update: Partial<Settings>
      }
    }
    Views: {
      public_asset: {
        Row: PublicAsset
      }
      contracts_with_status: {
        Row: ContractWithStatus
      }
    }
    Functions: {
      contract_status: {
        Args: { renewal: string | null }
        Returns: ContractStatus
      }
    }
  }
}
