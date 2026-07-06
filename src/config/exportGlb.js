import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import * as THREE from "three";

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportShirtToGlb = (geometry, canvas, sourceMaterial) =>
  new Promise((resolve, reject) => {
    if (!geometry || !canvas) {
      reject(new Error("Missing geometry or texture canvas"));
      return;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color("#ffffff"),
      metalness: 0,
      roughness: sourceMaterial?.roughness ?? 0.55,
    });

    if (sourceMaterial?.normalMap) {
      material.normalMap = sourceMaterial.normalMap;
      material.normalScale = sourceMaterial.normalScale.clone();
    }

    if (sourceMaterial?.roughnessMap) {
      material.roughnessMap = sourceMaterial.roughnessMap;
    }

    const mesh = new THREE.Mesh(geometry.clone(), material);
    const scene = new THREE.Scene();
    scene.add(mesh);

    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        texture.dispose();
        material.dispose();

        if (result instanceof ArrayBuffer) {
          downloadBlob(new Blob([result], { type: "model/gltf-binary" }), "shirt-custom.glb");
          resolve();
          return;
        }

        reject(new Error("Unexpected GLTF export format"));
      },
      (error) => {
        texture.dispose();
        material.dispose();
        reject(error);
      },
      { binary: true }
    );
  });
