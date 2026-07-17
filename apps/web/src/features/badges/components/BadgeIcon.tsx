import { Award, LifeBuoy, Shield, Sparkles, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  'life-buoy': LifeBuoy,
  shield: Shield,
  star: Star,
}

export function BadgeIcon({
  icon,
  className,
}: {
  icon: string | null
  className?: string
}) {
  const Icon = (icon && ICONS[icon]) || Award
  return <Icon className={className} aria-hidden="true" />
}
