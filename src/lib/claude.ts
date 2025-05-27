import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ExtractedTask {
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  category: 'work' | 'personal' | 'shopping' | 'communication' | 'appointment' | 'deadline';
  suggestedDate?: string;
  estimatedDuration?: number;
  context: string;
}

export async function extractTasksFromText(text: string): Promise<ExtractedTask[]> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analysiere den folgenden deutschen Text und extrahiere alle Aufgaben, Termine und ToDos.

Gib das Ergebnis als JSON-Array zurück. Für jede Aufgabe bestimme:
- title: Kurzer, klarer Titel (max 50 Zeichen)
- description: Detailliertere Beschreibung
- priority: 1 (hoch), 2 (mittel), 3 (niedrig)
- category: 'work', 'personal', 'shopping', 'communication', 'appointment', 'deadline'
- suggestedDate: YYYY-MM-DD Format wenn erkennbar, sonst null
- estimatedDuration: Geschätzte Dauer in Minuten
- context: Der ursprüngliche Textabschnitt

Text: "${text}"

Antworte nur mit dem JSON-Array, keine zusätzlichen Erklärungen.`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonStr = content.text.trim();
      const tasks = JSON.parse(jsonStr) as ExtractedTask[];
      return tasks;
    }
    
    throw new Error('Unerwarteter Response-Typ');
  } catch (error) {
    console.error('Claude API Fehler:', error);
    throw new Error('Aufgaben konnten nicht extrahiert werden');
  }
}