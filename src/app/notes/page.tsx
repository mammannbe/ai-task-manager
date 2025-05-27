// src/app/notes/page.tsx - Mit Supabase Integration
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Header } from '@/components/layout/Header'
import { NotesEditor } from '@/components/notes/NotesEditor'
import { 
  BookOpen, Plus, Search, Edit3, Trash2, Save, X, 
  FileText, Folder, FolderPlus, Eye, Hash, Loader, AlertCircle
} from 'lucide-react'

interface Note {
  id: string;
  title: string;
  content: string;
  notebook_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Notebook {
  id: string;
  title: string;
  description?: string;
  color: string;
  created_at: string;
  user_id: string;
}

export default function NotesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNotebookTitle, setNewNotebookTitle] = useState('')
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [saving, setSaving] = useState(false)

  const supabase = createClientComponentClient()

  // Initialize
  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadNotebooks()
    }
  }, [user])

  useEffect(() => {
    if (selectedNotebook) {
      loadNotes(selectedNotebook.id)
    }
  }, [selectedNotebook])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser({ id: 'demo-user', email: 'demo@example.com' })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setUser({ id: 'demo-user', email: 'demo@example.com' })
    } finally {
      setLoading(false)
    }
  }

  const loadNotebooks = async () => {
    try {
      setError(null)
      console.log('Loading notebooks for user:', user?.id)

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Load notebooks error:', error)
        setError(`Fehler beim Laden der Notizbücher: ${error.message}`)
        return
      }

      console.log('Notebooks loaded:', data?.length || 0)
      setNotebooks(data || [])

      // Erstes Notebook automatisch auswählen
      if (data && data.length > 0) {
        setSelectedNotebook(data[0])
      } else {
        // Standard-Notebook erstellen wenn keins existiert
        await createDefaultNotebook()
      }

    } catch (error) {
      console.error('Load notebooks error:', error)
      setError('Unbekannter Fehler beim Laden der Notizbücher')
    }
  }

  const createDefaultNotebook = async () => {
    try {
      const defaultNotebook = {
        title: 'Meine Notizen',
        description: 'Standard Notizbuch',
        color: 'blue',
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('notebooks')
        .insert([defaultNotebook])
        .select()
        .single()

      if (error) throw error

      setNotebooks([data])
      setSelectedNotebook(data)
      console.log('Default notebook created:', data)

    } catch (error) {
      console.error('Create default notebook error:', error)
    }
  }

  const loadNotes = async (notebookId: string) => {
    try {
      setError(null)
      console.log('Loading notes for notebook:', notebookId)

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Load notes error:', error)
        setError(`Fehler beim Laden der Notizen: ${error.message}`)
        return
      }

      console.log('Notes loaded:', data?.length || 0)
      setNotes(data || [])

    } catch (error) {
      console.error('Load notes error:', error)
      setError('Unbekannter Fehler beim Laden der Notizen')
    }
  }

  const createNotebook = async () => {
    if (!newNotebookTitle.trim()) return
    
    try {
      setSaving(true)
      setError(null)

      const newNotebook = {
        title: newNotebookTitle.trim(),
        description: '',
        color: 'blue',
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('notebooks')
        .insert([newNotebook])
        .select()
        .single()

      if (error) throw error

      setNotebooks([...notebooks, data])
      setNewNotebookTitle('')
      setIsCreatingNotebook(false)
      setSelectedNotebook(data)
      console.log('Notebook created:', data)

    } catch (error) {
      console.error('Create notebook error:', error)
      setError('Fehler beim Erstellen des Notizbuchs')
    } finally {
      setSaving(false)
    }
  }

  const saveNote = async () => {
    if (!newNoteTitle.trim() || !selectedNotebook) return
    
    try {
      setSaving(true)
      setError(null)

      const newNote = {
        title: newNoteTitle.trim(),
        content: newNoteContent,
        notebook_id: selectedNotebook.id,
        tags: [],
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single()

      if (error) throw error

      setNotes([data, ...notes])
      setIsCreatingNote(false)
      setNewNoteTitle('')
      setNewNoteContent('')
      setSelectedNote(data)
      console.log('Note created:', data)

    } catch (error) {
      console.error('Create note error:', error)
      setError('Fehler beim Erstellen der Notiz')
    } finally {
      setSaving(false)
    }
  }

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)

      if (error) throw error

      // UI sofort aktualisieren
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
      ))
      
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, ...updates, updated_at: new Date().toISOString() })
      }

      console.log('Note updated:', noteId)

    } catch (error) {
      console.error('Update note error:', error)
      setError('Fehler beim Speichern der Notiz')
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Notiz wirklich löschen?')) return
    
    try {
      setError(null)

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(notes.filter(note => note.id !== noteId))
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
      }
      console.log('Note deleted:', noteId)

    } catch (error) {
      console.error('Delete note error:', error)
      setError('Fehler beim Löschen der Notiz')
    }
  }

  const deleteNotebook = async (notebookId: string) => {
    if (!confirm('Notizbuch und alle enthaltenen Notizen löschen?')) return
    
    try {
      setError(null)

      // Erst alle Notizen löschen
      const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('notebook_id', notebookId)

      if (notesError) throw notesError

      // Dann das Notizbuch löschen
      const { error: notebookError } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', notebookId)

      if (notebookError) throw notebookError

      setNotebooks(notebooks.filter(nb => nb.id !== notebookId))
      setNotes(notes.filter(note => note.notebook_id !== notebookId))
      
      if (selectedNotebook?.id === notebookId) {
        const remainingNotebooks = notebooks.filter(nb => nb.id !== notebookId)
        setSelectedNotebook(remainingNotebooks[0] || null)
        setSelectedNote(null)
      }

      console.log('Notebook deleted:', notebookId)

    } catch (error) {
      console.error('Delete notebook error:', error)
      setError('Fehler beim Löschen des Notizbuchs')
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery ? 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchesSearch
  })

  const getColorClasses = (color: string): string => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[color] || colors.blue
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Lade Notizen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      {/* Fehler-Anzeige */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex h-[calc(100vh-89px)]">
        {/* Sidebar - Notebooks & Notes */}
        <aside className="w-80 bg-white border-r border-gray-200">
          {/* Notebooks Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Folder className="w-4 h-4 mr-2" />
                Notizbücher ({notebooks.length})
              </h3>
              <button 
                onClick={() => setIsCreatingNotebook(true)}
                disabled={saving}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Neues Notizbuch"
              >
                <FolderPlus size={16} />
              </button>
            </div>
            
            {isCreatingNotebook && (
              <div className="mb-3 p-2 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Notizbuch Name..."
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  className="w-full p-2 text-sm border-none outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && createNotebook()}
                  disabled={saving}
                />
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={createNotebook}
                    disabled={saving || !newNotebookTitle.trim()}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                  <button
                    onClick={() => {setIsCreatingNotebook(false); setNewNotebookTitle('')}}
                    disabled={saving}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {notebooks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Keine Notizbücher vorhanden</p>
              ) : (
                notebooks.map(notebook => (
                  <div key={notebook.id} className="group">
                    <button
                      onClick={() => {setSelectedNotebook(notebook); setSelectedNote(null)}}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedNotebook?.id === notebook.id 
                          ? getColorClasses(notebook.color)
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <div className={`w-3 h-3 rounded mr-3 bg-${notebook.color}-500`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{notebook.title}</h4>
                          <p className="text-xs text-gray-500 truncate">{notebook.description}</p>
                        </div>
                      </div>
                      {notebooks.length > 1 && (
                        <button
                          onClick={(e) => {e.stopPropagation(); deleteNotebook(notebook.id)}}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                          title="Löschen"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Notizen
                {selectedNotebook && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({filteredNotes.length})
                  </span>
                )}
              </h4>
              <button 
                onClick={() => setIsCreatingNote(true)}
                disabled={!selectedNotebook || saving}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Neue Notiz"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Notizen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {!selectedNotebook ? (
                <p className="text-sm text-gray-500 text-center py-4">Wählen Sie ein Notizbuch aus</p>
              ) : filteredNotes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchQuery ? 'Keine Notizen gefunden' : 'Keine Notizen vorhanden'}
                </p>
              ) : (
                filteredNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group ${
                      selectedNote?.id === note.id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-gray-900 truncate mb-1">{note.title}</h5>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {note.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(note.updated_at).toLocaleDateString('de-DE')}
                          </span>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1">
                              {note.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {e.stopPropagation(); deleteNote(note.id)}}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity ml-2"
                        title="Löschen"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Content - Notes Editor */}
        <main className="flex-1 flex flex-col">
          {isCreatingNote ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Notiz Titel..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="text-xl font-semibold border-none outline-none flex-1 mr-4"
                    disabled={saving}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={saveNote}
                      disabled={saving || !newNoteTitle.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {saving ? <Loader size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                      Speichern
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingNote(false);
                        setNewNoteTitle('');
                        setNewNoteContent('');
                      }}
                      disabled={saving}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <NotesEditor
                  content={newNoteContent}
                  onChange={setNewNoteContent}
                  placeholder="Schreiben Sie hier Ihre Notiz..."
                />
              </div>
            </div>
          ) : selectedNote ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedNote.title}</h2>
                    <p className="text-sm text-gray-500">
                      Zuletzt bearbeitet: {new Date(selectedNote.updated_at).toLocaleDateString('de-DE')} um {new Date(selectedNote.updated_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <Edit3 size={16} className="mr-2" />
                      Bearbeiten
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <NotesEditor
                  content={selectedNote.content}
                  onChange={(content: string) => updateNote(selectedNote.id, { content })}
                  placeholder=""
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center">
                <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Notiz ausgewählt</h3>
                <p className="text-gray-500 mb-4">
                  {selectedNotebook 
                    ? 'Wählen Sie eine Notiz aus oder erstellen Sie eine neue'
                    : 'Wählen Sie zuerst ein Notizbuch aus'
                  }
                </p>
                {selectedNotebook && (
                  <button
                    onClick={() => setIsCreatingNote(true)}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Neue Notiz erstellen
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}