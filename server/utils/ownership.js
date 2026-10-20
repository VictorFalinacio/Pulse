export const assertOwned = (resource, userId) => {
    if (!resource) throw new Error('NOT_FOUND');
    if (resource.userId.toString() !== userId.toString()) throw new Error('UNAUTHORIZED');
};
