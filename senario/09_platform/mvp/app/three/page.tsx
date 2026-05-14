import sampleScenario from '@/data/sample-scenario.json'
import { ScenarioThreePlayer } from '@/components/ScenarioThreePlayer'
import { parseAndValidateScenario } from '@/lib/scenario/schema'

export default function ThreePage() {
  const result = parseAndValidateScenario(sampleScenario)

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

  return <ScenarioThreePlayer scenario={result.scenario} />
}
