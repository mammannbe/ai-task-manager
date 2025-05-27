// src/components/tasks/TaskPlanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, TASK_CATEGORIES, getPriorityInfo } from '@/lib/types'
import { 
  Calendar, Clock, Tag, Zap, Battery, Sun, Moon, Sunset,
  Plus, Save, X, AlertTriangle, CheckCircle, ArrowRight,
  Repeat, Link as LinkIcon, MapPin
} from 'lucide-react'

interface TaskPlannerProps {
  onTasksUpdated: () => Promise<void>
  existingTasks: Task[]
}

export function TaskPlanner({ onTasksUpdated, existingTasks }: TaskPlannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [planningMode, setPlanningMode] = useState<'auto' | 'manual'>('auto')
  const [planningDate, setPlanningDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [availableHours, setAvailableHours] = useState(8)
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' })
  const [isPlanning, setIsPlanning] = useState(false)
  const [plannedSchedule, setPlannedSchedule] = useState<{
    task: Task
    startTime: string
    endTime: string
    reason: string
  }[]>([])

  // Automatische Kategorisierung basierend auf Titel und Kontext
  const categorizeTasks = async () => {
    const unCategorizedTasks = existingTasks.filter(
      task => task.category === 'other' || !task.urgency || !task.importance
    )

    if (unCategorizedTasks.length === 0) return

    setIsPlanning(true)
    
    try {
      const response = await fetch('/api/categorize-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: unCategorizedTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            context: task.context
          }))
        })
      })

      if (!response.ok) throw new Error('Kategorisierung fehlgeschlagen')

      const { categorizedTasks } = await response.json()

      // Tasks in Supabase aktualisieren
      for (const taskUpdate of categorizedTasks) {
        await supabase
          .from('tasks')
          .update({
            category: taskUpdate.category,
            urgency: taskUpdate.urgency,
            importance: taskUpdate.importance,
            energy_level: taskUpdate.energy_level,
            time_of_day: taskUpdate.time_of_day,
            tags: taskUpdate.tags
          })
          .eq('id', taskUpdate.id)
      }

      onTasksUpdated()
    } catch (error) {
      console.error('Kategorisierung Fehler:', error)
    } finally {
      setIsPlanning(false)
    }
  }

  // Intelligente Tagesplanung
  const planDay = async () => {
    const openTasks = existingTasks.filter(task => task.status === 'open')
    
    if (openTasks.length === 0) {
      alert('Keine offenen Tasks zum Planen vorhanden')
      return
    }

    setIsPlanning(true)

    try {
      const response = await fetch('/api/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: openTasks,
          planningDate,
          availableHours,
          workingHours,
          preferences: {
            preferMorning: true,
            groupSimilarTasks: true,
            considerEnergyLevels: true
          }
        })
      })

      if (!response.ok) throw new Error('Tagesplanung fehlgeschlagen')

      const { schedule } = await response.json()
      setPlannedSchedule(schedule)
    } catch (error) {
      console.error('Planungsfehler:', error)
    } finally {
      setIsPlanning(false)
    }
  }

  // Tasks in Kalender eintragen
  const scheduleInCalendar = async () => {
    if (plannedSchedule.length === 0) return

    setIsPlanning(true)

    try {
      const response = await fetch('/api/schedule-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: plannedSchedule,
          date: planningDate
        })
      })

      if (!response.ok) throw new Error('Kalender-Integration fehlgeschlagen')

      const { scheduledEvents } = await response.json()

      // Task-IDs mit Calendar Event IDs verknüpfen
      for (const event of scheduledEvents) {
        await supabase
          .from('tasks')
          .update({
            calendar_event_id: event.calendar_event_id,
            due_date: event.scheduled_time
          })
          .eq('id', event.task_id)
      }

      onTasksUpdated()
      setPlannedSchedule([])
      alert(`${scheduledEvents.length} Tasks erfolgreich im Kalender geplant!`)
    } catch (error) {
      console.error('Kalender-Fehler:', error)
      alert('Fehler beim Eintragen in den Kalender')
    } finally {
      setIsPlanning(false)
    }
  }

  // Matrix-Ansicht: Eisenhower-Matrix
  const renderEisenhowerMatrix = () => {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Urgent + Important */}
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Dringend + Wichtig
          </h4>
          <div className="space-y-2">
            {existingTasks.filter(task => 
              task.priority >= 3 && (task.urgency === 'high' || task.urgency === 'critical')
            ).map(task => (
              <div key={task.id} className="p-2 bg-white rounded border text-sm">
                <span className="font-medium">{task.title}</span>
                {task.due_date && (
                  <div className="text-xs text-red-600 mt-1">
                    Fällig: {new Date(task.due_date).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Not Urgent + Important */}
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Wichtig + Planbar
          </h4>
          <div className="space-y-2">
            {existingTasks.filter(task => 
              task.priority >= 3 && (task.urgency === 'low' || task.urgency === 'medium' || !task.urgency)
            ).map(task => (
              <div key={task.id} className="p-2 bg-white rounded border text-sm">
                <span className="font-medium">{task.title}</span>
                {task.estimated_minutes && (
                  <div className="text-xs text-blue-600 mt-1">
                    ~{Math.round(task.estimated_minutes / 60)}h
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Urgent + Not Important */}
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Dringend + Delegierbar
          </h4>
          <div className="space-y-2">
            {existingTasks.filter(task => 
              task.priority <= 2 && (task.urgency === 'high' || task.urgency === 'critical')
            ).map(task => (
              <div key={task.id} className="p-2 bg-white rounded border text-sm">
                <span className="font-medium">{task.title}</span>
                <div className="text-xs text-yellow-600 mt-1">
                  Kategorie: {TASK_CATEGORIES[task.category]?.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Not Urgent + Not Important */}
        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-600 mb-2 flex items-center">
            <Battery className="w-4 h-4 mr-2" />
            Niedrige Priorität
          </h4>
          <div className="space-y-2">
            {existingTasks.filter(task => 
              task.priority <= 2 && (task.urgency === 'low' || task.urgency === 'medium' || !task.urgency)
            ).map(task => (
              <div key={task.id} className="p-2 bg-white rounded border text-sm">
                <span className="font-medium">{task.title}</span>
                <div className="text-xs text-gray-500 mt-1">
                  Bei Zeit erledigen
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Task Planer öffnen"
      >
        <Calendar className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎯 Intelligenter Task Planer</h2>
            <p className="text-gray-600 mt-1">Kategorisierung, Priorisierung und Kalender-Integration</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={categorizeTasks}
              disabled={isPlanning}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Tag className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-800">Auto-Kategorisierung</h3>
              <p className="text-sm text-blue-600 mt-1">
                KI analysiert und kategorisiert Tasks automatisch
              </p>
            </button>

            <button
              onClick={planDay}
              disabled={isPlanning}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <Clock className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-800">Tagesplanung</h3>
              <p className="text-sm text-green-600 mt-1">
                Intelligente Zeitplanung basierend auf Prioritäten
              </p>
            </button>

            <button
              onClick={scheduleInCalendar}
              disabled={isPlanning || plannedSchedule.length === 0}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-800">Kalender-Sync</h3>
              <p className="text-sm text-purple-600 mt-1">
                Termine automatisch in Google Calendar eintragen
              </p>
            </button>
          </div>

          {/* Planning Settings */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Planungseinstellungen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planungsdatum
                </label>
                <input
                  type="date"
                  value={planningDate}
                  onChange={(e) => setPlanningDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verfügbare Stunden
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arbeitszeiten
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={workingHours.start}
                    onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="time"
                    value={workingHours.end}
                    onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Eisenhower Matrix */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Eisenhower-Matrix</h3>
            {renderEisenhowerMatrix()}
          </div>

          {/* Planned Schedule */}
          {plannedSchedule.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">📅 Geplanter Tagesablauf für {new Date(planningDate).toLocaleDateString('de-DE')}</h3>
              <div className="space-y-3">
                {plannedSchedule.map((item, index) => (
                  <div key={index} className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-blue-800">
                          {item.startTime} - {item.endTime}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityInfo(item.task.priority).color}`}>
                          {getPriorityInfo(item.task.priority).label}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{item.task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {TASK_CATEGORIES[item.task.category]?.icon} {TASK_CATEGORIES[item.task.category]?.label}
                      </div>
                      {item.task.estimated_minutes && (
                        <div className="text-xs text-gray-400 mt-1">
                          ~{Math.round(item.task.estimated_minutes / 60)}h
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex gap-4">
                <button
                  onClick={scheduleInCalendar}
                  disabled={isPlanning}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  In Kalender eintragen
                </button>
                <button
                  onClick={() => setPlannedSchedule([])}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Planung verwerfen
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isPlanning && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-blue-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>KI analysiert und plant Ihre Tasks...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}