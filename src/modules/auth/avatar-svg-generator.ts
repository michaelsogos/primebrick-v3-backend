/**
 * Generate hexagon avatar SVG with initials and background color.
 */

export function generateHexagonAvatarSvg(
  initials: string,
  backgroundColor: string,
  size: number = 100
): string {
  // Calculate contrast color for text (white/black based on background)
  const textColor = getContrastTextColor(backgroundColor);

  // Generate hexagon SVG
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="hexagon">
      <polygon points="${getHexagonPoints(size)}" />
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" fill="${backgroundColor}" clip-path="url(#hexagon)" />
  <text x="50%" y="${size/2 + size*0.05}" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-size="${size * 0.4}" font-family="Arial, sans-serif" font-weight="bold">
    ${initials}
  </text>
</svg>`.trim();

  // Encode to base64 data URI
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get hexagon polygon points for a given size.
 */
function getHexagonPoints(size: number): string {
  const center = size / 2;
  const radius = size * 0.45; // Reduced from size/2 for better fit within viewBox
  const points: string[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return points.join(' ');
}

/**
 * Convert hex color to RGB array
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : null;
}

/**
 * Calculate relative luminance of a hex color using W3C standard formula.
 * Returns a value between 0 (black) and 1 (white).
 */
function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // Default to middle if invalid

  const [r, g, b] = rgb.map((channel) => {
    channel = channel / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Determine contrast text color (white or black) based on background color.
 * Uses W3C luminance formula for accurate contrast calculation.
 */
function getContrastTextColor(hexColor: string): string {
  const luminance = calculateLuminance(hexColor);
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
