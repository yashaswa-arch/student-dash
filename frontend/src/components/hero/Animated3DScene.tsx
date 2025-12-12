import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei'
import * as THREE from 'three'

// Animated floating code block
function FloatingCodeBlock({ position, rotationSpeed = 1 }: { position: [number, number, number], rotationSpeed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * rotationSpeed
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <Box ref={meshRef} position={position} args={[0.8, 0.8, 0.8]}>
        <MeshDistortMaterial
          color="#3B82F6"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </Box>
    </Float>
  )
}

// Animated sphere with code pattern
function CodeSphere({ position, size = 1 }: { position: [number, number, number], size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.015
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Sphere ref={meshRef} position={position} args={[size, 32, 32]}>
        <MeshDistortMaterial
          color="#60A5FA"
          attach="material"
          distort={0.2}
          speed={1.5}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  )
}

// Animated torus (ring)
function CodeTorus({ position, size = 0.5 }: { position: [number, number, number], size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02
      meshRef.current.rotation.z += 0.01
    }
  })

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2}>
      <Torus ref={meshRef} position={position} args={[size, size * 0.3, 16, 32]}>
        <MeshDistortMaterial
          color="#93C5FD"
          attach="material"
          distort={0.15}
          speed={1.2}
          roughness={0.4}
          metalness={0.5}
          transparent
          opacity={0.5}
        />
      </Torus>
    </Float>
  )
}

// Main 3D Scene Component
export const Animated3DScene: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        className="w-full h-full"
      >
        {/* Ambient and directional lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#3B82F6" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#60A5FA" />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        {/* 3D Objects */}
        <FloatingCodeBlock position={[-2.5, 1.5, 0]} rotationSpeed={1} />
        <FloatingCodeBlock position={[2.5, -1, -1]} rotationSpeed={-1.2} />
        <CodeSphere position={[0, -2, -2]} size={0.6} />
        <CodeSphere position={[-3, 0, 1]} size={0.4} />
        <CodeTorus position={[3, 1.5, -1.5]} size={0.5} />
        <CodeTorus position={[0, 2.5, -2]} size={0.4} />

        {/* Subtle orbit controls for interactivity */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}

export default Animated3DScene

