import { ScenarioThreePlayerOrion2 } from '@/components/ScenarioThreePlayerOrion2'
import { orionEchoPractical3DScenario } from '@/data/practical-3d/orion-echo'
import orionScenario from '@/data/orion-echo-supply-chain.json'
import { parseAndValidateScenario } from '@/lib/scenario/schema'

export default function Orion2Page() {
  const result = parseAndValidateScenario(orionScenario)

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

  return <ScenarioThreePlayerOrion2 scenario={result.scenario} practical3DScenario={orionEchoPractical3DScenario} />
}
