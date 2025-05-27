// src/components/notes/NotesEditor.tsx
'use client'

import { useState, useRef } from 'react'
import { 
  Bold, Italic, List, ListOrdered, Quote, Code, Link, 
  Eye, Edit3, CheckSquare, Image, Table
} from 'lucide-react'

interface NotesEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
}

export function NotesEditor({ 
  content, 
  onChange, 
  placeholder = "Beginnen Sie zu schreiben...", 
  editable = true 
}: NotesEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    onChange(newText)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const formatText = (type: string) => {
    switch (type) {
      case 'bold':
        insertAtCursor('**', '**')
        break
      case 'italic':
        insertAtCursor('*', '*')
        break
      case 'heading1':
        insertAtCursor('# ')
        break
      case 'heading2':
        insertAtCursor('## ')
        break
      case 'heading3':
        insertAtCursor('### ')
        break
      case 'bulletList':
        insertAtCursor('- ')
        break
      case 'orderedList':
        insertAtCursor('1. ')
        break
      case 'quote':
        insertAtCursor('> ')
        break
      case 'code':
        insertAtCursor('`', '`')
        break
      case 'codeBlock':
        insertAtCursor('```\n', '\n```')
        break
      case 'link':
        insertAtCursor('[', '](url)')
        break
      case 'image':
        insertAtCursor('![alt](', ')')
        break
      case 'table':
        insertAtCursor('\n| Spalte 1 | Spalte 2 | Spalte 3 |\n|----------|----------|----------|\n| Zeile 1  | Daten    | Daten    |\n| Zeile 2  | Daten    | Daten    |\n')
        break
      case 'checkbox':
        insertAtCursor('- [ ] ')
        break
    }
  }

  // Simple Markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Links  
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg shadow-sm" />')
      
      // Checkboxes
      .replace(/^- \[ \] (.*)$/gm, '<div class="flex items-center my-1"><input type="checkbox" class="mr-2 rounded" disabled> <span class="text-gray-700">$1</span></div>')
      .replace(/^- \[x\] (.*)$/gm, '<div class="flex items-center my-1"><input type="checkbox" checked class="mr-2 rounded" disabled> <span class="text-gray-700 line-through">$1</span></div>')
      
      // Lists
      .replace(/^- (.*)$/gm, '<li class="text-gray-700 mb-1">$1</li>')
      .replace(/^(\d+)\. (.*)$/gm, '<li class="text-gray-700 mb-1">$2</li>')
      
      // Quotes - Fixed escaping issue
      .replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      
      // Line breaks
      .replace(/\n/g, '<br>')
      
      // Wrap lists
      .replace(/(<li class="text-gray-700 mb-1">.*<\/li>)/g, '<ul class="list-disc list-inside my-4 space-y-1">$1</ul>')
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* Text Formatting */}
              <button
                onClick={() => formatText('bold')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Fett (**text**)"
              >
                <Bold size={16} />
              </button>
              
              <button
                onClick={() => formatText('italic')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Kursiv (*text*)"
              >
                <Italic size={16} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Headers */}
              <button
                onClick={() => formatText('heading1')}
                className="px-3 py-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold text-gray-600"
                title="Überschrift 1 (# text)"
              >
                H1
              </button>
              
              <button
                onClick={() => formatText('heading2')}
                className="px-3 py-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold text-gray-600"
                title="Überschrift 2 (## text)"
              >
                H2
              </button>
              
              <button
                onClick={() => formatText('heading3')}
                className="px-3 py-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold text-gray-600"
                title="Überschrift 3 (### text)"
              >
                H3
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Lists */}
              <button
                onClick={() => formatText('bulletList')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Aufzählungsliste (- text)"
              >
                <List size={16} />
              </button>

              <button
                onClick={() => formatText('orderedList')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Nummerierte Liste (1. text)"
              >
                <ListOrdered size={16} />
              </button>

              <button
                onClick={() => formatText('checkbox')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Checkbox (- [ ] text)"
              >
                <CheckSquare size={16} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Other */}
              <button
                onClick={() => formatText('quote')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Zitat (> text)"
              >
                <Quote size={16} />
              </button>

              <button
                onClick={() => formatText('code')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Code (`code`)"
              >
                <Code size={16} />
              </button>

              <button
                onClick={() => formatText('link')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Link ([text](url))"
              >
                <Link size={16} />
              </button>

              <button
                onClick={() => formatText('image')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Bild (![alt](url))"
              >
                <Image size={16} />
              </button>

              <button
                onClick={() => formatText('table')}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600"
                title="Tabelle"
              >
                <Table size={16} />
              </button>
            </div>

            {/* Preview Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  !isPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit3 size={14} className="inline mr-1" />
                Bearbeiten
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye size={14} className="inline mr-1" />
                Vorschau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          /* Preview Mode */
          <div className="h-full overflow-y-auto p-6">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          </div>
        ) : (
          /* Edit Mode */
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-6 border-none outline-none resize-none font-mono text-sm leading-relaxed"
            style={{ minHeight: '100%' }}
          />
        )}
      </div>

      {/* Help Text */}
      {editable && !isPreview && (
        <div className="border-t border-gray-100 px-6 py-2 bg-gray-50">
          <p className="text-xs text-gray-500">
            <strong>Markdown Shortcuts:</strong> **fett**, *kursiv*, # Überschrift, - Liste, &gt; Zitat, `code`, [Link](url)
          </p>
        </div>
      )}
    </div>
  )
}