import Anthropic from '@anthropic-ai/sdk'
import { getInterviewTrainingQuestionsPrompt, getInterviewAnswerEvaluationPrompt } from '../prompts/interview-training'

const anthropic = new Anthropic()

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

export async function generateInterviewQuestions(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  fitAnalysis: any,
  regenerate: boolean = false
): Promise<any> {
  const regenerateInstruction = regenerate
    ? 'IMPORTANT: This is a regeneration request. Generate completely different questions from a different angle — same topics but different phrasing, scenarios, and perspective.'
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `${getInterviewTrainingQuestionsPrompt()}

${regenerateInstruction}

Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Key Context from Fit Analysis:
- Strengths: ${fitAnalysis?.strengths?.map((s: any) => s.area).join(', ') ?? 'N/A'}
- Gaps: ${fitAnalysis?.gaps?.map((g: any) => g.requirement).join(', ') ?? 'N/A'}
- Perceived Level: ${fitAnalysis?.positioning?.levelPerceived ?? 'Senior'}
- Hiring Verdict: ${fitAnalysis?.hiringVerdict ?? 'Interview'}`
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  const clean = cleanJSON(content.text)
  return JSON.parse(clean)
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  level: number,
  jobTitle: string,
  company: string,
  resumeText: string
): Promise<any> {
  const levelNames: Record<number, string> = {
    1: 'Level 1 - Fundamentals',
    2: 'Level 2 - Applied',
    3: 'Level 3 - Scenario',
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `${getInterviewAnswerEvaluationPrompt()}

Interview Context:
- Job Title: ${jobTitle}
- Company: ${company}
- Level: ${levelNames[level] ?? 'Level 1'}

Question asked:
"${question}"

Candidate's answer:
"${answer}"

Candidate background summary (from resume):
${resumeText.slice(0, 1000)}`
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  const clean = cleanJSON(content.text)
  return JSON.parse(clean)
}