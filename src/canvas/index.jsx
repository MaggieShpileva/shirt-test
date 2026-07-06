import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";

import Shirt from "./Shirt";
import CameraRig from "./CameraRig";

const CanvasModel = () => {
  return (
    <Canvas shadows camera={{ position: [0, 0, 0], fov: 22 }} gl={{ preserveDrawingBuffer: true }} className="w-full max-w-full h-full transition-all ease-in touch-none" style={{ touchAction: "none" }}>
      <directionalLight position={[2, 2, 3]} intensity={1} />
      <Environment preset="city" />

      <CameraRig>
        <Center>
          <Shirt />
        </Center>
      </CameraRig>
    </Canvas>
  );
};

export default CanvasModel;
