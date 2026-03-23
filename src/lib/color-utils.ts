export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 255 }
}

export function getLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const toLinear = (c: number) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function isDark(hex: string) {
  return getLuminance(hex) < 0.4
}

export function getContrastColor(hex: string) {
  return isDark(hex) ? '#FFFFFF' : '#111827'
}

export function lightenColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  const newR = Math.min(255, r + amount)
  const newG = Math.min(255, g + amount)
  const newB = Math.min(255, b + amount)
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

export function darkenColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  const newR = Math.max(0, r - amount)
  const newG = Math.max(0, g - amount)
  const newB = Math.max(0, b - amount)
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

export function getAlphaColor(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

export function getLogoBackground(primaryColor: string) {
  if (isDark(primaryColor)) {
    return { bg: primaryColor, needsWhiteBg: false }
  } else {
    return { bg: primaryColor, needsWhiteBg: true }
  }
}
