import React, { useRef } from "react";

import state from "../store";
import { reader } from "../config/helpers";

const ImageOverlayPicker = () => {
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await reader(file);
    state.overlayImage = result;
    state.overlaySignal += 1;

    e.target.value = "";
  };

  return (
    <div className="absolute left-full ml-3 glassmorphism p-3 w-[220px] rounded-md">
      <p className="text-xs font-semibold text-gray-700 mb-3">Накладка на футболку</p>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <button type="button" onClick={() => inputRef.current?.click()} className="w-full py-2 px-3 rounded-md text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        Загрузить картинку
      </button>

      <button type="button" onClick={() => (state.clearOverlaySignal += 1)} className="w-full mt-3 py-2 px-3 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
        Убрать картинку
      </button>
    </div>
  );
};

export default ImageOverlayPicker;
