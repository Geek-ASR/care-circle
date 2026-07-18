import { describe, expect, it } from 'vitest'
import type { Symptom } from '@/types/database'
import { computeSymptomMatches } from './matching'
import type { ConditionSymptomRow } from '../api/symptomChecker'

const symptoms: Symptom[] = [
  {
    id: 's-fatigue',
    name: 'Persistent fatigue',
    slug: 'fatigue',
    category: 'energy_sleep',
    created_at: '',
  },
  {
    id: 's-joint',
    name: 'Joint pain',
    slug: 'joint-pain',
    category: 'pain',
    created_at: '',
  },
  {
    id: 's-rash',
    name: 'Skin rash',
    slug: 'skin-rash',
    category: 'skin_hair',
    created_at: '',
  },
  {
    id: 's-cough',
    name: 'Persistent cough',
    slug: 'cough',
    category: 'respiratory_cardiac',
    created_at: '',
  },
]
const symptomsById = new Map(symptoms.map((s) => [s.id, s]))

const conditionSymptoms: ConditionSymptomRow[] = [
  // lupus: fatigue(3) + joint pain(2) + rash(3)
  {
    condition_id: 'c-lupus',
    symptom_id: 's-fatigue',
    weight: 3,
    condition: { name: 'Lupus', slug: 'lupus', category: 'autoimmune' },
  },
  {
    condition_id: 'c-lupus',
    symptom_id: 's-joint',
    weight: 2,
    condition: { name: 'Lupus', slug: 'lupus', category: 'autoimmune' },
  },
  {
    condition_id: 'c-lupus',
    symptom_id: 's-rash',
    weight: 3,
    condition: { name: 'Lupus', slug: 'lupus', category: 'autoimmune' },
  },
  // asthma: cough(3) only - unrelated to the symptoms we'll select
  {
    condition_id: 'c-asthma',
    symptom_id: 's-cough',
    weight: 3,
    condition: { name: 'Asthma', slug: 'asthma', category: 'respiratory' },
  },
  // rheumatoid arthritis: joint pain(3) only - single weak-ish match
  {
    condition_id: 'c-ra',
    symptom_id: 's-joint',
    weight: 3,
    condition: {
      name: 'Rheumatoid Arthritis',
      slug: 'rheumatoid-arthritis',
      category: 'autoimmune',
    },
  },
]

const communitySlugByConditionId = new Map([
  ['c-lupus', 'lupus'],
  ['c-asthma', 'asthma'],
  ['c-ra', 'rheumatoid-arthritis'],
])

describe('computeSymptomMatches', () => {
  it('returns nothing when no symptoms are selected', () => {
    expect(
      computeSymptomMatches(
        [],
        conditionSymptoms,
        symptomsById,
        communitySlugByConditionId,
      ),
    ).toEqual([])
  })

  it('scores by summed weight of matched symptoms only', () => {
    const results = computeSymptomMatches(
      ['s-fatigue', 's-joint', 's-rash'],
      conditionSymptoms,
      symptomsById,
      communitySlugByConditionId,
    )
    const [top] = results
    expect(top!.conditionSlug).toBe('lupus')
    expect(top!.score).toBe(8)
    expect(top!.matchedSymptomNames.sort()).toEqual(
      ['Joint pain', 'Persistent fatigue', 'Skin rash'].sort(),
    )
    expect(top!.communitySlug).toBe('lupus')
  })

  it('excludes conditions with no overlap at all', () => {
    const results = computeSymptomMatches(
      ['s-fatigue', 's-rash'],
      conditionSymptoms,
      symptomsById,
      communitySlugByConditionId,
    )
    expect(results.some((r) => r.conditionSlug === 'asthma')).toBe(false)
  })

  it('excludes matches below the minimum score threshold', () => {
    // a single weight-1 symptom match would score 1, below MIN_SCORE=2
    const thin: ConditionSymptomRow[] = [
      {
        condition_id: 'c-thin',
        symptom_id: 's-cough',
        weight: 1,
        condition: { name: 'Thin Match', slug: 'thin-match', category: null },
      },
    ]
    const results = computeSymptomMatches(
      ['s-cough'],
      thin,
      symptomsById,
      communitySlugByConditionId,
    )
    expect(results).toEqual([])
  })

  it('respects the limit and breaks ties by number of matched symptoms', () => {
    const results = computeSymptomMatches(
      ['s-fatigue', 's-joint', 's-rash', 's-cough'],
      conditionSymptoms,
      symptomsById,
      communitySlugByConditionId,
      2,
    )
    expect(results).toHaveLength(2)
    expect(results.map((r) => r.conditionSlug)).toEqual(['lupus', 'asthma'])
  })
})
