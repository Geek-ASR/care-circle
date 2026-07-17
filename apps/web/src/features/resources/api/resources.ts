import { supabase } from '@/services/supabaseClient'
import type { ConditionResource, ResourceCategory } from '@/types/database'

export async function listConditionResources(
  conditionId: string,
): Promise<ConditionResource[]> {
  const { data, error } = await supabase
    .from('condition_resources')
    .select('*')
    .eq('condition_id', conditionId)
    .order('category')
  if (error) throw error
  return data as ConditionResource[]
}

export interface CreateConditionResourceInput {
  conditionId: string
  title: string
  url: string
  description: string
  category: ResourceCategory | ''
}

export async function createConditionResource(input: CreateConditionResourceInput) {
  const { error } = await supabase.from('condition_resources').insert({
    condition_id: input.conditionId,
    title: input.title,
    url: input.url || null,
    description: input.description || null,
    category: input.category || null,
  })
  if (error) throw error
}

export async function deleteConditionResource(id: string) {
  const { error } = await supabase.from('condition_resources').delete().eq('id', id)
  if (error) throw error
}
