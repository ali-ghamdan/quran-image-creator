export function isColorDark(c: string) {
  const color = +(
    "0x" + c.slice(1).replace((c.length < 5 && /./g) || "@", "$&$&")
  );

  const [r, g, b] = [color >> 16, (color >> 8) & 255, color & 255];

  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  return !(hsp > 127.5);
}
