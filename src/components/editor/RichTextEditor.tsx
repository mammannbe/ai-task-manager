// src/components/editor/RichTextEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import TableExtension from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  CheckSquare
} from 'lucide-react'

interface RichTextEditorProps {
  content: any
  onChange: (content: any) => void
  placeholder?: string
  editable?: boolean
}

interface EditorToolbarProps {
  editor: Editor
}

// Toolbar Component
function EditorToolbar({ editor }: EditorToolbarProps) {
  const addImage = () => {
    const url = window.prompt('Bild URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('Link URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Fett (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Kursiv (Ctrl+I)"
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Durchgestrichen"
      >
        <Underline size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-semibold ${
          editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Überschrift 1"
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-semibold ${
          editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Überschrift 2"
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-semibold ${
          editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Überschrift 3"
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Aufzählungsliste"
      >
        <List size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Nummerierte Liste"
      >
        <ListOrdered size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('taskList') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Aufgabenliste"
      >
        <CheckSquare size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Block Elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Zitat"
      >
        <Quote size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Code Block"
      >
        <Code size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Media & Links */}
      <button
        onClick={addImage}
        className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
        title="Bild einfügen"
      >
        <ImageIcon size={16} />
      </button>

      <button
        onClick={addLink}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          editor.isActive('link') ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
        }`}
        title="Link einfügen"
      >
        <LinkIcon size={16} />
      </button>

      <button
        onClick={addTable}
        className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
        title="Tabelle einfügen"
      >
        <TableIcon size={16} />
      </button>
    </div>
  )
}

// Main Rich Text Editor Component
export function RichTextEditor({ 
  content = {}, 
  onChange, 
  placeholder = "Beginnen Sie zu schreiben...",
  editable = true 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      TableExtension.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange(json)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-6',
      },
    },
  })

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          Editor wird geladen...
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {editable && <EditorToolbar editor={editor} />}
      <div className="min-h-[300px] max-h-[800px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      {editable && (
        <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 bg-gray-50">
          Tipp: Verwenden Sie Markdown-Syntax wie **fett** oder *kursiv*
        </div>
      )}
    </div>
  )
}