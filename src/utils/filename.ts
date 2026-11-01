const mojibakePattern = /(?:Ã[\u0080-\u00bf]|Â[\u0080-\u00bf])/;

export const normalizeFilenameEncoding = (fileName: string) => {
  if (!mojibakePattern.test(fileName)) return fileName;
  const characters = [...fileName];
  if (characters.some(character => character.codePointAt(0)! > 0xff)) return fileName;

  try {
    const bytes = Uint8Array.from(characters, character => character.codePointAt(0)!);
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return decoded || fileName;
  } catch {
    return fileName;
  }
};
