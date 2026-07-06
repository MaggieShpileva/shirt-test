import React, { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { getMaterialPreview } from "../config/preloadMaterials";

useGLTF.preload("/shirt_baked.glb");

const PREVIEW_TEXTURE_SIZE = 256;

const createTintedTexture = (image, color) => {
  const canvas = document.createElement("canvas");
  canvas.width = PREVIEW_TEXTURE_SIZE;
  canvas.height = PREVIEW_TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");

  const tint = (color || "#ffffff").toLowerCase();
  if (tint !== "#ffffff") {
    ctx.filter = "grayscale(100%)";
  }
  ctx.drawImage(image, 0, 0, PREVIEW_TEXTURE_SIZE, PREVIEW_TEXTURE_SIZE);
  ctx.filter = "none";

  if (tint !== "#ffffff") {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, PREVIEW_TEXTURE_SIZE, PREVIEW_TEXTURE_SIZE);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const VariantShirtMesh = ({ color, materialPath }) => {
  const { nodes, materials } = useGLTF("/shirt_baked.glb");
  const textureRef = useRef(null);

  const shirtMaterial = useMemo(() => {
    const material = materials.lambert1.clone();
    material.color.set("#ffffff");
    material.metalness = 0;
    material.roughness = 0.55;
    return material;
  }, [materials.lambert1]);

  useEffect(() => {
    let cancelled = false;

    const applyTexture = (image) => {
      if (cancelled) return;

      textureRef.current?.dispose();
      textureRef.current = materialPath ? createTintedTexture(image, color) : null;

      shirtMaterial.map = textureRef.current;
      if (!materialPath) {
        shirtMaterial.color.set(color);
      } else {
        shirtMaterial.color.set("#ffffff");
      }
      shirtMaterial.needsUpdate = true;
    };

    if (!materialPath) {
      textureRef.current?.dispose();
      textureRef.current = null;
      shirtMaterial.map = null;
      shirtMaterial.color.set(color);
      shirtMaterial.needsUpdate = true;
      return () => {
        cancelled = true;
      };
    }

    const cached = getMaterialPreview(materialPath);
    if (cached?.complete && cached.naturalWidth > 0) {
      applyTexture(cached);
    } else if (cached) {
      cached.onload = () => applyTexture(cached);
    }

    return () => {
      cancelled = true;
      textureRef.current?.dispose();
      textureRef.current = null;
    };
  }, [color, materialPath, shirtMaterial]);

  return (
    <Center>
      <mesh geometry={nodes.T_Shirt_male.geometry} material={shirtMaterial} rotation={[0.15, 0.45, 0]} scale={1.05} />
    </Center>
  );
};

const VariantMiniCanvas = ({ color, materialPath }) => (
  <Canvas className="variant-mini-canvas" dpr={[1, 1.5]} camera={{ position: [0, 0, 2.15], fov: 30 }} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={0.75} />
    <VariantShirtMesh color={color} materialPath={materialPath} />
  </Canvas>
);

export default VariantMiniCanvas;
