import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { FollowUpQuestions } from '@/features/symptom-checker/components/FollowUpQuestions'
import { MedicalDisclaimer } from '@/features/symptom-checker/components/MedicalDisclaimer'
import { ResultsList } from '@/features/symptom-checker/components/ResultsList'
import { SymptomCheckHistoryList } from '@/features/symptom-checker/components/SymptomCheckHistoryList'
import { SymptomPicker } from '@/features/symptom-checker/components/SymptomPicker'
import {
  useConditionCommunitySlugs,
  useConditionSymptomMap,
  useCreateSymptomCheck,
  useSymptoms,
} from '@/features/symptom-checker/hooks/useSymptomChecker'
import { computeSymptomMatches } from '@/features/symptom-checker/lib/matching'
import type { SymptomCheckAnswers, SymptomCheckResult } from '@/types/database'

type Step = 'symptoms' | 'questions' | 'results'

const DEFAULT_ANSWERS: SymptomCheckAnswers = {
  duration: '',
  severity: 3,
  pattern: '',
  notes: '',
}

export default function SymptomCheckerPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('symptoms')
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([])
  const [answers, setAnswers] = useState<SymptomCheckAnswers>(DEFAULT_ANSWERS)
  const [results, setResults] = useState<SymptomCheckResult[]>([])

  const { data: symptoms } = useSymptoms()
  const { data: conditionSymptoms } = useConditionSymptomMap()
  const { data: communitySlugs } = useConditionCommunitySlugs()
  const createCheck = useCreateSymptomCheck()

  function toggleSymptom(id: string) {
    setSelectedSymptomIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  function handleSeeResults() {
    if (!symptoms || !conditionSymptoms || !communitySlugs) return
    const symptomsById = new Map(symptoms.map((s) => [s.id, s]))
    const communityMap = new Map(communitySlugs.map((c) => [c.condition_id, c.slug]))
    const computed = computeSymptomMatches(
      selectedSymptomIds,
      conditionSymptoms,
      symptomsById,
      communityMap,
    )
    setResults(computed)
    setStep('results')
    if (user) {
      createCheck.mutate({ symptomIds: selectedSymptomIds, answers, results: computed })
    }
  }

  function handleStartOver() {
    setSelectedSymptomIds([])
    setAnswers(DEFAULT_ANSWERS)
    setResults([])
    setStep('symptoms')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Symptom Checker · CareCircle</title>
      </Helmet>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Symptom Checker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Not a diagnosis — a way to find your community.
        </p>
      </div>

      <Tabs defaultValue="check">
        <TabsList>
          <TabsTrigger value="check">Check symptoms</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="check" className="mt-4 flex flex-col gap-4">
          <MedicalDisclaimer />

          {step === 'symptoms' && (
            <>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  What are you experiencing?
                </h2>
                <p className="text-xs text-muted-foreground">Select all that apply.</p>
              </div>
              <SymptomPicker selected={selectedSymptomIds} onToggle={toggleSymptom} />
              <Button
                disabled={selectedSymptomIds.length === 0}
                onClick={() => setStep('questions')}
                className="self-start"
              >
                Continue ({selectedSymptomIds.length} selected)
              </Button>
            </>
          )}

          {step === 'questions' && (
            <>
              <FollowUpQuestions answers={answers} onChange={setAnswers} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('symptoms')}>
                  Back
                </Button>
                <Button onClick={handleSeeResults}>See results</Button>
              </div>
            </>
          )}

          {step === 'results' && (
            <>
              <ResultsList results={results} />
              {!user && results.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <Link to="/signup" className="text-primary hover:underline">
                    Create a free account
                  </Link>{' '}
                  to save this check and revisit it later.
                </p>
              )}
              <Button variant="outline" onClick={handleStartOver} className="self-start">
                Start a new check
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <SymptomCheckHistoryList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
