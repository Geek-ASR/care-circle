import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { queryKeys } from '@/services/queryClient'
import { useConditions } from '@/features/conditions/hooks/useConditions'
import { onboardingSchema, type OnboardingValues } from '../schemas'
import { completeOnboarding, isUsernameAvailable } from '../api/onboarding'

export function OnboardingForm() {
  const { user, profile } = useAuth()
  const { data: conditions } = useConditions()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  // Safety net: if someone who already finished onboarding lands here (stale link,
  // browser back button, etc.), bounce them home instead of showing a form whose
  // blank bio/diagnosis defaults would overwrite their existing profile on submit.
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/', { replace: true })
    }
  }, [profile?.onboarding_completed, navigate])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: profile?.username?.startsWith('user_') ? '' : (profile?.username ?? ''),
      displayName: profile?.display_name ?? '',
      bio: '',
      diagnosisConditionId: '',
      diagnosisYear: '',
    },
  })

  async function onSubmit(values: OnboardingValues) {
    if (!user) return
    setFormError(null)

    const available = await isUsernameAvailable(values.username, user.id)
    if (!available) {
      setError('username', { message: 'That username is taken' })
      return
    }

    try {
      await completeOnboarding({
        userId: user.id,
        username: values.username,
        displayName: values.displayName,
        bio: values.bio ?? '',
        diagnosisConditionId: values.diagnosisConditionId || null,
        diagnosisYear: values.diagnosisYear ? Number(values.diagnosisYear) : null,
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) })
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not save your profile.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Set up your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This helps others in the community find and connect with you. You can change all
          of this later.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="jane_doe"
          aria-invalid={Boolean(errors.username)}
          {...register('username')}
        />
        {errors.username && (
          <p className="text-xs text-danger">{errors.username.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          placeholder="Jane Doe"
          aria-invalid={Boolean(errors.displayName)}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-xs text-danger">{errors.displayName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="A little about you (optional)"
          {...register('bio')}
        />
        {errors.bio && <p className="text-xs text-danger">{errors.bio.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="diagnosis">Diagnosis (optional)</Label>
          <Controller
            control={control}
            name="diagnosisConditionId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="diagnosis">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions?.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id}>
                      {condition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="diagnosisYear">Year diagnosed</Label>
          <Input id="diagnosisYear" placeholder="2019" {...register('diagnosisYear')} />
          {errors.diagnosisYear && (
            <p className="text-xs text-danger">{errors.diagnosisYear.message}</p>
          )}
        </div>
      </div>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Finish setup'}
      </Button>
    </form>
  )
}
