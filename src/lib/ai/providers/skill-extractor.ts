import Anthropic from '@anthropic-ai/sdk'
import { getSkillExtractorPrompt } from '../prompts/skill-explainer'

const anthropic = new Anthropic()

export interface ExtractedSkill {
  name: string
  category: string
  tier: number
  evidence: string
}

export async function extractSkillsFromResume(resumeText: string): Promise<ExtractedSkill[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `${getSkillExtractorPrompt()}\n\nResume text:\n${resumeText}`
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const clean = content.text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  return parsed.skills ?? []
}