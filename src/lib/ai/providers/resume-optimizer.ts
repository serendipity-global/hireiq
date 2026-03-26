import Anthropic from '@anthropic-ai/sdk'
import { RESUME_OPTIMIZER_PROMPT } from '../prompts/resume-optimizer'
import { ResumeOptimizerSchema, ResumeOptimizer } from '../schemas/resume-optimizer-zod'

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

export async function optimizeResume(
  resumeText: string,
  targetRole?: string
): Promise<ResumeOptimizer> {
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Resume optimization attempt ${attempt}/${MAX_RETRIES}`)

      const userContent = `${RESUME_OPTIMIZER_PROMPT}

RESUME TEXT:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}` : 'TARGET ROLE: Not specified — analyze based on the candidate\'s apparent target from their resume'}`

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: userContent }],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('Unexpected response type')

      const clean = cleanJSON(content.text)

      let parsed: unknown
      try {
        parsed = JSON.parse(clean)
      } catch {
        throw new Error(`JSON parse failed on attempt ${attempt}`)
      }

      const validated = ResumeOptimizerSchema.safeParse(parsed)
      if (!validated.success) {
        const issues = validated.error.issues
          .map(i => `${i.path.join('.')}: ${i.message}`)
          .join(', ')
        throw new Error(`Schema validation failed: ${issues}`)
      }

      console.log(`Resume optimization succeeded on attempt ${attempt}`)
      return validated.data

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Attempt ${attempt} failed:`, lastError.message)
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1500))
      }
    }
  }

  throw new Error(`Resume optimization failed after ${MAX_RETRIES} attempts: ${lastError?.message}`)
}