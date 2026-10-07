// The eight chapters of the scroll story. Navbar and section eyebrows read from here.
export const CHAPTERS = [
  { id: "problem", label: "The Problem" },
  { id: "solution", label: "Our Solution" },
  { id: "technology", label: "Technology" },
  { id: "workflow", label: "Workflow" },
  { id: "in-action", label: "In Action" },
  { id: "features", label: "Features" },
  { id: "business", label: "Business" },
  { id: "impact", label: "Impact" },
];

export function chapterIndex(id) {
  return String(CHAPTERS.findIndex((c) => c.id === id) + 1).padStart(2, "0");
}

export const LINKS = {
  demo: "https://app.trustchain.hemeshkanyal.com/",
  github: "https://github.com/HemeshKanyal/trustchain-webpage",
  pitchDeck: null, // TODO: add the pitch deck URL to show its button
};
