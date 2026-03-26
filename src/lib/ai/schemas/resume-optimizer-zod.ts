import { z } from 'zod'

export const HiringSignalSchema = z.object({
  level: z.enum(['below_bar', 'meets_bar', 'strong']),
  risk: z.enum(['low', 'medium', 'high']),
  decision: z.string().optional(),
})

export const ResumeSectionSchema = z.object({
  sectionName: z.string(),
  originalText: z.string(),
  score: z.number().min(0).max(100),
  hiringSignal: z.object({
    level: z.enum(['below_bar', 'meets_bar', 'strong']),
    risk: z.enum(['low', 'medium', 'high']),
  }),
  needsImprovement: z.boolean(),
  changeType: z.enum(['none', 'minor', 'rewrite']),
  doNotTouch: z.boolean(),
  doNotTouchReason: z.string(),
  verdict: z.string(),
  issues: z.array(z.string()),
  keepAsIs: z.array(z.string()),
  removeOrRewrite: z.array(z.string()),
  improvedText: z.string(),
  changesSummary: z.string(),
  impactIfChanged: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  interviewRiskFromThisSection: z.string(),
})

export const ResumeOptimizerSchema = z.object({
  overallScore: z.number().min(0).max(100),
  overallVerdict: z.string(),
  hiringSignal: HiringSignalSchema,
  atsCompatibility: z.object({
    score: z.number().min(0).max(100),
    keywordDensity: z.string(),
    formattingRisks: z.array(z.string()),
    parsingIssues: z.array(z.string()),
    verdict: z.string(),
  }),
  sections: z.array(ResumeSectionSchema).min(1),
  alignmentWithTargetRole: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    verdict: z.string(),
  }),
  topPriorities: z.array(z.object({
    priority: z.number().min(1).max(5),
    action: z.string(),
    impact: z.enum(['low', 'medium', 'high', 'critical']),
    reason: z.string(),
    changeType: z.enum(['none', 'minor', 'rewrite']),
  })).min(1).max(5),
  warningFlags: z.array(z.string()),
  interviewBridge: z.object({
    resumeToInterviewRisks: z.array(z.string()),
    strongTalkingPoints: z.array(z.string()),
    narrativeGaps: z.array(z.string()),
  }),
})

export type ResumeOptimizer = z.infer<typeof ResumeOptimizerSchema>
export type ResumeSection = z.infer<typeof ResumeSectionSchema>