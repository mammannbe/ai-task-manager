// src/components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Search, Settings, User, CheckCircle2, AlertCircle } from 'lucide-react'

interface HeaderProps {
  user?: { id: string; email: string }
  taskStats?: { completed: number; open: number }
}

export function Header({ user, taskStats }: HeaderProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Notes', href: '/notes', icon: '📝' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Brain className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Task Manager Pro
            </h1>
          </Link>
          
          {/* Navigation */}
          <nav className="flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Stats */}
          {taskStats && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {taskStats.completed} erledigt
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {taskStats.open} offen
              </div>
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Suchen..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              <User className="w-4 h-4 inline mr-1" />
              {user?.email || 'demo@example.com'}
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}