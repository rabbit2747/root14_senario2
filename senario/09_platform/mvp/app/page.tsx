import sampleScenario from '@/data/sample-scenario.json'
import Link from 'next/link'
import { ScenarioPlayer } from '@/components/ScenarioPlayer'
import { parseAndValidateScenario } from '@/lib/scenario/schema'

export default function Home() {
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

  return (
    <>
      <nav className="scenario-switcher">
        <Link href="/scenario/sample">2D Sample</Link>
        <Link href="/three/sample">3D Sample</Link>
        <Link href="/scenario/orion">2D Orion</Link>
        <Link href="/three/orion">3D Orion</Link>
        <Link href="/three/orion_2">3D Orion 2</Link>
        <Link href="/three/ledger_mirage">3D Ledger Mirage</Link>
      </nav>
      <ScenarioPlayer scenario={result.scenario} validationErrors={result.errors} />
    </>
  )
}
