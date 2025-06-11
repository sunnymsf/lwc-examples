import { RESIZER_DEFAULT_STATE, isTableRenderedVisible } from './columnResizer';
import { AutoWidthStrategy } from './autoWidthStrategy';
import { FixedWidthStrategy } from './fixedWidthStrategy';
import { getScrollerX, setCssProperty } from './utils';
import {
    getRowNumberColumnIndex,
    getAdjustedRowNumberColumnWidth,
} from './rowNumber';
import { getColumnWidth } from './widthManagerShared';
import { isRTL } from 'lightning/utilsPrivate';

const AUTO_WIDTH_MODE = 'auto';
const FIXED_WIDTH_MODE = 'fixed';

/**
 * Computes and updates the `widthsData` for a datatable.
 *
 * @param {Array} columns The column definitions
 * @param {Object} widthsData The widths data to update
 * @param {Object} adjustedWidths The adjusted widths object
 */
export function updateColumnWidths(refs, columns, widthsData, adjustedWidths) {
    const { columnWidths } = adjustedWidths;
    const { length: colCount } = columns;
    if (columnWidths.length !== colCount) {
        return;
    }
    let columnWidthsSum = 0;
    const rtl = isRTL();
    for (let colIndex = 0; colIndex < colCount; colIndex += 1) {
        const col = columns[colIndex];
        const newWidth = columnWidths[colIndex];
        widthsData.columnWidths[colIndex] = newWidth;
        col.columnWidth = newWidth;
        setCssProperty(
            refs,
            'headerRow',
            `--_slds-c-datatable-sizing-width-col${colIndex}`,
            `${newWidth}px`
        );
        // In RTL, we need to explicitly position the column headers.
        // We do this by providing the offset (in pixels) from the start of the table.
        if (rtl) {
            col.offset = columnWidthsSum;
        }

        columnWidthsSum += newWidth;
    }

    // TODO: W-7679487 - `tableWidth` should match `columnWidthsSum`
    widthsData.tableWidth = columnWidthsSum;
    setCssProperty(
        refs,
        'scrollerX',
        '--_slds-c-datatable-sizing-width-table',
        `${columnWidthsSum}px`
    );
}

/**
 * Column width manager.
 * Invokes one of the two width managing strategies based
 * on `column-widths-mode`: "auto" or "fixed"
 */
export class ColumnWidthManager {
    columnWidthMode = FIXED_WIDTH_MODE;

    // Flag to indicate resetting column widths is needed.
    // Could be with or without `autoResizingUpdate`.
    isResizingUpdateQueued = false;

    // Flag to indicate whether auto resizing computation update is needed,
    // in which case table styles need to auto flow.
    isAutoResizingUpdateQueued = false;

    /************************** LIFECYCLE HOOKS **************************/

    constructor(widthsData) {
        const minColumnWidth =
            widthsData.minColumnWidth || RESIZER_DEFAULT_STATE.minColumnWidth;
        const maxColumnWidth =
            widthsData.maxColumnWidth || RESIZER_DEFAULT_STATE.maxColumnWidth;
        const fixedWidthStrategy = new FixedWidthStrategy(
            minColumnWidth,
            maxColumnWidth
        );
        const autoWidthStrategy = new AutoWidthStrategy(
            minColumnWidth,
            maxColumnWidth
        );
        this.widthStrategies = {
            [FIXED_WIDTH_MODE]: fixedWidthStrategy,
            [AUTO_WIDTH_MODE]: autoWidthStrategy,
        };
    }

    /************************** PRIVATE GETTERS **************************/

    /**
     * Gets the configured column width strategy.
     *
     * @returns {Object} The column width strategy
     */
    get columnWidthStrategy() {
        return this.widthStrategies[this.columnWidthMode];
    }

    /************************** PRIVATE SETTERS **************************/

    /**
     * Sets the minimum column width (in pixels).
     *
     * @param {Number} value The minimum column width
     */
    set minColumnWidth(value) {
        const { widthStrategies } = this;
        const keys = Object.keys(widthStrategies);
        for (let i = 0, { length } = keys; i < length; i += 1) {
            const strategy = keys[i];
            widthStrategies[strategy].minColumnWidth = value;
        }
    }

    /**
     * Sets the maximum column width (in pixels).
     *
     * @param {Number} value The maximum column width
     */
    set maxColumnWidth(value) {
        const { widthStrategies } = this;
        const keys = Object.keys(widthStrategies);
        for (let i = 0, { length } = keys; i < length; i += 1) {
            const strategy = keys[i];
            widthStrategies[strategy].maxColumnWidth = value;
        }
    }

