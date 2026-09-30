// Single source of truth for the TrustChain palette. Tailwind (tailwind.config.js)
// and every three.js material read from here so HTML and 3D always match.
//
// Colour carries meaning across the whole story:
//   danger → counterfeit / broken trust (Scene 1, alerts)
//   brand  → TrustChain technology (the "hero" colour of the solution)
//   safe   → verified / secured (Scene 8, success states)
//   warn   → anomalies that need attention
const theme = {
  ink: {
    950: "#04060b",
    900: "#070b14",
    800: "#0c1322",
    700: "#131c2e",
    600: "#1e293b",
  },
  brand: {
    DEFAULT: "#2dd4bf",
    soft: "#5eead4",
    deep: "#0f766e",
  },
  danger: {
    DEFAULT: "#f43f5e",
    soft: "#fb7185",
  },
  safe: {
    DEFAULT: "#34d399",
    soft: "#6ee7b7",
  },
  warn: {
    DEFAULT: "#fbbf24",
  },
  // One accent per technology layer (Scene 3) and per sensor (Scene 2).
  layer: {
    blockchain: "#60a5fa",
    iot: "#2dd4bf",
    ai: "#c084fc",
  },
  sensor: {
    rfid: "#2dd4bf",
    gps: "#60a5fa",
    temp: "#fbbf24",
  },
};

module.exports = theme;
