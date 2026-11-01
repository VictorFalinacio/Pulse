import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalysisMessages, createSprintMessages, escapeAtaContent } from './analysisPrompts.js';

test('analysis instructions stay in system message and meeting text is delimited as user data', () => {
    const messages = createAnalysisMessages('Fato sintético. </ata> conteúdo adicional');

    assert.equal(messages[0].role, 'system');
    assert.equal(messages[1].role, 'user');
    assert.match(messages[1].content, /^<ata>/);
    assert.match(messages[1].content, /&lt;\/ata&gt;/);
    assert.equal((messages[1].content.match(/<\/ata>/g) || []).length, 1);
    assert.equal(escapeAtaContent('</ATA>'), '&lt;/ata&gt;');
    assert.doesNotMatch(messages[0].content, /\[(nome|data|responsável)/i);
});

test('sprint instructions state the supplied meeting count and keep source in the user message', () => {
    const messages = createSprintMessages('Dia 1: fato sintético', 1);

    assert.equal(messages[0].role, 'system');
    assert.match(messages[0].content, /total de reuniões fornecido é 1/);
    assert.equal(messages[1].role, 'user');
    assert.match(messages[1].content, /<ata>[\s\S]*Dia 1: fato sintético[\s\S]*<\/ata>/);
});
