import Anthropic from '@anthropic-ai/sdk'
import { getJobFitPrompt } from '../prompts/job-fit'
import { getCoverLetterPrompt } from '../prompts/cover-letter'

const anthropic = new Anthropic()

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

export async function analyzeJobFit(resumeText: string, jobDescription: string): Promise<any> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `${getJobFitPrompt()}

Resume:
${resumeText}

Job Description:
${jobDescription}`
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const clean = cleanJSON(content.text)
  return JSON.parse(clean)
}

export async function generateCoverLetter(resumeText: string, jobDescription: string, fitAnalysis: any): Promise<any> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `${getCoverLetterPrompt()}

Resume:
${resumeText}

Job Description:
${jobDescription}

Fit Analysis Context:
- Job Title: ${fitAnalysis.jobTitle}
- Company: ${fitAnalysis.company}
- Fit Level: ${fitAnalysis.fitLevel}
- Hiring Verdict: ${fitAnalysis.hiringVerdict}
- Key Strengths: ${fitAnalysis.strengths?.map((s: any) => s.area).join(', ')}
- Positioning Gap: ${fitAnalysis.positioning?.gap ?? 'None'}
- Key Angle: ${fitAnalysis.hiringVerdictReason}`
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const clean = cleanJSON(content.text)
  return JSON.parse(clean)
}