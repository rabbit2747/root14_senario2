import ScenarioConceptClass from '../scenario-template/ScenarioConceptClass';
import { orionEchoCourse } from './data/orion-echo-course';

export default function ConceptClass() {
  return <ScenarioConceptClass course={orionEchoCourse} />;
}
