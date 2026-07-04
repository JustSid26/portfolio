"use client";
// React Compiler can interfere with R3F's mutable-ref render loop.
"use no memo";

import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const INK = "#16140f";
const ACCENT = "#e8490f";

/* A technical-drawing gyroscope: nested ink rings spinning on different
   axes around a wireframe core, orange vertex markers, mouse parallax. */
function Gyro() {
    const group = useRef<THREE.Group>(null);
    const ringA = useRef<THREE.Mesh>(null);
    const ringB = useRef<THREE.Mesh>(null);
    const ringC = useRef<THREE.Mesh>(null);
    const core = useRef<THREE.Mesh>(null);

    // Orange markers on the core's vertices
    const markers = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(0.72, 0);
        const pos = geo.getAttribute("position");
        const unique = new Map<string, THREE.Vector3>();
        for (let i = 0; i < pos.count; i++) {
            const v = new THREE.Vector3().fromBufferAttribute(pos, i);
            unique.set(v.toArray().map((n) => n.toFixed(3)).join(","), v);
        }
        return Array.from(unique.values());
    }, []);

    useFrame((state, delta) => {
        const px = state.pointer.x;
        const py = state.pointer.y;

        if (group.current) {
            group.current.rotation.y += (px * 0.5 - group.current.rotation.y) * 0.05;
            group.current.rotation.x += (-py * 0.35 - group.current.rotation.x) * 0.05;
        }
        if (ringA.current) ringA.current.rotation.x += delta * 0.5;
        if (ringB.current) {
            ringB.current.rotation.y += delta * 0.35;
            ringB.current.rotation.z += delta * 0.15;
        }
        if (ringC.current) ringC.current.rotation.z -= delta * 0.45;
        if (core.current) {
            core.current.rotation.y += delta * 0.2;
            core.current.rotation.x -= delta * 0.08;
        }
    });

    return (
        <group ref={group}>
            {/* rings */}
            <mesh ref={ringA}>
                <torusGeometry args={[1.55, 0.008, 8, 96]} />
                <meshBasicMaterial color={INK} transparent opacity={0.75} />
            </mesh>
            <mesh ref={ringB} rotation={[Math.PI / 2.4, 0, 0]}>
                <torusGeometry args={[1.28, 0.008, 8, 96]} />
                <meshBasicMaterial color={INK} transparent opacity={0.55} />
            </mesh>
            <mesh ref={ringC} rotation={[0, Math.PI / 2.2, 0]}>
                <torusGeometry args={[1.02, 0.008, 8, 96]} />
                <meshBasicMaterial color={INK} transparent opacity={0.4} />
            </mesh>

            {/* core: faceted wireframe + orange vertex markers */}
            <group ref={core}>
                <mesh>
                    <icosahedronGeometry args={[0.72, 0]} />
                    <meshBasicMaterial color={INK} wireframe transparent opacity={0.5} />
                </mesh>
                {markers.map((v, i) => (
                    <mesh key={i} position={v}>
                        <sphereGeometry args={[0.022, 8, 8]} />
                        <meshBasicMaterial color={ACCENT} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

export default function GyroScene() {
    const dpr = useMemo<[number, number]>(() => [1, 2], []);

    return (
        <Canvas
            dpr={dpr}
            camera={{ position: [0, 0, 4.4], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
            <Suspense fallback={null}>
                <Gyro />
            </Suspense>
        </Canvas>
    );
}
