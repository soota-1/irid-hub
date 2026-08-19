import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

function SpinningGem() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.4;
    ref.current.rotation.y += delta * 0.6;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 0]} />
      <MeshDistortMaterial distort={0.15} speed={2} roughness={0.1} metalness={0.7} color="#ec4899" emissive="#22d3ee" emissiveIntensity={0.2} />
    </mesh>
  );
}

/** The "one singular 3D accent" outside the hero (Design.md §19) — shown
 * once at the membership-form success moment. Skipped entirely under
 * prefers-reduced-motion (checkmark + confetti alone still carry the
 * moment, uiux.md §14). */
export function MembershipSuccessScene() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <div className="mx-auto h-28 w-28" aria-hidden>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#ec4899" />
        <Suspense fallback={null}>
          <SpinningGem />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
