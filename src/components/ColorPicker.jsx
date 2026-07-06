import React from "react";
import { SketchPicker } from "react-color";
import { useSnapshot } from "valtio";

import state from "../store";

const ColorPicker = () => {
  const snap = useSnapshot(state);

  return (
    <div className="absolute left-full ml-3 flex flex-col gap-3">
      <SketchPicker color={snap.color} disableAlpha presetColors={["#ccc", "#EFBD4E", "#80C670", "#726DE8", "#353934", "#2CCCE4", "#ff8a65", "#7098DA", "#C19277", "#FF96AD", "#512314", "#5F123D"]} onChange={(color) => (state.color = color.hex)} />

      <div className="bg-white rounded-lg p-3 shadow-md w-[220px]">
        <div>
          <label className="text-xs text-gray-600 font-medium">Размер кисти: {snap.brushSize}px</label>
          <input type="range" min={5} max={60} value={snap.brushSize} onChange={(e) => (state.brushSize = Number(e.target.value))} className="w-full mt-1 accent-blue-500" />
        </div>

        <button type="button" onClick={() => (state.clearSignal += 1)} className="w-full mt-3 py-2 px-3 rounded-md text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
          Очистить рисунок
        </button>

        <button
          type="button"
          onClick={() => {
            state.downloadUvIncludeTexture = true;
            state.downloadUvSignal += 1;
          }}
          className="w-full mt-2 py-2 px-3 rounded-md text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          Скачать развёртку
        </button>

        <button
          type="button"
          onClick={() => {
            state.downloadUvIncludeTexture = false;
            state.downloadUvSignal += 1;
          }}
          className="w-full mt-2 py-2 px-3 rounded-md text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Скачать без текстуры
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
