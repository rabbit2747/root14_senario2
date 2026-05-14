import ScenarioLegacyBridge from '../scenario-template/ScenarioLegacyBridge';
import { orionEchoCourse } from './data/orion-echo-course';

export default function LegacyBridge() {
  return <ScenarioLegacyBridge course={orionEchoCourse} />;
}
