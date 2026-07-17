import {
  Accessibility,
  Activity,
  AlertCircle,
  Baby,
  BatteryLow,
  Brain,
  Dna,
  Droplet,
  Eye,
  Flame,
  Gauge,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  type LucideIcon,
  Moon,
  PersonStanding,
  Ribbon,
  Salad,
  ShieldAlert,
  Sparkles,
  Star,
  Syringe,
  TestTube,
  Thermometer,
  Users2,
  Wind,
} from 'lucide-react'

export interface ConditionCategory {
  value: string
  label: string
  icon: LucideIcon
}

/**
 * Fixed taxonomy for conditions.category (free text, not DB-constrained - see
 * conditions_admin_write RLS policy). Order here drives display order everywhere
 * categories are grouped or listed, so it's deliberately curated rather than
 * alphabetical.
 */
export const CONDITION_CATEGORIES: ConditionCategory[] = [
  { value: 'autoimmune', label: 'Autoimmune & Rheumatic', icon: ShieldAlert },
  { value: 'chronic_pain', label: 'Chronic Pain', icon: Flame },
  { value: 'digestive', label: 'Digestive & Gastrointestinal', icon: Salad },
  { value: 'oncology', label: 'Cancer & Oncology', icon: Ribbon },
  { value: 'endocrine', label: 'Endocrine & Metabolic', icon: Gauge },
  { value: 'neurological', label: 'Neurological', icon: Brain },
  { value: 'cardiovascular', label: 'Heart & Cardiovascular', icon: HeartPulse },
  { value: 'respiratory', label: 'Lung & Respiratory', icon: Wind },
  { value: 'mental_health', label: 'Mental Health', icon: HandHeart },
  { value: 'dysautonomia', label: 'Dysautonomia', icon: Activity },
  { value: 'neuroimmune', label: 'Neuroimmune (ME/CFS)', icon: BatteryLow },
  { value: 'post_viral', label: 'Post-Viral & Long-Term Effects', icon: Thermometer },
  { value: 'reproductive_health', label: "Reproductive & Women's Health", icon: Baby },
  { value: 'mens_health', label: "Men's Health", icon: PersonStanding },
  { value: 'skin', label: 'Skin Conditions', icon: Sparkles },
  { value: 'kidney_urological', label: 'Kidney & Urological', icon: Droplet },
  { value: 'blood_disorders', label: 'Blood Disorders', icon: TestTube },
  { value: 'rare_disease', label: 'Rare & Genetic Disease', icon: Dna },
  { value: 'sensory', label: 'Sensory & Communication', icon: Eye },
  {
    value: 'mobility_disability',
    label: 'Mobility & Physical Disability',
    icon: Accessibility,
  },
  { value: 'neurodevelopmental', label: 'Neurodevelopmental', icon: Star },
  { value: 'sleep', label: 'Sleep Disorders', icon: Moon },
  { value: 'infectious_immune', label: 'Infectious Disease & Immune', icon: Syringe },
  { value: 'allergy_immunology', label: 'Allergies & Immunology', icon: AlertCircle },
  {
    value: 'substance_recovery',
    label: 'Substance Use & Recovery',
    icon: HeartHandshake,
  },
  { value: 'caregiver_support', label: 'Caregiver & Family Support', icon: Users2 },
]

const CATEGORY_BY_VALUE = new Map(CONDITION_CATEGORIES.map((c) => [c.value, c]))

export function getConditionCategory(
  value: string | null,
): ConditionCategory | undefined {
  return value ? CATEGORY_BY_VALUE.get(value) : undefined
}

export function getConditionCategoryLabel(value: string | null): string {
  return getConditionCategory(value)?.label ?? 'Other'
}

export interface ConditionGroup<T> {
  category: ConditionCategory
  items: T[]
}

const OTHER_CATEGORY: ConditionCategory = {
  value: '__other__',
  label: 'Other',
  icon: Sparkles,
}

/**
 * Groups items with a `category` field into the fixed CONDITION_CATEGORIES order,
 * dropping categories with no matches. Anything with an unrecognized/missing
 * category (shouldn't happen via the app's own admin UI, but conditions.category
 * has no DB constraint) lands in a trailing "Other" group instead of vanishing.
 */
export function groupConditionsByCategory<T extends { category: string | null }>(
  items: T[],
): ConditionGroup<T>[] {
  const groups: ConditionGroup<T>[] = CONDITION_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category.value),
  })).filter((group) => group.items.length > 0)

  const other = items.filter((item) => !getConditionCategory(item.category))
  if (other.length > 0) {
    groups.push({ category: OTHER_CATEGORY, items: other })
  }

  return groups
}
