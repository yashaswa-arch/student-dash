import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface Feature3DIconProps {
  color?: string
  shape?: 'box' | 'sphere' | 'torus'
  size?: number
}

function AnimatedShape({ color = '#3B82F6', shape = 'box', size = 0.5 }: Feature3DIconProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.015
    }
  })

  const ShapeComponent = () => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size, 32, 32]} />
      case 'torus':
        return <torusGeometry args={[size, size * 0.3, 16, 32]} />
      default:
        return <boxGeometry args={[size, size, size]} />
    }
  }

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <ShapeComponent />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.2}
          speed={1.5}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  )
}

export const Feature3DIcon: React.FC<Feature3DIconProps> = ({ color, shape, size }) => {
  return (
    <div className="w-16 h-16">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color={color} />
        <AnimatedShape color={color} shape={shape} size={size} />
      </Canvas>
    </div>
  )
}

export default Feature3DIcon

