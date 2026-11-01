export const assertString = (value, errorCode) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(errorCode);
    }
    return value;
};
