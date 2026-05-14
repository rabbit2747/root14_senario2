import ScenarioHandsOnLab from '../scenario-template/ScenarioHandsOnLab';
import { ledgerMirageCourse } from './data/ledger-mirage-course';

export default function LedgerMirageHandsOnLab() {
  return <ScenarioHandsOnLab course={ledgerMirageCourse} />;
}
