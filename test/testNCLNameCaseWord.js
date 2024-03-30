'use strict';

// Use nodeJS native test modules, see:
// 
// https://nodejs.org/api/test.html
// https://nodejs.org/api/assert.html
// 
// node@16: node --test ./test
// node@18: node --test --experimental-test-coverage ./test
//          node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=lcov.info

const assert = require('node:assert');
const { describe, it, test } = require('node:test');

const NCLNameCaseWord = require('../src/NCL/NCLNameCaseWord');

describe('NCLNameCaseWord', () => {
    it(`init with empty word`, () => {
        const ncl = new NCLNameCaseWord('');

        assert.strictEqual(ncl.word, '');
        assert.strictEqual(ncl.word_orig, '');
        assert.strictEqual(ncl.namePart, '');
        assert.strictEqual(ncl.genderMan, 0);
        assert.strictEqual(ncl.genderWoman, 0);
        assert.strictEqual(ncl.genderSolved, 0);
        assert.strictEqual(ncl.letterMask.join(''), '');
        assert.strictEqual(ncl.NameCases.length, 0);
        assert.strictEqual(ncl.rule, 0);
        // assert.strictEqual(ncl.isUpperCase, false);
    });

    it(`init with filled word`, () => {
        const ncl = new NCLNameCaseWord('Тарас');

        assert.strictEqual(ncl.word, 'тарас');
        assert.strictEqual(ncl.word_orig, 'Тарас');
        assert.strictEqual(ncl.namePart, '');
        assert.strictEqual(ncl.genderMan, 0);
        assert.strictEqual(ncl.genderWoman, 0);
        assert.strictEqual(ncl.genderSolved, 0);
        assert.strictEqual(ncl.letterMask.join(''), 'Xxxxx');
        assert.strictEqual(ncl.NameCases.length, 0);
        assert.strictEqual(ncl.rule, 0);
        assert.strictEqual(ncl.isUpperCase, false);
    });

    it(`returnMask()`, () => {
        const ncl = new NCLNameCaseWord('Орел');

        const data = 'орел,орла,орлові,орла,орлом,орлові,орле';
        const expect = 'Орел,Орла,Орлові,Орла,Орлом,Орлові,Орле';

        ncl.NameCases = data.split(',');
        ncl.returnMask();

        assert.strictEqual(ncl.NameCases.join(','), expect);
    });

    it(`setNameCases()`, () => {
        const ncl = new NCLNameCaseWord('Орел');

        const data = 'орел,орла,орлові,орла,орлом,орлові,орле';
        const expect = 'Орел,Орла,Орлові,Орла,Орлом,Орлові,Орле';

        ncl.setNameCases(data.split(','), false);
        assert.strictEqual(ncl.NameCases.join(','), data);

        ncl.setNameCases(data.split(','), true);
        assert.strictEqual(ncl.NameCases.join(','), expect);
    });
});
