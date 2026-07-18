import {
  Accessibility,
  BatteryFull,
  Brain,
  Droplet,
  Flame,
  Gauge,
  HandHeart,
  HeartPulse,
  type LucideIcon,
  Salad,
  Sparkles,
  Thermometer,
  Baby,
  Eye,
} from 'lucide-react'

export interface SymptomCategory {
  value: string
  label: string
  icon: LucideIcon
}

/** Fixed taxonomy for symptoms.category - order drives display order in the picker. */
export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  { value: 'pain', label: 'Pain', icon: Flame },
  { value: 'energy_sleep', label: 'Energy & Sleep', icon: BatteryFull },
  { value: 'digestive', label: 'Digestive', icon: Salad },
  { value: 'neuro_cognitive', label: 'Neurological & Cognitive', icon: Brain },
  { value: 'mood_mental', label: 'Mood & Mental Health', icon: HandHeart },
  { value: 'skin_hair', label: 'Skin & Hair', icon: Sparkles },
  { value: 'respiratory_cardiac', label: 'Heart & Breathing', icon: HeartPulse },
  { value: 'immune_fever', label: 'Fever & Immune', icon: Thermometer },
  { value: 'weight_metabolic', label: 'Weight & Metabolic', icon: Gauge },
  { value: 'urinary', label: 'Urinary', icon: Droplet },
  { value: 'reproductive', label: 'Reproductive', icon: Baby },
  { value: 'sensory', label: 'Sensory', icon: Eye },
  { value: 'mobility', label: 'Mobility', icon: Accessibility },
]

const CATEGORY_BY_VALUE = new Map(SYMPTOM_CATEGORIES.map((c) => [c.value, c]))

export function getSymptomCategory(value: string): SymptomCategory | undefined {
  return CATEGORY_BY_VALUE.get(value)
}

export const DURATION_OPTIONS = [
  { value: 'days', label: 'A few days' },
  { value: 'weeks', label: 'A few weeks' },
  { value: 'months', label: 'A few months' },
  { value: 'years', label: 'A year or more' },
]

export const PATTERN_OPTIONS = [
  { value: 'constant', label: 'Constant - always there' },
  { value: 'comes_and_goes', label: 'Comes and goes' },
  { value: 'triggered', label: 'Triggered by specific things' },
  { value: 'worsening', label: 'Getting worse over time' },
]
