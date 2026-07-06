import React, { useRef } from "react";
import { useSnapshot } from "valtio";

import state, { DEFAULT_OVERLAY_SCALE } from "../store";
import { reader } from "../config/helpers";

const ImageOverlayPicker = () => {
  const snap = useSnapshot(state);
  const inputRef = useRef(null);

  const resetOverlayTransform = () => {
    state.overlayScale = DEFAULT_OVERLAY_SCALE;
    state.overlayOffsetX = 0;
    state.overlayOffsetY = 0;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await reader(file);
    resetOverlayTransform();
    state.overlayImage = result;
    state.overlaySignal += 1;

    e.target.value = "";
  };

  return (
    <div className="absolute left-full ml-3 glassmorphism p-3 w-[240px] rounded-md">
      <p className="text-xs font-semibold text-gray-700 mb-3">Накладка на футболку</p>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <button type="button" onClick={() => inputRef.current?.click()} className="w-full py-2 px-3 rounded-md text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        Загрузить картинку
      </button>

      {snap.overlayImage && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          <div>
            <label className="text-xs text-gray-600 font-medium">Размер: {Math.round(snap.overlayScale * 100)}%</label>
            <input type="range" min={5} max={100} step={1} value={Math.round(snap.overlayScale * 100)} onChange={(e) => (state.overlayScale = Number(e.target.value) / 100)} className="w-full mt-1 accent-blue-500" />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Влево ← → Вправо</label>
            <input type="range" min={-40} max={40} step={1} value={Math.round(snap.overlayOffsetX * 100)} onChange={(e) => (state.overlayOffsetX = Number(e.target.value) / 100)} className="w-full mt-1 accent-blue-500" />
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Вверх ← → Вниз</label>
            <input type="range" min={-40} max={40} step={1} value={Math.round(snap.overlayOffsetY * 100)} onChange={(e) => (state.overlayOffsetY = Number(e.target.value) / 100)} className="w-full mt-1 accent-blue-500" />
          </div>

          <button type="button" onClick={resetOverlayTransform} className="w-full py-2 px-3 rounded-md text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
            Сбросить положение
          </button>
        </div>
      )}

      <button type="button" onClick={() => (state.clearOverlaySignal += 1)} className="w-full mt-3 py-2 px-3 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
        Убрать картинку
      </button>
    </div>
  );
};

export default ImageOverlayPicker;
