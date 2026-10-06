import React from "react";

const PresetColorGrid = ({ colors, value, onChange }) => (
  <div className="preset-color-grid">
    {colors.map((hex, index) => {
      const isActive = value?.toLowerCase() === hex.toLowerCase();

      return (
        <button
          key={`${hex}-${index}`}
          type="button"
          onClick={() => onChange(hex)}
          className={`preset-color-swatch ${isActive ? "preset-color-swatch-active" : ""}`}
          style={{ backgroundColor: hex }}
          title={hex}
          aria-label={`Цвет ${hex}`}
        />
      );
    })}
  </div>
);

export default PresetColorGrid;
