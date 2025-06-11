export const HEADER_ROW_INDEX = -1;
export const HEADER_ROW_KEY = 'HEADER';

export function getCellFromIndexes(state, rowIndex, colIndex) {
    const { columns, rows } = state;
    if (rows.length > rowIndex && columns.length && columns.length > colIndex) {
        const rowKeyValue =
            rowIndex === HEADER_ROW_INDEX ? HEADER_ROW_KEY : rows[rowIndex].key;
        const { colKeyValue } = columns[colIndex];
        return state.indexes[`${rowKeyValue}-${colKeyValue}`];
    }
    return undefined;
}

export function getCellByKeys(state, rowKeyValue, colKeyValue) {
    return state.indexes[`${rowKeyValue}-${colKeyValue}`];
}

export function getRowIndexByKey(state, rowKeyValue) {
    const row = state.indexes[rowKeyValue];
    return row ? row.rowIndex : undefined;
}

export function getRowByKey(state, rowKeyValue) {
    return state.indexes[rowKeyValue];
}

export function getUserRowByKey(state, rowKeyValue) {
    const row = state.indexes[rowKeyValue];
    return row ? state.data[row.rowIndex] : undefined;
}

export function isValidCell(state, rowKeyValue, colKeyValue) {
    return state.indexes[`${rowKeyValue}-${colKeyValue}`] !== undefined;
}
