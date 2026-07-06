const LOGO_PATHS = `
<path class="st2" d="M215.5,0c-2.8,0-5.3,1.8-6.2,4.5L194.8,49h13.7l13.2-40.5C223,4.3,219.9,0,215.5,0z"></path>
<path class="st1" d="M120.8,1H78l-3.9,12h30L65.4,39c-3,2-3.5,6.1-1.2,8.8c2,2.4,5.4,2.8,8,1.1l39-26.2L102.6,49h13.7l12.2-37.5  C130.1,6.3,126.3,1,120.8,1z"></path>
<path class="st2" d="M15.6,1L0,49h13.7l11.7-36h27.9l-19,12.8c-2.8,1.9-3.7,5.6-1.8,8.4c1.9,2.8,5.6,3.5,8.4,1.7l23.7-16  C73,14.2,69,1,58.8,1H15.6z"></path>
<path class="st2" d="M187.8,1h-43.1L129,49h13.7l11.7-36h27.9l-24.7,16.7l15.3,18.2c2,2.4,5.4,2.8,8,1.1c3-2,3.5-6.1,1.2-8.8l-6.7-8  L193.6,20C202,14.2,198,1,187.8,1z"></path>
`;

export const buildLogoSvgMarkup = (primaryColor, secondaryColor) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 50">
<style type="text/css">
.st1{fill:${primaryColor};}
.st2{fill:${secondaryColor};}
</style>
${LOGO_PATHS}
</svg>`;

export const loadLogoImage = (primaryColor, secondaryColor) =>
  new Promise((resolve, reject) => {
    const primary = primaryColor || "#00C7B1";
    const secondary = secondaryColor || "#FFFFFF";
    const svg = buildLogoSvgMarkup(primary, secondary);
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load logo SVG"));
    };
    img.src = url;
  });
