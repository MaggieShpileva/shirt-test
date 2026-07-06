import React from "react";
import { useSnapshot } from "valtio";

import state from "../store";

const BackNumberColorPicker = () => {
  const snap = useSnapshot(state);

  return (
    <div className="absolute left-full ml-3 glassmorphism p-3 w-[220px] rounded-md">
      <p className="text-xs font-semibold text-gray-700 mb-3">Номер на спине</p>

      <label className="block mb-3">
        <span className="text-xs text-gray-600 font-medium">Номер</span>
        <input type="text" value={snap.backNumberText} maxLength={3} onChange={(e) => (state.backNumberText = e.target.value.toUpperCase())} className="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 text-sm font-bold tracking-wider" />
      </label>

      <label className="block">
        <span className="text-xs text-gray-600 font-medium">Цвет номера</span>
        <input type="color" value={snap.backNumberColor} onChange={(e) => (state.backNumberColor = e.target.value)} className="w-full h-9 mt-1 rounded border border-gray-200 cursor-pointer" />
      </label>
    </div>
  );
};

export default BackNumberColorPicker;
