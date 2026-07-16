import { supabase } from '@/services/supabaseClient'
import type { Condition } from '@/types/database'

export async function listConditions(): Promise<Condition[]> {
  const { data, error } = await supabase.from('conditions').select('*').order('name')
  if (error) throw error
  return data
}