    /**
     * Sets the maximum number of text wrap lines
     *
     * @param {Number} value The maximum number of lines text can be wrapped on
     */
    set wrapTextMaxLines(value) {
        this.widthStrategies[AUTO_WIDTH_MODE].wrapTextMaxLines = value;
    }

    /************************* HELPER FUNCTIONS **************************/

    /**
     * Determines if we should fire the resize event based on the previous
     * widths data and the column definition. The event is only fired when
     * the number of columns change in fixed width mode. In auto width mode,
     * nothing happens.
     *
     * @param {Object} previousWidthsData The previous widths data to evaluate
     * @param {Array} columns The column definitions
     * @returns {Boolean} Whether or not the resize event should be fired
     */
    shouldFireResizeEvent(previousWidthsData, columns) {
        return (
            this.columnWidthMode === FIXED_WIDTH_MODE &&
            previousWidthsData.columnWidths.length !== columns.length
        );
    }

    /**
     * Adjusts all the column sizes based on the supplied widths data.
     *
     * @param {Node} template The datatable template
     * @param {Object} refs The datatable refs
     * @param {Array} columns The column definitions
     * @param {Object} widthsData The widths data object
     */
    adjustColumnsSize(template, refs, columns, widthsData) {
        const {
            columnWidthStrategy,
            isAutoResizingUpdateQueued,
            isResizingUpdateQueued,
        } = this;
        if (isResizingUpdateQueued) {
            let adjustedWidths;
            // If table is hidden when updating and `ResizeObserver` is not available,
            // then updating sizes causes min widths to be set.
            // Hence, the check if ok update from DOM.
            if (this.shouldResizeWithUpdate(template, refs, widthsData)) {
                adjustedWidths = columnWidthStrategy.getAdjustedColumnWidths(
                    this.getDatatableInterface(template, refs),
                    columns,
                    isAutoResizingUpdateQueued
                );
            } else {
                // Otherwise update from previous widths
                adjustedWidths = {
                    columnWidths: widthsData.columnWidths,
                };
            }
            updateColumnWidths(refs, columns, widthsData, adjustedWidths);
        }
        this.isAutoResizingUpdateQueued = false;
        setCssProperty(
            refs,
            'tableElement',
            '--_slds-c-datatable-layout',
            'fixed'
        );
        this.isResizingUpdateQueued = false;
    }

    /**
     * Adjusts all the column widths after a resize happens.
     *
     * @param {Node} template The datatable template
     * @param {Object} refs The datatable refs
     * @param {Array} columns The column definitions
     * @param {Object} widthsData The widths data object
     */
    adjustColumnsSizeAfterResize(dt, columns, widthsData) {
        const adjustedWidths = this.columnWidthStrategy.getAdjustedColumnWidths(
            this.getDatatableInterface(dt.template, dt.refs),
            columns
        );
        updateColumnWidths(dt.refs, columns, widthsData, adjustedWidths);
    }

    /**
     * React to a change in data.
     *
     * @param {Array} columns The column definitions
     * @param {Object} refs The datatable refs
     */
    handleDataChange(columns, refs) {
        // Resize columns with auto-resizing update only if the mode is auto
        if (this.columnWidthMode === AUTO_WIDTH_MODE) {
            this.isResizingUpdateQueued = true;
            this.setAutoResizingUpdate(columns, refs);
        }
    }

    /**
     * React to change in column definitions
     *
     * @param {Array} columns The column definitions
     * @param {Object} refs The datatable refs
     */
    handleColumnsChange(columns, refs) {
        if (columns.length > 0) {
            this.isResizingUpdateQueued = true;
            this.setAutoResizingUpdate(columns, refs);
        }
    }

    /**
     * React to change in column widths mode
     *
     * @param {Array} columns The column definitions
     * @param {Object} refs The datatable refs
     */
    handleWidthModeChange(columns, refs) {
        if (columns.length > 0) {
            this.isResizingUpdateQueued = true;
            this.setAutoResizingUpdate(columns, refs);
        }
    }

    /**
     * React to change in row number offset
     *
     * @param {Object} state The datatable state
     * @param {Object} widthsData The widths data
     */
    handleRowNumberOffsetChange(state, widthsData) {
        const colIndex = getRowNumberColumnIndex(state);
        if (colIndex !== -1) {
            const { columns } = state;
            const col = columns[colIndex];
            const newWidth = getAdjustedRowNumberColumnWidth(state);
            if (col.initialWidth !== newWidth) {
                col.initialWidth = Math.max(newWidth, col.minWidth);
                if (widthsData.columnWidths.length > 0) {
                    // When columns are resized with the resizer, a horizontal scroller appears.
                    // Adjusting the columns size will respect widths already set and try to fit this column.
                    this.isResizingUpdateQueued = true;
                }
            }
        }
    }

