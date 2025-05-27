// src/app/api/schedule-calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { schedule, date } = await req.json()

    if (!schedule || schedule.length === 0) {
      return NextResponse.json({ error: 'Kein Zeitplan zum Eintragen' }, { status: 400 })
    }

    // Simulierte Google Calendar Integration
    // In einer echten Implementierung würden Sie hier die Google Calendar API verwenden
    const scheduledEvents = schedule.map((item: any, index: number) => {
      const startDateTime = new Date(`${date}T${item.startTime}:00`)
      const endDateTime = new Date(`${date}T${item.endTime}:00`)
      
      // Simulierte Calendar Event ID
      const calendar_event_id = `cal_${Date.now()}_${index}`
      
      // Hier würden Sie normalerweise einen echten Google Calendar API Call machen:
      /*
      const event = {
        summary: item.task.title,
        description: `${item.task.description || ''}\n\nAutomatisch geplant: ${item.reason}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Berlin'
        },
        end: {
          dateTime: endDateTime.toISOString(), 
          timeZone: 'Europe/Berlin'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 }
          ]
        }
      }
      
      const calendarResponse = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      })
      */

      return {
        task_id: item.task.id,
        calendar_event_id,
        scheduled_time: startDateTime.toISOString(),
        title: item.task.title,
        start_time: item.startTime,
        end_time: item.endTime,
        status: 'scheduled'
      }
    })

    // Simuliere eine kleine Verzögerung für Realismus
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({ 
      scheduledEvents,
      message: `${scheduledEvents.length} Events erfolgreich geplant`,
      calendarUrl: `https://calendar.google.com/calendar/r/day/${date.replace(/-/g, '/')}`
    })

  } catch (error) {
    console.error('Kalender-Integration Fehler:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Kalender-Integration' },
      { status: 500 }
    )
  }
}
