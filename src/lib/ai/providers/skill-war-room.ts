import Anthropic from '@anthropic-ai/sdk'
import {
  SKILL_TEACH_PROMPT,
  SKILL_FRAME_PROMPT,
  SKILL_EVALUATE_PROMPT,
  SKILL_PRESSURE_PROMPT,
  SKILL_FINAL_SCORE_PROMPT,
  SkillContext,
  SkillProgressState,
} from '../prompts/skill-war-room'

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

async function callClaude(systemPrompt: string, userContent: string, maxTokens = 3000): Promise<unknown> {
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userContent}`,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('Unexpected response type')

      const clean = cleanJSON(content.text)
      return JSON.parse(clean)

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }
  }

  throw new Error(`Failed after ${MAX_RETRIES} attempts: ${lastError?.message}`)
}

export async function generateTeachContent(
  skill: string,
  candidateRole: string,
  candidateLevel: string,
  resumeEvidence: string
): Promise<unknown> {
  const userContent = `
SKILL: ${skill}
CANDIDATE ROLE: ${candidateRole}
CANDIDATE LEVEL: ${candidateLevel}
RESUME EVIDENCE: ${resumeEvidence}

Generate the teach content for this skill based on the candidate's profile.`

  return callClaude(SKILL_TEACH_PROMPT, userContent, 3000)
}

export async function generateFrameContent(
  skill: string,
  skillContext: SkillContext,
  candidateRole: string,
  resumeEvidence: string
): Promise<unknown> {
  const userContent = `
SKILL: ${skill}
SKILL CONTEXT (from teach phase): ${JSON.stringify(skillContext)}
CANDIDATE ROLE: ${candidateRole}
RESUME EVIDENCE: ${resumeEvidence}

Generate the interview framing content using the skill context for continuity.`

  return callClaude(SKILL_FRAME_PROMPT, userContent, 3000)
}

export async function evaluateAnswer(
  skill: string,
  question: string,
  answer: string,
  skillContext: SkillContext,
  progressState: SkillProgressState
): Promise<unknown> {
  const userContent = `
SKILL: ${skill}
QUESTION ASKED: ${question}
CANDIDATE ANSWER: ${answer}
SKILL CONTEXT: ${JSON.stringify(skillContext)}
CANDIDATE PROGRESS STATE: ${JSON.stringify(progressState)}

Evaluate this answer honestly. Do not soften feedback.`

  return callClaude(SKILL_EVALUATE_PROMPT, userContent, 3000)
}

export async function generatePressureQuestion(
  skill: string,
  question: string,
  answer: string,
  skillContext: SkillContext,
  progressState: SkillProgressState
): Promise<unknown> {
  const userContent = `
SKILL: ${skill}
ORIGINAL QUESTION: ${question}
CANDIDATE ANSWER: ${answer}
SKILL CONTEXT: ${JSON.stringify(skillContext)}
CANDIDATE WEAK AREAS: ${progressState.weakAreas.join(', ')}

Generate a pressure follow-up question that challenges this answer.`

  return callClaude(SKILL_PRESSURE_PROMPT, userContent, 1500)
}

export async function generateFinalScore(
  skill: string,
  sessionData: {
    answers: string[]
    scores: number[]
    weakAreas: string[]
    attempts: number
  }
): Promise<unknown> {
  const userContent = `
SKILL: ${skill}
SESSION DATA: ${JSON.stringify(sessionData)}

Generate the final score and verdict for this War Room session.`

  return callClaude(SKILL_FINAL_SCORE_PROMPT, userContent, 2000)
}