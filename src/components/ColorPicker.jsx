import React from "react";
import { useSnapshot } from "valtio";

import state from "../store";
import { FootballTeams, getTeamPaletteList } from "../config/constants";
import PresetColorGrid from "./PresetColorGrid";

const ColorPicker = ({ onClose }) => {
  const snap = useSnapshot(state);
  const activeTeam = FootballTeams.find((team) => team.id === snap.selectedTeamId);
  const presetColors = activeTeam ? getTeamPaletteList(activeTeam) : [];

  return (
    <div className="picker-panel-stack">
      <div className="picker-panel relative">
        {onClose && (
          <button type="button" className="picker-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        )}
        <p className="text-xs font-semibold text-gray-700 mb-2 pr-6">Цвет кисти</p>

        {activeTeam ? (
          <>
            <p className="text-[10px] text-gray-500 mb-2">Палитра {activeTeam.name}</p>
            <PresetColorGrid colors={presetColors} value={snap.color} onChange={(hex) => (state.color = hex)} />
          </>
        ) : (
          <p className="text-xs text-gray-500">Сначала выберите команду внизу</p>
        )}
      </div>

      <div className="picker-panel bg-white/80">
        <div>
          <label className="text-xs text-gray-600 font-medium">Размер кисти: {snap.brushSize}px</label>
          <input type="range" min={5} max={60} value={snap.brushSize} onChange={(e) => (state.brushSize = Number(e.target.value))} className="w-full mt-1 accent-blue-500" />
        </div>

        <button type="button" onClick={() => (state.clearSignal += 1)} className="w-full mt-3 py-2 px-3 rounded-md text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
          Очистить рисунок
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
