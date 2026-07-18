import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useDeleteSymptomCheck, useSymptomChecks } from '../hooks/useSymptomChecker'
import { ResultsList } from './ResultsList'

export function SymptomCheckHistoryList() {
  const { user } = useAuth()
  const { data: checks, isLoading } = useSymptomChecks()
  const deleteCheck = useDeleteSymptomCheck()

  if (!user) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>{' '}
        to save and revisit your symptom checks.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!checks || checks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        You haven&apos;t run a symptom check yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {checks.map((check) => (
        <div key={check.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {new Date(check.created_at).toLocaleDateString(undefined, {
                dateStyle: 'medium',
              })}
            </p>
            <Button
              variant="ghost"
              size="icon"
              disabled={deleteCheck.isPending}
              onClick={() => deleteCheck.mutate(check.id)}
              aria-label="Delete this check"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <ResultsList results={check.results} />
        </div>
      ))}
    </div>
  )
}
