import ScenarioPracticalReview from '../scenario-template/ScenarioPracticalReview';
import { ledgerMirageCourse } from './data/ledger-mirage-course';

export default function LedgerMiragePracticalScenario() {
  return <ScenarioPracticalReview course={ledgerMirageCourse} />;
}
