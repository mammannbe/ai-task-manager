// src/app/api/plan-day/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { tasks, planningDate, availableHours, workingHours, preferences } = await req.json()

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'Keine Tasks zum Planen' }, { status: 400 })
    }

    const prompt = `Du bist ein Experte für Zeitmanagement und Produktivität. Erstelle einen optimalen Tagesplan.

Planungsdatum: ${planningDate}
Verfügbare Arbeitszeit: ${availableHours} Stunden
Arbeitszeiten: ${workingHours.start} - ${workingHours.end}

Tasks zu planen:
${tasks.map((task: any, index: number) => `
${index + 1}. "${task.title}"
   - Priorität: ${task.priority}
   - Dringlichkeit: ${task.urgency || 'medium'}  
   - Wichtigkeit: ${task.importance || 'medium'}
   - Energielevel: ${task.energy_level || 'medium'}
   - Bevorzugte Tageszeit: ${task.time_of_day || 'any'}
   - Geschätzte Zeit: ${task.estimated_minutes || 60} Minuten
   - Kategorie: ${task.category}
`).join('')}

Planungsregeln:
1. **Energiebasierte Planung**: High-Energy Tasks morgens, Low-Energy nachmittags
2. **Prioritäten-Matrix**: Critical/High zuerst, dann nach Dringlichkeit
3. **Zeitblöcke**: Ähnliche Tasks gruppieren (Batch-Processing)
4. **Pausen**: 15min nach 90min, 30min Mittagspause
5. **Flexibilität**: 20% Puffer für Unvorhergesehenes

Erstelle einen JSON-Plan:
{
  "schedule": [
    {
      "task": {task-object},
      "startTime": "09:00",
      "endTime": "10:30", 
      "reason": "Optimale Zeit für kreative Arbeit, hohe Energie am Morgen"
    }
  ],
  "summary": {
    "totalPlannedHours": 6.5,
    "tasksScheduled": 8,
    "unscheduledTasks": 2,
    "recommendations": ["Empfehlung 1", "Empfehlung 2"]
  }
}

Antworte NUR mit dem JSON.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('Claude Tagesplanung Response:', responseText)

    let planningResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        planningResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Kein JSON gefunden')
      }
    } catch (parseError) {
      // Fallback: Einfache Zeit-basierte Planung
      console.error('JSON Parse Error, using fallback:', parseError)
      
      const sortedTasks = tasks
        .filter((task: any) => task.status === 'open')
        .sort((a: any, b: any) => {
          const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
          const aWeight = (priorityWeight[a.priority as keyof typeof priorityWeight] || 2) + 
                         (priorityWeight[a.urgency as keyof typeof priorityWeight] || 2)
          const bWeight = (priorityWeight[b.priority as keyof typeof priorityWeight] || 2) + 
                         (priorityWeight[b.urgency as keyof typeof priorityWeight] || 2)
          return bWeight - aWeight
        })

      let currentTime = new Date(`${planningDate}T${workingHours.start}:00`)
      const endTime = new Date(`${planningDate}T${workingHours.end}:00`)
      const schedule = []

      for (const task of sortedTasks) {
        const taskDuration = (task.estimated_minutes || 60) * 60 * 1000 // in milliseconds
        const taskEndTime = new Date(currentTime.getTime() + taskDuration)
        
        if (taskEndTime <= endTime) {
          schedule.push({
            task,
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: taskEndTime.toTimeString().slice(0, 5),
            reason: `Priorität ${task.priority}, ${Math.round((task.estimated_minutes || 60) / 60)}h eingeplant`
          })
          
          // 15min Puffer hinzufügen
          currentTime = new Date(taskEndTime.getTime() + 15 * 60 * 1000)
        }
      }

      planningResult = {
        schedule,
        summary: {
          totalPlannedHours: schedule.length * 1.25, // geschätzt
          tasksScheduled: schedule.length,
          unscheduledTasks: tasks.length - schedule.length,
          recommendations: [
            "Plane regelmäßige Pausen ein",
            "Schwierige Tasks am Morgen bearbeiten",
            "Ähnliche Tasks gruppieren"
          ]
        }
      }
    }

    return NextResponse.json(planningResult)

  } catch (error) {
    console.error('Tagesplanung Fehler:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Tagesplanung' },
      { status: 500 }
    )
  }
}