    /**
     * React to change in hide-checkbox-column
     *
     * @param {Any} previousValue The previous column value
     * @param {Any} newValue The new column value
     * @param {Array} columns The column definitions
     */
    handleCheckboxColumnChange(previousValue, newValue, columns) {
        if (columns.length > 0 && previousValue !== newValue) {
            this.isResizingUpdateQueued = true;
        }
    }

    /**
     * React to change in show-actions-menu
     *
     * @param {Any} previousValue The previous column value
     * @param {Any} newValue The new column value
     * @param {Array} columns The column definitions
     */
    handleActionsColumnChange(previousValue, newValue, columns) {
        if (columns.length > 0 && previousValue !== newValue) {
            this.isResizingUpdateQueued = true;
        }
    }

    /**
     * React to change in show-row-number-column
     *
     * @param {Any} previousValue The previous column value
     * @param {Any} newValue The new column value
     * @param {Array} columns The column definitions
     * @param {Object} refs The datatable refs
     */
    handleRowNumberColumnChange(previousValue, newValue, columns, refs) {
        if (columns.length > 0 && previousValue !== newValue) {
            this.isResizingUpdateQueued = true;
            this.setAutoResizingUpdate(columns, refs);
        }
    }

    /**
     * Queues up an auto resizing update. If a column width isn't defined,
     * reset the width so it can be recalculated.
     */
    setAutoResizingUpdate(columns, refs) {
        if (this.columnWidthMode === AUTO_WIDTH_MODE) {
            this.isAutoResizingUpdateQueued = true;
            setCssProperty(
                refs,
                'tableElement',
                '--_slds-c-datatable-layout',
                'auto'
            );
        }
        for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
            const col = columns[colIndex];
            if (!getColumnWidth(col)) {
                col.columnWidth = null;
                setCssProperty(
                    refs,
                    'headerRow',
                    `--_slds-col-${colIndex}-width`,
                    ''
                );
            }
        }
    }

    /**
     * Evaluates if there is a change between two sets of data.
     *
     * @param {Array} previousData An array of previous data
     * @param {Array} newData An array of new data
     * @returns {Boolean} Whether or not the is a difference between the two data sets
     */
    hasDataChanged(previousData, newData) {
        const { length: previousDataLength } = previousData;
        const { length: newDataLength } = newData;
        return (
            newDataLength > 0 &&
            (previousDataLength === 0 || previousDataLength !== newDataLength)
        );
    }

    /**
     * @private
     * Determines if a column should resize with an update.
     *
     * @param {Node} template The datatable template
     * @param {Object} refs The datatable refs
     * @param {Object} widthsData The source widths data
     * @returns {Boolean} Whether the column should resize with an update
     */
    shouldResizeWithUpdate(template, refs, widthsData) {
        if (widthsData.columnWidths.length > 0) {
            // Can resize from DOM when table is visible.
            // Otherwise, only when `ResizeObserver` is available in browser.
            return isTableRenderedVisible(template, refs);
        }
        return true;
    }

    /**
     * Retrieves the datatable interface from the DOM
     *
     * @param {Node} template The datatable template
     * @param {Object} refs The datatable refs
     * @returns {Object} The datatable interface
     */
    getDatatableInterface(template, refs) {
        return {
            getAvailableWidthFromDom() {
                const scrollerX = getScrollerX(template, refs);
                return scrollerX.offsetWidth;
            },
            getDataCellWidths() {
                const firstRow = refs.tableBody.firstChild;
                if (firstRow) {
                    const cellElements = firstRow.children;
                    const { length } = cellElements;
                    const result = Array(length);
                    for (let i = 0; i < length; i += 1) {
                        result[i] = cellElements[i].offsetWidth;
                    }
                    return result;
                }
                return [];
            },
            getHeaderCellWidths() {
                const headerCells = refs.headerRow.children;
                const result = [];
                for (let i = 0; i < headerCells.length; i += 1) {
                    const headerElement = headerCells[i].firstChild;
                    const headerDomWidth = headerElement.getDomWidth();
                    if (headerDomWidth) {
                        result.push(headerDomWidth);
                    }
                }
                return result;
            },
            getTableElementWidth() {
                const elem =
                    refs?.tableElement || template.querySelector('.slds-table');
                return elem.offsetWidth;
            },
        };
    }
}
