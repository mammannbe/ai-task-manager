// src/app/api/extract-tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

// Prüfe Environment Variables beim Start
const anthropicApiKey = process.env.ANTHROPIC_API_KEY
if (!anthropicApiKey) {
  console.error('❌ ANTHROPIC_API_KEY is not set in environment variables')
}

const anthropic = anthropicApiKey ? new Anthropic({
  apiKey: anthropicApiKey,
}) : null

export async function POST(req: NextRequest) {
  console.log('🚀 Extract-tasks API called')
  
  try {
    // Parse request body
    let body
    try {
      body = await req.json()
      console.log('📥 Request body:', body)
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError instanceof Error ? parseError.message : 'Unknown parsing error' },
        { status: 400 }
      )
    }

    const { text, userId } = body

    if (!text || !userId) {
      console.log('❌ Missing required fields:', { text: !!text, userId: !!userId })
      return NextResponse.json(
        { error: 'Text und User ID sind erforderlich', received: { text: !!text, userId: !!userId } },
        { status: 400 }
      )
    }

    // Check API Key
    if (!anthropic) {
      console.error('❌ Anthropic client not initialized - API key missing')
      return NextResponse.json(
        { error: 'Anthropic API Key ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    console.log('✅ Starting task extraction for:', { text, userId })

    const currentDate = new Date()
    const currentDateStr = currentDate.toISOString().split('T')[0]
    const currentTime = currentDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

    // Berechne relative Daten
    const tomorrow = new Date(currentDate)
    tomorrow.setDate(currentDate.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const nextWeek = new Date(currentDate)
    nextWeek.setDate(currentDate.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    // Berechne nächsten Freitag
    const nextFriday = new Date(currentDate)
    const daysUntilFriday = (5 - currentDate.getDay() + 7) % 7 || 7
    nextFriday.setDate(currentDate.getDate() + daysUntilFriday)
    const nextFridayStr = nextFriday.toISOString().split('T')[0]

    const prompt = `Du bist ein intelligenter Task-Manager-Assistent. Analysiere den folgenden Text und extrahiere alle Aufgaben daraus.

Heutiges Datum: ${currentDateStr}
Aktuelle Uhrzeit: ${currentTime}
Morgen: ${tomorrowStr}
Nächste Woche: ${nextWeekStr}
Nächster Freitag: ${nextFridayStr}

Text zu analysieren: "${text}"

Bitte extrahiere alle Aufgaben und erstelle für jede eine strukturierte JSON-Antwort. Erkenne dabei:
- Relative Zeitangaben ("morgen", "nächste Woche", "freitag") und konvertiere sie zu korrekten Daten
- Prioritäten basierend auf Kontext und Wörtern
- Kategorien basierend auf Inhalt
- Geschätzte Dauer

Antworte mit folgendem JSON-Format:
{
  "tasks": [
    {
      "title": "Kurzer prägnanter Titel",
      "description": "Detailliertere Beschreibung falls nötig",
      "priority": "low|medium|high|critical",
      "category": "work|personal|shopping|health|finance|communication|travel|other",
      "due_date": "YYYY-MM-DD oder null",
      "estimated_minutes": 60,
      "context": "Originaltext für diese Aufgabe"
    }
  ]
}

Kategorisierungs-Richtlinien:
- work: Arbeit, Meetings, Projekte, Präsentationen
- personal: Private Termine, Familie, Freizeit
- shopping: Einkaufen, Besorgungen
- health: Arzt, Gesundheit, Sport
- finance: Rechnungen, Bank, Geld
- communication: Anrufe, E-Mails, Nachrichten
- travel: Reisen, Transport
- other: Alles andere

Antworte NUR mit dem JSON, ohne zusätzlichen Text.`

    console.log('🤖 Sending prompt to Claude...')

    let message
    try {
      message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
      console.log('✅ Claude responded successfully')
    } catch (claudeError) {
      console.error('❌ Claude API Error:', claudeError)
      return NextResponse.json(
        { 
          error: 'Claude API Fehler', 
          details: claudeError instanceof Error ? claudeError.message : 'Unknown Claude error'
        },
        { status: 500 }
      )
    }

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('📝 Claude Response length:', responseText.length)

    let extractedTasks = []
    
    try {
      // Extrahiere JSON aus der Antwort
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0])
        extractedTasks = parsedResponse.tasks || []
        console.log('✅ Parsed tasks from Claude:', extractedTasks.length)
      } else {
        console.log('⚠️ No JSON found in Claude response, using fallback')
        throw new Error('Kein JSON in Claude Response gefunden')
      }
    } catch (parseError) {
      console.error('❌ JSON Parse Error, using fallback:', parseError)
      
      // Fallback: Einfache Task-Erstellung
      const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0)
      
      extractedTasks = sentences.map((sentence: string) => {
        const cleanSentence = sentence.trim()
        let priority = 'medium'
        let category = 'other'
        let estimated_minutes = 60
        let due_date = null

        // Einfache Keyword-Analyse
        const lowerText = cleanSentence.toLowerCase()
        
        // Priorität erkennen
        if (lowerText.includes('dringend') || lowerText.includes('sofort') || lowerText.includes('wichtig')) {
          priority = 'high'
        } else if (lowerText.includes('später') || lowerText.includes('irgendwann')) {
          priority = 'low'
        }

        // Kategorie erkennen
        if (lowerText.includes('einkauf') || lowerText.includes('kaufen') || lowerText.includes('shopping')) {
          category = 'shopping'
          estimated_minutes = 90
        } else if (lowerText.includes('arzt') || lowerText.includes('gesundheit')) {
          category = 'health'
          estimated_minutes = 120
        } else if (lowerText.includes('anruf') || lowerText.includes('telefonieren')) {
          category = 'communication'
          estimated_minutes = 15
        } else if (lowerText.includes('meeting') || lowerText.includes('arbeit')) {
          category = 'work'
          estimated_minutes = 90
        } else if (lowerText.includes('rechnung') || lowerText.includes('bezahlen')) {
          category = 'finance'
          estimated_minutes = 30
        }

        // Datum erkennen
        if (lowerText.includes('morgen')) {
          due_date = tomorrowStr
        } else if (lowerText.includes('freitag')) {
          due_date = nextFridayStr
        } else if (lowerText.includes('nächste woche')) {
          due_date = nextWeekStr
        }

        return {
          title: cleanSentence.length > 50 ? cleanSentence.substring(0, 50) + '...' : cleanSentence,
          description: cleanSentence.length > 50 ? cleanSentence : null,
          priority,
          category,
          due_date,
          estimated_minutes,
          context: cleanSentence
        }
      })
      
      console.log('✅ Fallback tasks created:', extractedTasks.length)
    }

    if (extractedTasks.length === 0) {
      console.log('⚠️ No tasks extracted, creating simple fallback')
      extractedTasks = [{
        title: text.substring(0, 50),
        description: text.length > 50 ? text : null,
        priority: 'medium',
        category: 'other',
        due_date: null,
        estimated_minutes: 60,
        context: text
      }]
    }

    // Priority-Mapping für bestehende Datenbank (falls priority als INTEGER gespeichert ist)
    const mapPriority = (priority: string): number => {
      switch (priority.toLowerCase()) {
        case 'low': return 1
        case 'medium': return 2
        case 'high': return 3
        case 'critical': return 4
        default: return 2 // Default: medium
      }
    }

    // Tasks in Supabase speichern
    const tasksToInsert = extractedTasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: mapPriority(task.priority), // Convert string to number
      category: task.category,
      status: 'open',
      due_date: task.due_date,
      estimated_minutes: task.estimated_minutes,
      context: task.context,
      user_id: userId
    }))

    console.log('💾 Inserting tasks into Supabase:', tasksToInsert.length)

    let data
    try {
      const { data: insertedData, error } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
        .select()

      if (error) {
        console.error('❌ Supabase Error:', error)
        throw error
      }
      
      data = insertedData
      console.log('✅ Tasks successfully inserted:', data?.length)
    } catch (supabaseError) {
      console.error('❌ Supabase insertion failed:', supabaseError)
      return NextResponse.json(
        { 
          error: 'Datenbankfehler beim Speichern', 
          details: supabaseError instanceof Error ? supabaseError.message : 'Unknown database error'
        },
        { status: 500 }
      )
    }

    console.log('🎉 Task extraction completed successfully')

    return NextResponse.json({
      success: true,
      tasks: data,
      message: `${data?.length || 0} Tasks erfolgreich erstellt`
    })

  } catch (error) {
    console.error('💥 Unexpected error in extract-tasks:', error)
    return NextResponse.json(
      { 
        error: 'Unerwarteter Server-Fehler',
        details: error instanceof Error ? error.message : 'Unknown server error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}