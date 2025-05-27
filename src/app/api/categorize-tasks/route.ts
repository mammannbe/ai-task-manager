// src/app/api/categorize-tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json()

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'Keine Tasks zum Kategorisieren' }, { status: 400 })
    }

    const currentDate = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

    const prompt = `Du bist ein Experte für Produktivität und Task-Management. Analysiere die folgenden Tasks und kategorisiere sie intelligent.

Heutiges Datum: ${currentDate}
Aktuelle Uhrzeit: ${currentTime}

Tasks zu analysieren:
${tasks.map((task: any, index: number) => `
${index + 1}. Titel: "${task.title}"
   Beschreibung: "${task.description || 'Keine Beschreibung'}"
   Kontext: "${task.context || 'Kein Kontext'}"
`).join('')}

Bitte analysiere jeden Task und gib für jeden eine JSON-Struktur zurück mit:

{
  "categorizedTasks": [
    {
      "id": "task-id",
      "category": "work|personal|shopping|health|finance|communication|travel|other",
      "urgency": "low|medium|high|critical",
      "importance": "low|medium|high|critical", 
      "energy_level": "low|medium|high",
      "time_of_day": "morning|afternoon|evening|any",
      "tags": ["tag1", "tag2", "tag3"],
      "reasoning": "Kurze Begründung für die Kategorisierung"
    }
  ]
}

Kategorisierungs-Richtlinien:
- **Urgency**: Basierend auf zeitlichen Aspekten (Deadlines, "sofort", "dringend")
- **Importance**: Basierend auf Auswirkungen und Konsequenzen
- **Energy Level**: 
  - Low: Administrative Tasks, E-Mails, einfache Erledigungen
  - Medium: Meetings, Anrufe, Standardarbeiten
  - High: Kreative Arbeit, komplexe Problemlösung, wichtige Präsentationen
- **Time of Day**:
  - Morning: Schwierige, kreative Tasks (7-11 Uhr)
  - Afternoon: Meetings, Kommunikation (11-15 Uhr)  
  - Evening: Routine, Administration (15-19 Uhr)
  - Any: Flexible Tasks
- **Tags**: Relevante Schlagwörter für bessere Organisation

Antworte NUR mit dem JSON, ohne zusätzlichen Text.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('Claude Kategorisierung Response:', responseText)

    let categorizedTasks
    try {
      // Extrahiere JSON aus der Antwort
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0])
        categorizedTasks = parsedResponse.categorizedTasks || []
      } else {
        throw new Error('Kein JSON in Claude Response gefunden')
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      // Fallback: Einfache Kategorisierung basierend auf Titel-Keywords
      categorizedTasks = tasks.map((task: any) => {
        const title = task.title.toLowerCase()
        let category = 'other'
        let urgency = 'medium'
        let importance = 'medium'
        let energy_level = 'medium'
        let time_of_day = 'any'
        let tags: string[] = []

        // Einfache Keyword-basierte Kategorisierung
        if (title.includes('einkauf') || title.includes('kaufen') || title.includes('shopping')) {
          category = 'shopping'
          tags.push('einkaufen')
        } else if (title.includes('arzt') || title.includes('gesundheit') || title.includes('termin')) {
          category = 'health'
          urgency = 'high'
          time_of_day = 'morning'
        } else if (title.includes('anruf') || title.includes('email') || title.includes('nachricht')) {
          category = 'communication'
          energy_level = 'low'
          time_of_day = 'afternoon'
        } else if (title.includes('meeting') || title.includes('präsentation') || title.includes('projekt')) {
          category = 'work'
          importance = 'high'
          energy_level = 'high'
          time_of_day = 'morning'
        } else if (title.includes('rechnung') || title.includes('bezahl') || title.includes('geld')) {
          category = 'finance'
          urgency = 'high'
        }

        return {
          id: task.id,
          category,
          urgency,
          importance,
          energy_level,
          time_of_day,
          tags,
          reasoning: `Automatisch kategorisiert basierend auf Schlüsselwörtern`
        }
      })
    }

    return NextResponse.json({ categorizedTasks })

  } catch (error) {
    console.error('Kategorisierung Fehler:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Task-Kategorisierung' },
      { status: 500 }
    )
  }
}