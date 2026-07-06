import state from "../store";

export const downloadCanvasToImage = () => {
  const canvas = document.querySelector("canvas");
  const dataURL = canvas.toDataURL();
  const link = document.createElement("a");

  link.href = dataURL;
  link.download = "canvas.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadDataUrl = (dataUrl, filename) =>
  new Promise((resolve) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Пауза между скачиваниями — иначе браузер блокирует второй файл
    setTimeout(resolve, 500);
  });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFrames = (count = 3) =>
  new Promise((resolve) => {
    let frames = 0;
    const tick = () => {
      frames += 1;
      if (frames >= count) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

export const takeFrontBackScreenshots = async () => {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  const savedRotation = [state.modelRotation[0], state.modelRotation[1]];
  state.isScreenshotting = true;

  try {
    state.modelRotation[0] = 0;
    state.modelRotation[1] = 0;
    await waitFrames(10);
    await wait(100);
    await downloadDataUrl(canvas.toDataURL("image/png"), "shirt-front.png");

    state.modelRotation[0] = 0;
    state.modelRotation[1] = Math.PI;
    await waitFrames(10);
    await wait(100);
    await downloadDataUrl(canvas.toDataURL("image/png"), "shirt-back.png");
  } finally {
    state.modelRotation[0] = savedRotation[0];
    state.modelRotation[1] = savedRotation[1];
    state.isScreenshotting = false;
  }
};

export const reader = (file) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });

export const getContrastingColor = (color) => {
  // Remove the '#' character if it exists
  const hex = color.replace("#", "");

  // Convert the hex string to RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate the brightness of the color
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black or white depending on the brightness
  return brightness > 128 ? "black" : "white";
};
