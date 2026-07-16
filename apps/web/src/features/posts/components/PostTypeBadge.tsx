import { Badge } from '@/components/ui'
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

export function PostTypeBadge({ postType }: { postType: PostType }) {
  return <Badge variant="outline">{LABELS[postType]}</Badge>
}
