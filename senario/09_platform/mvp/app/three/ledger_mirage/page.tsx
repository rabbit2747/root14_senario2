import { ScenarioThreePlayerOrion2 } from '@/components/ScenarioThreePlayerOrion2'
import { ledgerMiragePractical3DScenario } from '@/data/practical-3d/ledger-mirage'
import type { Scenario } from '@/lib/scenario/schema'

const ledgerMirageScenario = {
  title: 'Operation Ledger Mirage'
} as Scenario

export default function LedgerMiragePractical3DPage() {
  return (
    <ScenarioThreePlayerOrion2
      scenario={ledgerMirageScenario}
      practical3DScenario={ledgerMiragePractical3DScenario}
      labHref="http://127.0.0.1:5173/apt/ledger-mirage/lab"
      labLabel="Open Lab Runbook"
      sideNote="Current View marks what the attacker is operating or watching: webmail composer, credential capture page, compromised mailbox session, or payment thread. The detail map shows how defenders prove that activity."
    />
  )
}
