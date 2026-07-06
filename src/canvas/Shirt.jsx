import React, { useRef, useEffect, useMemo, useLayoutEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { useThree } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

import state from "../store";
import { ShirtMaterials, ChestLogoPlacement, BackNumberPlacement, LogoDecalTransform } from "../config/constants";
import { getMaterialPreview } from "../config/preloadMaterials";
import { loadLogoImage } from "../config/logoSvg";
import { loadBackNumberImage } from "../config/backNumberSvg";

const CANVAS_SIZE = 1024;

const createCanvas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  return canvas;
};

const fillCanvasBase = (ctx, image, tintColor = "#ffffff") => {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";

  if (image) {
    const tint = (tintColor || "#ffffff").toLowerCase();

    // Паттерн материала — только яркость, без цвета превью
    if (tint !== "#ffffff") {
      ctx.filter = "grayscale(100%)";
    }
    ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.filter = "none";

    if (tint !== "#ffffff") {
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = tintColor;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.globalCompositeOperation = "source-over";
    }
    return;
  }

  ctx.fillStyle = tintColor || "#ffffff";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

const getFirstMaterial = (gltf) => {
  if (gltf.materials) {
    const materials = Object.values(gltf.materials);
    if (materials.length) return materials[0];
  }

  let found = null;
  gltf.scene?.traverse((child) => {
    if (found || !child.isMesh) return;

    const meshMaterial = child.material;
    if (!meshMaterial) return;

    found = Array.isArray(meshMaterial) ? meshMaterial[0] : meshMaterial;
  });

  return found;
};

const applyPbrMaps = (sourceMat, mat, originalNormalMap, originalNormalScale, originalRoughnessMap) => {
  // Рельеф футболки оставляем от модели — GLTF-normal с sample-сферы
  // на UV рубашки даёт «шероховатую» чужую текстуру при рисовании.
  if (originalNormalMap) {
    mat.normalMap = originalNormalMap;
    mat.normalScale.copy(originalNormalScale);
  }

  if (originalRoughnessMap) {
    mat.roughnessMap = originalRoughnessMap;
    mat.roughness = 0.55;
  } else {
    mat.roughnessMap = null;
    mat.roughness = sourceMat.roughness ?? 0.55;
  }

  mat.metalness = 0;
  mat.needsUpdate = true;
};

const clearPaintLayer = (ctx) => {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

const clearOverlayLayer = (ctx) => {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

const clearLogoLayer = (ctx) => {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

const clearBackNumberLayer = (ctx) => {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

const drawPlacementGraphic = (ctx, clearLayer, image, uv, placement, defaultAspect) => {
  if (!ctx || !image || !uv) return false;

  const { uvOffset, uvWidth } = placement;
  const anchorX = uv.x + uvOffset.x;
  const anchorY = uv.y + uvOffset.y;
  const graphicWidth = CANVAS_SIZE * uvWidth;
  const aspect = image.naturalWidth > 0 ? image.naturalHeight / image.naturalWidth : defaultAspect;
  const graphicHeight = graphicWidth * aspect;
  const x = anchorX * CANVAS_SIZE - graphicWidth / 2;
  const y = anchorY * CANVAS_SIZE - graphicHeight / 2;

  clearLayer(ctx);
  ctx.drawImage(image, x, y, graphicWidth, graphicHeight);
  return true;
};

const drawChestLogo = (ctx, image, uv) =>
  drawPlacementGraphic(ctx, clearLogoLayer, image, uv, ChestLogoPlacement, 50 / 240);

const drawBackNumber = (ctx, image, uv) =>
  drawPlacementGraphic(ctx, clearBackNumberLayer, image, uv, BackNumberPlacement, 80 / 120);

const getChestLogoUv = () => ChestLogoPlacement.fallbackUv;

const getBackNumberUv = () => BackNumberPlacement.fallbackUv;

const isImageReady = (image) => Boolean(image?.complete && image.naturalWidth > 0);

const Shirt = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/shirt_baked.glb");

  const materialLibraryRef = useRef({});
  const materialLoadIdRef = useRef(0);
  const baseTextureCacheRef = useRef({});
  const overlayImageCacheRef = useRef(null);
  const canvasInitializedRef = useRef(false);
  const overlayImageDataRef = useRef(null);
  const shirtMatRef = useRef(null);
  const [shirtMat, setShirtMat] = useState(null);

  const logoTexture = useTexture(snap.logoDecal);
  const fullTexture = useTexture(snap.fullDecal);

  const meshRef = useRef();
  const baseCanvasRef = useRef(null);
  const baseCtxRef = useRef(null);
  const logoCanvasRef = useRef(null);
  const logoCtxRef = useRef(null);
  const logoImageRef = useRef(null);
  const logoUvRef = useRef(null);
  const backNumberCanvasRef = useRef(null);
  const backNumberCtxRef = useRef(null);
  const backNumberImageRef = useRef(null);
  const backNumberUvRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const overlayCtxRef = useRef(null);
  const paintCanvasRef = useRef(null);
  const paintCtxRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const paintTextureRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const lastUvRef = useRef(null);
  const clearSignalRef = useRef(snap.clearSignal);
  const downloadUvSignalRef = useRef(snap.downloadUvSignal);
  const overlaySignalRef = useRef(snap.overlaySignal);
  const clearOverlaySignalRef = useRef(snap.clearOverlaySignal);
  const shirtMaterialRef = useRef(snap.shirtMaterial);
  const fabricColorRef = useRef(snap.fabricColor);
  const logoColorPrimaryRef = useRef(snap.logoColorPrimary);
  const logoColorSecondaryRef = useRef(snap.logoColorSecondary);
  const backNumberTextRef = useRef(snap.backNumberText);
  const backNumberColorRef = useRef(snap.backNumberColor);
  const logoPlacedRef = useRef(false);
  const logoColorsInitializedRef = useRef(false);
  const backNumberInitializedRef = useRef(false);
  const initGenerationRef = useRef(0);
  const baseColorRef = useRef(null);
  const originalNormalMapRef = useRef(null);
  const originalNormalScaleRef = useRef(null);
  const originalRoughnessMapRef = useRef(null);
  const colorRef = useRef(snap.color);
  const brushSizeRef = useRef(snap.brushSize);

  colorRef.current = snap.color;
  brushSizeRef.current = snap.brushSize;

  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  const isOutputTextureReady = () =>
    Boolean(baseCanvasRef.current && paintTextureRef.current && !paintTextureRef.current.disposed);

  const bindOutputTexture = () => {
    const mat = shirtMatRef.current;
    const texture = paintTextureRef.current;
    if (!mat || !texture || texture.disposed) return;
    if (mat.map !== texture) {
      mat.map = texture;
      mat.needsUpdate = true;
    }
  };

  const loadMaterialPreviewImage = (materialPath, previewUrl) =>
    new Promise((resolve) => {
      const cached = baseTextureCacheRef.current[materialPath];
      if (isImageReady(cached)) {
        resolve(cached);
        return;
      }

      const fromPreload = getMaterialPreview(materialPath);
      if (isImageReady(fromPreload)) {
        resolve(fromPreload);
        return;
      }

      const img = fromPreload ?? new Image();
      if (isImageReady(img)) {
        resolve(img);
        return;
      }

      img.onload = () => resolve(isImageReady(img) ? img : null);
      img.onerror = () => resolve(null);
      if (!img.src) img.src = previewUrl;
    });

  const setupCanvasLayers = () => {
    if (isOutputTextureReady()) return true;
    if (!shirtMatRef.current) return false;

    const mat = shirtMatRef.current;

    if (!baseColorRef.current) {
      baseColorRef.current = mat.color.clone();
      originalNormalMapRef.current = mat.normalMap;
      originalNormalScaleRef.current = mat.normalScale.clone();
      originalRoughnessMapRef.current = mat.roughnessMap;
    }

    if (!baseCanvasRef.current) {
      baseCanvasRef.current = createCanvas();
      baseCtxRef.current = baseCanvasRef.current.getContext("2d");
      logoCanvasRef.current = createCanvas();
      logoCtxRef.current = logoCanvasRef.current.getContext("2d");
      backNumberCanvasRef.current = createCanvas();
      backNumberCtxRef.current = backNumberCanvasRef.current.getContext("2d");
      overlayCanvasRef.current = createCanvas();
      overlayCtxRef.current = overlayCanvasRef.current.getContext("2d");
      paintCanvasRef.current = createCanvas();
      paintCtxRef.current = paintCanvasRef.current.getContext("2d");
      outputCanvasRef.current = createCanvas();
      clearLogoLayer(logoCtxRef.current);
      clearBackNumberLayer(backNumberCtxRef.current);
      clearOverlayLayer(overlayCtxRef.current);
      clearPaintLayer(paintCtxRef.current);
      fillCanvasBase(baseCtxRef.current, null, fabricColorRef.current);
    }

    if (paintTextureRef.current && !paintTextureRef.current.disposed) {
      bindOutputTexture();
      return true;
    }

    paintTextureRef.current?.dispose();

    const texture = new THREE.CanvasTexture(outputCanvasRef.current);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    paintTextureRef.current = texture;

    mat.map = texture;
    mat.needsUpdate = true;
    canvasInitializedRef.current = true;
    return true;
  };

  const ensureLogoLayer = () => {
    const ctx = logoCtxRef.current;
    const img = logoImageRef.current;
    if (!ctx || !img?.complete) return false;

    if (!logoUvRef.current) {
      logoUvRef.current = getChestLogoUv();
    }

    return drawChestLogo(ctx, img, logoUvRef.current);
  };

  const ensureBackNumberLayer = () => {
    const ctx = backNumberCtxRef.current;
    const img = backNumberImageRef.current;
    if (!ctx || !img?.complete) return false;

    if (!backNumberUvRef.current) {
      backNumberUvRef.current = getBackNumberUv();
    }

    return drawBackNumber(ctx, img, backNumberUvRef.current);
  };

  const placeBackNumber = () => {
    if (!ensureBackNumberLayer()) return;
    compositeLayers();
  };

  const refreshBackNumberImage = async (generation) => {
    const text = backNumberTextRef.current || state.backNumberText;
    const color = backNumberColorRef.current || state.backNumberColor;

    try {
      const img = await loadBackNumberImage(text, color);
      if (generation != null && generation !== initGenerationRef.current) return;

      backNumberImageRef.current = img;
      backNumberUvRef.current = getBackNumberUv();
      placeBackNumber();
    } catch (error) {
      console.error("Failed to build back number:", error);
    }
  };

  const placeChestLogo = () => {
    if (!ensureLogoLayer()) return;
    logoPlacedRef.current = true;
    compositeLayers();
  };

  const refreshLogoImage = async (generation) => {
    const primary = logoColorPrimaryRef.current || state.logoColorPrimary;
    const secondary = logoColorSecondaryRef.current || state.logoColorSecondary;

    try {
      const img = await loadLogoImage(primary, secondary);
      if (generation != null && generation !== initGenerationRef.current) return;

      logoImageRef.current = img;
      logoUvRef.current = getChestLogoUv();
      placeChestLogo();
    } catch (error) {
      console.error("Failed to build logo:", error);
    }
  };

  const compositeLayers = () => {
    if (!setupCanvasLayers()) return;

    const baseCanvas = baseCanvasRef.current;
    const logoCanvas = logoCanvasRef.current;
    const backNumberCanvas = backNumberCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const paintCanvas = paintCanvasRef.current;
    const outputCanvas = outputCanvasRef.current;
    const texture = paintTextureRef.current;

    const materialPath = shirtMaterialRef.current;
    const baseCtx = baseCtxRef.current;
    const overlayCtx = overlayCtxRef.current;
    const cachedImage =
      (materialPath && baseTextureCacheRef.current[materialPath]) ||
      (materialPath && getMaterialPreview(materialPath));
    const hasFabricTexture = isImageReady(cachedImage);

    if (cachedImage && baseCtx) {
      fillCanvasBase(baseCtx, cachedImage, fabricColorRef.current);
    } else if (baseCtx) {
      fillCanvasBase(baseCtx, null, fabricColorRef.current);
    }

    if (overlayImageCacheRef.current && overlayCtx) {
      clearOverlayLayer(overlayCtx);
      overlayCtx.drawImage(overlayImageCacheRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    const ctx = outputCanvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(baseCanvas, 0, 0);

    if (hasFabricTexture) {
      ctx.globalCompositeOperation = "color";
      ctx.drawImage(overlayCanvas, 0, 0);
      ctx.drawImage(paintCanvas, 0, 0);
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(overlayCanvas, 0, 0);
      ctx.drawImage(paintCanvas, 0, 0);
    }

    ensureLogoLayer();
    ensureBackNumberLayer();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(logoCanvas, 0, 0);
    ctx.drawImage(backNumberCanvas, 0, 0);
    texture.needsUpdate = true;
    bindOutputTexture();
  };

  const restoreOverlayLayer = () => {
    const overlayCtx = overlayCtxRef.current;
    if (!overlayCtx) return;

    clearOverlayLayer(overlayCtx);
    if (!overlayImageDataRef.current) {
      compositeLayers();
      return;
    }

    const img = new Image();
    img.onload = () => {
      overlayImageCacheRef.current = img;
      clearOverlayLayer(overlayCtx);
      overlayCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      compositeLayers();
    };
    img.src = overlayImageDataRef.current;
  };

  const applyBaseMaterial = (materialPath) => {
    if (!setupCanvasLayers()) return;

    const ctx = baseCtxRef.current;
    const mat = shirtMatRef.current;
    if (!ctx || !mat) return;

    if (!materialPath) {
      materialLoadIdRef.current += 1;
      fillCanvasBase(ctx, null, fabricColorRef.current);
      compositeLayers();

      mat.normalMap = originalNormalMapRef.current;
      mat.normalScale.copy(originalNormalScaleRef.current);
      mat.roughnessMap = originalRoughnessMapRef.current;
      mat.roughness = 0.55;
      mat.metalness = 0;
      mat.needsUpdate = true;
      return;
    }

    const entry = ShirtMaterials.find((item) => item.path === materialPath);
    if (!entry) return;

    const applyPreviewImage = (image) => {
      if (!image || shirtMaterialRef.current !== materialPath) return;
      baseTextureCacheRef.current[materialPath] = image;
      fillCanvasBase(ctx, image, fabricColorRef.current);
      compositeLayers();
    };

    const cachedImage = baseTextureCacheRef.current[materialPath] || getMaterialPreview(materialPath);
    if (isImageReady(cachedImage)) {
      applyPreviewImage(cachedImage);
    } else {
      loadMaterialPreviewImage(materialPath, entry.preview).then(applyPreviewImage);
    }

    const cachedMaterial = materialLibraryRef.current[materialPath];
    if (cachedMaterial) {
      applyPbrMaps(cachedMaterial, mat, originalNormalMapRef.current, originalNormalScaleRef.current, originalRoughnessMapRef.current);
      return;
    }

    const loadId = ++materialLoadIdRef.current;

    const loader = new GLTFLoader();
    loader
      .loadAsync(materialPath)
      .then((gltf) => {
        if (materialLoadIdRef.current !== loadId || shirtMaterialRef.current !== materialPath) return;

        const sourceMat = getFirstMaterial(gltf);
        if (!sourceMat) return;

        materialLibraryRef.current[materialPath] = sourceMat;
        applyPbrMaps(sourceMat, mat, originalNormalMapRef.current, originalNormalScaleRef.current, originalRoughnessMapRef.current);
      })
      .catch((error) => {
        if (materialLoadIdRef.current === loadId) {
          console.error("Failed to load shirt material:", materialPath, error);
        }
      });
  };

  useEffect(() => {
    const sourceMat = materials.lambert1;
    if (!sourceMat || shirtMat) return;

    const mat = sourceMat.clone();
    mat.color.set("#ffffff");
    shirtMatRef.current = mat;
    setShirtMat(mat);
  }, [materials.lambert1, shirtMat]);

  useEffect(() => {
    if (!shirtMat) return;

    shirtMatRef.current = shirtMat;
    logoColorPrimaryRef.current = snap.logoColorPrimary;
    logoColorSecondaryRef.current = snap.logoColorSecondary;
    backNumberTextRef.current = snap.backNumberText;
    backNumberColorRef.current = snap.backNumberColor;
    fabricColorRef.current = snap.fabricColor;
    shirtMaterialRef.current = snap.shirtMaterial;

    if (!setupCanvasLayers()) return;

    applyBaseMaterial(snap.shirtMaterial);
    restoreOverlayLayer();
    compositeLayers();

    const mountId = ++initGenerationRef.current;
    refreshLogoImage(mountId);
    refreshBackNumberImage(mountId);
  }, [shirtMat]);

  useEffect(() => {
    logoColorPrimaryRef.current = snap.logoColorPrimary;
    logoColorSecondaryRef.current = snap.logoColorSecondary;

    if (!isOutputTextureReady()) return;

    if (!logoColorsInitializedRef.current) {
      logoColorsInitializedRef.current = true;
      return;
    }

    refreshLogoImage(initGenerationRef.current);
  }, [snap.logoColorPrimary, snap.logoColorSecondary]);

  useEffect(() => {
    backNumberTextRef.current = snap.backNumberText;
    backNumberColorRef.current = snap.backNumberColor;

    if (!isOutputTextureReady()) return;

    if (!backNumberInitializedRef.current) {
      backNumberInitializedRef.current = true;
      return;
    }

    refreshBackNumberImage(initGenerationRef.current);
  }, [snap.backNumberText, snap.backNumberColor]);

  useLayoutEffect(() => {
    bindOutputTexture();
  });

  useEffect(() => {
    if (!setupCanvasLayers()) return;

    shirtMaterialRef.current = snap.shirtMaterial;
    fabricColorRef.current = snap.fabricColor;
    applyBaseMaterial(snap.shirtMaterial);
  }, [snap.shirtMaterial]);

  useEffect(() => {
    if (!setupCanvasLayers()) return;

    fabricColorRef.current = snap.fabricColor;
    applyBaseMaterial(shirtMaterialRef.current);
  }, [snap.fabricColor]);

  useEffect(() => {
    if (snap.clearSignal === clearSignalRef.current) return;
    clearSignalRef.current = snap.clearSignal;

    const paintCtx = paintCtxRef.current;
    if (!paintCtx) return;

    clearPaintLayer(paintCtx);
    compositeLayers();
  }, [snap.clearSignal]);

  useEffect(() => {
    if (snap.overlaySignal === overlaySignalRef.current) return;
    overlaySignalRef.current = snap.overlaySignal;

    const overlayCtx = overlayCtxRef.current;
    if (!overlayCtx || !snap.overlayImage) return;

    overlayImageDataRef.current = snap.overlayImage;

    const img = new Image();
    img.onload = () => {
      overlayImageCacheRef.current = img;
      clearOverlayLayer(overlayCtx);
      overlayCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      compositeLayers();
    };
    img.src = snap.overlayImage;
  }, [snap.overlaySignal, snap.overlayImage]);

  useEffect(() => {
    if (snap.clearOverlaySignal === clearOverlaySignalRef.current) return;
    clearOverlaySignalRef.current = snap.clearOverlaySignal;

    const overlayCtx = overlayCtxRef.current;
    if (!overlayCtx) return;

    clearOverlayLayer(overlayCtx);
    overlayImageDataRef.current = null;
    overlayImageCacheRef.current = null;
    state.overlayImage = null;
    compositeLayers();
  }, [snap.clearOverlaySignal]);

  const buildExportCanvas = (includeTexture) => {
    const logoCanvas = logoCanvasRef.current;
    const backNumberCanvas = backNumberCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const paintCanvas = paintCanvasRef.current;
    const outputCanvas = outputCanvasRef.current;
    const overlayCtx = overlayCtxRef.current;
    if (!logoCanvas || !backNumberCanvas || !overlayCanvas || !paintCanvas) return null;

    if (overlayImageCacheRef.current && overlayCtx) {
      clearOverlayLayer(overlayCtx);
      overlayCtx.drawImage(overlayImageCacheRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    if (includeTexture) {
      compositeLayers();
      return outputCanvas;
    }

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = CANVAS_SIZE;
    exportCanvas.height = CANVAS_SIZE;
    const ctx = exportCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(overlayCanvas, 0, 0);
    ctx.drawImage(paintCanvas, 0, 0);
    ensureLogoLayer();
    ensureBackNumberLayer();
    ctx.drawImage(logoCanvas, 0, 0);
    ctx.drawImage(backNumberCanvas, 0, 0);
    return exportCanvas;
  };

  useEffect(() => {
    if (snap.downloadUvSignal === downloadUvSignalRef.current) return;
    downloadUvSignalRef.current = snap.downloadUvSignal;

    const canvas = buildExportCanvas(snap.downloadUvIncludeTexture);
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = snap.downloadUvIncludeTexture ? "shirt-uv.png" : "shirt-uv-plain.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [snap.downloadUvSignal, snap.downloadUvIncludeTexture]);

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
    if (!ctx || !uv) return;

    const x = uv.x * CANVAS_SIZE;
    const y = uv.y * CANVAS_SIZE;
    const radius = brushSizeRef.current;

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = colorRef.current;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (!isStart && lastUvRef.current) {
      const lastX = lastUvRef.current.x * CANVAS_SIZE;
      const lastY = lastUvRef.current.y * CANVAS_SIZE;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = radius * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    lastUvRef.current = uv;
    compositeLayers();
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

  return (
    <group>
      <mesh
        ref={meshRef}
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={shirtMat ?? materials.lambert1}
        dispose={null}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {snap.isFullTexture && <Decal position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} map={fullTexture} />}

        {snap.isLogoTexture && (
          <Decal
            position={LogoDecalTransform.position}
            rotation={LogoDecalTransform.rotation}
            scale={LogoDecalTransform.scale}
            map={logoTexture}
            transparent
            anisotropy={16}
            depthTest={false}
            depthWrite
          />
        )}
      </mesh>
    </group>
  );
};

export default Shirt;
