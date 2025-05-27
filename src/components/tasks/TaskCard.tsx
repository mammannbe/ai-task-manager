// src/components/tasks/TaskCard.tsx
'use client'

import { useState } from 'react'
import { Task, TASK_CATEGORIES, getPriorityInfo } from '@/lib/types'
import { 
  Calendar, Clock, Edit2, Trash2, Save, X, 
  CheckCircle2, Circle, AlertCircle, Tag
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  isEditing: boolean
  onToggleEdit: (id: string) => void
  onUpdate: (updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  viewMode: 'grid' | 'list'
}

export function TaskCard({ 
  task, 
  isEditing, 
  onToggleEdit, 
  onUpdate, 
  onDelete, 
  viewMode 
}: TaskCardProps) {
  const [editData, setEditData] = useState<{
    title: string
    description: string
    priority: number
    category: Task['category']
    due_date: string
    estimated_minutes: number
  }>({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    category: task.category,
    due_date: task.due_date || '',
    estimated_minutes: task.estimated_minutes || 60
  })

  const handleSave = async () => {
    await onUpdate({
      title: editData.title,
      description: editData.description || undefined,
      priority: editData.priority,
      category: editData.category,
      due_date: editData.due_date || undefined,
      estimated_minutes: editData.estimated_minutes
    })
    onToggleEdit(task.id!)
  }

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      due_date: task.due_date || '',
      estimated_minutes: task.estimated_minutes || 60
    })
    onToggleEdit(task.id!)
  }

  const toggleStatus = async () => {
    const newStatus: Task['status'] = task.status === 'completed' ? 'open' : 'completed'
    await onUpdate({ status: newStatus })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  const categoryInfo = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.other
  const priorityInfo = getPriorityInfo(task.priority)

  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
        task.status === 'completed' ? 'opacity-60' : ''
      } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          {/* Status Toggle */}
          <button
            onClick={toggleStatus}
            className="flex-shrink-0"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Task-Titel"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: Number(e.target.value) })}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value={1}>Niedrig</option>
                    <option value={2}>Mittel</option>
                    <option value={3}>Hoch</option>
                    <option value={4}>Kritisch</option>
                  </select>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value as Task['category'] })}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <h3 className={`font-medium text-gray-900 ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3">
            {/* Category */}
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <span>{categoryInfo.icon}</span>
              <span className="hidden sm:inline">{categoryInfo.label}</span>
            </span>

            {/* Priority */}
            <span className={`px-2 py-1 text-xs rounded-full border ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>

            {/* Due Date */}
            {task.due_date && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.due_date).toLocaleDateString('de-DE')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Speichern"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-gray-600 hover:text-gray-800"
                    title="Abbrechen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onToggleEdit(task.id!)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id!)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
      task.status === 'completed' ? 'opacity-60' : ''
    } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleStatus}
            className="flex-shrink-0"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryInfo.icon}</span>
            <span className={`px-2 py-1 text-xs rounded-full border ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <button
                onClick={() => onToggleEdit(task.id!)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="Bearbeiten"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id!)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-4">
          <input
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg font-medium"
            placeholder="Task-Titel"
          />
          
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20"
            placeholder="Beschreibung (optional)"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value={1}>🟢 Niedrig</option>
                <option value={2}>🟡 Mittel</option>
                <option value={3}>🟠 Hoch</option>
                <option value={4}>🔴 Kritisch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
              <select
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value as Task['category'] })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
              <input
                type="date"
                value={editData.due_date}
                onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geschätzte Zeit (Min)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={editData.estimated_minutes}
                onChange={(e) => setEditData({ ...editData, estimated_minutes: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${
            task.status === 'completed' ? 'line-through' : ''
          }`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="space-y-2">
            {task.due_date && (
              <div className={`flex items-center gap-2 text-sm ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>{new Date(task.due_date).toLocaleDateString('de-DE')}</span>
                {isOverdue && <AlertCircle className="w-4 h-4" />}
              </div>
            )}
            
            {task.estimated_minutes && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{task.estimated_minutes} Min</span>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Tag className="w-4 h-4" />
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Erstellt: {task.created_at ? new Date(task.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
            {task.context && (
              <div className="mt-1 italic">"{task.context}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}