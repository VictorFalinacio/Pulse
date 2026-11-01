import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const extractText = async (buffer, mimetype) => {
    if (mimetype === 'application/pdf') {
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
    }

    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    if (mimetype === 'text/plain') return buffer.toString('utf-8');
    throw new Error('UNSUPPORTED_FORMAT');
};
