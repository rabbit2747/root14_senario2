/**
 * SceneRenderer — Stage.sceneType에 따라 적절한 Voxel 씬 디스패치
 */
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { ReconVoxelScene } from '../scenes/ReconVoxelScene';
import { InitialAccessVoxelScene } from '../scenes/InitialAccessVoxelScene';
import { DiscoveryVoxelScene } from '../scenes/DiscoveryVoxelScene';
import { GenericVoxelScene } from '../scenes/GenericVoxelScene';

const REGISTRY = {
  recon:           ReconVoxelScene,
  initial_access:  InitialAccessVoxelScene,
  discovery:       DiscoveryVoxelScene,
  generic:         GenericVoxelScene,
};

export function SceneRenderer({ stage, onHotspot }) {
  const Scene = REGISTRY[stage.sceneType] || GenericVoxelScene;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      background: '#06070a',
    }}>
      <Canvas shadows camera={{ position: [5, 5, 7], fov: 42 }}>
        <color attach="background" args={['#06070a']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 6]} intensity={1.4} castShadow />
        <Scene stage={stage} onHotspot={onHotspot} />
        <ContactShadows position={[0, -0.3, 0]} opacity={0.55} blur={2.5} />
        <Environment preset="city" />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={1.3}
          minDistance={5}
          maxDistance={10}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
