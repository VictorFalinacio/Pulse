const mojibakePattern = /(?:Ã[\u0080-\u00bf]|Â[\u0080-\u00bf])/;

export const normalizeFilenameEncoding = (fileName) => {
    if (typeof fileName !== 'string' || !mojibakePattern.test(fileName)) return fileName;
    if ([...fileName].some(character => character.codePointAt(0) > 0xff)) return fileName;

    const decoded = Buffer.from(fileName, 'latin1').toString('utf8');
    if (decoded.includes('\uFFFD') || decoded === fileName) return fileName;
    return decoded;
};
