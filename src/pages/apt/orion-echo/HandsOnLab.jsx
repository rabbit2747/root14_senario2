import ScenarioHandsOnLab from '../scenario-template/ScenarioHandsOnLab';
import { orionEchoCourse } from './data/orion-echo-course';

export default function HandsOnLab() {
  return <ScenarioHandsOnLab course={orionEchoCourse} />;
}
