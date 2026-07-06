import { Component, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import './Bombero3D.css'

const MODEL_PATH = '/models/bombero.glb'

const coloresPorEstado = {
  bombero_basico: '#9ca3af',
  bombero_equipamiento_parcial: '#f97316',
  bombero_casi_equipado: '#dc2626',
  bombero_completo: '#d97706',
}

const coloresPorParte = {
  casco: '#facc15',
  uniforme: '#dc2626',
  equipo: '#111827',
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function BomberoModel({ estadoVisual, partesColoreadas }) {
  const { scene } = useGLTF(MODEL_PATH)
  const modelo = useMemo(() => {
    const clone = scene.clone(true)
    const partes = Array.isArray(partesColoreadas) ? partesColoreadas : []
    const colorGeneral = coloresPorEstado[estadoVisual] || coloresPorEstado.bombero_basico

    clone.traverse((object) => {
      if (!object.isMesh) return

      const nombre = String(object.name || '').toLowerCase()
      const parte = partes.find((item) => nombre.includes(String(item).toLowerCase()))
      const color = parte ? coloresPorParte[parte] || colorGeneral : colorGeneral

      object.material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.12,
      })
      object.castShadow = true
      object.receiveShadow = true
    })

    return clone
  }, [scene, estadoVisual, partesColoreadas])

  return (
    <Center>
      <primitive object={modelo} scale={1.8} />
    </Center>
  )
}

export default function Bombero3D({ porcentaje = 0, estado_visual = 'bombero_basico', partes_coloreadas = [] }) {
  return (
    <div className="b3d-shell">
      <ModelErrorBoundary fallback={<div className="b3d-fallback">Modelo 3D pendiente de carga.</div>}>
        <Canvas camera={{ position: [0, 1.3, 4.5], fov: 42 }} shadows>
          <ambientLight intensity={0.85} />
          <directionalLight position={[4, 5, 4]} intensity={1.6} castShadow />
          <pointLight position={[-3, 2, 3]} intensity={0.55} />
          <Suspense fallback={null}>
            <BomberoModel estadoVisual={estado_visual} partesColoreadas={partes_coloreadas} />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={2.8} maxDistance={6} />
        </Canvas>
      </ModelErrorBoundary>
      <span className="b3d-percent">{Number(porcentaje || 0)}%</span>
    </div>
  )
}

useGLTF.preload(MODEL_PATH)
