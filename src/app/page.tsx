// src/app/page.tsx - Dashboard
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { 
  CheckCircle2, Clock, Calendar, TrendingUp, 
  FileText, BookOpen, Plus, ArrowRight 
} from 'lucide-react'

export default function Dashboard() {
  const [user] = useState({ id: 'demo-user', email: 'demo@example.com' })
  const [stats] = useState({
    tasks: { total: 7, completed: 1, open: 6, overdue: 2 },
    notes: { total: 3, recent: 1 },
    productivity: 85
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} taskStats={{ completed: stats.tasks.completed, open: stats.tasks.open }} />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen zurück! 👋
          </h2>
          <p className="text-gray-600">
            Hier ist eine Übersicht über Ihre Aufgaben und Notizen
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Offene Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.tasks.open}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                {stats.tasks.completed} von {stats.tasks.total} erledigt
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Überfällig</p>
                <p className="text-3xl font-bold text-red-600">{stats.tasks.overdue}</p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-red-500">Benötigen Aufmerksamkeit</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Notizen</p>
                <p className="text-3xl font-bold text-gray-900">{stats.notes.total}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                {stats.notes.recent} neue diese Woche
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Produktivität</p>
                <p className="text-3xl font-bold text-green-600">{stats.productivity}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-500">+12% diese Woche</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                Aufgaben
              </h3>
              <Link 
                href="/tasks"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Alle anzeigen <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <Clock className="w-4 h-4 text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Kundenpräsentation</p>
                  <p className="text-sm text-red-600">Überfällig seit 2 Tagen</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Calendar className="w-4 h-4 text-yellow-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Team Meeting</p>
                  <p className="text-sm text-yellow-600">Heute um 14:00</p>
                </div>
              </div>
            </div>
            
            <Link 
              href="/tasks"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neue Aufgabe erstellen
            </Link>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                Notizen
              </h3>
              <Link 
                href="/notes"
                className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
              >
                Alle anzeigen <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <FileText className="w-4 h-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Projektplanung Q1</p>
                  <p className="text-sm text-gray-500">Zuletzt bearbeitet: Heute</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <FileText className="w-4 h-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Meeting Protokoll</p>
                  <p className="text-sm text-gray-500">Zuletzt bearbeitet: Gestern</p>
                </div>
              </div>
            </div>
            
            <Link 
              href="/notes"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neue Notiz erstellen
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Task "Team Meeting" als erledigt markiert</span>
              <span className="text-gray-400 ml-auto">vor 2 Stunden</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Neue Notiz "Projektplanung Q1" erstellt</span>
              <span className="text-gray-400 ml-auto">vor 3 Stunden</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">3 neue Tasks aus Claude Analyse erstellt</span>
              <span className="text-gray-400 ml-auto">gestern</span>
            </div>
          </div>
        </div>
      </main>

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