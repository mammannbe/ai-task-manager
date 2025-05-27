// src/lib/types.ts
export interface Task {
  id?: string
  title: string
  description?: string  // Optional, kann undefined sein
  priority: number  // INTEGER in Datenbank: 1=low, 2=medium, 3=high, 4=critical
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  estimated_minutes?: number
  category: 'work' | 'personal' | 'shopping' | 'health' | 'finance' | 'communication' | 'travel' | 'other'
  tags?: string[]
  context?: string
  user_id: string
  created_at?: string
  updated_at?: string
  // Neue Felder für erweiterte Planung
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  importance?: 'low' | 'medium' | 'high' | 'critical'
  energy_level?: 'low' | 'medium' | 'high'
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'any'
  dependencies?: string[] // IDs anderer Tasks
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    end_date?: string
  }
  calendar_event_id?: string // Google Calendar Event ID
}

export interface Note {
  id?: string
  title: string
  content: string
  notebook_id: string
  user_id: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface Notebook {
  id?: string
  title: string
  description?: string
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray'
  user_id: string
  created_at?: string
  updated_at?: string
}

// Helper-Funktionen für Priority-Mapping
export const PRIORITY_MAP = {
  1: { text: 'low', label: 'Niedrig', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  2: { text: 'medium', label: 'Mittel', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  3: { text: 'high', label: 'Hoch', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  4: { text: 'critical', label: 'Kritisch', color: 'bg-red-100 text-red-700 border-red-200' }
} as const

export const getPriorityInfo = (priority: number) => {
  return PRIORITY_MAP[priority as keyof typeof PRIORITY_MAP] || PRIORITY_MAP[2]
}

// Kategorien mit Icons und Farben
export const TASK_CATEGORIES = {
  work: { icon: '💼', label: 'Arbeit', color: 'blue' },
  personal: { icon: '👤', label: 'Privat', color: 'green' },
  shopping: { icon: '🛒', label: 'Einkaufen', color: 'purple' },
  health: { icon: '🏥', label: 'Gesundheit', color: 'red' },
  finance: { icon: '💰', label: 'Finanzen', color: 'yellow' },
  communication: { icon: '📞', label: 'Kommunikation', color: 'indigo' },
  travel: { icon: '✈️', label: 'Reisen', color: 'pink' },
  other: { icon: '📋', label: 'Sonstiges', color: 'gray' }
} as const