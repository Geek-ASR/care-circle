import { supabase } from '@/services/supabaseClient'

export interface CompleteOnboardingInput {
  userId: string
  username: string
  displayName: string
  bio: string
  diagnosisConditionId: string | null
  diagnosisYear: number | null
}

export async function isUsernameAvailable(username: string, currentUserId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', currentUserId)
    .maybeSingle()

  if (error) throw error
  return data === null
}

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const { error } = await supabase
    .from('profiles')
    .update({
      username: input.username,
      display_name: input.displayName,
      bio: input.bio || null,
      diagnosis_condition_id: input.diagnosisConditionId,
      diagnosis_year: input.diagnosisYear,
      onboarding_completed: true,
    })
    .eq('id', input.userId)

  if (error) throw error
}
