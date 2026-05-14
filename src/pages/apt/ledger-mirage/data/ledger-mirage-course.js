import practicalScenario from './ledger-mirage-practical.json';
import { ledgerMirageCurriculum } from './ledger-mirage-curriculum';
import { validateScenarioPackage } from '../../scenario-template/validateScenarioPackage';

const validation = validateScenarioPackage({
  curriculum: ledgerMirageCurriculum,
  practicalScenario,
});

if (import.meta.env.DEV && (!validation.valid || validation.warnings.length > 0)) {
  console.warn('[ROOT14 ledger mirage validation]', validation);
}

export const ledgerMirageCourse = Object.freeze({
  curriculum: ledgerMirageCurriculum,
  practicalScenario,
  validation,
});
