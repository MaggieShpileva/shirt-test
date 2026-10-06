import { proxy } from "valtio";

import { FootballTeams } from "../config/constants";

export const DEFAULT_FABRIC_COLOR = "#0C1520";
export const FABRIC_COLOR_WITH_TEXTURE = "#FFFFFF";
export const DEFAULT_OVERLAY_SCALE = 0.4;

const defaultTeam = FootballTeams[0];

const state = proxy({
  intro: false,
  color: defaultTeam.colors.brush,
  selectedTeamId: defaultTeam.id,
  isLogoTexture: false,
  isFullTexture: false,
  logoDecal: "/logo.svg",
  fullDecal: "./threejs.png",
  shirtMaterial: null,
  fabricColor: defaultTeam.colors.fabric,
  logoColorPrimary: defaultTeam.colors.logoPrimary,
  logoColorSecondary: defaultTeam.colors.logoSecondary,
  backNumberText: "01",
  backNumberColor: defaultTeam.colors.backNumber,
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
