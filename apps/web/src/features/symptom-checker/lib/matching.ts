import type { Symptom, SymptomCheckResult } from '@/types/database'
import type { ConditionSymptomRow } from '../api/symptomChecker'

/**
 * Pure, explainable overlap-scoring - no AI, no external calls. Each matched
 * symptom's weight (1=sometimes, 2=common, 3=hallmark) is summed per
 * condition; a minimum score keeps a single "sometimes" symptom from
 * surfacing a flood of loosely-related conditions. This is deliberately
 * NOT a diagnostic model - it is a transparent "communities that discuss
 * similar symptoms" match, and every result carries the matched symptom
 * names so the reasoning is visible, not a black box.
 */
const MIN_SCORE = 2

export function computeSymptomMatches(
  selectedSymptomIds: string[],
  conditionSymptoms: ConditionSymptomRow[],
  symptomsById: Map<string, Symptom>,
  communitySlugByConditionId: Map<string, string>,
  limit = 3,
): SymptomCheckResult[] {
  const selected = new Set(selectedSymptomIds)
  if (selected.size === 0) return []

  interface Accumulator {
    name: string
    slug: string
    category: string | null
    score: number
    matched: string[]
  }
  const byCondition = new Map<string, Accumulator>()

  for (const row of conditionSymptoms) {
    if (!selected.has(row.symptom_id)) continue
    const entry = byCondition.get(row.condition_id) ?? {
      name: row.condition.name,
      slug: row.condition.slug,
      category: row.condition.category,
      score: 0,
      matched: [],
    }
    entry.score += row.weight
    const symptomName = symptomsById.get(row.symptom_id)?.name
    if (symptomName) entry.matched.push(symptomName)
    byCondition.set(row.condition_id, entry)
  }

  return Array.from(byCondition.entries())
    .filter(([, v]) => v.score >= MIN_SCORE)
    .sort((a, b) => b[1].score - a[1].score || b[1].matched.length - a[1].matched.length)
    .slice(0, limit)
    .map(([conditionId, v]) => ({
      conditionId,
      conditionName: v.name,
      conditionSlug: v.slug,
      conditionCategory: v.category,
      communitySlug: communitySlugByConditionId.get(conditionId) ?? null,
      score: v.score,
      matchedSymptomNames: v.matched,
    }))
}
