import { unsafeCSS } from 'lit'

/**
 * The desktop breakpoint, in CSS pixels. Below it `dp-shell`'s sidebar is a drawer over the
 * content; at and above it the sidebar always sits beside the content, so `dp-toolbar` hides the
 * toggle that opens the drawer.
 */
export const desktopMinWidth = 1024

/** The media query for {@link desktopMinWidth}, for a component's styles. */
export const desktopMedia = unsafeCSS(`(min-width: ${desktopMinWidth}px)`)
