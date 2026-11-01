import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { config } from '../config.js';

export const extractText = async (fileBuffer, mimetype) => {
    let text;
    if (mimetype === 'application/pdf') {
        const result = await pdfParse(fileBuffer);
        text = result.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        text = result.value;
    } else if (mimetype === 'text/plain') {
        text = fileBuffer.toString('utf-8');
    } else {
        throw new Error('UNSUPPORTED_FORMAT');
    }

    if (typeof text !== 'string' || !text.trim()) throw new Error('EMPTY_FILE');
    return text.slice(0, config.geminiMaxInputChars);
};
