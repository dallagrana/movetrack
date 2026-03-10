export interface Profile {
  id: string
  full_name: string | null
  target_move_date: string | null
  origin_address: string | null
  destination_address: string | null
  updated_at: string
}

export interface Category {
  id: number
  name: string
  icon: string | null
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  user_id: string
  category_id: number | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  start_date: string | null
  end_date: string | null
  is_essential: boolean
  created_at: string
  categories?: Category
}

export interface TaskFormData {
  title: string
  description: string
  category_id: number | null
  status: TaskStatus
  priority: TaskPriority
  start_date: string
  end_date: string
  is_essential: boolean
}

export const CATEGORY_COLORS: Record<string, string> = {
  Utilities: '#3B82F6',
  Packing: '#F59E0B',
  Legal: '#8B5CF6',
  Moving: '#10B981',
  Administrative: '#6B7280',
}

export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#94A3B8', bg: 'bg-slate-100', text: 'text-slate-600' },
  in_progress: { label: 'In Progress', color: '#3B82F6', bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { label: 'Completed', color: '#10B981', bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

export const PRIORITY_CONFIG = {
  low: { label: 'Low', bg: 'bg-green-100', text: 'text-green-700' },
  medium: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700' },
  high: { label: 'High', bg: 'bg-red-100', text: 'text-red-700' },
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export interface Expense {
  id: string
  user_id: string
  date: string          // ISO date YYYY-MM-DD
  description: string
  amount: number
  created_at: string
}

export interface ExpenseFormData {
  date: string
  description: string
  amount: string        // string for input control, parsed on submit
}

// ─── Box Tracking ────────────────────────────────────────────────────────────

export type RoomKey = 'bedroom' | 'livingroom' | 'kitchen' | 'keller' | 'garage' | 'office' | 'other'

export const ROOMS: { key: RoomKey; label: string; code: string }[] = [
  { key: 'bedroom',    label: 'Bedroom',      code: 'BED' },
  { key: 'livingroom', label: 'Living Room',  code: 'LIV' },
  { key: 'kitchen',    label: 'Kitchen',      code: 'KIT' },
  { key: 'keller',     label: 'Keller / Cave',code: 'KEL' },
  { key: 'garage',     label: 'Garage',       code: 'GAR' },
  { key: 'office',     label: 'Office',       code: 'OFF' },
  { key: 'other',      label: 'Other',        code: 'OTH' },
]

export const ROOM_CODE: Record<RoomKey, string> = {
  bedroom:    'BED',
  livingroom: 'LIV',
  kitchen:    'KIT',
  keller:     'KEL',
  garage:     'GAR',
  office:     'OFF',
  other:      'OTH',
}

export const ROOM_COLORS: Record<string, string> = {
  bedroom:    '#8B5CF6',
  livingroom: '#3B82F6',
  kitchen:    '#F59E0B',
  keller:     '#6B7280',
  garage:     '#10B981',
  office:     '#EF4444',
  other:      '#94A3B8',
}

export interface Box {
  id: string
  user_id: string
  box_id: string        // e.g. "kitchen-bx03"
  box_number: number
  room_name: string
  contents: string | null
  is_fragile: boolean
}

export interface BoxFormData {
  room_key: RoomKey
  contents: string
  is_fragile: boolean
}
