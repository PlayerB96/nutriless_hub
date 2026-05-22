/**
 * Debe coincidir con --breakpoint-* en src/app/globals.css
 * mobile: < 768px (sin prefijo)
 * tablet: ≥ 768px
 * desktop: ≥ 1024px
 */
export const BREAKPOINT_TABLET_PX = 768;
export const BREAKPOINT_DESKTOP_PX = 1024;

export const mediaTabletUp = `(min-width: ${BREAKPOINT_TABLET_PX}px)`;
export const mediaDesktopUp = `(min-width: ${BREAKPOINT_DESKTOP_PX}px)`;
