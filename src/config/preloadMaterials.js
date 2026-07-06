import { ShirtMaterials } from "./constants";

const THUMB_SIZE = 200;
const previewCache = new Map();
const listeners = new Set();

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

const createThumbnailUrl = (image, preview) => {
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
      thumbUrl = createThumbnailUrl(image, preview);
    } catch {
      thumbUrl = preview;
    }
  }

  previewCache.set(path, { full: image, preview, thumbUrl });
  notify();
};

export const preloadMaterialPreviews = () => {
  ShirtMaterials.forEach(({ path, preview }) => {
    if (previewCache.has(path)) return;

    const img = new Image();
    previewCache.set(path, { full: null, preview, thumbUrl: preview, loading: img });

    img.decoding = "async";
    img.onload = () => storePreview(path, preview, img);
    img.onerror = () => {
      previewCache.delete(path);
      notify();
    };
    img.src = preview;
  });
};
