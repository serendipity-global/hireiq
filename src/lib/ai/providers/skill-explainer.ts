import Anthropic from '@anthropic-ai/sdk'
import { getSkillExplainerPrompt } from '../prompts/skill-explainer'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

export async function explainSkills(
  skills: { name: string; category: string; evidence?: string }[]
): Promise<any[]> {
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  const batchSize = 7
  const batches = []
  for (let i = 0; i < skills.length; i += batchSize) {
    batches.push(skills.slice(i, i + batchSize))
  }

  const allExplanations: any[] = []

  for (const batch of batches) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const skillsList = batch.map(s =>
          `- ${s.name} (${s.category})${s.evidence ? ` — Resume evidence: ${s.evidence}` : ''}`
        ).join('\n')

        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [{
            role: 'user',
            content: `${getSkillExplainerPrompt()}\n\nSkills to explain:\n${skillsList}`,
          }],
        })

        const content = message.content[0]
        if (content.type !== 'text') throw new Error('Unexpected response type')

        const clean = cleanJSON(content.text)
        const parsed = JSON.parse(clean)
        allExplanations.push(...(parsed.explanations ?? []))
        break

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        }
      }
    }
  }

  if (allExplanations.length === 0) {
    throw new Error(`Failed to explain skills: ${lastError?.message}`)
  }

  return allExplanations
}