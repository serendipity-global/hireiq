import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { question, jobTitle, company, jobDescription, resumeText, fitAnalysis } = await request.json()

    if (!question?.trim()) return NextResponse.json({ error: 'Question is required' }, { status: 400 })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are an expert interview coach helping a candidate answer interview questions in real time.

The candidate is interviewing for: ${jobTitle} at ${company}

Job Description Context:
${jobDescription?.slice(0, 1500) ?? ''}

Candidate Background:
${resumeText?.slice(0, 1500) ?? ''}

Key Strengths from Fit Analysis:
${fitAnalysis?.strengths?.map((s: any) => s.area + ': ' + s.detail).join('\n') ?? ''}

The interviewer just asked:
"${question}"

Generate a response that:
- Sounds completely natural and human — not scripted or AI-generated
- Is confident but conversational
- Uses the candidate's REAL experience from their background
- Is specific to this company and role
- Answers the question directly without fluff
- A real senior professional would say this in a real interview

Return ONLY valid JSON. No markdown.

{
  "bullets": [
    "string - key point 1, max 15 words, action-oriented",
    "string - key point 2, max 15 words, action-oriented", 
    "string - key point 3, max 15 words, action-oriented"
  ],
  "full_response": "string - complete natural response, 3-4 sentences, written as the candidate speaking. Confident, specific, human. No filler words.",
  "tone": "string - one word describing the tone used e.g. confident, technical, strategic",
  "key_metric": "string - the strongest specific metric or achievement from their background relevant to this answer. Empty string if none applies."
}`
        }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const clean = content.text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(clean)

    return NextResponse.json({ success: true, response: parsed })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}