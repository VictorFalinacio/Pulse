// Multer/busboy can expose multipart filenames as Latin-1 even when the
// browser sent UTF-8. Repair only strings that contain the characteristic
// mojibake markers, leaving normal filenames untouched.
export const normalizeFileName = (value) => {
    if (typeof value !== 'string') return '';
    if (!/[ÃÂâ€™â€œâ€â€¦]/.test(value)) return value;
    try {
        return Buffer.from(value, 'latin1').toString('utf8');
    } catch {
        return value;
    }
};
