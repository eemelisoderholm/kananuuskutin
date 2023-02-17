export const diffSeconds = (a: Date, b: Date): number => 
  Math.round((b.getTime() - a.getTime()) / 1000)

export const secondsSince = (d: Date | string): number => {
  const now = new Date()
  const then = new Date(d)
  return diffSeconds(then, now)
}

export function yearsSince(d: Date): number {
  const diffMs = Date.now() - d.getTime()
  const diffDate = new Date(diffMs)
  return Math.abs(diffDate.getUTCFullYear() - 1970)
}

/** parseInt, but allow nullish value and convert NaN -> undefined */
export function parseIntFinite(str?: string | null): number | undefined {
  const num = parseInt(str as string, 10)
  return isFinite(num) ? num : undefined
}

/** parseFloat, but allow nullish value and convert NaN -> undefined */
export function parseFloatFinite(str?: string | null): number | undefined {
  const num = parseFloat(str as string)
  return isFinite(num) ? num : undefined
}

/** Class name prefixer to avoid collisions */
export const cls = (className: string) => `nuusk-${className}`

/** Make DOM element creation less verbose
 * - If children is an array, any values other than HTMLElement are ignored
 * - Classnames are prefixed by default, use ! at the start of class to avoid
 * (Should really bring in some ui rendering library at this point...) */
export function createEl(
  tagName: keyof HTMLElementTagNameMap,
  classNames: string | string[] = [],
  children: string | HTMLElement | Array<HTMLElement | null | undefined | string | number | boolean> = []
) {
  const el = document.createElement(tagName)
  if (typeof classNames === 'string') classNames = [classNames]
  classNames
    .map(name => name.startsWith('!') ? name.replaceAll('!', '') : cls(name))
    .forEach(name => el.classList.add(name))
  if (typeof children === 'string') {
    el.textContent = children
  } else {
    if (!Array.isArray(children)) children = [children]
    children.filter((e) => e instanceof HTMLElement).forEach(child => el.appendChild(child as HTMLElement))
  }
  return el
}

/** Get textContent from element, defaulting to empty string */
export const getText = (element?: Element | null): string =>
  element ? element.textContent || '' : ''