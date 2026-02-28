import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function AmbientGlow({
  color,
  position,
  speed,
}: {
  color: string;
  position: [number, number, number];
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed;
      // Мягкое движение по восьмерке
      meshRef.current.position.x = position[0] + Math.sin(t) * 2;
      meshRef.current.position.y = position[1] + Math.cos(t * 0.5) * 2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.07} />
    </mesh>
  );
}

export default function BackgroundGeometry() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#030303]">
      <Canvas camera={{ position: [0, 0, 20] }}>
        {/* Три пятна света в разных частях экрана */}
        <AmbientGlow color="#3f3f46" position={[-10, 5, 0]} speed={0.2} />
        <AmbientGlow color="#18181b" position={[10, -5, 0]} speed={0.3} />
        <AmbientGlow color="#27272a" position={[0, 0, -5]} speed={0.1} />
      </Canvas>
      {/* Добавляем блюр прямо поверх Canvas для мягкости */}
      <div className="absolute inset-0 backdrop-blur-[120px] pointer-events-none" />
    </div>
  );
}
