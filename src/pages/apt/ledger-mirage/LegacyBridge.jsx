import ScenarioLegacyBridge from '../scenario-template/ScenarioLegacyBridge';
import { ledgerMirageCourse } from './data/ledger-mirage-course';

export default function LedgerMirageLegacyBridge() {
  return <ScenarioLegacyBridge course={ledgerMirageCourse} />;
}
