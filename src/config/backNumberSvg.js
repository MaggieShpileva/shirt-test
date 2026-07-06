export const buildBackNumberSvgMarkup = (text, color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
<style type="text/css">
.num{fill:${color};}
</style>
<text class="num" x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="64">${text}</text>
</svg>`;

export const loadBackNumberImage = (text, color) =>
  new Promise((resolve, reject) => {
    const label = text || "01";
    const fill = color || "#FFFFFF";
    const svg = buildBackNumberSvgMarkup(label, fill);
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load back number SVG"));
    };
    img.src = url;
  });
