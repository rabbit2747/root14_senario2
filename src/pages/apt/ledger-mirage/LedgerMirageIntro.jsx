import ScenarioIntro from '../scenario-template/ScenarioIntro';
import { ledgerMirageCourse } from './data/ledger-mirage-course';

export default function LedgerMirageIntro() {
  return <ScenarioIntro course={ledgerMirageCourse} />;
}
