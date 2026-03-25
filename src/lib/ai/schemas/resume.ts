export interface ResumeSkill {
  name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  confidence: number
  evidence: string
}

export interface ResumeAchievement {
  description: string
  hasMetrics: boolean
  impact: 'low' | 'medium' | 'high'
  rewriteSuggestion: string
}

export interface ResumeGap {
  area: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  reason: string
}

export interface ResumeRiskSignal {
  signal: string
  severity: 'low' | 'medium' | 'high'
  mitigation: string
}

export interface InterviewReadiness {
  score: number
  level: 'not_ready' | 'needs_work' | 'close' | 'ready'
  reason: string
}

export interface PredictedQuestion {
  question: string
  reason: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ResumeAnalysis {
  primaryRole: string
  secondaryRoles: string[]
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'staff' | 'principal'
  yearsOfExperience: number
  industry: string
  skills: ResumeSkill[]
  achievements: ResumeAchievement[]
  gaps: ResumeGap[]
  riskSignals: ResumeRiskSignal[]
  strengths: string[]
  interviewReadiness: InterviewReadiness
  positioningStatement: string
  summary: string
  topPredictedQuestions: PredictedQuestion[]
  whyYouMightFail: string[]
}