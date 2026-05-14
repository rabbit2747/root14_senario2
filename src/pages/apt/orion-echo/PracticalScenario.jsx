import ScenarioPracticalReview from '../scenario-template/ScenarioPracticalReview';
import { orionEchoCourse } from './data/orion-echo-course';

export default function PracticalScenario() {
  return <ScenarioPracticalReview course={orionEchoCourse} />;
}
