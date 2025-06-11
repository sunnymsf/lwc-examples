/**
 * Generates a UUID.
 * Consider replacing this with { guid } from 'lightning/utilsPrivate';
 */
export function generateUUID() {
    let d = new Date().getTime();
    if (performance && typeof performance.now === 'function') {
        d += performance.now();
    }

    // Use underscores so that downstream users can use value in event names
    return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}
