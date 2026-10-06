import React from "react";
import { useSnapshot } from "valtio";

import state from "../store";
import { FootballTeams, getTeamPaletteList } from "../config/constants";

const COLOR_ROLES = [
  { key: "fabric", label: "Ткань", stateKey: "fabricColor" },
  { key: "backNumber", label: "Номер", stateKey: "backNumberColor" },
  { key: "brush", label: "Кисть", stateKey: "color" },
];

export const applyTeamColors = (team) => {
  state.selectedTeamId = team.id;
  state.fabricColor = team.colors.fabric;
  state.logoColorPrimary = team.colors.logoPrimary;
  state.logoColorSecondary = team.colors.logoSecondary;
  state.backNumberColor = team.colors.backNumber;
  state.color = team.colors.brush;
};

const TeamPalettePicker = () => {
  const snap = useSnapshot(state);
  const activeTeam = FootballTeams.find((team) => team.id === snap.selectedTeamId);

  return (
    <div className="team-palette-bar glassmorphism">
      <div className="team-palette-list" role="listbox" aria-label="Выбор футбольной команды">
        {FootballTeams.map((team) => {
          const isActive = snap.selectedTeamId === team.id;
          const palette = getTeamPaletteList(team);

          return (
            <button
              key={team.id}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => applyTeamColors(team)}
              className={`team-palette-card ${isActive ? "team-palette-card-active" : ""}`}
              title={team.name}
            >
              <span className="team-palette-swatches">
                {palette.slice(0, 3).map((hex, index) => (
                  <span key={`${team.id}-${index}`} className="team-palette-swatch" style={{ backgroundColor: hex }} />
                ))}
              </span>
              <span className="team-palette-name">{team.name}</span>
            </button>
          );
        })}
      </div>

      {activeTeam && (
        <div className="team-palette-roles" aria-label="Цвета команды">
          {COLOR_ROLES.map((role) => (
            <button
              key={role.key}
              type="button"
              className="team-palette-role"
              title={`${role.label}: ${activeTeam.colors[role.key]}`}
              onClick={() => {
                state[role.stateKey] = activeTeam.colors[role.key];
              }}
            >
              <span className="team-palette-role-swatch" style={{ backgroundColor: activeTeam.colors[role.key] }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPalettePicker;
