import ScenarioIntro from '../scenario-template/ScenarioIntro';
import { orionEchoCourse } from './data/orion-echo-course';

export default function OrionEchoIntro() {
  return <ScenarioIntro course={orionEchoCourse} />;
}
