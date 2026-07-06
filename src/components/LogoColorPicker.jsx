import React from "react";
import { useSnapshot } from "valtio";

import state from "../store";

const LogoColorPicker = () => {
  const snap = useSnapshot(state);

  return (
    <div className="absolute left-full ml-3 glassmorphism p-3 w-[220px] rounded-md">
      <p className="text-xs font-semibold text-gray-700 mb-3">Цвета логотипа</p>

      <label className="block mb-3">
        <span className="text-xs text-gray-600 font-medium">Акцент (.st1)</span>
        <input
          type="color"
          value={snap.logoColorPrimary}
          onChange={(e) => (state.logoColorPrimary = e.target.value)}
          className="w-full h-9 mt-1 rounded border border-gray-200 cursor-pointer"
        />
      </label>

      <label className="block">
        <span className="text-xs text-gray-600 font-medium">Основной (.st2)</span>
        <input
          type="color"
          value={snap.logoColorSecondary}
          onChange={(e) => (state.logoColorSecondary = e.target.value)}
          className="w-full h-9 mt-1 rounded border border-gray-200 cursor-pointer"
        />
      </label>
    </div>
  );
};

export default LogoColorPicker;
