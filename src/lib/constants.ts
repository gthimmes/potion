export const COVER_GRADIENTS: Record<string, string> = {
  sunset: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
  ocean: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
  grape: "linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)",
  forest: "linear-gradient(120deg, #96e6a1 0%, #d4fc79 100%)",
  ember: "linear-gradient(120deg, #ff9a9e 0%, #fecfef 100%)",
  slate: "linear-gradient(120deg, #667eea 0%, #764ba2 100%)",
};

export const COVER_KEYS = Object.keys(COVER_GRADIENTS);

export const PAGE_EMOJIS = [
  "📄", "📝", "📓", "📔", "📕", "📗", "📘", "📙", "📚", "🗒️",
  "✅", "🎯", "🚀", "💡", "🔥", "⭐", "🌟", "🎨", "🧠", "💻",
  "📅", "📊", "📈", "🗂️", "🏷️", "🔖", "📌", "🧩", "⚙️", "🛠️",
  "🌱", "🌍", "☕", "🍕", "🎵", "🎬", "🏆", "❤️", "👋", "🙌",
];

export const SELECT_COLORS = [
  "#e3e2e0", "#ffd6cc", "#ffe0b3", "#fff3bf",
  "#d3f9d8", "#c5f6fa", "#d0ebff", "#e5dbff",
  "#fcc2d7", "#ffec99",
];

// Deterministic color for a select option value.
export function selectColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return SELECT_COLORS[hash % SELECT_COLORS.length];
}
