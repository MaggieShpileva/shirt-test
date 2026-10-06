import { ShirtMaterials } from "./constants";

const THUMB_SIZE = 200;
const MAX_CONCURRENT = 2;
const previewCache = new Map();
const listeners = new Set();
const loadQueue = [];
let activeLoads = 0;

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeMaterialPreviews = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getMaterialPreview = (materialPath) => {
  const entry = previewCache.get(materialPath);
  if (!entry) return null;
  return entry.full ?? entry.loading ?? null;
};

export const getMaterialThumbnailUrl = (materialPath) => {
  const entry = previewCache.get(materialPath);
  return entry?.thumbUrl ?? entry?.preview ?? null;
};

const createThumbnailUrl = (image) => {
  const canvas = document.createElement("canvas");
  canvas.width = THUMB_SIZE;
  canvas.height = THUMB_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, THUMB_SIZE, THUMB_SIZE);
  return canvas.toDataURL("image/jpeg", 0.82);
};

const storePreview = (path, preview, image) => {
  const prev = previewCache.get(path);
  if (prev?.thumbUrl?.startsWith("data:")) return;

  let thumbUrl = preview;
  if (image?.complete && image.naturalWidth > 0) {
    try {
      thumbUrl = createThumbnailUrl(image);
    } catch {
      thumbUrl = preview;
    }
  }

  previewCache.set(path, { full: image, preview, thumbUrl });
  notify();
};

const pumpQueue = () => {
  while (activeLoads < MAX_CONCURRENT && loadQueue.length > 0) {
    const { path, preview } = loadQueue.shift();
    if (previewCache.get(path)?.full || previewCache.get(path)?.loading) continue;

    activeLoads += 1;
    const img = new Image();
    previewCache.set(path, { full: null, preview, thumbUrl: preview, loading: img });
    notify();

    img.decoding = "async";
    img.onload = () => {
      storePreview(path, preview, img);
      activeLoads -= 1;
      pumpQueue();
    };
    img.onerror = () => {
      previewCache.delete(path);
      notify();
      activeLoads -= 1;
      pumpQueue();
    };
    img.src = preview;
  }
};

/** Ленивая фоновая подгрузка превью (не при старте приложения). */
export const preloadMaterialPreviews = () => {
  ShirtMaterials.forEach(({ path, preview }) => {
    const entry = previewCache.get(path);
    if (entry?.full || entry?.loading) return;
    if (loadQueue.some((item) => item.path === path)) return;
    loadQueue.push({ path, preview });
  });
  pumpQueue();
};
