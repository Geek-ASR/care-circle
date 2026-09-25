import { Badge, type BadgeProps } from '@/components/ui'
import type { PostType } from '@/types/database'

const LABELS: Record<PostType, string> = {
  text: 'Discussion',
  image: 'Image',
  link: 'Link',
  poll: 'Poll',
  question: 'Question',
  experience: 'Experience',
  success_story: 'Success story',
  treatment_review: 'Treatment review',
  medication_review: 'Medication review',
  doctor_review: 'Doctor review',
  hospital_review: 'Hospital review',
  research_discussion: 'Research',
  lifestyle_tip: 'Lifestyle tip',
}

// Color-codes the kinds of post people scan for most (questions, reviews, wins),
// so the feed is skimmable; everyday discussion stays neutral.
const VARIANTS: Partial<Record<PostType, BadgeProps['variant']>> = {
  question: 'accent',
  poll: 'primary',
  success_story: 'success',
  treatment_review: 'warning',
  medication_review: 'warning',
  doctor_review: 'warning',
  hospital_review: 'warning',
  research_discussion: 'accent',
  lifestyle_tip: 'success',
}

export function PostTypeBadge({ postType }: { postType: PostType }) {
  return <Badge variant={VARIANTS[postType] ?? 'outline'}>{LABELS[postType]}</Badge>
}
