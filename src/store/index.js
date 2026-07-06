import { proxy } from "valtio";

export const DEFAULT_FABRIC_COLOR = "#0C1520";
export const FABRIC_COLOR_WITH_TEXTURE = "#FFFFFF";
export const DEFAULT_OVERLAY_SCALE = 0.4;

const state = proxy({
  intro: false,
  color: "#EFBD48",
  isLogoTexture: false,
  isFullTexture: false,
  logoDecal: "/logo.svg",
  fullDecal: "./threejs.png",
  shirtMaterial: null,
  fabricColor: DEFAULT_FABRIC_COLOR,
  logoColorPrimary: "#00C7B1",
  logoColorSecondary: "#FFFFFF",
  backNumberText: "01",
  backNumberColor: "#FFFFFF",
  // Режим рисования кистью по модели
  isPainting: false,
  brushSize: 25,
  // Счётчик-сигнал для очистки нарисованного слоя
  clearSignal: 0,
  downloadUvSignal: 0,
  downloadUvIncludeTexture: true,
  downloadGlbSignal: 0,
  isExportingGlb: false,
  overlayImage: null,
  overlayScale: DEFAULT_OVERLAY_SCALE,
  overlayOffsetX: 0,
  overlayOffsetY: 0,
  overlaySignal: 0,
  clearOverlaySignal: 0,
  // Угол вращения модели [x, y]
  modelRotation: [0, 0],
  isScreenshotting: false,
});

export default state;
