"use client";
// React Compiler can interfere with R3F's mutable-ref render loop.
"use no memo";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Icosahedron,
    MeshDistortMaterial,
    Sparkles,
    Float,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/* The glowing, distorting crystal core + wireframe shell that reacts to the mouse. */
function Crystal() {
    const group = useRef<THREE.Group>(null);
    const wire = useRef<THREE.Mesh>(null);
    const distortRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;

        // Pointer in normalized device coords (-1..1)
        const px = state.pointer.x;
        const py = state.pointer.y;

        if (group.current) {
            // Ease the whole group toward the pointer for a parallax tilt
            group.current.rotation.y +=
                (px * 0.6 - group.current.rotation.y) * 0.05;
            group.current.rotation.x +=
                (-py * 0.4 - group.current.rotation.x) * 0.05;
            // Gentle drift so it never feels static
            group.current.position.x +=
                (px * viewport.width * 0.04 - group.current.position.x) * 0.04;
        }

        if (wire.current) {
            wire.current.rotation.y -= delta * 0.18;
            wire.current.rotation.z += delta * 0.06;
            const s = 1.32 + Math.sin(t * 0.8) * 0.04;
            wire.current.scale.setScalar(s);
        }

        if (distortRef.current) {
            distortRef.current.rotation.y += delta * 0.12;
        }
    });

    return (
        <group position={[1.9, 0.3, 0]}>
        <group ref={group}>
            <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
                {/* Inner distorted, semi-metallic core */}
                <Icosahedron ref={distortRef} args={[1.25, 12]}>
                    <MeshDistortMaterial
                        color="#0e1726"
                        emissive="#1b3a52"
                        emissiveIntensity={0.6}
                        metalness={0.92}
                        roughness={0.16}
                        distort={0.38}
                        speed={1.6}
                    />
                </Icosahedron>

                {/* Outer faceted wireframe shell */}
                <Icosahedron ref={wire} args={[1.25, 1]}>
                    <meshBasicMaterial
                        color="#9fe8ff"
                        wireframe
                        transparent
                        opacity={0.22}
                    />
                </Icosahedron>
            </Float>

            {/* Floating glints around the crystal */}
            <Sparkles
                count={60}
                scale={6}
                size={2.4}
                speed={0.3}
                opacity={0.6}
                color="#bfe9ff"
            />
        </group>
        </group>
    );
}

function Lights() {
    return (
        <>
            <ambientLight intensity={0.35} />
            <pointLight position={[5, 4, 5]} intensity={45} color="#7fe9ff" />
            <pointLight position={[-5, -3, 2]} intensity={35} color="#a78bfa" />
            <pointLight position={[0, 2, -5]} intensity={20} color="#6ea8ff" />
        </>
    );
}

export default function CrystalScene() {
    // Memo the DPR so the canvas isn't re-created on every render
    const dpr = useMemo<[number, number]>(() => [1, 1.8], []);

    return (
        <Canvas
            dpr={dpr}
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
            <Suspense fallback={null}>
                <Lights />
                <Crystal />
                <EffectComposer>
                    <Bloom
                        intensity={0.9}
                        luminanceThreshold={0.18}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />
                    <Vignette eskil={false} offset={0.25} darkness={0.85} />
                </EffectComposer>
            </Suspense>
        </Canvas>
    );
}
