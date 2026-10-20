export const ALLOWED_UPLOAD_MIME_TYPES = Object.freeze([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
]);

export const validateFileMagicBytes = (buffer, mimetype) => {
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(mimetype)) return false;
    if (mimetype === 'application/pdf') return buffer.subarray(0, 4).toString('hex') === '25504446';
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    }
    return true;
};
