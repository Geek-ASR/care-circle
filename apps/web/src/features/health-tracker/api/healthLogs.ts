import { supabase } from '@/services/supabaseClient'
import type { HealthLog, MedicationEntry, SymptomEntry } from '@/types/database'

export interface HealthLogInput {
  loggedAt: string
  symptoms: SymptomEntry[]
  medications: MedicationEntry[]
  mood: number | null
  notes: string
}

export async function listHealthLogs(userId: string): Promise<HealthLog[]> {
  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
  if (error) throw error
  return data as unknown as HealthLog[]
}

export async function createHealthLog(userId: string, input: HealthLogInput) {
  const { error } = await supabase.from('health_logs').insert({
    user_id: userId,
    logged_at: input.loggedAt,
    symptoms: input.symptoms,
    medications: input.medications,
    mood: input.mood,
    notes: input.notes || null,
  })
  if (error) throw error
}

export async function deleteHealthLog(id: string) {
  const { error } = await supabase.from('health_logs').delete().eq('id', id)
  if (error) throw error
}
