import ScenarioTOC from '../scenario-template/ScenarioTOC';
import { ledgerMirageCourse } from './data/ledger-mirage-course';

export default function LedgerMirageTOC() {
  return <ScenarioTOC course={ledgerMirageCourse} />;
}
