import { proxy } from "valtio";

const state = proxy({
  intro: false,
  color: "#EFBD48",
  isLogoTexture: false,
  isFullTexture: false,
  logoDecal: "./threejs.png",
  fullDecal: "./threejs.png",
  // Режим рисования кистью по модели
  isPainting: false,
  brushSize: 25,
  // Счётчик-сигнал для очистки нарисованного слоя
  clearSignal: 0,
  // Угол вращения модели [x, y]
  modelRotation: [0, 0],
});

export default state;
