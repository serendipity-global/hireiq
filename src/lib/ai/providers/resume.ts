import Anthropic from '@anthropic-ai/sdk'
import { RESUME_ANALYSIS_PROMPT } from '../prompts/resume'
import { ResumeAnalysis } from '../schemas/resume'
import { ResumeAnalysisSchema } from '../schemas/resume-zod'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function callClaude(resumeText: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `${RESUME_ANALYSIS_PROMPT}\n\nRESUME TEXT:\n${resumeText}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text
}

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Resume analysis attempt ${attempt}/${MAX_RETRIES}`)

      const raw = await callClaude(resumeText)
      const clean = cleanJSON(raw)

      let parsed: unknown
      try {
        parsed = JSON.parse(clean)
      } catch {
        throw new Error(`JSON parse failed on attempt ${attempt}: ${clean.substring(0, 200)}`)
      }

      const validated = ResumeAnalysisSchema.safeParse(parsed)

      if (!validated.success) {
        const issues = validated.error.issues
          .map(i => `${i.path.join('.')}: ${i.message}`)
          .join(', ')
        throw new Error(`Schema validation failed on attempt ${attempt}: ${issues}`)
      }

      console.log(`Resume analysis succeeded on attempt ${attempt}`)
      return validated.data as ResumeAnalysis

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Attempt ${attempt} failed:`, lastError.message)

      if (attempt < MAX_RETRIES) {
        const delay = attempt * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Resume analysis failed after ${MAX_RETRIES} attempts: ${lastError?.message}`)
}