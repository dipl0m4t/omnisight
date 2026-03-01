import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface ShapeProps {
  color: string;
  offset: number;
  speed: number;
}

function LowPolyShape({ color, offset, speed }: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed * 0.1;
      meshRef.current.position.x = Math.sin(t + offset) * 12;
      meshRef.current.position.y = Math.cos(t * 0.8 + offset) * 8;
      meshRef.current.position.z = Math.sin(t * 0.5 + offset) * 5;
      meshRef.current.rotation.x = t * 0.5;
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[4, 0]} />
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        metalness={0.3}
        flatShading={true}
      />
    </mesh>
  );
}

export default function BackgroundGeometry({ theme }: { theme: string }) {
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-[-1] bg-transparent">
      <Canvas camera={{ position: [0, 0, 40], fov: 25 }}>
        <ambientLight intensity={isDark ? 0.5 : 1.2} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={isDark ? 2.5 : 1.5}
        />

        <LowPolyShape
          color={isDark ? "#18181b" : "#94a3b8"}
          offset={0}
          speed={0.5}
        />
        <LowPolyShape
          color={isDark ? "#0f0f11" : "#64748b"}
          offset={2.5}
          speed={0.4}
        />
        <LowPolyShape
          color={isDark ? "#27272a" : "#cbd5e1"}
          offset={5}
          speed={0.3}
        />
      </Canvas>
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none" />
    </div>
  );
}
