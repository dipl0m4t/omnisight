import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function WireCube() {
  const meshRef = useRef<Mesh | null>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Чуть-чуть замедлил, чтобы не мельтешило
    meshRef.current.rotation.y += delta * 0.08;
    meshRef.current.rotation.x += delta * 0.03;
  });

  return (
    // Уменьшил масштаб, чтобы куб был виден целиком как объект
    <mesh ref={meshRef} scale={[1, 1, 1]}>
      <boxGeometry args={[4, 4, 4]} />
      <meshBasicMaterial
        wireframe
        color="#27272a" // Тёмно-серый, очень строгий
        transparent
        opacity={0.5} // Оптимально для фона
      />
    </mesh>
  );
}

function BackgroundGeometry() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
      <Canvas
        camera={{ position: [0, 0, 10] }}
        gl={{ antialias: true, alpha: true }}
        // Важно: Canvas должен занимать всё место
        style={{ width: "100%", height: "100%" }}
      >
        <WireCube />
      </Canvas>
    </div>
  );
}

export default BackgroundGeometry;
