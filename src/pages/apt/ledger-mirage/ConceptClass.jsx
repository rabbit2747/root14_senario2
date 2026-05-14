import ScenarioConceptClass from '../scenario-template/ScenarioConceptClass';
import { ledgerMirageCourse } from './data/ledger-mirage-course';

export default function LedgerMirageConceptClass() {
  return <ScenarioConceptClass course={ledgerMirageCourse} />;
}
