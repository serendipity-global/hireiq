import Anthropic from '@anthropic-ai/sdk'
import { getProfessionalSummaryPrompt } from '../prompts/professional-summary'

const anthropic = new Anthropic()

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

export async function analyzeProfessionalSummary(resumeText: string): Promise<any> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `${getProfessionalSummaryPrompt()}\n\nResume text:\n${resumeText}`
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const clean = cleanJSON(content.text)
  return JSON.parse(clean)
}