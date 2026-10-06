import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Center, useGLTF } from "@react-three/drei";

import Shirt from "./Shirt";
import CameraRig from "./CameraRig";

// Ранний старт загрузки модели, не дожидаясь материалов/HDR
useGLTF.preload("/shirt_baked.glb");

const CanvasModel = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 0], fov: 22 }}
      gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: "high-performance" }}
      className="w-full max-w-full h-full transition-all ease-in touch-none"
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 2, 3]} intensity={1} />
      <directionalLight position={[-2, 1, -1]} intensity={0.35} />

      {/* HDR не блокирует появление модели */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <Suspense fallback={null}>
        <CameraRig>
          <Center>
            <Shirt />
          </Center>
        </CameraRig>
      </Suspense>
    </Canvas>
  );
};

export default CanvasModel;
