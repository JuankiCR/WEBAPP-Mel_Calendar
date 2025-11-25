export function extractColorFromCssVar(varName: string, element = document.documentElement) {
  const style = getComputedStyle(element);
  return style.getPropertyValue(varName).trim();
}
