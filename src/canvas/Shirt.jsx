import React, { useRef, useEffect, useMemo } from "react";
import { useSnapshot } from "valtio";
import { useThree } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import state from "../store";

const CANVAS_SIZE = 1024;

const Shirt = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/shirt_baked.glb");

  const logoTexture = useTexture(snap.logoDecal);
  const fullTexture = useTexture(snap.fullDecal);

  const meshRef = useRef();
  const paintCanvasRef = useRef(null);
  const paintCtxRef = useRef(null);
  const paintTextureRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const lastUvRef = useRef(null);
  const clearSignalRef = useRef(snap.clearSignal);
  const baseColorRef = useRef(null);

  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  // Сохраняем исходный цвет материала и создаём canvas-текстуру
  useEffect(() => {
    const mat = materials.lambert1;
    if (!baseColorRef.current) {
      baseColorRef.current = mat.color.clone();
      mat.color.set("#ffffff");
    }

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");

    // Белый фон — базовый цвет футболки на текстуре
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    paintCanvasRef.current = canvas;
    paintCtxRef.current = ctx;

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    paintTextureRef.current = texture;

    mat.map = texture;
    mat.needsUpdate = true;

    return () => {
      texture.dispose();
      if (baseColorRef.current) {
        mat.color.copy(baseColorRef.current);
        mat.map = null;
        mat.needsUpdate = true;
      }
    };
  }, [materials.lambert1]);

  // Очистка нарисованного слоя
  useEffect(() => {
    if (snap.clearSignal === clearSignalRef.current) return;
    clearSignalRef.current = snap.clearSignal;

    const ctx = paintCtxRef.current;
    const texture = paintTextureRef.current;
    if (!ctx || !texture) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    texture.needsUpdate = true;
  }, [snap.clearSignal]);

  const getUvFromEvent = (event) => {
    const mesh = meshRef.current;
    if (!mesh) return null;

    const rect = gl.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(mesh, false);

    if (intersects.length > 0 && intersects[0].uv) {
      return intersects[0].uv.clone();
    }
    return null;
  };

  const drawAtUv = (uv, isStart = false) => {
    const ctx = paintCtxRef.current;
    const texture = paintTextureRef.current;
    if (!ctx || !texture || !uv) return;

    const x = uv.x * CANVAS_SIZE;
    const y = uv.y * CANVAS_SIZE;
    const radius = snap.brushSize;

    ctx.fillStyle = snap.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Соединяем точки для плавного штриха
    if (!isStart && lastUvRef.current) {
      const lastX = lastUvRef.current.x * CANVAS_SIZE;
      const lastY = lastUvRef.current.y * CANVAS_SIZE;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = snap.color;
      ctx.lineWidth = radius * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    lastUvRef.current = uv;
    texture.needsUpdate = true;
  };

  const handlePointerDown = (event) => {
    const e = event.nativeEvent;

    if (snap.isPainting) {
      event.stopPropagation();
      isDrawingRef.current = true;
      lastUvRef.current = null;

      const uv = getUvFromEvent(e);
      if (uv) drawAtUv(uv, true);
      return;
    }

    isRotatingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    gl.domElement.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (event) => {
    const e = event.nativeEvent;

    if (snap.isPainting) {
      if (!isDrawingRef.current) return;
      event.stopPropagation();

      const uv = getUvFromEvent(e);
      if (uv) drawAtUv(uv);
      return;
    }

    if (!isRotatingRef.current) return;

    const deltaX = e.clientX - lastPointerRef.current.x;
    const deltaY = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    state.modelRotation[0] += deltaY * 0.005;
    state.modelRotation[1] -= deltaX * 0.005;
  };

  const handlePointerUp = (event) => {
    isDrawingRef.current = false;
    isRotatingRef.current = false;
    lastUvRef.current = null;

    const pointerId = event?.nativeEvent?.pointerId;
    if (pointerId != null && gl.domElement.hasPointerCapture?.(pointerId)) {
      gl.domElement.releasePointerCapture(pointerId);
    }
  };

  const stateString = JSON.stringify(snap);

  return (
    <group key={stateString}>
      <mesh
        ref={meshRef}
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={1}
        dispose={null}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {snap.isFullTexture && <Decal position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} map={fullTexture} />}

        {snap.isLogoTexture && <Decal position={[0, 0.04, 0.15]} rotation={[0, 0, 0]} scale={0.15} map={logoTexture} anisotropy={16} depthTest={false} depthWrite={true} />}
      </mesh>
    </group>
  );
};

export default Shirt;
