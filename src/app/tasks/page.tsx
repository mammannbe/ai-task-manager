// src/app/tasks/page.tsx - Mit TaskPlanner Integration
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, TASK_CATEGORIES, getPriorityInfo } from '@/lib/types'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskPlanner } from '@/components/tasks/TaskPlanner'
import { Header } from '@/components/layout/Header'
import { 
  Brain, Plus, Search, Filter, Calendar as CalendarIcon, 
  BarChart3, Clock, CheckCircle2, AlertCircle, Tag,
  SortAsc, SortDesc, Grid3X3, List, Eye, EyeOff
} from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [newTaskInput, setNewTaskInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  
  // Filter und View States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at' | 'title'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCompleted, setShowCompleted] = useState(false)

  const user = { id: 'demo-user', email: 'demo@example.com' }

  // Tasks laden
  const loadTasks = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      console.error('Fehler beim Laden der Tasks:', err)
      setError('Fehler beim Laden der Tasks')
    } finally {
      setLoading(false)
    }
  }

  // Task erstellen mit Claude-Analyse
  const createTask = async (): Promise<void> => {
    if (!newTaskInput.trim()) return

    setIsAnalyzing(true)
    setError('') // Clear previous errors
    
    try {
      console.log('🚀 Starting task creation with text:', newTaskInput)
      
      const response = await fetch('/api/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: newTaskInput,
          userId: user.id 
        })
      })

      console.log('📡 API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(`API Fehler (${response.status}): ${errorData.error || 'Unbekannter Fehler'}`)
      }

      const result = await response.json()
      console.log('✅ API Success:', result)
      
      if (result.tasks && result.tasks.length > 0) {
        console.log(`📝 Created ${result.tasks.length} tasks`)
        await loadTasks()
        setNewTaskInput('')
        setError(`✅ ${result.tasks.length} Tasks erfolgreich erstellt!`)
        
        // Success message nach 3 Sekunden entfernen
        setTimeout(() => setError(''), 3000)
      } else {
        throw new Error('Keine Tasks erstellt - prüfen Sie die API Response')
      }
      
    } catch (err) {
      console.error('💥 Task-Erstellung Fehler:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setError(`Fehler beim Erstellen der Tasks: ${errorMessage}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Task aktualisieren
  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error
      await loadTasks()
    } catch (err) {
      console.error('Task-Update Fehler:', err)
      setError('Fehler beim Aktualisieren des Tasks')
    }
  }

  // Task löschen
  const deleteTask = async (taskId: string): Promise<void> => {
    if (!confirm('Task wirklich löschen?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      await loadTasks()
    } catch (err) {
      console.error('Task-Löschung Fehler:', err)
      setError('Fehler beim Löschen des Tasks')
    }
  }

  // Filtering und Sorting
  useEffect(() => {
    let filtered = tasks.filter(task => {
      // Suchterm Filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !(task.description?.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false
      }

      // Kategorie Filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false
      }

      // Priorität Filter
      if (selectedPriority !== 'all' && task.priority.toString() !== selectedPriority) {
        return false
      }

      // Status Filter
      if (selectedStatus !== 'all' && task.status !== selectedStatus) {
        return false
      }

      // Abgeschlossene Tasks verstecken
      if (!showCompleted && task.status === 'completed') {
        return false
      }

      return true
    })

    // Sortierung
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date) : new Date('2099-12-31')
          bValue = b.due_date ? new Date(b.due_date) : new Date('2099-12-31')
          break
        case 'priority':
          const priorityOrder = { 1: 1, 2: 2, 3: 3, 4: 4 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 2
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 2
          break
        case 'created_at':
          aValue = new Date(a.created_at || 0)
          bValue = new Date(b.created_at || 0)
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          aValue = a.title
          bValue = b.title
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, selectedCategory, selectedPriority, selectedStatus, sortBy, sortOrder, showCompleted])

  useEffect(() => {
    loadTasks()
  }, [])

  // Statistiken berechnen
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    open: tasks.filter(t => t.status === 'open').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
    high_priority: tasks.filter(t => [3, 4].includes(t.priority) && t.status !== 'completed').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg">Tasks werden geladen...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} taskStats={{ completed: stats.completed, open: stats.open }} />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Error/Success Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            error.startsWith('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error.startsWith('✅') ? (
              <CheckCircle2 className="w-5 h-5 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            <div className="flex-1">
              <div className="font-medium">
                {error.startsWith('✅') ? 'Erfolg!' : 'Fehler aufgetreten'}
              </div>
              <div className="text-sm mt-1">{error}</div>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">✅ Task Manager</h1>
            <p className="text-gray-600 mt-1">
              {stats.open} offen • {stats.completed} erledigt • {stats.overdue} überfällig
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
              <div className="text-xs text-gray-500">Offen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-500">Erledigt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-xs text-gray-500">Überfällig</div>
            </div>
          </div>
        </div>

        {/* Task Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Beschreiben Sie Ihre Aufgaben in natürlicher Sprache... 
Beispiel: 'Morgen um 14:00 Zahnarzttermin, dann Lisa anrufen wegen Budget-Meeting nächste Woche'"
                className="w-full p-4 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAnalyzing}
              />
            </div>
            <button
              onClick={createTask}
              disabled={isAnalyzing || !newTaskInput.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analysiert...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Mit Claude analysieren</span>
                </>
              )}
            </button>
          </div>
          
          {/* Quick Examples */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Beispiele:</span>
            <button
              onClick={() => setNewTaskInput('Morgen einkaufen gehen, dann Lisa anrufen')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={isAnalyzing}
            >
              💼 Arbeitsaufgaben
            </button>
            <button
              onClick={() => setNewTaskInput('Wocheneinkauf erledigen, Rechnung bezahlen')}
              className="text-sm text-green-600 hover:text-green-800 underline"
              disabled={isAnalyzing}
            >
              🏠 Private Erledigungen
            </button>
          </div>
        </div>

        {/* Filters und Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tasks durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Show Completed Toggle */}
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                showCompleted 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {showCompleted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm">Erledigte ({stats.completed})</span>
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Kategorien</option>
              {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Prioritäten</option>
              <option value="4">🔴 Kritisch</option>
              <option value="3">🟠 Hoch</option>
              <option value="2">🟡 Mittel</option>
              <option value="1">⚪ Niedrig</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="open">🔵 Offen</option>
              <option value="in_progress">🟡 In Bearbeitung</option>
              <option value="completed">✅ Erledigt</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as any)
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority-desc">Priorität (Hoch → Niedrig)</option>
              <option value="priority-asc">Priorität (Niedrig → Hoch)</option>
              <option value="due_date-asc">Fälligkeitsdatum (Früh → Spät)</option>
              <option value="due_date-desc">Fälligkeitsdatum (Spät → Früh)</option>
              <option value="created_at-desc">Erstellt (Neu → Alt)</option>
              <option value="created_at-asc">Erstellt (Alt → Neu)</option>
              <option value="title-asc">Titel (A → Z)</option>
              <option value="title-desc">Titel (Z → A)</option>
            </select>
          </div>
        </div>

        {/* Tasks List/Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              {tasks.length === 0 ? 'Keine Tasks vorhanden' : 'Keine passenden Tasks gefunden'}
            </h3>
            <p className="text-gray-400">
              {tasks.length === 0 
                ? 'Erstellen Sie Ihre erste Aufgabe mit dem Claude-Analyzer oben'
                : 'Versuchen Sie andere Filter oder Suchbegriffe'}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isEditing={editingTask === task.id}
                onToggleEdit={(id: string) => setEditingTask(editingTask === id ? null : id)}
                onUpdate={async (updates: Partial<Task>) => await updateTask(task.id!, updates)}
                onDelete={async (id: string) => await deleteTask(id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Task Statistics Footer */}
        {tasks.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Produktivitäts-Übersicht
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Abschlussrate</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">{stats.overdue}</div>
                <div className="text-sm text-gray-600">Überfällige Tasks</div>
                <div className="text-xs text-red-500 mt-1">
                  {stats.overdue > 0 ? 'Benötigen Aufmerksamkeit!' : 'Alles im Plan 👍'}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">{stats.high_priority}</div>
                <div className="text-sm text-gray-600">Hohe Priorität</div>
                <div className="text-xs text-orange-500 mt-1">
                  Fokus auf diese Tasks
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {tasks.filter(t => t.estimated_minutes).reduce((acc, t) => acc + (t.estimated_minutes || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Gesamte Minuten</div>
                <div className="text-xs text-green-500 mt-1">
                  ≈ {Math.round(tasks.filter(t => t.estimated_minutes).reduce((acc, t) => acc + (t.estimated_minutes || 0), 0) / 60)} Stunden
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Kategorien-Verteilung</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(
                  tasks.reduce((acc, task) => {
                    acc[task.category] = (acc[task.category] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    <span>{TASK_CATEGORIES[category as keyof typeof TASK_CATEGORIES]?.icon}</span>
                    <span className="font-medium">{count}</span>
                    <span className="text-gray-600">
                      {TASK_CATEGORIES[category as keyof typeof TASK_CATEGORIES]?.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Planner Component */}
      <TaskPlanner 
        onTasksUpdated={loadTasks}
        existingTasks={tasks}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-gray-500">
            🤖 Powered by Claude 3.5 Sonnet • 🗄️ Supabase Database • ⚡ Next.js & TypeScript
          </div>
        </div>
      </footer>
    </div>
  )
}