import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const TorsoModel = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshPhongMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshPhongMaterial color="#059669" emissive="#059669" emissiveIntensity={0.2} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.7, 1.5, 0]}>
        <boxGeometry args={[0.25, 1, 0.25]} />
        <meshPhongMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.7, 1.5, 0]}>
        <boxGeometry args={[0.25, 1, 0.25]} />
        <meshPhongMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.35, 0, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshPhongMaterial color="#047857" emissive="#047857" emissiveIntensity={0.2} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.35, 0, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshPhongMaterial color="#047857" emissive="#047857" emissiveIntensity={0.2} />
      </mesh>

      {/* Dumbbell Left */}
      <group position={[-1.2, 1.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshPhongMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshPhongMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Dumbbell Right */}
      <group position={[1.2, 1.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshPhongMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshPhongMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const Fitness3DModel: React.FC = () => {
  return (
    <Canvas className="w-full h-full" dpr={window.devicePixelRatio}>
      <PerspectiveCamera makeDefault position={[0, 1.5, 3]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
      />

      {/* Lights */}
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 3, 3]} intensity={0.8} color="#10b981" />

      {/* Model */}
      <TorsoModel />

      {/* Environment */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#020617" metalness={0.3} roughness={0.8} />
      </mesh>
    </Canvas>
  );
};

export default Fitness3DModel;
