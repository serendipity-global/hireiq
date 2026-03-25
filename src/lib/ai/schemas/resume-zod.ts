import { z } from 'zod'

export const ResumeSkillSchema = z.object({
  name: z.string(),
  category: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  confidence: z.number().min(0).max(1),
  evidence: z.string(),
})

export const ResumeAchievementSchema = z.object({
  description: z.string(),
  hasMetrics: z.boolean(),
  impact: z.enum(['low', 'medium', 'high']),
  rewriteSuggestion: z.string(),
})

export const ResumeGapSchema = z.object({
  area: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  reason: z.string(),
})

export const ResumeRiskSignalSchema = z.object({
  signal: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  mitigation: z.string(),
})

export const InterviewReadinessSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(['not_ready', 'needs_work', 'close', 'ready']),
  reason: z.string(),
})

export const PredictedQuestionSchema = z.object({
  question: z.string(),
  reason: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

export const ResumeAnalysisSchema = z.object({
  primaryRole: z.string(),
  secondaryRoles: z.array(z.string()),
  seniorityLevel: z.enum(['entry', 'mid', 'senior', 'staff', 'principal']),
  yearsOfExperience: z.number().min(0).max(50),
  industry: z.string(),
  skills: z.array(ResumeSkillSchema).min(1).max(20),
  achievements: z.array(ResumeAchievementSchema),
  gaps: z.array(ResumeGapSchema),
  riskSignals: z.array(ResumeRiskSignalSchema),
  strengths: z.array(z.string()).min(1).max(5),
  interviewReadiness: InterviewReadinessSchema,
  positioningStatement: z.string().min(10),
  summary: z.string().min(10),
  topPredictedQuestions: z.array(PredictedQuestionSchema).length(5),
  whyYouMightFail: z.array(z.string()).min(3).max(5),
})

export type ResumeAnalysisValidated = z.infer<typeof ResumeAnalysisSchema>