import { swatch, fileIcon, ai, logoShirt, stylishShirt, select, numberIcon } from "../assets";

export const ShirtMaterials = [
  {
    name: "Sand rocks",
    path: "/materials/1.gltf/coast_sand_rocks_02_4k.gltf",
    preview: "/materials/1.gltf/textures/coast_sand_rocks_02_diff_4k.jpg",
  },
  {
    name: "Red brick",
    path: "/materials/2.gltf/faux_fur_geometric_4k.gltf",
    preview: "/materials/2.gltf/textures/faux_fur_geometric_spec_ior_4k.jpg",
  },
  {
    name: "Painted plaster",
    path: "/materials/3.gltf/painted_plaster_wall_4k.gltf",
    preview: "/materials/3.gltf/textures/painted_plaster_wall_diff_4k.jpg",
  },
  {
    name: "Gravel floor",
    path: "/materials/4.gltf/gravel_floor_04_4k.gltf",
    preview: "/materials/4.gltf/textures/gravel_floor_04_diff_4k.jpg",
  },
  {
    name: "Bi stretch",
    path: "/materials/5.gltf/bi_stretch_4k.gltf",
    preview: "/materials/5.gltf/textures/bi_stretch_diff_4k.jpg",
  },
  {
    name: "Waffle cotton",
    path: "/materials/6.gltf/waffle_pique_cotton_4k.gltf",
    preview: "/materials/6.gltf/textures/waffle_pique_cotton_diff_4k.jpg",
  },
  {
    name: "Rough linen",
    path: "/materials/7.gltf/rough_linen_4k.gltf",
    preview: "/materials/7.gltf/textures/rough_linen_diff_4k.jpg",
  },
  {
    name: "Crepe satin",
    path: "/materials/8.gltf/crepe_satin_4k.gltf",
    preview: "/materials/8.gltf/textures/crepe_satin_diff_4k.jpg",
  },
  {
    name: "Gingham check",
    path: "/materials/9.gltf/gingham_check_4k.gltf",
    preview: "/materials/9.gltf/textures/gingham_check_diff_4k.jpg",
  },
  {
    name: "Floral jacquard",
    path: "/materials/10.gltf/floral_jacquard_4k.gltf",
    preview: "/materials/10.gltf/textures/floral_jacquard_diff_4k.jpg",
  },
  {
    name: "Ribbed corduroy",
    path: "/materials/11.gltf/ribbed_corduroy_4k.gltf",
    preview: "/materials/11.gltf/textures/ribbed_corduroy_diff_4k.jpg",
  },
  {
    name: "Leather red",
    path: "/materials/12.gltf/leather_red_03_4k.gltf",
    preview: "/materials/12.gltf/textures/leather_red_03_rough_4k.jpg",
  },
];

export const EditorTabs = [
  {
    name: "colorpicker",
    icon: swatch,
  },
  {
    name: "materialpicker",
    icon: stylishShirt,
  },
  {
    name: "imageoverlay",
    icon: fileIcon,
  },
  {
    name: "backnumberpicker",
    icon: numberIcon,
  },
  {
    name: "variantgallery",
    icon: select,
  },
];

export const FilterTabs = [
  {
    name: "logoShirt",
    icon: logoShirt,
  },
  {
    name: "stylishShirt",
    icon: stylishShirt,
  },
];

export const DecalTypes = {
  logo: {
    stateProperty: "logoDecal",
    filterTab: "logoShirt",
  },
  full: {
    stateProperty: "fullDecal",
    filterTab: "stylishShirt",
  },
};

/** Смещение логотипа относительно модели (редактируйте здесь) */
export const ChestLogoPlacement = {
  /** Точка raycast на груди в NDC: центр модели = (0, 0) */
  raycastNdc: { x: 0, y: 0.1 },
  /** UV-якорь, если raycast не попал в меш */
  fallbackUv: { x: 0.27, y: 0.25 },
  /** Доп. смещение на UV-развёртке, доли 0–1 */
  uvOffset: { x: 0, y: 0 },
  /** Ширина логотипа на развёртке (доля ширины) */
  uvWidth: 0.2,
};

/** Decal-логотип в локальных координатах меша */
export const LogoDecalTransform = {
  position: [0.1, 0.58, 0.4],
  rotation: [0, 0, 0],
  scale: [0.6, 0.08, 0.12],
};

/** Смещение номера на спине на UV-развёртке */
export const BackNumberPlacement = {
  fallbackUv: { x: 0.73, y: 0.28 },
  uvOffset: { x: 0, y: 0 },
  uvWidth: 0.25,
};

/**
 * Палитры футбольных клубов (только пресеты, без свободного RGB).
 * logoPrimary / logoSecondary фиксируются при выборе команды и не кастомизируются.
 */
export const FootballTeams = [
  {
    id: "barcelona",
    name: "Barcelona",
    colors: {
      fabric: "#A50044",
      logoPrimary: "#004D98",
      logoSecondary: "#EDBB00",
      backNumber: "#FFFFFF",
      brush: "#97C1E7",
    },
  },
  {
    id: "real-madrid",
    name: "Real Madrid",
    colors: {
      fabric: "#FFFFFF",
      logoPrimary: "#FEBE10",
      logoSecondary: "#00529F",
      backNumber: "#00529F",
      brush: "#EE334E",
    },
  },
  {
    id: "manchester-united",
    name: "Man United",
    colors: {
      fabric: "#DA291C",
      logoPrimary: "#FBE122",
      logoSecondary: "#000000",
      backNumber: "#FFFFFF",
      brush: "#FBE122",
    },
  },
  {
    id: "chelsea",
    name: "Chelsea",
    colors: {
      fabric: "#034694",
      logoPrimary: "#DBA111",
      logoSecondary: "#FFFFFF",
      backNumber: "#FFFFFF",
      brush: "#ED1C24",
    },
  },
  {
    id: "juventus",
    name: "Juventus",
    colors: {
      fabric: "#1A1A1A",
      logoPrimary: "#FFFFFF",
      logoSecondary: "#C8A35F",
      backNumber: "#FFFFFF",
      brush: "#C8A35F",
    },
  },
];

export const getTeamPaletteList = (team) => [
  team.colors.fabric,
  team.colors.logoPrimary,
  team.colors.logoSecondary,
  team.colors.backNumber,
  team.colors.brush,
];
