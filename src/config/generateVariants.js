import { ShirtMaterials } from "./constants";

const PRESET_COLORS = [
  "#EFBD4E",
  "#80C670",
  "#726DE8",
  "#353934",
  "#2CCCE4",
  "#ff8a65",
  "#7098DA",
  "#C19277",
  "#FF96AD",
  "#512314",
  "#5F123D",
  "#ffffff",
  "#1a1a1a",
  "#e63946",
  "#457b9d",
];

export const generateShirtVariants = (count = 20) =>
  Array.from({ length: count }, (_, index) => {
    const material = ShirtMaterials[Math.floor(Math.random() * ShirtMaterials.length)];

    return {
      id: index + 1,
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      materialPath: material.path,
      materialName: material.name,
    };
  });

export const SHIRT_VARIANTS = generateShirtVariants(20);
