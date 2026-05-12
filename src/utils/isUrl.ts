export function isUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (error) {
    return false;
  }
}
