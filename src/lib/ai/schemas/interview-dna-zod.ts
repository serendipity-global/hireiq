import { z } from 'zod'

export const InterviewPersonaSchema = z.object({
  firstImpression: z.string(),
  perceivedStrength: z.string(),
  perceivedWeakness: z.string(),
  hiringManagerConcerns: z.array(z.string()).min(3).max(5),
  whatTheyNeedToHear: z.string(),
})

export const SkillTier1Schema = z.object({
  name: z.string(),
  category: z.string(),
  depth: z.enum(['mentioned', 'familiar', 'practiced', 'mastered']),
  evidence: z.string(),
  hiringImpact: z.enum(['low', 'medium', 'high', 'critical']),
  marketDemand: z.enum(['low', 'medium', 'high', 'very_high']),
  senioritySignal: z.enum(['junior', 'mid', 'senior', 'principal']),
  interviewLikelihood: z.enum(['low', 'medium', 'high', 'guaranteed']),
  trainingPriority: z.number().min(1).max(15),
  whyItMatters: z.string(),
})

export const SkillTier2Schema = z.object({
  name: z.string(),
  category: z.string(),
  depth: z.enum(['mentioned', 'familiar', 'practiced', 'mastered']),
  evidence: z.string(),
  hiringImpact: z.enum(['low', 'medium', 'high', 'critical']),
  interviewLikelihood: z.enum(['low', 'medium', 'high', 'guaranteed']),
})

export const SkillTier3Schema = z.object({
  name: z.string(),
  category: z.string(),
})

export const SkillMapSchema = z.object({
  tier1: z.array(SkillTier1Schema).min(8).max(15),
  tier2: z.array(SkillTier2Schema).min(5).max(25),
  tier3: z.array(SkillTier3Schema),
})

export const WeaknessFingerprintSchema = z.object({
  primaryPattern: z.string(),
  specificFailPoints: z.array(z.object({
    situation: z.string(),
    reason: z.string(),
    fix: z.string(),
  })).min(2).max(5),
  blindSpots: z.array(z.string()).min(1).max(5),
})

export const MarketPositionSchema = z.object({
  overallPercentile: z.number().min(1).max(100),
  byRole: z.array(z.object({
    role: z.string(),
    percentile: z.number().min(1).max(100),
    verdict: z.string(),
  })).min(1).max(4),
  salaryRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.literal('USD'),
    basis: z.literal('annual'),
  }),
  competitiveAdvantage: z.string(),
  competitiveDisadvantage: z.string(),
})

export const BattlePlanItemSchema = z.object({
  priority: z.number().min(1).max(10),
  action: z.string(),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  timeToComplete: z.string(),
  reason: z.string(),
})

export const ProbabilityEngineSchema = z.object({
  currentHireProbability: z.number().min(0).max(100),
  afterPreparationProbability: z.number().min(0).max(100),
  keyLeverPoints: z.array(z.string()).min(3).max(3),
  dealBreakers: z.array(z.string()).min(1).max(5),
})

export const InterviewDNASchema = z.object({
  interviewPersona: InterviewPersonaSchema,
  skillMap: SkillMapSchema,
  weaknessFingerprint: WeaknessFingerprintSchema,
  marketPosition: MarketPositionSchema,
  battlePlan: z.array(BattlePlanItemSchema).min(3).max(10),
  probabilityEngine: ProbabilityEngineSchema,
  harshReality: z.array(z.string()).min(3).max(5),
})

export type InterviewDNA = z.infer<typeof InterviewDNASchema>