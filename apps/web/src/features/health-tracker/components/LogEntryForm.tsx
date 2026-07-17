import { useState } from 'react'
import { Plus, X } from 'lucide-react'
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
import type { MedicationEntry, SymptomEntry } from '@/types/database'
import { useCreateHealthLog } from '../hooks/useHealthLogs'

const SEVERITY_LABELS: Record<number, string> = {
  1: '1 - Mild',
  2: '2 - Noticeable',
  3: '3 - Moderate',
  4: '4 - Severe',
  5: '5 - Worst',
}

const MOOD_LABELS: Record<number, string> = {
  1: '1 - Very low',
  2: '2 - Low',
  3: '3 - Okay',
  4: '4 - Good',
  5: '5 - Great',
}

function toDatetimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export function LogEntryForm() {
  const createLog = useCreateHealthLog()
  const [loggedAt, setLoggedAt] = useState(() => toDatetimeLocal(new Date()))
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([{ name: '', severity: 3 }])
  const [medications, setMedications] = useState<MedicationEntry[]>([
    { name: '', dosage: '' },
  ])
  const [mood, setMood] = useState('')
  const [notes, setNotes] = useState('')

  function updateSymptom(index: number, patch: Partial<SymptomEntry>) {
    setSymptoms((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function updateMedication(index: number, patch: Partial<MedicationEntry>) {
    setMedications((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const filledSymptoms = symptoms.filter((s) => s.name.trim().length > 0)
    const filledMedications = medications.filter((m) => m.name.trim().length > 0)

    await createLog.mutateAsync({
      loggedAt: new Date(loggedAt).toISOString(),
      symptoms: filledSymptoms,
      medications: filledMedications,
      mood: mood ? Number(mood) : null,
      notes,
    })

    setSymptoms([{ name: '', severity: 3 }])
    setMedications([{ name: '', dosage: '' }])
    setMood('')
    setNotes('')
    setLoggedAt(toDatetimeLocal(new Date()))
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logged-at">When</Label>
        <Input
          id="logged-at"
          type="datetime-local"
          value={loggedAt}
          onChange={(e) => setLoggedAt(e.target.value)}
          className="max-w-64"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Symptoms</Label>
        <div className="flex flex-col gap-2">
          {symptoms.map((symptom, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={symptom.name}
                onChange={(e) => updateSymptom(i, { name: e.target.value })}
                placeholder="e.g. Joint pain"
                aria-label={`Symptom ${i + 1} name`}
                className="flex-1"
              />
              <Select
                value={String(symptom.severity)}
                onValueChange={(v) => updateSymptom(i, { severity: Number(v) })}
              >
                <SelectTrigger className="w-40" aria-label={`Symptom ${i + 1} severity`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {SEVERITY_LABELS[n]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {symptoms.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setSymptoms((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  aria-label={`Remove symptom ${i + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setSymptoms((prev) => [...prev, { name: '', severity: 3 }])}
        >
          <Plus className="h-4 w-4" /> Add symptom
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Medications taken</Label>
        <div className="flex flex-col gap-2">
          {medications.map((medication, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={medication.name}
                onChange={(e) => updateMedication(i, { name: e.target.value })}
                placeholder="e.g. Ibuprofen"
                aria-label={`Medication ${i + 1} name`}
                className="flex-1"
              />
              <Input
                value={medication.dosage}
                onChange={(e) => updateMedication(i, { dosage: e.target.value })}
                placeholder="e.g. 200mg"
                aria-label={`Medication ${i + 1} dosage`}
                className="w-32"
              />
              {medications.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setMedications((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  aria-label={`Remove medication ${i + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setMedications((prev) => [...prev, { name: '', dosage: '' }])}
        >
          <Plus className="h-4 w-4" /> Add medication
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mood">Mood (optional)</Label>
        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger id="mood" className="max-w-64">
            <SelectValue placeholder="How are you feeling overall?" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {MOOD_LABELS[n]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else worth remembering about today..."
        />
      </div>

      <Button type="submit" disabled={createLog.isPending} className="self-start">
        {createLog.isPending ? 'Saving…' : 'Save entry'}
      </Button>
    </form>
  )
}
