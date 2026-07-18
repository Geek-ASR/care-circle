import { supabase } from '@/services/supabaseClient'
import type {
  Symptom,
  SymptomCheck,
  SymptomCheckAnswers,
  SymptomCheckResult,
} from '@/types/database'

export async function listSymptoms(): Promise<Symptom[]> {
  const { data, error } = await supabase.from('symptoms').select('*').order('name')
  if (error) throw error
  return data
}

export interface ConditionSymptomRow {
  condition_id: string
  symptom_id: string
  weight: number
  condition: { name: string; slug: string; category: string | null }
}

/** Public data (~470 rows) - fetched whole and cached, matching happens client-side. */
export async function listConditionSymptomMap(): Promise<ConditionSymptomRow[]> {
  const { data, error } = await supabase
    .from('condition_symptoms')
    .select(
      'condition_id, symptom_id, weight, condition:conditions(name, slug, category)',
    )
  if (error) throw error
  return data as unknown as ConditionSymptomRow[]
}

export interface ConditionCommunityRow {
  condition_id: string
  slug: string
}

export async function listConditionCommunitySlugs(): Promise<ConditionCommunityRow[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('condition_id, slug')
    .eq('is_approved', true)
    .not('condition_id', 'is', null)
  if (error) throw error
  return data as unknown as ConditionCommunityRow[]
}

export async function listSymptomChecks(userId: string): Promise<SymptomCheck[]> {
  const { data, error } = await supabase
    .from('symptom_checks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as SymptomCheck[]
}

export interface CreateSymptomCheckInput {
  symptomIds: string[]
  answers: SymptomCheckAnswers
  results: SymptomCheckResult[]
}

export async function createSymptomCheck(
  userId: string,
  input: CreateSymptomCheckInput,
): Promise<SymptomCheck> {
  const { data, error } = await supabase
    .from('symptom_checks')
    .insert({
      user_id: userId,
      symptom_ids: input.symptomIds,
      answers: input.answers,
      results: input.results,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as unknown as SymptomCheck
}

export async function deleteSymptomCheck(id: string) {
  const { error } = await supabase.from('symptom_checks').delete().eq('id', id)
  if (error) throw error
}
