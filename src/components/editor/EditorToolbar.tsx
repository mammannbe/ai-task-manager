// src/components/editor/EditorToolbar.tsx
'use client'

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

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
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
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-200' : ''
        }`}
        title="Fett"
      >
        <Bold size={16} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-200' : ''
        }`}
        title="Kursiv"
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('strike') ? 'bg-gray-200' : ''
        }`}
        title="Durchgestrichen"
      >
        <Underline size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bulletList') ? 'bg-gray-200' : ''
        }`}
        title="Aufzählungsliste"
      >
        <List size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('orderedList') ? 'bg-gray-200' : ''
        }`}
        title="Nummerierte Liste"
      >
        <ListOrdered size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('taskList') ? 'bg-gray-200' : ''
        }`}
        title="Aufgabenliste"
      >
        <CheckSquare size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Block Elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('blockquote') ? 'bg-gray-200' : ''
        }`}
        title="Zitat"
      >
        <Quote size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('codeBlock') ? 'bg-gray-200' : ''
        }`}
        title="Code Block"
      >
        <Code size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Media & Links */}
      <button
        onClick={addImage}
        className="p-2 rounded hover:bg-gray-100"
        title="Bild einfügen"
      >
        <ImageIcon size={16} />
      </button>

      <button
        onClick={addLink}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('link') ? 'bg-gray-200' : ''
        }`}
        title="Link einfügen"
      >
        <LinkIcon size={16} />
      </button>

      <button
        onClick={addTable}
        className="p-2 rounded hover:bg-gray-100"
        title="Tabelle einfügen"
      >
        <TableIcon size={16} />
      </button>
    </div>
  )
}