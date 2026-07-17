import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useConditions } from '@/features/conditions/hooks/useConditions'
import { useCreateCommunity } from '../hooks/useCommunities'
import { createCommunitySchema, slugify, type CreateCommunityValues } from '../schemas'

export function CreateCommunityForm() {
  const navigate = useNavigate()
  const { data: conditions } = useConditions()
  const createCommunity = useCreateCommunity()
  const [slugTouched, setSlugTouched] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommunityValues>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: { name: '', slug: '', description: '', conditionId: '' },
  })

  async function onSubmit(values: CreateCommunityValues) {
    setFormError(null)
    try {
      const community = await createCommunity.mutateAsync({
        name: values.name,
        slug: values.slug,
        description: values.description ?? '',
        conditionId: values.conditionId || null,
      })
      navigate(`/r/${community.slug}`)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not create your community.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Ankylosing Spondylitis Support"
          aria-invalid={Boolean(errors.name)}
          {...register('name', {
            onChange: (e) => {
              if (!slugTouched) setValue('slug', slugify(e.target.value))
            },
          })}
        />
        {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">/r/</Label>
        <Input
          id="slug"
          aria-invalid={Boolean(errors.slug)}
          {...register('slug', {
            onChange: () => setSlugTouched(true),
          })}
        />
        {errors.slug && <p className="text-xs text-danger">{errors.slug.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="What is this community for?"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-danger">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="condition">Related condition (optional)</Label>
        <Controller
          control={control}
          name="conditionId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="None" />
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

      <p className="text-xs text-muted-foreground">
        New communities are reviewed by an admin before they appear publicly. You&apos;ll
        be able to see and manage yours while it&apos;s pending.
      </p>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Creating…' : 'Create community'}
      </Button>
    </form>
  )
}
