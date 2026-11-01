import test from 'node:test';
import assert from 'node:assert/strict';
import { persistSprintUpload } from './sprintUploadPersistence.js';

const input = {
    sprintId: 'sprint-1',
    userId: 'user-1',
    dayNumber: 2,
    upload: { day: 2, analysisId: 'analysis-2' },
    aggregatedSummary: 'Updated summary'
};

test('atomically replaces an existing day and scopes the update to its owner', async () => {
    const calls = [];
    const SprintModel = {
        async updateOne(filter, update) {
            calls.push({ filter, update });
            return { matchedCount: 1 };
        }
    };

    await persistSprintUpload(SprintModel, input);

    assert.deepEqual(calls, [{
        filter: { _id: 'sprint-1', userId: 'user-1', 'uploads.day': 2 },
        update: { $set: { 'uploads.$': input.upload, aggregatedSummary: 'Updated summary' } }
    }]);
});

test('adds a new day only when no concurrent request has inserted it', async () => {
    const calls = [];
    const SprintModel = {
        async updateOne(filter, update) {
            calls.push({ filter, update });
            return { matchedCount: calls.length === 1 ? 0 : 1 };
        }
    };

    await persistSprintUpload(SprintModel, input);

    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1], {
        filter: { _id: 'sprint-1', userId: 'user-1', 'uploads.day': { $ne: 2 } },
        update: { $push: { uploads: input.upload }, $set: { aggregatedSummary: 'Updated summary' } }
    });
});

test('replaces the day if a concurrent request inserted it after the first check', async () => {
    const calls = [];
    const SprintModel = {
        async updateOne(filter, update) {
            calls.push({ filter, update });
            return { matchedCount: calls.length === 3 ? 1 : 0 };
        }
    };

    await persistSprintUpload(SprintModel, input);

    assert.equal(calls.length, 3);
    assert.deepEqual(calls[2], {
        filter: { _id: 'sprint-1', userId: 'user-1', 'uploads.day': 2 },
        update: { $set: { 'uploads.$': input.upload, aggregatedSummary: 'Updated summary' } }
    });
});

test('fails if the sprint disappeared and no atomic update matched', async () => {
    const SprintModel = { async updateOne() { return { matchedCount: 0 }; } };
    await assert.rejects(persistSprintUpload(SprintModel, input), { message: 'NOT_FOUND' });
});
