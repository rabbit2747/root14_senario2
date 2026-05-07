/**
 * OrionEchoCinematic — 페이지 #3 시네마틱 (피해자 1인칭)
 * orion-echo.cinematic.json을 CinematicPlayer로 재생
 */
import CinematicPlayer from '../cinematic/CinematicPlayer';

export default function OrionEchoCinematic() {
  return <CinematicPlayer scenarioIdOverride="orion-echo" />;
}
