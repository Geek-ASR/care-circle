import { supabase } from '@/services/supabaseClient'
import type { ReportReason, ReportTargetType } from '@/types/database'

export interface CreateReportInput {
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  reason: ReportReason
  description?: string
}

export async function createReport(input: CreateReportInput) {
  const { error } = await supabase.from('reports').insert({
    reporter_id: input.reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    description: input.description || null,
  })
  if (error) throw error
}
