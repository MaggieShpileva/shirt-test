import React, { useSyncExternalStore } from "react";
import { useSnapshot } from "valtio";

import state, { DEFAULT_FABRIC_COLOR, FABRIC_COLOR_WITH_TEXTURE } from "../store";
import { FootballTeams, ShirtMaterials } from "../config/constants";
import { getMaterialThumbnailUrl, subscribeMaterialPreviews } from "../config/preloadMaterials";

const MaterialThumb = ({ material, isSelected }) => {
  useSyncExternalStore(subscribeMaterialPreviews, () => getMaterialThumbnailUrl(material.path));
  const src = getMaterialThumbnailUrl(material.path) ?? material.preview;

  return (
    <button
      type="button"
      onClick={() => {
        state.shirtMaterial = material.path;
        state.fabricColor = FABRIC_COLOR_WITH_TEXTURE;
      }}
      className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
      }`}
      title={material.name}
    >
      <img
        src={src}
        alt={material.name}
        loading="eager"
        fetchpriority="high"
        decoding="sync"
        className="w-full h-full object-cover bg-gray-100"
      />
    </button>
  );
};

const MaterialPicker = ({ onClose }) => {
  const snap = useSnapshot(state);

  return (
    <div className="picker-panel relative">
      {onClose && (
        <button type="button" className="picker-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
      <p className="text-xs font-semibold text-gray-700 mb-3 pr-6">Материал</p>

      <div className="grid grid-cols-3 gap-2">
        {ShirtMaterials.map((material) => (
          <MaterialThumb
            key={material.path}
            material={material}
            isSelected={snap.shirtMaterial === material.path}
          />
        ))}
      </div>

      {snap.shirtMaterial && (
        <button
          type="button"
          onClick={() => {
            state.shirtMaterial = null;
            const active = FootballTeams.find((t) => t.id === state.selectedTeamId);
            state.fabricColor = active?.colors.fabric ?? DEFAULT_FABRIC_COLOR;
          }}
          className="w-full mt-3 py-2 px-3 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Убрать текстуру
        </button>
      )}
    </div>
  );
};

export default MaterialPicker;
