import { isCSR } from './ssr';

/**
 * Does the browser display animation.
 */
export function hasAnimation() {
    if (isCSR) {
        if (!window.matchMedia) {
            return true;
        }
        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );
        return !(!mediaQuery || mediaQuery.matches);
    }
    return false;
}
