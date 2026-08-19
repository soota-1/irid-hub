import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import { GradientMesh } from "@/shared/components";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

/** Abstract kinetic-sculpture shape — flowing ribbon-like torus knot, not a
 * generic blob (uiux.md §5). Reacts subtly to cursor position. */
function IridescentKnot() {
  const meshRef = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.12;
    meshRef.current.rotation.y += delta * 0.18;
    // subtle reaction to cursor, eased toward the target offset
    meshRef.current.rotation.x += (pointer.y * 0.15 - meshRef.current.rotation.x * 0.02) * delta;
    meshRef.current.rotation.y += (pointer.x * 0.2 - meshRef.current.rotation.y * 0.02) * delta;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 0.6) * 0.15;
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <torusKnotGeometry args={[1, 0.32, 220, 32, 2, 3]} />
      <MeshDistortMaterial
        distort={0.28}
        speed={1.4}
        roughness={0.15}
        metalness={0.6}
        color="#8b5cf6"
        emissive="#ec4899"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

/** Hero 3D scene (Design.md §19 — R3F reserved for hero + one singular
 * conversion moment, not repeated in cards/lists). Falls back to a static
 * GradientMesh (no canvas at all) under prefers-reduced-motion. */
export function HeroScene({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <GradientMesh className={className} />;
  }

  return (
    <div className={className} aria-hidden>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={1.2} color="#ec4899" />
        <pointLight position={[-4, -2, 3]} intensity={0.8} color="#22d3ee" />
        <Suspense fallback={null}>
          <IridescentKnot />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
