import {
    STENCIL_ARRAY_LENGTH,
    STENCIL_PLACEHOLDER_ID_PREFIX,
} from './constants';

export const generatePlaceholderArray = function () {
    return [...Array(STENCIL_ARRAY_LENGTH)].map((_, index) => {
        return {
            id: `${STENCIL_PLACEHOLDER_ID_PREFIX}${index}`,
        };
    });
};

export const getOuterHeight = function (event) {
    return event.view.outerHeight;
};

export const getScrollHeight = function (event) {
    const container = event && event.currentTarget;
    return container.scrollHeight;
};

export const getTopOffset = function (event) {
    const container = event && event.currentTarget;
    return container.getBoundingClientRect().top;
};

export const isScrollAtBottom = function (scrollHeight, viewHeight, topOffset) {
    const buffer = 20; // acccount for variance
    const maxScroll = scrollHeight - viewHeight;
    return Math.abs(topOffset) + buffer >= maxScroll;
};
