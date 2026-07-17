import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useHealthLogs } from '../hooks/useHealthLogs'

export function SymptomTrendChart() {
  const { data: logs } = useHealthLogs()
  const [symptomName, setSymptomName] = useState('')

  const symptomNames = useMemo(() => {
    const names = new Set<string>()
    for (const log of logs ?? []) {
      for (const symptom of log.symptoms) names.add(symptom.name)
    }
    return Array.from(names).sort()
  }, [logs])

  useEffect(() => {
    const first = symptomNames[0]
    if (!symptomName && first) setSymptomName(first)
  }, [symptomNames, symptomName])

  const points = useMemo(() => {
    if (!logs || !symptomName) return []
    return logs
      .flatMap((log) =>
        log.symptoms
          .filter((symptom) => symptom.name === symptomName)
          .map((symptom) => ({ date: log.logged_at, severity: symptom.severity })),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-20)
  }, [logs, symptomName])

  if (symptomNames.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <Select value={symptomName} onValueChange={setSymptomName}>
        <SelectTrigger className="max-w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {symptomNames.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {points.length === 0 ? (
        <p className="text-sm text-muted-foreground">No entries for this symptom yet.</p>
      ) : (
        <div className="flex h-40 items-end gap-1.5 rounded-lg border border-border p-4">
          {points.map((point, i) => (
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`${format(new Date(point.date), 'MMM d, h:mm a')}: ${point.severity}/5`}
            >
              <div
                className="w-full rounded-t bg-primary"
                style={{ height: `${(point.severity / 5) * 100}%` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(point.date), 'M/d')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
