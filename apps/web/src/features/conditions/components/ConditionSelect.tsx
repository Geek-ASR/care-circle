import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { groupConditionsByCategory } from '../constants'
import { useConditions } from '../hooks/useConditions'

interface ConditionSelectProps {
  value: string | undefined
  onValueChange: (value: string) => void
  id?: string
  placeholder?: string
  className?: string
  /** Which condition field becomes the option value. Defaults to 'id'. */
  valueBy?: 'id' | 'slug'
}

/**
 * Condition picker grouped by category (Autoimmune, Mental Health, ...) instead of
 * one flat alphabetical list - with 120+ conditions a flat list stopped being
 * navigable. Shared by onboarding, community creation, resources, and the admin
 * resources panel so all four stay in sync automatically as conditions are added.
 */
export function ConditionSelect({
  value,
  onValueChange,
  id,
  placeholder = 'Select a condition',
  className,
  valueBy = 'id',
}: ConditionSelectProps) {
  const { data: conditions } = useConditions()
  const groups = groupConditionsByCategory(conditions ?? [])

  return (
    <Select value={value ?? ''} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groups.map(({ category, items }) => (
          <SelectGroup key={category.value}>
            <SelectLabel className="flex items-center gap-1.5">
              <category.icon className="h-3 w-3 shrink-0" aria-hidden="true" />
              {category.label}
            </SelectLabel>
            {items.map((condition) => (
              <SelectItem key={condition.id} value={condition[valueBy]}>
                {condition.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
