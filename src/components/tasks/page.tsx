// src/app/tasks/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { TaskCard } from '@/components/tasks/TaskCard'
import { 
  Brain, Plus, Calendar, Clock, CheckCircle, Circle, Loader, 
  Edit2, Trash2, Save, X, User, AlertCircle 
} from 'lucide-react'

interface Task {
  id?: string
  title: string
  description: string
  priority: 1 | 2 | 3
  category: string
  due_date?: string
  estimated_duration?: number
  context: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at?: string
  user_id?: string
}

export default function TasksPage() {
  const [inputText, setInputText] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // User Session prüfen
  useEffect(() => {
    checkUser()
  }, [])

  // Tasks laden wenn User da ist
  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  const checkUser = async () => {
    try {
      // Demo-User für Entwicklung
      setUser({ id: 'demo-user', email: 'demo@example.com' })
    } catch (error) {
      console.error('Auth error:', error)
      setUser({ id: 'demo-user', email: 'demo@example.com' })
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      console.log('Loading tasks for user:', user?.id)
      
      // Hier würde Ihr Supabase Code stehen
      // Für Demo verwenden wir Sample Data
      const sampleTasks = [
        {
          id: '1',
          title: 'Kundenpräsentation fertigstellen',
          description: 'Präsentation für den Kunden muss bis Freitag fertig sein',
          priority: 1 as const,
          category: 'deadline',
          due_date: '2025-01-19',
          status: 'pending' as const,
          estimated_duration: 180,
          context: 'Ich muss bis Freitag die Präsentation für den Kunden fertigstellen',
          created_at: '2025-05-26',
          user_id: 'demo-user'
        },
        {
          id: '2',
          title: 'Team-Meeting',
          description: 'Meeting mit dem Team',
          priority: 2 as const,
          category: 'appointment',
          due_date: '2024-01-16',
          status: 'completed' as const,
          estimated_duration: 60,
          context: 'Meeting mit dem Team morgen um 10 Uhr',
          created_at: '2025-05-26',
          user_id: 'demo-user'
        },
        {
          id: '3',
          title: 'Lisa wegen Budget anrufen',
          description: 'Telefonat mit Lisa bezüglich Budget',
          priority: 2 as const,
          category: 'communication',
          status: 'pending' as const,
          estimated_duration: 15,
          context: 'Lisa wegen dem Budget anrufen',
          created_at: '2025-05-26',
          user_id: 'demo-user'
        }
      ]
      
      console.log('Tasks loaded successfully:', sampleTasks.length)
      setTasks(sampleTasks)
      
    } catch (error) {
      console.error('Load tasks error:', error)
      setTasks([])
    }
  }

  const extractTasks = async () => {
    if (!inputText.trim()) return
    
    setIsAnalyzing(true)
    
    try {
      console.log('1. Starte Claude-Analyse...')
      
      // Hier würde Ihr Claude API Aufruf stehen
      // Für Demo simulieren wir das
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newTask: Task = {
        id: Date.now().toString(),
        title: 'Neue Aufgabe: ' + inputText.substring(0, 50) + '...',
        description: inputText,
        priority: 2,
        category: 'general',
        status: 'pending',
        context: inputText,
        created_at: new Date().toISOString().split('T')[0],
        user_id: user.id
      }
      
      setTasks(prev => [newTask, ...prev])
      setInputText('')
      alert('1 Task erfolgreich erstellt!')
      
    } catch (error) {
      console.error('Gesamter Fehler:', error)
      alert(`Detaillierter Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      console.log('Updating task:', taskId, updates)
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
      
      console.log('Task updated successfully')
    } catch (error) {
      console.error('Update Fehler:', error)
      alert('Fehler beim Aktualisieren')
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    await updateTask(taskId, { status: newStatus })
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Task wirklich löschen?')) return

    try {
      console.log('Deleting task:', taskId)
      
      setTasks(prev => prev.filter(task => task.id !== taskId))
      console.log('Task deleted successfully')
    } catch (error) {
      console.error('Delete Fehler:', error)
      alert('Fehler beim Löschen')
    }
  }

  const getPriorityColor = (priority: number) => {
    switch(priority) {
      case 1: return 'border-red-200 bg-red-50 text-red-800'
      case 2: return 'border-yellow-200 bg-yellow-50 text-yellow-800'  
      case 3: return 'border-green-200 bg-green-50 text-green-800'
      default: return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'work': return '💼'
      case 'personal': return '👤'
      case 'shopping': return '🛒'
      case 'communication': return '📞'
      case 'appointment': return '📅'
      case 'deadline': return '⏰'
      default: return '📋'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const completedTasks = tasks.filter(t => t.status === 'completed')
  const openTasks = tasks.filter(t => t.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        taskStats={{ completed: completedTasks.length, open: openTasks.length }} 
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Input Section */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-blue-500" />
                Neue Aufgaben
              </h2>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Beschreiben Sie Ihre Aufgaben natürlich..."
                className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <button
                onClick={extractTasks}
                disabled={!inputText.trim() || isAnalyzing}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Claude analysiert...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Mit Claude analysieren
                  </>
                )}
              </button>

              {/* Beispiel-Buttons */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 font-medium">Beispiele:</p>
                <button
                  onClick={() => setInputText("Ich muss bis Freitag die Präsentation für den Kunden fertigstellen. Außerdem Meeting mit dem Team morgen um 10 Uhr. Lisa wegen dem Budget anrufen.")}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                >
                  💼 Arbeitsaufgaben
                </button>
                <button
                  onClick={() => setInputText("Einkaufen: Milch, Brot, Äpfel. Zahnarzttermin vereinbaren für nächste Woche. Auto bis Montag zur Inspektion bringen.")}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                >
                  🏠 Private Erledigungen
                </button>
              </div>

              {/* Debug Info */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                <div className="font-medium mb-1">Debug Info:</div>
                <div>User ID: {user?.id}</div>
                <div>Tasks geladen: {tasks.length}</div>
                <div>Status: {loading ? 'Loading...' : 'Ready'}</div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                  Ihre Aufgaben ({tasks.length})
                </div>
                {tasks.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {Math.round((completedTasks.length / tasks.length) * 100)}% erledigt
                  </div>
                )}
              </h2>

              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Noch keine Aufgaben vorhanden</p>
                  <p className="text-gray-400">Geben Sie links Text ein und lassen Sie Claude arbeiten</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isEditing={editingTask === task.id}
                      onToggleEdit={(id) => setEditingTask(editingTask === id ? null : id)}
                      onToggleStatus={() => toggleTaskStatus(task.id!, task.status)}
                      onUpdate={(updates) => updateTask(task.id!, updates)}
                      onDelete={() => deleteTask(task.id!)}
                      getPriorityColor={getPriorityColor}
                      getCategoryIcon={getCategoryIcon}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}