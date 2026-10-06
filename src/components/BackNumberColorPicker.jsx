import React from "react";
import { useSnapshot } from "valtio";

import state from "../store";
import { FootballTeams, getTeamPaletteList } from "../config/constants";
import PresetColorGrid from "./PresetColorGrid";

const BackNumberColorPicker = ({ onClose }) => {
  const snap = useSnapshot(state);
  const activeTeam = FootballTeams.find((team) => team.id === snap.selectedTeamId);
  const presetColors = activeTeam ? getTeamPaletteList(activeTeam) : [];

  return (
    <div className="picker-panel relative">
      {onClose && (
        <button type="button" className="picker-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
      <p className="text-xs font-semibold text-gray-700 mb-3 pr-6">Номер на спине</p>

      <label className="block mb-3">
        <span className="text-xs text-gray-600 font-medium">Номер</span>
        <input type="text" value={snap.backNumberText} maxLength={3} onChange={(e) => (state.backNumberText = e.target.value.toUpperCase())} className="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 text-sm font-bold tracking-wider" />
      </label>

      <div>
        <span className="text-xs text-gray-600 font-medium">Цвет номера</span>
        {activeTeam ? (
          <div className="mt-2">
            <p className="text-[10px] text-gray-500 mb-2">Палитра {activeTeam.name}</p>
            <PresetColorGrid colors={presetColors} value={snap.backNumberColor} onChange={(hex) => (state.backNumberColor = hex)} />
          </div>
        ) : (
          <p className="text-xs text-gray-500 mt-2">Сначала выберите команду внизу</p>
        )}
      </div>
    </div>
  );
};

export default BackNumberColorPicker;
