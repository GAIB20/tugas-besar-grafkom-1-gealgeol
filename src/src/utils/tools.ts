function componentToHex(c: number) {
  // Convert from normalized (0 to 1) range to 0-255 range and round
  const scaledValue = Math.round(c * 255);
  const hex = scaledValue.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex(rgba: number[]): string {
  // Assuming the input is an array of normalized RGB values (and optionally an alpha value)
  const [r, g, b] = rgba;
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}
function hexToRgb(hex: string):number[] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return [r / 255, g / 255, b / 255, 1];
}

export { rgbToHex, hexToRgb };
