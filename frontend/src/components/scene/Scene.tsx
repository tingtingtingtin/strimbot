import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { RobotMesh } from './RobotMesh';
import { RobotTrail } from './RobotTrail';
import { LidarPoints } from './LidarPoints';
import type { RobotState, TrailPoint } from '../../types/ros';

interface SceneProps {
  robotState: RobotState;
  trail: TrailPoint[];
  showTrail: boolean;
  lidarPoints: React.RefObject<[number, number][]>;
}

export function Scene({ robotState, trail, showTrail, lidarPoints }: SceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 120, position: [0, 0, 10], near: 0.01, far: 100 }}
      style={{ background: '#080c18' }}
    >
      <ambientLight intensity={1} />
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e2d4a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#162036"
        fadeDistance={60}
        fadeStrength={1}
        infiniteGrid
      />
      {showTrail && <RobotTrail trail={trail} />}
      <LidarPoints points={lidarPoints} />
      <RobotMesh robotState={robotState} />
      <OrbitControls
        makeDefault
        enableRotate={false}
        enablePan
        enableZoom
        zoomSpeed={0.6}
        panSpeed={0.8}
      />
    </Canvas>
  );
}