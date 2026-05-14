import ScenarioTOC from '../scenario-template/ScenarioTOC';
import { orionEchoCourse } from './data/orion-echo-course';

export default function CourseTOC() {
  return <ScenarioTOC course={orionEchoCourse} />;
}
