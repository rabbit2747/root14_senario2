import practicalScenario from './orion-echo-practical.json';
import { orionEchoCurriculum } from './orion-echo-curriculum';
import { validateScenarioPackage } from '../../scenario-template/validateScenarioPackage';

const validation = validateScenarioPackage({
  curriculum: orionEchoCurriculum,
  practicalScenario,
});

if (import.meta.env.DEV && (!validation.valid || validation.warnings.length > 0)) {
  console.warn('[ROOT14 scenario validation]', validation);
}

export const orionEchoCourse = Object.freeze({
  curriculum: orionEchoCurriculum,
  practicalScenario,
  validation,
});
