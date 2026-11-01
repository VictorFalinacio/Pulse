const matched = (result) => result.matchedCount ?? result.n ?? 0;

export const persistSprintUpload = async (SprintModel, {
    sprintId,
    userId,
    dayNumber,
    upload,
    aggregatedSummary
}) => {
    const summaryUpdate = typeof aggregatedSummary === 'string'
        ? { aggregatedSummary }
        : {};
    const updated = await SprintModel.updateOne(
        { _id: sprintId, userId, 'uploads.day': dayNumber },
        { $set: { 'uploads.$': upload, ...summaryUpdate } }
    );
    if (matched(updated)) return;

    const inserted = await SprintModel.updateOne(
        { _id: sprintId, userId, 'uploads.day': { $ne: dayNumber } },
        { $push: { uploads: upload }, ...(Object.keys(summaryUpdate).length ? { $set: summaryUpdate } : {}) }
    );
    if (matched(inserted)) return;

    // Another request may have inserted this day after the first check.
    const racedUpdate = await SprintModel.updateOne(
        { _id: sprintId, userId, 'uploads.day': dayNumber },
        { $set: { 'uploads.$': upload, ...summaryUpdate } }
    );
    if (!matched(racedUpdate)) throw new Error('NOT_FOUND');
};
