export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface RobotState {
  position: Position;
  orientation: Quaternion;
  theta: number; // derived yaw in radians
  linearVel: number;
  angularVel: number;
}

export interface TrailPoint {
  x: number;
  y: number;
}

export interface OdometryMessage {
  pose: {
    pose: {
      position: { x: number; y: number; z: number };
      orientation: { x: number; y: number; z: number; w: number };
    };
  };
  twist: {
    twist: {
      linear: { x: number; y: number; z: number };
      angular: { x: number; y: number; z: number };
    };
  };
}