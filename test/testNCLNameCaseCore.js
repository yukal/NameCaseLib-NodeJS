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

const NCLNameCaseCore = require('../src/NCL/NCLNameCaseCore');
const NCL = require('../src/NCL/NCL');

describe('NCLNameCaseCore', () => {
    const ncl = new NCLNameCaseCore();

    it(`Last()`, () => {
        var input = 'ЧерезТинНогуЗадерищенко';

        // ncl.setSecondName(input);
        // ncl.setGender(NCL.MAN);
        // ncl.getSecondNameCase();

        ncl.setWorkingWord(input);

        assert.strictEqual(ncl.workingWord, input);
        assert.strictEqual(ncl.Last(9), 'дерищенко');
        assert.strictEqual(ncl.Last(9, 7), 'дерищен');
    });
});
