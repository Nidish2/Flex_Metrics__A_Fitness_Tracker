import React, { useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useUIStore } from '@/store/useUIStore'

interface BodyPartProps {
  position: [number, number, number]
  geometryType: 'box' | 'cylinder' | 'sphere'
  args: any
  label: string
  isSelected: boolean
  onSelect: (label: string) => void
  theme: string
}

const BodyPartMesh: React.FC<BodyPartProps> = ({ position, geometryType, args, label, isSelected, onSelect, theme }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Neon futuristic colors: Cyan for selected, Emerald for hovered, Slate/dark-blue for base
  const baseColor = isSelected ? '#06b6d4' : (theme === 'dark' ? '#1e293b' : '#cbd5e1')
  const hoverColor = '#10b981'
  const activeColor = hovered ? hoverColor : baseColor

  const geometry = useMemo(() => {
    if (geometryType === 'cylinder') {
      return <cylinderGeometry args={args} />
    }
    if (geometryType === 'sphere') {
      return <sphereGeometry args={args} />
    }
    return <boxGeometry args={args} />
  }, [args, geometryType])

  return (
    <group>
      {/* 1. Core Semi-Transparent Glowing Mesh */}
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(label)
        }}
      >
        {geometry}
        <meshStandardMaterial
          color={activeColor}
          emissive={isSelected || hovered ? activeColor : (theme === 'dark' ? '#06b6d4' : '#000000')}
          emissiveIntensity={isSelected || hovered ? 0.95 : (theme === 'dark' ? 0.45 : 0)}
          roughness={0.1}
          metalness={0.9}
          transparent={true}
          opacity={theme === 'dark' ? 0.35 : 0.65}
        />
      </mesh>
      
      {/* 2. Cyberpunk Holographic Wireframe Skin */}
      <mesh position={position}>
        {geometry}
        <meshBasicMaterial 
          color={activeColor} 
          wireframe={true} 
          transparent={true} 
          opacity={isSelected || hovered ? 0.95 : (theme === 'dark' ? 0.75 : 0.3)} 
        />
      </mesh>
    </group>
  )
}

interface MuscleGroup3DProps {
  selectedMuscle: string
  onSelectMuscle: (muscle: string) => void
}

export const MuscleGroup3D: React.FC<MuscleGroup3DProps> = ({ selectedMuscle, onSelectMuscle }) => {
  const theme = useUIStore((state) => state.theme)

  return (
    <div className="w-full h-[325px] rounded-xl overflow-hidden relative glass-panel border border-cyan-500/10">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block">3D Biometric Muscle Filter</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Rotate and click to filter catalog</span>
      </div>

      {selectedMuscle && (
        <div className="absolute bottom-4 right-4 z-10 bg-cyan-500/15 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
          Active: {selectedMuscle}
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        frameloop="demand"
        dpr={[1, 1.25]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={theme === 'dark' ? 0.45 : 0.7} />
        <directionalLight position={[10, 10, 5]} intensity={theme === 'dark' ? 0.9 : 1.1} />
        <pointLight position={[-10, -10, -5]} intensity={0.25} />

        <group position={[0, -0.6, 0]}>
          
          {/* Head - Sleek Globe */}
          <group position={[0, 1.8, 0]}>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshStandardMaterial 
                color={theme === 'dark' ? '#475569' : '#94a3b8'} 
                roughness={0.1} 
                metalness={0.9} 
                transparent={true} 
                opacity={0.3} 
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshBasicMaterial 
                color={theme === 'dark' ? '#475569' : '#94a3b8'} 
                wireframe={true} 
                transparent={true} 
                opacity={0.25} 
              />
            </mesh>
          </group>

          {/* Neck - Cylinder */}
          <group position={[0, 1.55, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.07, 0.15, 12]} />
              <meshStandardMaterial 
                color={theme === 'dark' ? '#475569' : '#94a3b8'} 
                roughness={0.1} 
                metalness={0.9} 
                transparent={true} 
                opacity={0.3} 
              />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.06, 0.07, 0.15, 12]} />
              <meshBasicMaterial 
                color={theme === 'dark' ? '#475569' : '#94a3b8'} 
                wireframe={true} 
                transparent={true} 
                opacity={0.25} 
              />
            </mesh>
          </group>

          {/* Torso - Tapered Cylinder Chest / Abs */}
          <BodyPartMesh
            position={[0, 1.05, 0]}
            geometryType="cylinder"
            args={[0.28, 0.22, 0.8, 16]}
            label="Chest"
            isSelected={selectedMuscle === 'Chest'}
            onSelect={onSelectMuscle}
            theme={theme}
          />

          {/* Left Shoulder Joint - Sphere */}
          <BodyPartMesh
            position={[-0.38, 1.35, 0]}
            geometryType="sphere"
            args={[0.11, 16, 16]}
            label="Shoulders"
            isSelected={selectedMuscle === 'Shoulders'}
            onSelect={onSelectMuscle}
            theme={theme}
          />

          {/* Right Shoulder Joint - Sphere */}
          <BodyPartMesh
            position={[0.38, 1.35, 0]}
            geometryType="sphere"
            args={[0.11, 16, 16]}
            label="Shoulders"
            isSelected={selectedMuscle === 'Shoulders'}
            onSelect={onSelectMuscle}
            theme={theme}
          />

          {/* Left Arm - Upper Cylinder */}
          <BodyPartMesh
            position={[-0.48, 0.9, 0]}
            geometryType="cylinder"
            args={[0.08, 0.07, 0.6, 12]}
            label="Arms"
            isSelected={selectedMuscle === 'Arms'}
            onSelect={onSelectMuscle}
            theme={theme}
          />

          {/* Right Arm - Upper Cylinder */}
          <BodyPartMesh
            position={[0.48, 0.9, 0]}
            geometryType="cylinder"
            args={[0.08, 0.07, 0.6, 12]}
            label="Arms"
            isSelected={selectedMuscle === 'Arms'}
            onSelect={onSelectMuscle}
            theme={theme}
          />

          {/* Left Leg - Cylinder */}
          <BodyPartMesh
            position={[-0.16, 0.1, 0]}
            geometryType="cylinder"
            args={[0.11, 0.08, 0.8, 12]}
            label="Legs"
            isSelected={selectedMuscle === 'Legs'}
            onSelect={onSelectMuscle}
            theme={theme}
          />

          {/* Right Leg - Cylinder */}
          <BodyPartMesh
            position={[0.16, 0.1, 0]}
            geometryType="cylinder"
            args={[0.11, 0.08, 0.8, 12]}
            label="Legs"
            isSelected={selectedMuscle === 'Legs'}
            onSelect={onSelectMuscle}
            theme={theme}
          />
        </group>

        <OrbitControls enableZoom={false} autoRotate={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
