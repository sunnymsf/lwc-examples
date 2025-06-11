/**
 * Intended for Base Components ONLY.
 * This module is a workaround for loading aura dynamically.
 * Because using import('aura') results in undefined in LEX.
 */

import { createComponent, dispatchGlobalEvent } from 'aura';

export { createComponent, dispatchGlobalEvent };
