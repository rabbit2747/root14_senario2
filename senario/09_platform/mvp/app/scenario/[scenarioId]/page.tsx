import { notFound } from 'next/navigation'
import { ScenarioPlayer } from '@/components/ScenarioPlayer'
import { getScenarioSource, scenarioKeys } from '@/lib/scenario/scenarios'
import { parseAndValidateScenario } from '@/lib/scenario/schema'

type Props = {
  params: Promise<{ scenarioId: string }>
}

export function generateStaticParams() {
  return scenarioKeys().map(scenarioId => ({ scenarioId }))
}

export default async function ScenarioPage({ params }: Props) {
  const { scenarioId } = await params
  const source = getScenarioSource(scenarioId)
  if (!source) notFound()

  const result = parseAndValidateScenario(source)
  if (!result.scenario) {
    return (
      <main className="error-page">
        <h1>Scenario validation failed</h1>
        <ul>
          {result.errors.map(error => <li key={error}>{error}</li>)}
        </ul>
      </main>
    )
  }

  return <ScenarioPlayer scenario={result.scenario} validationErrors={result.errors} />
}
