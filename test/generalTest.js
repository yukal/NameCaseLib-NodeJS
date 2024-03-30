'use strict';

const fs = require('node:fs');
const path = require('node:path');

const assert = require('node:assert');
const { describe, it, test } = require('node:test');

const { NCLNameCaseUa, NCLNameCaseRu, NCL } = require('../src');
const { getMergedCases, loadData } = require('./helper');

describe('UA', () => {
    const CASES_NAMES = [
        '[1] нзв. (хто?)',
        '[2] род. (кого?)',
        '[3] дав. (кому?)',
        '[4] знх. (кого?)',
        '[5] ору. (ким?)',
        '[6] міс. (при кому?)',
        '[7] клч. (зверн!)',
    ];

    describe('ПІБ', () => {
        const ncl = new NCLNameCaseUa();

        const forms = ["Облогін Денис", "Облогіна Дениса"];
        const [nominative] = forms;

        for (let n = 1; n < forms.length; n++) {
            const expect = forms[n];
            const result = ncl.q(nominative, n);

            it(CASES_NAMES[n] + ' -> ' + expect, () => {
                assert.strictEqual(result, expect);
            })
        }
    });

    // ----------------------------------------------------------------------

    describe('Masculine Full Names', () => {
        const ncl = new NCLNameCaseUa();

        const data = loadData('masculine');
        const biggestPart = 'f';

        it('Masculine', () => {
            for (let i = 0; i < data[biggestPart].length; i++) {
                const cases = getMergedCases(i, data);
                const [nominative] = cases;

                for (let caseNum = 1; caseNum < cases.length; caseNum++) {
                    const expect = cases[caseNum];
                    const result = ncl.q(nominative, caseNum);

                    assert.strictEqual(result, expect);
                }
            }
        });
    });

    // ----------------------------------------------------------------------

    describe('Feminine Full Names', () => {
        const ncl = new NCLNameCaseUa();

        const data = loadData('feminine');
        const biggestPart = 'f';

        it('Feminine', () => {
            for (let i = 0; i < data[biggestPart].length; i++) {
                const cases = getMergedCases(i, data);
                const [nominative] = cases;

                for (let caseNum = 1; caseNum < cases.length; caseNum++) {
                    const expect = cases[caseNum];
                    const result = ncl.q(nominative, caseNum);

                    assert.strictEqual(result, expect);
                }
            }
        });
    });

});

describe('RU', () => {
    const CASES_NAMES = [
        '[1] им. (кто?)',
        '[2] род. (кого?)',
        '[3] дат. (кому?)',
        '[4] вин. (кого?)',
        '[5] твор. (кем?)',
        '[6] предл. (о ком?)',
        '[7] зват. (кто?)',
    ];

    describe('ФИО', () => {
        const ncl = new NCLNameCaseRu();

        const forms = ["Облогин Денис", "Облогина Дениса"];
        const [nominative] = forms;

        for (let n = 1; n < forms.length; n++) {
            const expect = forms[n];
            const result = ncl.q(nominative, n);

            it(CASES_NAMES[n] + ' -> ' + expect, () => {
                assert.strictEqual(result, expect);
            })
        }
    });

    // ----------------------------------------------------------------------

    describe('Masculine Full Names', () => {
        const ncl = new NCLNameCaseRu();

        const pathToStubFile = path.join(process.cwd(), 'data/Names/boy_full_result.txt');
        const delimeter = '#';

        const rows = fs.readFileSync(pathToStubFile, 'utf8')
            .trim()
            .split('\n');

        it('Masculine', () => {
            for (let row of rows) {
                if (!row.length) {
                    continue;
                }

                let forms = row.split(delimeter);
                if (forms.length < 6) {
                    continue;
                }

                const [nominative] = forms;

                for (let caseNum = 1; caseNum < forms.length; caseNum++) {
                    let expect = forms[caseNum];
                    let result = ncl.q(nominative, caseNum);

                    expect = expect.replace(/ё/g, 'е');
                    result = result.replace(/ё/g, 'е');

                    assert.strictEqual(result, expect);
                }
            }
        });
    });

    // ----------------------------------------------------------------------

    describe('Feminine Full Names', () => {
        const ncl = new NCLNameCaseRu();

        const pathToStubFile = path.join(process.cwd(), 'data/Names/girl_full_result.txt');
        const delimeter = '#';

        const rows = fs.readFileSync(pathToStubFile, 'utf8')
            .trim()
            .split('\n');

        it('Feminine', () => {
            for (let row of rows) {
                if (!row.length) {
                    continue;
                }

                let forms = row.split(delimeter);
                if (forms.length < 6) {
                    continue;
                }

                const [nominative] = forms;

                for (let caseNum = 1; caseNum < forms.length; caseNum++) {
                    let expect = forms[caseNum];
                    let result = ncl.q(nominative, caseNum);

                    expect = expect.replace(/ё/g, 'е');
                    result = result.replace(/ё/g, 'е');

                    assert.strictEqual(result, expect);
                }
            }
        });
    });

});
